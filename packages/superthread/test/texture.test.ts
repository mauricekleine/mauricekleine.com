// The texture port: the tiles and plates scripts/texture/build.py makes with the vendored master modules, its decoder,
// and the hand-written utilities in tokens/texture.css. Reads only S1.T's files and the committed tokens/details.json,
// tokens/master.json, tokens/master.source.json and tokens/master-plates.json; never the master world.
import { afterAll, beforeAll, expect, setDefaultTimeout, test } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const scripts = join(root, "scripts/texture");
const json = (path: string) => JSON.parse(readFileSync(join(root, path), "utf8"));

type Run = { code: number; out: string; err: string };

/** Runs build.py isolated (`-I`) from the package root. */
function build(...args: string[]): Run {
  const run = Bun.spawnSync(["python3", "-I", join(scripts, "build.py"), ...args], { cwd: root });
  return { code: run.exitCode ?? 1, out: run.stdout.toString(), err: run.stderr.toString() };
}

/** Runs Python isolated with build.py's directory and the vendored modules first on sys.path; parses the JSON it prints. */
function python(code: string, ...args: string[]) {
  const head = `import json, sys; sys.path[:0] = [${JSON.stringify(scripts)}, ${JSON.stringify(join(scripts, "master"))}]; sys.dont_write_bytecode = True\nimport build\n`;
  const run = Bun.spawnSync(["python3", "-I", "-c", head + code, ...args]);
  if (run.exitCode !== 0) throw new Error(run.stderr.toString());
  return JSON.parse(run.stdout.toString());
}

type PlateRecord = { w: number; h: number; form: string; pixels_sha256: string; planes_sha256: string[] | null };
type Plate = { function: string; form: string; compare?: string; master?: { [stem: string]: string[] } };

// a plate run takes about 3 s; three run here
setDefaultTimeout(60_000);

const tmp = mkdtempSync(join(tmpdir(), "texture-test-"));
const out = join(tmp, "plates");
let built: Run;
let files: Map<string, string>; // stem -> file name
let records: { [file: string]: PlateRecord };

