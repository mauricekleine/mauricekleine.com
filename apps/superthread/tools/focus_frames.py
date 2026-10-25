"""Count the frames a field draws, from the 2x crops tools/shoot.ts --focus takes after real interaction.

A port of the master world's src/focus.py, with its constants and its verdict, plus three checks of the plan's: the
2 px edge prints in the house ink (the error ink on an invalid field), no ancestor hugging the box draws a frame of
its own, and the text never moves inside the box.

Each crop holds one field box with PAD css px of page round it. The probe walks four lines into the box, from OUT css
px outside it (past where any offset ring would sit, short of a neighbour such as an open list) to INSET css px
inside it (short of the field's padding, its icon, its key cap or its text): left and right ROW px below the box's
top, top and bottom three quarters across. Every run of pixels that is neither the page colour where the line starts
nor the box's fill where it ends is a frame edge; the frames a field draws are the most runs on any line. One frame
of 1 px (rest, or a button inside the box holding focus) or 2 px (focus, or a printed focus demo) is the rule.

usage: focus_frames.py DIR [--html OUT.html]   (DIR holds manifest.jsonl and the crops it names; prints one row per
       crop and exits 1 when any field fails; --html writes the contact sheet)
       focus_frames.py crop SHOT OUT X Y W H [K]   (cuts a css rect out of a viewport shot taken at device scale K;
       a rect reaching past the shot is cut to it and the command exits 3, so the run can mark that crop clipped)
"""
import json
import pathlib
import struct
import sys
import zlib

HERE = pathlib.Path(__file__).resolve().parent
# run with -I: this directory and the vendored master modules come first, so nothing else answers "import png"
sys.path[:0] = [str(HERE), str(HERE.parents[2] / "packages/superthread/scripts/texture/master")]

from png import _chunk, read_rgb  # noqa: E402

PAD, K, INSET, OUT, ROW = 8, 2, 9, 6, 4


def px(rows, x, y):
    r = rows[y]
    return tuple(r[x * 3:x * 3 + 3])


def far(a, b):
    return sum(abs(p - q) for p, q in zip(a, b)) > 48


def runs(line, bgs):
    out, start = [], None
    for i, c in enumerate(line):
        if all(far(c, bg) for bg in bgs):
            if start is None:
                start = i
        elif start is not None:
            out.append((start, i - start, line[start]))
            start = None
    if start is not None:
        out.append((start, len(line) - start, line[start]))
    return out


def frames(path):
    """Runs of edge pixels on each of four lines walking into the box: {side: [(width in device px, colour)]}, or None
    when the crop is too small to hold the four lines."""
    w, h, rows = read_rgb(path)
    a, b = (PAD - OUT) * K, (PAD + INSET) * K
    if w < 2 * b or h < 2 * b or len(rows) < h:
        return None
    y, x = (PAD + ROW) * K, (w * 3) // 4
    lines = {
        "left": [px(rows, i, y) for i in range(a, b)],
        "right": [px(rows, w - 1 - i, y) for i in range(a, b)],
        "top": [px(rows, x, i) for i in range(a, b)],
        "bottom": [px(rows, x, h - 1 - i) for i in range(a, b)],
    }
    return {side: [(ln, "#%02x%02x%02x" % c) for _, ln, c in runs(line, (line[0], line[-1]))] for side, line in lines.items()}


def verdict(rec, fr):
    """The master's verdict, unchanged. One frame on every side: 2 css px (4 device px) when focused, 1 css px at
    rest. After Tab, a click or typing, the control must hold focus, draw no outline of its own, and its box must
    carry the 2 px outline inside (offset -2 px). A disabled field takes no focus and never shows the 2 px edge."""
    count = max(len(v) for v in fr.values())
    widths = sorted({ln for v in fr.values() for ln, _ in v})
    p = rec.get("probe", {})
    if rec.get("disabled"):
        return count, widths, not rec.get("active") and count <= 1 and all(w <= K for w in widths)
    ok = count == 1 and widths == [2 * K if rec["focused"] else K]
    if rec["how"] in ("tab", "click", "type"):
        ok = ok and rec.get("active") is True and p.get("ctl_outline") in ("none", "self") and p.get("box_outline") == "2px -2px"
    if rec["how"] == "inner":   # a button inside the box holds focus: its own 2 px ring, the box at its 1 px edge
        ok = ok and rec.get("active") is True and str(p.get("ctl_outline", "")).startswith("2px") and p.get("box_outline") == "none"
    return count, widths, ok


def rgb(hexa):
    return tuple(int(hexa[i:i + 2], 16) for i in (1, 3, 5))


def extra(rec, fr, rest_text):
    """The plan's checks on top of the verdict: the edge ink, no ancestor frame, the text unmoved. Returns problems."""
    p = rec.get("probe", {})
    problems = []
    if rec["focused"] and not rec.get("disabled"):
        want = p.get("error") if rec.get("invalid") else p.get("primary")
        seen = {c for v in fr.values() for _, c in v}
        if not want or any(far(rgb(c), rgb(want)) for c in seen):
            problems.append(f"edge {'/'.join(sorted(seen))} is not {'--error' if rec.get('invalid') else '--primary'} {want}")
    if p.get("ancestor"):
        problems.append(f"{p['ancestor']} draws a frame round the box")
    text = p.get("text")
    if rest_text is not None and text is not None and any(abs(a - b) > 0.5 for a, b in zip(text, rest_text)):
        problems.append(f"text moved from {rest_text} to {text}")
    return problems


