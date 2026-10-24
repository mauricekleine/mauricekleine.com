"""Superthread's texture build: tiles, plates and plate checks, run with the master world's own vendored modules.

Stdlib only. Run as `python3 -I scripts/texture/build.py <command>`. Builds copy the committed outputs and never run this;
only tests and regeneration do. Defaults resolve against the package root (packages/superthread) whatever the cwd; paths
given on the command line resolve against the cwd.

  tiles   [--out texture/tiles.json] [--check]
          the mask tiles the texture utilities read: details.tiles_css()'s tiles (b50, b19, rake-contact), the progress
          ramp and one line screen per ship, from tokens/details.json and tokens/master.json
  plates  [--spec texture/plates.json] --out <dir> [--ts <file>] [--url-base /texture/] [--check]
          [--write-hashes <file> | --check-hashes <file>]
          every plate in the spec through the vendored fields.py, as <stem>.<hash8>.png with a tEXt Source chunk, plus
          <dir>/PROVENANCE.json, and with --ts the site's map of plate name to { form, w, h, url }
  verify  --dir <dir> [--check-hashes texture/plates.sha256]
          every PNG in <dir> decodes to its recorded pixel hash, names it, and carries Source; no PNGs, or no <dir>, passes
  master  --dir <M>/build [--out tokens/master-plates.json] [--check]
          { w, h, form, pixels_sha256, planes_sha256 } for every master plate
  hash    [--json] <png...>
          each file's pixel hash with its size (--json: the full record master writes)

Every check compares decoded pixels and text chunks, never compressed bytes: zlib output differs between hosts.
"""
import sys
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
sys.path[:0] = [str(HERE), str(HERE / "master")]
sys.dont_write_bytecode = True

import argparse  # noqa: E402
import base64  # noqa: E402
import hashlib  # noqa: E402
import json  # noqa: E402
import re  # noqa: E402
import shutil  # noqa: E402
import struct  # noqa: E402
import tempfile  # noqa: E402
import zlib  # noqa: E402

PKG = HERE.parent.parent
SIG = b"\x89PNG\r\n\x1a\n"
GENERATOR = "packages/superthread/scripts/texture/build.py"
NAME = re.compile(r"^(?P<stem>.+)\.(?P<hash8>[0-9a-f]{8})\.png$")


# ---------- the decoder: colour type 3 at depths 1, 2, 4 and 8, and 8-bit types 2 and 6 ----------

def _chunks(data):
    assert data[:8] == SIG, "not a PNG"
    pos = 8
    while pos < len(data):
        n, kind = struct.unpack(">I4s", data[pos:pos + 8])
        yield kind, data[pos + 8:pos + 8 + n]
        pos += 12 + n
        if kind == b"IEND":
            return