beforeAll(() => {
  built = build("plates", "--out", out, "--check-hashes", "texture/plates.sha256");
  files = new Map(
    readdirSync(out)
      .filter((f) => f.endsWith(".png"))
      .map((f) => [f.replace(/\.[0-9a-f]{8}\.png$/, ""), f]),
  );
  const recs = JSON.parse(build("hash", "--json", ...[...files.values()].map((f) => join(out, f))).out);
  records = Object.fromEntries(Object.entries(recs).map(([p, r]) => [p.slice(out.length + 1), r as PlateRecord]));
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

// ---------- tiles and plates ----------

test("tiles.json is what `tiles` writes", () => {
  const run = build("tiles", "--check");
  expect(run.err).toBe("");
  expect(run.code).toBe(0);
});

test("a fresh plate run hashes to plates.sha256, file for file", () => {
  expect(built.err).toBe("");
  expect(built.code).toBe(0);
  const recorded = readFileSync(join(root, "texture/plates.sha256"), "utf8").trim().split("\n");
  expect([...files.keys()].sort()).toEqual(recorded.map((l) => l.split(/\s+/)[1]!));
  for (const line of recorded) {
    const [hash, stem] = line.split(/\s+/) as [string, string];
    expect({ stem, hash: records[files.get(stem)!]!.pixels_sha256 }).toEqual({ stem, hash });
    expect(files.get(stem)).toBe(`${stem}.${hash.slice(0, 8)}.png`);
  }
});

test("every plate the master has equals it, by pixels or by planes", () => {
  const spec: { [name: string]: Plate } = json("texture/plates.json").plates;
  const master: { [file: string]: PlateRecord } = json("tokens/master-plates.json");
  const compared = Object.entries(spec).filter(([, p]) => p.master);
  expect(compared.map(([n]) => n).sort()).toEqual(
    ["empty", "empty-phone", "figure", "figure-phone", "opener", "opener-phone"].sort(),
  );
  for (const [, plate] of compared) {
    for (const [stem, from] of Object.entries(plate.master!)) {
      const mine = records[files.get(stem)!]!;
      const theirs = from.map((f) => master[f]!);
      if (plate.compare === "pixels") {
        expect(from).toHaveLength(1);
        expect({ stem, form: mine.form, pixels: mine.pixels_sha256 }).toEqual({
          stem,
          form: theirs[0]!.form,
          pixels: theirs[0]!.pixels_sha256,
        });
      } else {
        expect(plate.compare).toBe("planes");
        expect({ stem, planes: mine.planes_sha256 }).toEqual({ stem, planes: theirs.flatMap((t) => t.planes_sha256!) });
      }
    }
  }
});

test("master-plates.json records each master plate's form from the file", () => {
  const master: { [file: string]: PlateRecord } = json("tokens/master-plates.json");
  for (const [file, rec] of Object.entries(master)) {
    const want = /^(figure-|reach-opener-)/.test(file)
      ? "mask"
      : /^(sketch-opener|empty-)/.test(file)
        ? "composite"
        : "unexpected";
    expect({ file, form: rec.form }).toEqual({ file, form: want });
  }
});

// the plates fields.wedge draws: the empty and loading place at each width it shows
const wedges = () =>
  Object.entries(json("texture/plates.json").plates as { [name: string]: Plate })
    .filter(([, plate]) => plate.function === "fields.wedge")
    .map(([name]) => name)
    .sort();

test("the light and dark wedges hash apart", () => {
  for (const base of wedges())
    expect(records[files.get(`${base}-light`)!]!.pixels_sha256).not.toBe(
      records[files.get(`${base}-dark`)!]!.pixels_sha256,
    );
});

test("every wedge prints the world's three steps whole at its width, the board column's 112 x 120 among them", () => {
  expect(wedges()).toContain("empty-column");
  for (const mode of ["light", "dark"])
    expect(records[files.get(`empty-column-${mode}`)!]).toMatchObject({ w: 112, h: 120 });
  // the world's note: a ramp "which bayer 4 x 4 prints as three steps (6.25, 12.5 and 18.75 percent), drawn at the
  // width it shows", so a plate cropped to a narrower field shows only its first step
  const uses: string[] = json("tokens/master.json").texture.dither.use;
  const note = uses.find((use) => use.startsWith("empty and loading:"))!;
  const steps = [.../three steps \(([^)]*)\)/.exec(note)![1]!.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  expect(steps).toHaveLength(3);
  // each plate's coverage in percent over its whole 4 x 4 cells; fields.wedge writes the palette [stock, ink]
  const stems = wedges().flatMap((name) => ["light", "dark"].map((mode) => `${name}-${mode}`));
  const coverage: { [file: string]: number[] } = python(
    `import pathlib
out = {}
for p in map(pathlib.Path, sys.argv[1:]):
    w, h, depth, ctype, palette, trns, rows = build.decode(p)
    out[p.name] = sorted({sum(rows[y][x] for y in range(y0, y0 + 4) for x in range(x0, x0 + 4)) * 100 / 16
                          for x0 in range(0, w - 3, 4) for y0 in range(0, h - 3, 4)})
print(json.dumps(out))`,
    ...stems.map((stem) => join(out, files.get(stem)!)),
  );
  for (const stem of stems)
    expect({ stem, missing: steps.filter((step) => !coverage[files.get(stem)!]!.includes(step)) }).toEqual({
      stem,
      missing: [],
    });
});

test("every plate carries a Source chunk: generator, function, plate, params and the module's master sha, no version", () => {
  const sources = json("tokens/master.source.json").files;
  const texts = python(
    `import pathlib
d = pathlib.Path(sys.argv[1])
print(json.dumps({p.name: build.texts(p) for p in sorted(d.glob("*.png"))}))`,
    out,
  );
  const version = json("package.json").version;
  for (const [file, text] of Object.entries(texts) as [string, { [k: string]: string }][]) {
    expect(Object.keys(text)).toEqual(["Source"]);
    expect(text.Source).not.toContain(version);
    const source = JSON.parse(text.Source!);
    expect(Object.keys(source).sort()).toEqual(["function", "generator", "module_sha256", "params", "plate"]);
    expect(source.generator).toBe("packages/superthread/scripts/texture/build.py");
    expect(file.startsWith(`${source.plate}.`)).toBe(true);
    expect(source.module_sha256).toBe(sources[`src/${source.function.split(".")[0]}.py`]);
  }
});

test("PROVENANCE.json names each file's generator, function, params, master hash and module sha", () => {
  type Entry = {
    plate: string;
    function: string;
    generator: string;
    params: { w: number; h: number };
    pixels_sha256: string;
    module: string;
    module_sha256: string;
    master: unknown;
  };
  const prov: { generator: string; modules: { [path: string]: string }; files: { [file: string]: Entry } } = JSON.parse(
    readFileSync(join(out, "PROVENANCE.json"), "utf8"),
  );
  const sources = json("tokens/master.source.json").files;
  const spec: { [name: string]: Plate } = json("texture/plates.json").plates;
  const master: { [file: string]: PlateRecord } = json("tokens/master-plates.json");
  expect(prov.generator).toBe("packages/superthread/scripts/texture/build.py");
  for (const [path, sha] of Object.entries(prov.modules)) expect(sha).toBe(sources[`src/${path.split("/").at(-1)}`]);
  expect(Object.keys(prov.files).sort()).toEqual([...files.values()].sort());
  for (const [file, f] of Object.entries(prov.files)) {
    const plate = spec[f.plate]!;
    expect(f.function).toBe(plate.function);
    expect(f.generator).toBe(prov.generator);
    expect(f.params.w).toBe(records[file]!.w);
    expect(f.params.h).toBe(records[file]!.h);
    expect(f.pixels_sha256).toBe(records[file]!.pixels_sha256);
    expect(f.module_sha256).toBe(prov.modules[f.module]);
    const stem = file.replace(/\.[0-9a-f]{8}\.png$/, "");
    const from: string[] | undefined = plate.master?.[stem];
    if (from === undefined) expect(f.master).toBeNull();
    else
      expect(f.master).toEqual({
        compare: plate.compare,
        files: from.map((m) => ({
          file: m,
          pixels_sha256: master[m]!.pixels_sha256,
          planes_sha256: master[m]!.planes_sha256,
        })),
      });
  }
});

test("`plates --check` passes on its own output and fails on a changed one", () => {
  expect(build("plates", "--out", out, "--check").code).toBe(0);
  const other = join(tmp, "changed");
  mkdirSync(other);
  for (const f of readdirSync(out)) if (!f.startsWith("band-light.")) copyFileSync(join(out, f), join(other, f));
  const run = build("plates", "--out", other, "--check");
  expect(run.code).toBe(1);
  expect(run.err).toContain("band-light.");
});

test("verify passes on built plates, on an empty directory and on a missing one, and fails on a misnamed plate", () => {
  expect(build("verify", "--dir", out).code).toBe(0);
  const empty = join(tmp, "empty");
  mkdirSync(empty);
  expect(build("verify", "--dir", empty).code).toBe(0);
  expect(build("verify", "--dir", join(tmp, "missing")).code).toBe(0);
  const wrong = join(tmp, "wrong");
  mkdirSync(wrong);
  copyFileSync(join(out, files.get("band-light")!), join(wrong, "band-light.00000000.png"));
  const run = build("verify", "--dir", wrong);
  expect(run.code).toBe(1);
  expect(run.err).toContain("does not carry its pixel hash");
});

// ---------- the decoder ----------

test("the decoder round-trips write_indexed, write_mask and write_rgb under every PNG filter type", () => {
  const result = python(`import pathlib, random, struct, tempfile, zlib
import png
rng = random.Random(7)
tmp = pathlib.Path(tempfile.mkdtemp())

def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    return a if pa <= pb and pa <= pc else b if pb <= pc else c

def refilter(data, filters, bpp):
    """The same image with each scanline re-filtered by filters[y % len(filters)]."""
    chunks = list(build._chunks(data))
    w, h, depth, ctype = struct.unpack(">IIBB", chunks[0][1][:10])
    channels = 1 if ctype == 3 else 3
    stride = (w * depth * channels + 7) // 8
    raw = zlib.decompress(b"".join(b for k, b in chunks if k == b"IDAT"))
    lines = [raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)] for y in range(h)]
    body, prev = bytearray(), bytes(stride)
    for y, x in enumerate(lines):
        f = filters[y % len(filters)]
        body.append(f)
        for i in range(stride):
            a = x[i - bpp] if i >= bpp else 0
            b, c = prev[i], (prev[i - bpp] if i >= bpp else 0)
            body.append((x[i] - (0, a, b, (a + b) // 2, paeth(a, b, c))[f]) & 255)
        prev = x
    head = b"".join(png._chunk(k, b) for k, b in chunks if k not in (b"IDAT", b"IEND"))
    return data[:8] + head + png._chunk(b"IDAT", zlib.compress(bytes(body))) + png._chunk(b"IEND", b"")

def check(name, data, bpp, want):
    out = []
    for filters in ([0], [1], [2], [3], [4], [0, 1, 2, 3, 4]):
        p = tmp / f"{name}-{''.join(map(str, filters))}.png"
        p.write_bytes(refilter(data, filters, bpp))
        w, h, depth, ctype, palette, trns, rows = build.decode(p)
        out.append({"name": name, "filters": filters, "ok": rows == want["rows"] and palette == want.get("palette"),
                    "depth": depth, "form": build.form(p)})
    return out

results = []
w, h = 13, 6
for n in (2, 3, 4, 16, 17):
    pal = ["#%02x%02x%02x" % (rng.randrange(256), rng.randrange(256), rng.randrange(256)) for _ in range(n)]
    rows = [[rng.randrange(n) for _ in range(w)] for _ in range(h)]
    rows[0][0], rows[-1][-1] = 0, n - 1
    want = {"rows": rows, "palette": [tuple(int(c[k:k + 2], 16) for k in (1, 3, 5)) for c in pal]}
    results += check(f"indexed-{n}", png.write_indexed(rows, pal), 1, want)
rows = [[rng.randrange(2) for _ in range(w)] for _ in range(h)]
results += check("mask", png.write_mask(rows), 1, {"rows": rows, "palette": [(0, 0, 0), (0, 0, 0)]})
px = [(rng.randrange(256), rng.randrange(256), rng.randrange(256)) for _ in range(w * h)]
results += check("rgb", png.write_rgb(px, w, h), 3, {"rows": [px[y * w:(y + 1) * w] for y in range(h)], "palette": None})
print(json.dumps(results))`);
  const want = (name: string) =>
    name === "mask"
      ? { depth: 1, form: "mask" }
      : name === "rgb"
        ? { depth: 8, form: "rgb" }
        : { depth: { 2: 1, 3: 2, 4: 2, 16: 4, 17: 8 }[Number(name.split("-")[1])], form: "composite" };
  expect(result).toHaveLength(7 * 6);
  for (const r of result)
    expect({ name: r.name, filters: r.filters, ok: r.ok, depth: r.depth, form: r.form }).toEqual({
      name: r.name,
      filters: r.filters,
      ok: true,
      ...want(r.name),
    });
});

// ---------- texture.css ----------

type Rule = { sel: string; decls: [string, string][]; rules: Rule[] };

/** A block tree of the file: every rule or at-rule with its own declarations and nested rules, whitespace normalised. */
function parse(css: string): Rule {
  const norm = (s: string) => s.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();
  const top: Rule = { sel: "", decls: [], rules: [] };
  const stack = [top];
  let buf = "";
  let parens = 0;
  const decl = () => {
    const s = norm(buf);
    buf = "";
    if (!s) return;
    const i = s.indexOf(":");
    stack.at(-1)!.decls.push([s.slice(0, i).trim(), s.slice(i + 1).trim()]);
  };
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (ch === "(") parens++;
    if (ch === ")") parens--;
    if (parens === 0 && ch === "{") {
      const rule: Rule = { sel: norm(buf), decls: [], rules: [] };
      buf = "";
      stack.at(-1)!.rules.push(rule);
      stack.push(rule);
    } else if (parens === 0 && ch === "}") {
      decl();
      stack.pop();
    } else if (parens === 0 && ch === ";") decl();
    else buf += ch;
  }
  expect(stack).toHaveLength(1);
  return top;
}

const css = readFileSync(join(root, "tokens/texture.css"), "utf8");
const sheet = parse(css);
const tiles: { [name: string]: { w: number; h: number } } = json("texture/tiles.json");
const details = json("tokens/details.json");

const child = (rule: Rule, sel: string) => {
  const found = rule.rules.filter((r) => r.sel === sel);
  expect({ in: rule.sel, sel, count: found.length }).toEqual({ in: rule.sel, sel, count: 1 });
  return found[0]!;
};
const utility = (name: string) => child(sheet, `@utility ${name}`);
const value = (rule: Rule, prop: string) => Object.fromEntries(rule.decls)[prop];
const walk = (rule: Rule): Rule[] => [rule, ...rule.rules.flatMap(walk)];
const declsOf = (rule: Rule) => walk(rule).flatMap((r) => r.decls);

test("texture.css reads every tile and only tiles that exist, and holds no placeholder", () => {
  const used = new Set([...css.matchAll(/var\(--texture-([\w-]+)\)/g)].map((m) => m[1]));
  expect([...used].sort()).toEqual(Object.keys(tiles).sort());
  expect(css).not.toContain("@@");
});

test("texture.css has a utility for every DETAILS key, the ramp and each ship's line screen, and none for REJECTED", () => {
  const ships = Object.keys(json("tokens/master.json").texture["line screen"].angles);
  const want = [
    ...details.DETAILS.map((d: { key: string }) => `texture-${d.key}`),
    "texture-ramp",
    ...ships.map((s) => `texture-line-${s}`),
  ];
  const have = sheet.rules.map((r) => r.sel);
  expect(have.every((s) => s.startsWith("@utility texture-"))).toBe(true);
  expect(have.map((s) => s.slice("@utility ".length)).sort()).toEqual(want.sort());
  for (const rejected of Object.keys(details.REJECTED))
    for (const word of rejected.split(" ").filter((w) => w.length > 3))
      expect(have.filter((s) => s.includes(word))).toEqual([]);
});

test("texture-contact lifts light layers by --contact-lift and its edge, screens the L, and leaves dark alone", () => {
  const contact = utility("texture-contact");
  const light = child(contact, "&:not(:is(.dark *):not(.dark .light *))");
  expect(light.decls).toEqual([["box-shadow", "var(--contact-lift), inset 0 0 0 1px var(--raised-edge)"]]);
  const after = child(contact, "&::after");
  expect(value(after, "content")).toBe('""');
  expect(value(after, "position")).toBe("absolute");
  expect(value(after, "left")).toBe("-1px");
  expect(value(after, "top")).toBe("-1px");
  expect(value(after, "width")).toBe("calc(100% + 2px + var(--contact-x))");
  expect(value(after, "height")).toBe("calc(100% + 2px + var(--contact-y))");
  expect(value(after, "background")).toBe("var(--shadow-ink)");
  expect(value(after, "mask")).toBe("var(--texture-rake-contact) 0 0 / 4px 4px");
  expect(value(after, "clip-path")).toBe(
    "polygon(calc(100% - var(--contact-x)) var(--contact-y), 100% var(--contact-y), 100% 100%, var(--contact-x) 100%, var(--contact-x) calc(100% - var(--contact-y)), calc(100% - var(--contact-x)) calc(100% - var(--contact-y)))",
  );
  expect(child(contact, "&:is(.dark *):not(.dark .light *)::after").decls).toEqual([["display", "none"]]);
  // the light rule is the only box-shadow, and the layer's own position is never set
  expect(declsOf(contact).filter(([p]) => p === "box-shadow")).toHaveLength(1);
  expect(contact.decls).toEqual([]);
  expect(contact.rules.map((r) => r.sel)).toEqual([
    "&:not(:is(.dark *):not(.dark .light *))",
    "&::after",
    "&:is(.dark *):not(.dark .light *)::after",
  ]);
});

test("texture-disabled screens the edge on ::before, a field box only for a disabled text control, and a bare input or textarea masks its own border (ruling 3)", () => {
  const disabled = utility("texture-disabled");
  const variant = child(disabled, "@variant disabled");
  for (const box of [variant, child(disabled, "&:has(:is(input:disabled, textarea:disabled))")]) {
    expect(value(box, "border-color")).toBe("transparent");
    const before = child(box, "&::before");
    expect(value(before, "inset")).toBe("-1px");
    expect(value(before, "padding")).toBe("1px");
    expect(value(before, "background")).toBe("var(--input)");
    expect(value(before, "mask")).toBe("var(--texture-b50) 0 0 / 4px 4px, linear-gradient(#000 0 0) content-box");
    expect(value(before, "mask-composite")).toBe("subtract");
  }
  const element = child(variant, "&:is(input, textarea)");
  expect(element.decls).toEqual([
    ["border-color", "var(--input)"],
    ["mask", "var(--texture-b50) 0 0 / 4px 4px border-box, linear-gradient(#000 0 0) padding-box"],
  ]);
});

test("state selectors go through @variant, so the site's demo variants reach them", () => {
  const selectors = walk(sheet).map((r) => r.sel);
  for (const s of selectors) expect(s).not.toMatch(/:(hover|focus-visible|focus|active)\b/);
  expect(selectors.filter((s) => /:disabled/.test(s))).toEqual(["&:has(:is(input:disabled, textarea:disabled))"]);
  child(utility("texture-tabhover"), "@variant hover");
  child(child(utility("texture-rowedge"), "& tbody tr"), "@variant hover");
});

test("the row edge is half on hover and solid when selected", () => {
  const rows = child(utility("texture-rowedge"), "& tbody tr");
  const hover = child(
    child(rows, "@variant hover"),
    '&:not([aria-selected="true"], [data-state="selected"]) > td:first-child::before',
  );
  expect(value(hover, "mask")).toBe("var(--texture-b50) 0 0 / 4px 4px");
  const selected = child(rows, '&:is([aria-selected="true"], [data-state="selected"]) > td:first-child::before');
  expect(value(selected, "mask")).toBeUndefined();
  for (const strip of [hover, selected]) expect(value(strip, "width")).toBe("4px");
});

test("texture.css never moves, and every mask is a tile at its own whole-pixel size", () => {
  expect(css).not.toMatch(/\b(animation|transition)[\w-]*\s*:/);
  expect(css).not.toMatch(/\d\.\d+px/);
  const masks = declsOf(sheet).filter(([p]) => p.startsWith("mask"));
  let sized = 0;
  for (const [, v] of masks) {
    const refs = [...v.matchAll(/var\(--texture-([\w-]+)\)/g)].length;
    const sizes = [...v.matchAll(/var\(--texture-([\w-]+)\) [^,/]*\/ (\d+)px (\d+)px/g)];
    expect({ v, sizes: sizes.length }).toEqual({ v, sizes: refs });
    for (const [, name, w, h] of sizes)
      expect({ name, w: Number(w), h: Number(h) }).toEqual({ name, w: tiles[name!]!.w, h: tiles[name!]!.h });
    sized += sizes.length;
  }
  expect(sized).toBeGreaterThanOrEqual(Object.keys(tiles).length);
});
