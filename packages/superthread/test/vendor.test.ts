// The vendored master: byte copies that match their recorded source, a closed set of modules, and dumps that agree
// with the vendored code. Reads only the package (CI has no master world); `vendor --check` compares with the world.
import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const vendored = join(root, "scripts/texture/master");
const modules = readdirSync(vendored)
  .filter((f) => f.endsWith(".py"))
  .sort();
const json = (path: string) => JSON.parse(readFileSync(join(root, path), "utf8"));
const sha256 = (path: string) =>
  createHash("sha256")
    .update(readFileSync(join(root, path)))
    .digest("hex");

/** Runs Python isolated (`-I`, no bytecode) with `dir` first on sys.path, and parses the JSON it prints. */
function python(code: string, dir = vendored) {
  const run = Bun.spawnSync([
    "python3",
    "-I",
    "-B",
    "-c",
    `import json, sys; sys.path.insert(0, ${JSON.stringify(dir)})\n${code}`,
  ]);
  if (run.exitCode !== 0) throw new Error(run.stderr.toString());
  return JSON.parse(run.stdout.toString());
}

test("every vendored file hashes to its master.source.json entry", () => {
  const source = json("tokens/master.source.json");
  expect(source.from).toBe("worlds/master");
  const copies: [string, string][] = [
    ["tokens/master.json", "tokens.json"],
    ...modules.map((m): [string, string] => [`scripts/texture/master/${m}`, `src/${m}`]),
  ];
  for (const [file, from] of copies)
    expect({ file, sha256: sha256(file) }).toEqual({ file, sha256: source.files[from] });
});

test("the vendored modules import nothing but each other and the stdlib", () => {
  // a copy, because fields.py creates <its dir>/../build on import
  const dir = mkdtempSync(join(tmpdir(), "vendor-test-"));
  try {
    mkdirSync(join(dir, "master"));
    for (const m of modules) copyFileSync(join(vendored, m), join(dir, "master", m));
    const missing = python(
      `import ast, pathlib
here = pathlib.Path(sys.path[0])
local = {p.stem for p in here.glob("*.py")}
def tops(tree):
    for n in ast.walk(tree):
        if isinstance(n, ast.Import):
            yield from (a.name.split(".")[0] for a in n.names)
        elif isinstance(n, ast.ImportFrom) and n.level == 0:
            yield n.module.split(".")[0]
missing = sorted({f"{p.stem} imports {m}" for p in here.glob("*.py") for m in tops(ast.parse(p.read_text()))
                  if m not in local and m not in sys.stdlib_module_names})
import details, fields
print(json.dumps(missing))`,
      join(dir, "master"),
    );
    expect(missing).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the vendored screen.py lattices and bayer matrix are master.json's", () => {
  const screen = python(
    `import screen
print(json.dumps({k: getattr(screen, k) for k in ("OPENER_KEY", "OPENER_SPOT", "FIGURE_KEY", "FIGURE_SPOT", "BAYER4")}))`,
  );
  const { halftone, dither } = json("tokens/master.json").texture;
  expect(screen).toEqual({
    OPENER_KEY: halftone.opener.key.vector,
    OPENER_SPOT: halftone.opener.spot.vector,
    FIGURE_KEY: halftone.figure.key.vector,
    FIGURE_SPOT: halftone.figure.spot.vector,
    BAYER4: dither.bayer4,
  });
});

test("details.json holds what the vendored details.py returns", () => {
  const details = json("tokens/details.json");
  const live = python(
    `import details
print(json.dumps({"tiles_css": details.tiles_css(), "constants": {k: v for k, v in vars(details).items() if k.isupper()}}))`,
  );
  expect(details.tiles_css).toBe(live.tiles_css);
  const constants = Object.fromEntries(Object.entries(details).filter(([k]) => k === k.toUpperCase()));
  expect(constants).toEqual(live.constants);
  const decoded = [...live.tiles_css.matchAll(/--([\w-]+):url\("data:image\/svg\+xml;base64,([^"]+)"\)/g)].map(
    ([, name, b64]: string[]) => [name, Buffer.from(b64!, "base64").toString()],
  );
  expect(details.tiles).toEqual(Object.fromEntries(decoded));
});
