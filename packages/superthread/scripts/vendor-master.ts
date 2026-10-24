// Vendors the master world into the package: `bun scripts/vendor-master.ts <M> [--check]`.
//
// It checks the world against the hashes the stage 0 gate recorded, copies `M/tokens.json` to `tokens/master.json`
// and the import closure of `details.py` and `fields.py` to `scripts/texture/master/` byte for byte, dumps the data
// tests need into `tokens/{glyphs,details,check}.json` with one `python3 -I -c` run, and records every source file's
// sha256 in `tokens/master.source.json`. `--check` reruns all of it into $TMPDIR, compares files only (ignoring the
// source map's `at`), then runs `build.py master --check` against `M/build`. It reads `M`, so it never runs in CI.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

// the world the stage 0 gate recorded: a mismatch stops the vendor and goes to the lead
const GATE: Record<string, string> = {
  "tokens.json": "a2421898a9e1cd60536c6309268e5da7bc526215fd22b8d7378d2f0c2f784e1d",
  "src/details.py": "3e2835cc18040c1e9c497c9d80450c611669cc9c46dbd54f484e99e51a1ebe9a",
  "src/reach.css": "89a5ec2efa731714d697118c0ee27690889cfeae3b55fff862e6448b7c196812",
  "src/check.py": "347a5b8ec0cc14068aea052aff7753b68030ce17cfd93c4ccdb2a124d5c6596a",
};
// the closure of the two roots, as the gate recorded it; the scan must find exactly these
const ROOTS = ["details", "fields"];
const GATE_CLOSURE = ["details", "fields", "ink", "opener", "palette", "png", "screen"];
// read for the dumps without being vendored: provenance only
const DUMPED_FROM = [
  "src/details.py",
  "src/check.py",
  "src/build_reach.py",
  "src/build_sketch.py",
  "src/chart.py",
  "src/common.py",
  "src/tokens.py",
  "src/reach.css",
  "reach.html",
];

const pkg = join(import.meta.dir, "..");
const MODULES = "scripts/texture/master";
const DUMPS = ["tokens/glyphs.json", "tokens/details.json", "tokens/check.json"];
const SOURCE = "tokens/master.source.json";

const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
const writeJson = (file: string, value: unknown) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
};
const pyFiles = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".py"))
        .sort()
    : [];