def _unfilter(line, prev, f, bpp):
    for i in range(len(line)):
        a = line[i - bpp] if i >= bpp else 0
        b = prev[i]
        c = prev[i - bpp] if i >= bpp else 0
        if f == 1:
            line[i] = (line[i] + a) & 255
        elif f == 2:
            line[i] = (line[i] + b) & 255
        elif f == 3:
            line[i] = (line[i] + (a + b) // 2) & 255
        elif f == 4:
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        else:
            assert f == 0, f"unknown filter {f}"


def decode(path):
    """(w, h, depth, ctype, palette, trns, rows): rows of palette indexes for colour type 3, of (r, g, b) for 2 and 6."""
    data = pathlib.Path(path).read_bytes()
    palette, trns, idat, head = None, None, [], None
    for kind, body in _chunks(data):
        if kind == b"IHDR":
            head = struct.unpack(">IIBBBBB", body)
        elif kind == b"PLTE":
            palette = [tuple(body[i:i + 3]) for i in range(0, len(body), 3)]
        elif kind == b"tRNS":
            trns = bytes(body)
        elif kind == b"IDAT":
            idat.append(body)
    w, h, depth, ctype, _, _, interlace = head
    assert interlace == 0, f"{path}: interlaced"
    if ctype == 3:
        assert depth in (1, 2, 4, 8) and palette, f"{path}: indexed at depth {depth}"
        channels = 1
    else:
        assert ctype in (2, 6) and depth == 8, f"{path}: colour type {ctype} at depth {depth}"
        channels = 3 if ctype == 2 else 4
    bits = depth * channels
    stride, bpp = (w * bits + 7) // 8, max(1, bits // 8)
    raw = zlib.decompress(b"".join(idat))
    rows, prev = [], bytearray(stride)
    for y in range(h):
        start = y * (stride + 1)
        line = bytearray(raw[start + 1:start + 1 + stride])
        _unfilter(line, prev, raw[start], bpp)
        prev = line
        if ctype == 3:
            per, mask = 8 // depth, (1 << depth) - 1
            row = [(line[x // per] >> (8 - depth * (x % per + 1))) & mask for x in range(w)]
        else:
            row = [tuple(line[x * channels:x * channels + 3]) for x in range(w)]
        rows.append(row)
    return w, h, depth, ctype, palette, trns, rows


def texts(path):
    """The file's tEXt chunks as { keyword: text }."""
    out = {}
    for kind, body in _chunks(pathlib.Path(path).read_bytes()):
        if kind == b"tEXt":
            k, _, v = body.partition(b"\0")
            out[k.decode("latin-1")] = v.decode("latin-1")
    return out


def _form(ctype, trns):
    if ctype == 3:
        return "mask" if trns is not None else "composite"
    return "rgb"


def _planes(ctype, trns, rows):
    assert ctype == 3, "planes need an indexed file"
    if trns is not None:
        return [rows]
    return [[[v & 1 for v in r] for r in rows], [[(v >> 1) & 1 for v in r] for r in rows]]


def form(path):
    """mask: colour type 3 with tRNS, the form the vendored write_mask writes; composite: every other colour type 3 file,
    at any depth; rgb: colour types 2 and 6. Bit depth never decides it."""
    _, _, _, ctype, _, trns, _ = decode(path)
    return _form(ctype, trns)


def pixels(path):
    """RGB rows, the palette applied, so a composite compares by colour."""
    _, _, _, ctype, palette, _, rows = decode(path)
    return [[palette[i] for i in r] for r in rows] if ctype == 3 else rows


def planes(path):
    """A composite's first plane (index & 1) and spot plane ((index >> 1) & 1), or a mask's index plane."""
    _, _, _, ctype, _, trns, rows = decode(path)
    return _planes(ctype, trns, rows)


def plane_hash(w, h, plane):
    s = hashlib.sha256(struct.pack(">II", w, h))
    for r in plane:
        assert all(v in (0, 1) for v in r), "a plane holds 0 and 1 only"
        s.update(bytes(r))
    return s.hexdigest()


def record(path):
    """{ w, h, form, pixels_sha256, planes_sha256 } from the decoded file."""
    w, h, _, ctype, palette, trns, rows = decode(path)
    kind = _form(ctype, trns)
    if kind == "rgb":
        s = hashlib.sha256(struct.pack(">II", w, h))
        for r in rows:
            s.update(bytes(v for px in r for v in px))
        return {"w": w, "h": h, "form": kind, "pixels_sha256": s.hexdigest(), "planes_sha256": None}
    ps = [plane_hash(w, h, p) for p in _planes(ctype, trns, rows)]
    if kind == "mask":
        return {"w": w, "h": h, "form": kind, "pixels_sha256": ps[0], "planes_sha256": ps}
    s = hashlib.sha256(struct.pack(">II", w, h))
    for r in rows:
        s.update(bytes(v for i in r for v in palette[i]))
    return {"w": w, "h": h, "form": kind, "pixels_sha256": s.hexdigest(), "planes_sha256": ps}


def pixel_hash(path):
    return record(path)["pixels_sha256"]


def with_text(png, keyword, text):
    """The PNG with a tEXt chunk inserted before IEND."""
    body = keyword.encode("latin-1") + b"\0" + text.encode("latin-1")
    chunk = struct.pack(">I", len(body)) + b"tEXt" + body + struct.pack(">I", zlib.crc32(b"tEXt" + body) & 0xFFFFFFFF)
    assert png[-12:] == b"\x00\x00\x00\x00IEND\xaeB`\x82", "the PNG must end with IEND"
    return png[:-12] + chunk + png[-12:]


# ---------- shared ----------

def load(path):
    return json.loads(pathlib.Path(path).read_text())


def dumps(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False) + "\n"


def pkg_path(arg, default):
    return pathlib.Path(arg).resolve() if arg else PKG / default


def fail(problems):
    for p in problems:
        print(p, file=sys.stderr)
    return 1 if problems else 0


def write_or_check(path, text, check):
    if check:
        if not path.exists() or path.read_text() != text:
            return fail([f"{path}: out of date; rerun without --check"])
        print(f"{path}: up to date")
        return 0
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    print(f"wrote {path}")
    return 0


# ---------- tiles ----------

def svg_size(svg):
    m = re.search(r'width="(\d+)" height="(\d+)"', svg)
    return int(m.group(1)), int(m.group(2))


def mask_svg(w, h, on):
    """A line-screen tile as integer squares, in the form details.tile_svg writes."""
    d = "".join(f"M{x} {y}h1v1h-1z" for x, y in on)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'shape-rendering="crispEdges"><path d="{d}"/></svg>')


def tiles_data():
    details = load(PKG / "tokens/details.json")
    master = load(PKG / "tokens/master.json")
    out = {}
    for name, svg in details["tiles"].items():
        w, h = svg_size(svg)
        out[name] = {"w": w, "h": h, "svg": svg, "from": f"details.tiles_css() --{name}"}
    prefix = "data:image/svg+xml;base64,"
    assert details["ramp"].startswith(prefix)
    ramp = base64.b64decode(details["ramp"][len(prefix):]).decode()
    w, h = svg_size(ramp)
    out["ramp"] = {"w": w, "h": h, "svg": ramp, "from": "build_reach.ramp_url()"}
    for ship, angle in master["texture"]["line screen"]["angles"].items():
        s = details["screens"][str(angle)]
        out[f"line-{ship}"] = {"w": s["w"], "h": s["h"], "svg": mask_svg(s["w"], s["h"], s["on"]),
                               "from": f"chart.SCREENS[{angle}], {ship}'s angle in texture['line screen'].angles"}
    return out


def cmd_tiles(a):
    return write_or_check(pkg_path(a.out, "texture/tiles.json"), dumps(tiles_data()), a.check)


# ---------- plates ----------

def plate_inputs():
    return load(PKG / "tokens/details.json")["plate_inputs"]


def resolve(value, inputs):
    """A spec value: a number, or a name such as "build_sketch.W", "fields.SKETCH_PATH" or "build_reach.EMPTY_W[0]",
    read from tokens/details.json plate_inputs."""
    if not isinstance(value, str):
        return value
    m = re.fullmatch(r"(\w+)\.(\w+)(?:\[(\d+)\])?", value)
    assert m, f"bad plate input name {value!r}"
    v = inputs[m.group(1)][m.group(2)]
    if m.group(3) is not None:
        v = v[int(m.group(3))]
    if m.group(2).endswith("_PATH"):
        v = [(float(u), float(t)) for u, t in v]   # JSON drops the master's 0.0 and 1.0 to 0 and 1
    return v


def module_shas():
    files = load(PKG / "tokens/master.source.json")["files"]
    return {p.name: files[f"src/{p.name}"] for p in sorted((HERE / "master").glob("*.py"))}


def outputs(name, plate):
    """The files a plate writes: (stem, mode, plane), plane None for a composite."""
    planes_ = ("first", "spot") if plate["form"] == "masks" else (None,)
    return [(f"{name}-{m}" + (f"-{p}" if p else ""), m, p) for m in plate["modes"] for p in planes_]


def render(spec, work):
    """Run every plate through the vendored fields.py into work/; yield (stem, plate, mode, plane, params, raw path)."""
    import fields
    import palette

    fields.BUILD = work   # fields.save() writes here, never into the package
    inputs = plate_inputs()
    for name, plate in spec["plates"].items():
        fn = plate["function"]
        w, h = resolve(plate["w"], inputs), resolve(plate["h"], inputs)
        for mode in plate["modes"]:
            base = f"{name}-{mode}"
            if fn == "fields.opener_png":
                spot = palette.HOUSE[palette.HOUSE_DEFAULT][mode]
                path, width = resolve(plate["path"], inputs), resolve(plate["width"], inputs)
                fields.opener_png(base, w, h, mode, spot, path, width)
                params = {"w": w, "h": h, "mode": mode, "spot": spot, "path": [list(p) for p in path], "width": width}
            elif fn == "fields.figure_plates":
                fields.figure_plates(base, w, h, mode)
                params = {"w": w, "h": h, "mode": mode}
            elif fn == "fields.wedge":
                fields.wedge(base, w, h, mode)
                params = {"w": w, "h": h, "mode": mode}
            else:
                raise SystemExit(f"{name}: unknown function {fn}")
            for stem, m, p in outputs(name, plate):
                if m == mode:
                    yield stem, name, plate, mode, p, params, work / f"{stem}.png"


def build_plates(spec_path, out, ts, url_base):
    """Write every plate, PROVENANCE.json and the --ts map into out (and ts); return { stem: pixel hash }."""
    spec = load(spec_path)
    shas = module_shas()
    masters = load(PKG / "tokens/master-plates.json")
    out.mkdir(parents=True, exist_ok=True)
    hashes, prov, site = {}, {}, {}
    with tempfile.TemporaryDirectory() as tmp:
        for stem, name, plate, mode, plane, params, raw in render(spec, pathlib.Path(tmp)):
            module = plate["function"].split(".")[0] + ".py"
            source = {"generator": GENERATOR, "function": plate["function"], "plate": stem, "params": params,
                      "module_sha256": shas[module]}
            png = with_text(raw.read_bytes(), "Source", json.dumps(source, separators=(",", ":"), ensure_ascii=True))
            raw.write_bytes(png)
            rec = record(raw)
            file = f"{stem}.{rec['pixels_sha256'][:8]}.png"
            shutil.copyfile(raw, out / file)
            hashes[stem] = rec["pixels_sha256"]
            ref = plate.get("master", {}).get(stem)
            prov[file] = {
                "plate": name, "mode": mode, "plane": plane, "form": rec["form"],
                "generator": GENERATOR, "function": plate["function"], "params": params,
                "pixels_sha256": rec["pixels_sha256"], "planes_sha256": rec["planes_sha256"],
                "master": None if ref is None else {
                    "compare": plate["compare"],
                    "files": [{"file": f, "pixels_sha256": masters[f]["pixels_sha256"],
                               "planes_sha256": masters[f]["planes_sha256"]} for f in ref]},
                "module": f"scripts/texture/master/{module}", "module_sha256": shas[module],
            }
            entry = site.setdefault(name, {"form": plate["form"], "w": rec["w"], "h": rec["h"], "url": {}})
            url = url_base + file
            if plane:
                entry["url"].setdefault(mode, {})[plane] = url
            else:
                entry["url"][mode] = url
    provenance = {"generator": GENERATOR, "spec": "packages/superthread/texture/plates.json",
                  "modules": {f"scripts/texture/master/{k}": v for k, v in shas.items()}, "files": prov}
    (out / "PROVENANCE.json").write_text(dumps(provenance))
    if ts:
        ts.parent.mkdir(parents=True, exist_ok=True)
        ts.write_text(ts_text(site))
    return hashes


def ts_text(site):
    return ("// generated by packages/superthread/scripts/texture/build.py plates; never edit by hand\n"
            "// each plate: its form (composite: one image per mode; masks: a first and a spot plate per mode, inked by\n"
            "// css), its size in css pixels, and its url per mode\n"
            f"export const plates = {json.dumps(site, indent=2)} as const;\n\n"
            "export type PlateName = keyof typeof plates;\n")


def read_hashes(path):
    out = {}
    for line in pathlib.Path(path).read_text().splitlines():
        if line.strip():
            h, stem = line.split()
            out[stem] = h
    return out


def compare_hashes(fresh, recorded, label):
    problems = [f"{label}: {s} is {fresh[s]}, recorded {recorded[s]}" for s in sorted(fresh) if s in recorded and fresh[s] != recorded[s]]
    problems += [f"{label}: {s} is not recorded" for s in sorted(set(fresh) - set(recorded))]
    problems += [f"{label}: {s} is recorded but not built" for s in sorted(set(recorded) - set(fresh))]
    return problems


def cmd_plates(a):
    spec = pkg_path(a.spec, "texture/plates.json")
    out = pathlib.Path(a.out).resolve()
    ts = pathlib.Path(a.ts).resolve() if a.ts else None
    if a.write_hashes and a.check_hashes:
        raise SystemExit("--write-hashes and --check-hashes exclude each other")
    if not a.check:
        hashes = build_plates(spec, out, ts, a.url_base)
        print(f"wrote {len(hashes)} plates, PROVENANCE.json" + (f" and {ts}" if ts else "") + f" to {out}")
    else:
        with tempfile.TemporaryDirectory() as tmp:
            fresh = pathlib.Path(tmp) / "out"
            fresh_ts = pathlib.Path(tmp) / "plates.ts" if ts else None
            hashes = build_plates(spec, fresh, fresh_ts, a.url_base)
            problems = check_dir(fresh, out)
            if ts and (not ts.exists() or ts.read_text() != fresh_ts.read_text()):
                problems.append(f"{ts}: out of date")
            if problems:
                return fail(problems)
            print(f"{out}: {len(hashes)} plates up to date")
    if a.write_hashes:
        path = pathlib.Path(a.write_hashes).resolve()
        path.write_text("".join(f"{hashes[s]}  {s}\n" for s in sorted(hashes)))
        print(f"wrote {path}")
    if a.check_hashes:
        problems = compare_hashes(hashes, read_hashes(pathlib.Path(a.check_hashes).resolve()), "plates")
        if problems:
            return fail(problems)
        print(f"every plate matches {a.check_hashes}")
    return 0


def check_dir(fresh, out):
    """A fresh run against the files in out: the same PNG names, pixels and text chunks, and the same PROVENANCE.json."""
    a = {p.name for p in fresh.glob("*.png")}
    b = {p.name for p in out.glob("*.png")} if out.is_dir() else set()
    problems = [f"{out}: {n} is missing" for n in sorted(a - b)] + [f"{out}: {n} is not in the spec's output" for n in sorted(b - a)]
    for n in sorted(a & b):
        if pixel_hash(fresh / n) != pixel_hash(out / n) or texts(fresh / n) != texts(out / n):
            problems.append(f"{out}: {n} differs in pixels or text")
    prov = out / "PROVENANCE.json"
    if not prov.exists() or load(prov) != load(fresh / "PROVENANCE.json"):
        problems.append(f"{prov}: out of date")
    return problems


# ---------- verify, master, hash ----------

def cmd_verify(a):
    d = pathlib.Path(a.dir).resolve()
    files = sorted(d.glob("*.png")) if d.is_dir() else []
    if not files:
        print(f"{d}: no plates to verify")
        return 0
    recorded = read_hashes(pkg_path(a.check_hashes, "texture/plates.sha256"))
    problems = []
    for f in files:
        m = NAME.match(f.name)
        if not m:
            problems.append(f"{f.name}: not named <plate>.<hash8>.png")
            continue
        h = pixel_hash(f)
        want = recorded.get(m.group("stem"))
        if want is None:
            problems.append(f"{f.name}: {m.group('stem')} has no recorded hash")
        elif h != want:
            problems.append(f"{f.name}: pixels hash to {h}, recorded {want}")
        if not h.startswith(m.group("hash8")):
            problems.append(f"{f.name}: the name does not carry its pixel hash {h[:8]}")
        if "Source" not in texts(f):
            problems.append(f"{f.name}: no tEXt Source chunk")
    if problems:
        return fail(problems)
    print(f"{d}: {len(files)} plates verified")
    return 0


def cmd_master(a):
    d = pathlib.Path(a.dir).resolve()
    files = sorted(d.glob("*.png"))
    if not files:
        return fail([f"{d}: no PNGs"])
    return write_or_check(pkg_path(a.out, "tokens/master-plates.json"), dumps({f.name: record(f) for f in files}), a.check)


def cmd_hash(a):
    recs = {p: record(p) for p in a.png}
    if a.json:
        print(dumps(recs), end="")
    else:
        for p, r in recs.items():
            print(f"{r['pixels_sha256']}  {r['w']}x{r['h']}  {p}")
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="build.py", description="superthread's texture tiles and plates")
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("tiles")
    t.add_argument("--out")
    t.add_argument("--check", action="store_true")
    p = sub.add_parser("plates")
    p.add_argument("--spec")
    p.add_argument("--out", required=True)
    p.add_argument("--ts")
    p.add_argument("--url-base", default="/texture/")
    p.add_argument("--check", action="store_true")
    p.add_argument("--write-hashes")
    p.add_argument("--check-hashes")
    v = sub.add_parser("verify")
    v.add_argument("--dir", required=True)
    v.add_argument("--check-hashes")
    m = sub.add_parser("master")
    m.add_argument("--dir", required=True)
    m.add_argument("--out")
    m.add_argument("--check", action="store_true")
    h = sub.add_parser("hash")
    h.add_argument("--json", action="store_true")
    h.add_argument("png", nargs="+")
    a = ap.parse_args(argv)
    return {"tiles": cmd_tiles, "plates": cmd_plates, "verify": cmd_verify, "master": cmd_master, "hash": cmd_hash}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