def report(d):
    recs = [json.loads(line) for line in (d / "manifest.jsonl").read_text().splitlines() if line.strip()]
    bad, counted, first_text = 0, 0, {}
    for r in recs:
        if not r.get("count", True):
            print(f"note {r['page']:<22} {r['pageMode']:<5} {r.get('note', '')}")
            continue
        path = d / r["file"]
        fr = frames(path) if path.exists() else None
        key = r["key"]
        first_text.setdefault(key, r.get("probe", {}).get("text"))
        if fr is None:
            count, widths, ok = 0, [], False
            problems = ["no crop" if not path.exists() else "the crop is too small to read"]
        else:
            count, widths, ok = verdict(r, fr)
            problems = extra(r, fr, first_text[key])
        if r.get("clipped"):
            problems.append("the box reaches past the window, so the crop is cut")
        ok = ok and not problems
        r.update(frames=count, widths=[w // K for w in widths], colour=next((c for v in (fr or {}).values() for _, c in v), ""), ok=ok,
                 problems=problems)
        counted += 1
        bad += 0 if ok else 1
        print(f"{'ok  ' if ok else 'FAIL'} {r['page']:<22} {r['pageMode']:<5} {r['mode']:<5} {r['field']:<24} {r['how']:<6} "
              f"active={r.get('active', '')!s:<5} frames={count} edge={'/'.join(str(w // K) for w in widths)} px {r['colour']}"
              + (f"  ({'; '.join(problems)})" if problems else ""))
    print(f"{counted} crops, {bad} failing")
    if counted == 0:
        print("no field was shot")
        bad += 1
    return recs, bad


def page(d, recs, out):
    """The contact sheet: one row per field, rest or demo, then tab, click, typing and inner."""
    by = {}
    for r in recs:
        if not r.get("count", True):
            continue
        by.setdefault((r["page"], r["pageMode"]), {}).setdefault(r["key"], {})[r["how"]] = r
    html = ['<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px 32px;background:#fff;'
            'font:400 13px/18px "Fragment Mono",monospace;color:#16181d}h2{font:500 15px/20px sans-serif;margin:28px 0 10px}'
            'table{border-collapse:collapse}td{vertical-align:top;padding:0 18px 14px 0}'
            'img{display:block;image-rendering:pixelated;outline:1px solid #ddd}.c{margin-top:4px}.bad{color:#b00}</style>',
            "<h1 style='font:500 18px sans-serif;margin:0'>field focus by real interaction, 2x crops (one image pixel is one device pixel)</h1>"]
    for (pg, mode), fields in by.items():
        html.append(f"<h2>{pg} · page {mode}</h2><table>")
        for hows in fields.values():
            cells = ""
            for how in ("rest", "demo", "tab", "click", "type", "inner"):
                r = hows.get(how)
                if not r:
                    continue
                cap = f"{how}: {r['frames']} frame, {'/'.join(map(str, r['widths']))} px"
                cls = "" if r.get("ok", True) else " bad"
                cells += f'<td><img src="{r["file"]}"><div class="c{cls}">{r["field"]} ({r["mode"]}) · {cap}</div></td>'
            html.append(f"<tr>{cells}</tr>")
        html.append("</table>")
    (d / out).write_text("".join(html))


def crop(shot, out, x, y, w, h, k=2):
    """Cut a css rect out of a viewport shot taken at device scale k, as the master's crop.py does. The rect is cut to
    the shot; returns whether it had to be."""
    x, y, w, h = (round(v * k) for v in (x, y, w, h))
    sw, sh, rows = read_rgb(shot)
    x0, y0, x1, y1 = max(0, x), max(0, y), min(sw, x + w), min(sh, y + h)
    clipped = (x0, y0, x1, y1) != (x, y, x + w, y + h)
    x1, y1 = max(x1, x0 + 1), max(y1, y0 + 1)   # never an empty image; the report fails a crop this small
    x0, y0 = min(x0, sw - 1), min(y0, sh - 1)
    x1, y1 = min(x1, sw), min(y1, sh)
    cut = [bytes(r[x0 * 3:x1 * 3]) for r in rows[y0:y1]]
    raw = b"".join(b"\x00" + r for r in cut)
    with open(out, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", struct.pack(">IIBBBBB", x1 - x0, len(cut), 8, 2, 0, 0, 0))
                + _chunk(b"IDAT", zlib.compress(raw, 6)) + _chunk(b"IEND", b""))
    return clipped


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "crop":
        clipped = crop(args[1], args[2], *map(float, args[3:7]), *(float(v) for v in args[7:8]))
        sys.exit(3 if clipped else 0)
    d = pathlib.Path(args[0])
    recs, bad = report(d)
    if "--html" in args:
        page(d, recs, args[args.index("--html") + 1])
    sys.exit(1 if bad else 0)