/** Top-level module names a Python file imports, from its `import x` and `from x import` lines. */
function importsOf(source: string): string[] {
  const names = new Set<string>();
  for (const raw of source.split("\n")) {
    const line = raw.replace(/#.*/, "");
    const from = line.match(/^\s*from\s+([A-Za-z_][\w.]*)\s+import\b/);
    if (from) names.add(from[1]!.split(".")[0]!);
    const imp = line.match(/^\s*import\s+(.+)$/);
    if (imp) for (const part of imp[1]!.split(",")) names.add(part.trim().split(/\s+/)[0]!.split(".")[0]!);
  }
  return [...names].filter(Boolean);
}

/** The modules in `M/src` that the roots reach through their imports, recursively. */
function closure(src: string): string[] {
  const seen = new Set<string>();
  const queue = [...ROOTS];
  while (queue.length) {
    const name = queue.shift()!;
    const file = join(src, `${name}.py`);
    if (seen.has(name) || !existsSync(file)) continue;
    seen.add(name);
    queue.push(...importsOf(readFileSync(file, "utf8")));
  }
  return [...seen].sort();
}

// The dump. Its first statement puts M/src on the path, because `-I` leaves the script directory off. `-B` keeps
// Python from writing bytecode into M. The master's imports and check.run print; only the JSON reaches stdout.
const dumpCode = (master: string) => String.raw`import sys; sys.path.insert(0, ${JSON.stringify(join(master, "src"))})
import ast, base64, contextlib, io, json, re

MASTER = ${JSON.stringify(master)}
REAL = sys.stdout
sys.stdout = io.StringIO()
import build_reach, build_sketch, chart, check, common, details, fields, palette, tokens


def own_constants(mod):
    """Upper-case names the module itself assigns at its top level, in source order."""
    names = []
    for node in ast.parse(open(mod.__file__).read()).body:
        targets = node.targets if isinstance(node, ast.Assign) else [node.target] if isinstance(node, ast.AnnAssign) else []
        for target in targets:
            for name in target.elts if isinstance(target, ast.Tuple) else [target]:
                if isinstance(name, ast.Name) and name.id.isupper() and name.id not in names:
                    names.append(name.id)
    return names


def is_number(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def is_plain(v):
    """A number, a string, or a list or tuple of those."""
    return is_number(v) or isinstance(v, str) or (isinstance(v, (list, tuple)) and all(is_plain(x) for x in v))


def is_json(v):
    if v is None or isinstance(v, (bool, str)) or is_number(v):
        return True
    if isinstance(v, (list, tuple)):
        return all(is_json(x) for x in v)
    return isinstance(v, dict) and all(isinstance(k, str) and is_json(x) for k, x in v.items())


# details.json: the module's data, its tiles (decoded), the progress ramp, the chart's line screens and the plate inputs
out = {k: getattr(details, k) for k in own_constants(details) if is_json(getattr(details, k))}
out["tiles_css"] = details.tiles_css()
DECL = r'--([\w-]+):url\("data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)"\)'
assert re.fullmatch(f"{DECL}(?:;{DECL})*", out["tiles_css"]), f"tiles_css: unexpected form {out['tiles_css']!r}"
out["tiles"] = {m.group(1): base64.b64decode(m.group(2)).decode() for m in re.finditer(DECL, out["tiles_css"])}
out["ramp"] = build_reach.ramp_url()
out["screens"] = {str(angle): {"w": w, "h": h, "on": [[x, y] for y in range(h) for x in range(w) if not knocked(x, y)]}
                  for angle, (w, h, knocked) in chart.SCREENS.items()}
out["plate_inputs"] = {
    "build_sketch": {k: getattr(build_sketch, k) for k in ("W", "H")},
    "build_reach": {k: getattr(build_reach, k) for k in ("BAND_W", "BAND_H", "FIG_W", "FIG_PW", "FIG_H", "EMPTY_W")},
    "fields": {k: getattr(fields, k) for k in ("SKETCH_PATH", "REACH_PATH", "PHONE_PATH", "PHONE_W", "PHONE_H", "PHONE_WIDTH")},
}
details_json = out

# check.json: constants, the shipped house and level, every need/apart/chroma call in run(), and what run() prints
check_src = open(check.__file__).read()
constants = {k: getattr(check, k) for k in own_constants(check) if is_plain(getattr(check, k))}
constants["TEXT_GROUNDS"] = tokens.TEXT_GROUNDS
FLOOR_AT = {"need": 3, "apart": 2, "chroma": 2}
run = next(n for n in ast.parse(check_src).body if isinstance(n, ast.FunctionDef) and n.name == "run")
calls = sorted((n for n in ast.walk(run) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id in FLOOR_AT),
               key=lambda n: (n.lineno, n.col_offset))
assertions = []
for call in calls:
    fn = call.func.id
    assert len(call.args) > FLOOR_AT[fn] and not call.keywords, f"check.py line {call.lineno}: {fn} takes its label and floor by position"
    floor = call.args[FLOOR_AT[fn]]
    value = None
    if isinstance(floor, ast.Constant) and is_number(floor.value):
        value = floor.value
    elif isinstance(floor, ast.Name) and floor.id.isupper() and is_number(getattr(check, floor.id, None)):
        value = getattr(check, floor.id)
    assertions.append({"fn": fn, "label": ast.get_source_segment(check_src, call.args[0]),
                       "floor": {"source": ast.get_source_segment(check_src, floor), "value": value}, "line": call.lineno})

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    fails = check.run(verbose=True)
assert not fails, f"check.py fails: {fails}"
printed = buf.getvalue().splitlines()
passed = [line[5:] for line in printed if line.startswith("ok   ")]
assert printed[-1] == f"{len(passed)} pairs pass, 0 fail", printed[-1]

MODES = ("light", "dark")


def shipped(line):
    """The line with its house and level tags reduced to [light] or [dark]; None for another house or level."""
    m = re.match(r"\[([^\]]+)\] (.*)$", line)
    if not m:
        return line
    words, rest = m.group(1).rsplit(" ", 1), m.group(2)
    if len(words) == 2 and words[0] in palette.HOUSE and words[1] in MODES:
        house, mode = words
    elif len(words) == 1 and words[0] in MODES:
        house, mode = None, words[0]
    else:
        return line
    level = None
    lm = re.match(r"\[([^\]]+)\] (.*)$", rest)
    if lm and lm.group(1) in palette.STATUS_LEVELS:
        level, rest = lm.group(1), lm.group(2)
    if house not in (None, palette.HOUSE_DEFAULT) or level not in (None, palette.STATUS_LEVEL):
        return None
    return f"[{mode}] {rest}"


labels, reported = [], []
for line in passed:
    line = shipped(line)
    if line is None:
        continue
    if any(w in line for w in ("reported", "named cost", "reference")):
        reported.append(line)
    else:
        v = re.fullmatch(r"(.*)(?:: -?\d+\.\d+| chroma -?\d+\.\d+)", line)
        labels.append(v.group(1) if v else line)

# values the master prints but no vendored file holds: the ground's hover, from reach.html's .lt and .dk rules
html = open(MASTER + "/reach.html").read()
styles = re.sub(r"/\*.*?\*/", "", "".join(re.findall(r"<style[^>]*>(.*?)</style>", html, re.S)), flags=re.S)
rules = re.findall(r"([^{}]+)\{([^{}]*)\}", styles)
gnd = {}
for mode, sel in (("light", ".lt"), ("dark", ".dk")):
    found = sorted({v for s, body in rules if s.strip() == sel for v in re.findall(r"--gnd-h:\s*(#[0-9a-fA-F]{6})\b", body)})
    assert len(found) == 1, f"reach.html: the {sel} rule must print --gnd-h once, found {found}"
    gnd[mode] = found[0]

check_json = {
    "constants": constants,
    "shipped": {"HOUSE_DEFAULT": palette.HOUSE_DEFAULT, "STATUS_LEVEL": palette.STATUS_LEVEL},
    "assertions": assertions,
    "labels": labels,
    "reported": reported,
    "printed": {"--gnd-h": gnd},
}

REAL.write(json.dumps({"glyphs": {"ICONS": common.ICONS, "GLYPHS": common.GLYPHS}, "details": details_json,
                       "check": check_json}, allow_nan=False))
`;

/** Writes everything the vendor produces into `out`, laid out as in the package. */
function build(master: string, modules: string[], out: string) {
  mkdirSync(join(out, "tokens"), { recursive: true });
  mkdirSync(join(out, MODULES), { recursive: true });
  copyFileSync(join(master, "tokens.json"), join(out, "tokens/master.json"));
  for (const name of modules) copyFileSync(join(master, "src", `${name}.py`), join(out, MODULES, `${name}.py`));

  const run = Bun.spawnSync(["python3", "-I", "-B", "-c", dumpCode(master)], { cwd: out });
  if (run.exitCode !== 0) throw new Error(`the python dump failed:\n${run.stderr.toString()}`);
  const dump = JSON.parse(run.stdout.toString());
  writeJson(join(out, "tokens/glyphs.json"), dump.glyphs);
  writeJson(join(out, "tokens/details.json"), dump.details);
  writeJson(join(out, "tokens/check.json"), dump.check);

  const pngs = readdirSync(join(master, "build"))
    .filter((f) => f.endsWith(".png"))
    .map((f) => `build/${f}`);
  const sources = [...new Set(["tokens.json", ...modules.map((m) => `src/${m}.py`), ...DUMPED_FROM, ...pngs])].sort();
  const files = Object.fromEntries(sources.map((f) => [f, sha256(join(master, f))]));
  writeJson(join(out, SOURCE), { from: "worlds/master", at: new Date().toISOString(), files });
}

/** Package-relative paths whose staged copy differs from the package's. */
function differences(stage: string): string[] {
  const modules = [...new Set([...pyFiles(join(stage, MODULES)), ...pyFiles(join(pkg, MODULES))])].sort();
  const diffs = ["tokens/master.json", ...DUMPS, ...modules.map((m) => `${MODULES}/${m}`)].filter((f) => {
    const [a, b] = [join(stage, f), join(pkg, f)];
    return !existsSync(a) || !existsSync(b) || !readFileSync(a).equals(readFileSync(b));
  });
  const committed = existsSync(join(pkg, SOURCE)) ? JSON.parse(readFileSync(join(pkg, SOURCE), "utf8")) : {};
  const fresh = JSON.parse(readFileSync(join(stage, SOURCE), "utf8"));
  if (committed.from !== fresh.from || !Bun.deepEquals(committed.files, fresh.files)) diffs.push(SOURCE);
  return diffs;
}

function main(argv: string[]): number {
  const check = argv.includes("--check");
  const args = argv.filter((a) => a !== "--check");
  if (args.length !== 1 || args[0]!.startsWith("-")) {
    console.error("usage: bun scripts/vendor-master.ts <M> [--check]   (M: the master world directory)");
    return 2;
  }
  const master = resolve(args[0]!);

  const moved = Object.entries(GATE).filter(
    ([f, want]) => !existsSync(join(master, f)) || sha256(join(master, f)) !== want,
  );
  if (moved.length) {
    for (const [f, want] of moved) console.error(`gate: ${f} is not the world the gate recorded (want ${want})`);
    console.error("the world moved after the gate: stop and take it to the lead");
    return 1;
  }

  const modules = closure(join(master, "src"));
  console.log(`closure of ${ROOTS.join(" and ")}: ${modules.join(", ")}`);
  console.log(`closure at the gate: ${GATE_CLOSURE.join(", ")}`);
  if (modules.join() !== GATE_CLOSURE.join()) {
    console.error("the closure differs from the gate's: stop and take it to the lead");
    return 1;
  }

  const stage = mkdtempSync(join(tmpdir(), "vendor-master-"));
  try {
    build(master, modules, stage);
    if (!check) {
      for (const stale of pyFiles(join(pkg, MODULES)).filter((f) => !modules.includes(f.slice(0, -3)))) {
        rmSync(join(pkg, MODULES, stale));
      }
      for (const f of ["tokens/master.json", ...DUMPS, SOURCE, ...modules.map((m) => `${MODULES}/${m}.py`)]) {
        mkdirSync(dirname(join(pkg, f)), { recursive: true });
        copyFileSync(join(stage, f), join(pkg, f));
        console.log(`wrote ${f}`);
      }
      return 0;
    }

    const diffs = differences(stage);
    for (const f of diffs) console.error(`DIFF ${f}`);
    console.log(`vendored files: ${diffs.length ? `${diffs.length} differ` : "all match"}`);

    const buildPy = join(pkg, "scripts/texture/build.py");
    let plates = false;
    if (!existsSync(buildPy)) console.error("build.py master: scripts/texture/build.py is missing");
    else {
      const run = Bun.spawnSync(["python3", "-I", "-B", buildPy, "master", "--dir", join(master, "build"), "--check"], {
        cwd: pkg,
        stdout: "inherit",
        stderr: "inherit",
      });
      plates = run.exitCode === 0;
      console.log(`build.py master --check: ${plates ? "matches" : `exit ${run.exitCode}`}`);
    }
    return diffs.length === 0 && plates ? 0 : 1;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

process.exit(main(process.argv.slice(2)));
