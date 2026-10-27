import { afterAll, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { MarkShip } from "../scripts/marks.ts";

const pkg = join(import.meta.dir, "..");
const scratch = mkdtempSync(join(tmpdir(), "marks-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
let fixtureNumber = 0;

// Exercise the actual CLI in a disposable repo layout, including the master marks and provenance.
function fixture() {
  const repo = join(scratch, String(fixtureNumber++));
  const root = join(repo, "packages/superthread");
  mkdirSync(join(root, "scripts"), { recursive: true });
  for (const file of ["marks.ts", "color.ts", "generate.ts"])
    cpSync(join(pkg, "scripts", file), join(root, "scripts", file));
  for (const file of ["marks", "tokens", "texture", "fonts.ts"])
    cpSync(join(pkg, file), join(root, file), { recursive: true });
  const publicMarks = join(repo, "apps/superthread/public/marks");
  cpSync(join(pkg, "../../apps/superthread/public/marks"), publicMarks, { recursive: true });
  mkdirSync(join(root, "items/lib"), { recursive: true });
  cpSync(join(pkg, "items/lib/fleet.ts"), join(root, "items/lib/fleet.ts"));
  return { repo, root, publicMarks };
}
type Fixture = ReturnType<typeof fixture>;
const read = (file: string) => readFileSync(file, "utf8");
const readJson = (file: string) => JSON.parse(read(file));
const writeJson = (file: string, value: unknown) => writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
const manifest = (f: Fixture) => readJson(join(f.root, "marks/fleet.json")) as { schema: 1; fleet: MarkShip[] };
function run(f: Fixture, ...args: string[]) {
  const result = Bun.spawnSync([process.execPath, "scripts/marks.ts", ...args], { cwd: f.root });
  return { code: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
}
function files(dir: string, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    readdirSync(join(dir, prefix), { withFileTypes: true }).flatMap((entry): [string, string][] => {
      const name = join(prefix, entry.name);
      return entry.isDirectory() ? Object.entries(files(dir, name)) : [[name, read(join(dir, name))]];
    }),
  );
}
function editSvg(f: Fixture, ship: MarkShip, mode: "light" | "dark", change: (svg: string) => string) {
  const relative = `${ship.id}/${ship.mark[mode]}`;
  const file = join(f.publicMarks, relative);
  const svg = change(read(file));
  writeFileSync(file, svg);
  const provenanceFile = join(f.publicMarks, "PROVENANCE.json");
  const provenance = readJson(provenanceFile);
  provenance.files[relative].sha256 = createHash("sha256").update(svg).digest("hex");
  writeJson(provenanceFile, provenance);
}

test("new writes a private ship and receipt, preserves legacy assets, survives build and resumes without changes", () => {
  const f = fixture();
  const before = files(f.publicMarks);
  const args = [
    "new",
    "test-ship",
    "--target",
    "soliton",
    "--url",
    "none",
    "--label",
    "test ship",
    "--receipt",
    "receipt.json",
  ];
  const result = run(f, ...args);
  expect(result.stderr).toBe("");
  expect(result.code).toBe(0);
  const receipt = JSON.parse(result.stdout);
  expect(receipt).toEqual({
    id: "test-ship",
    target: "soliton",
    url: null,
    manifest: "packages/superthread/marks/fleet.json",
    mark: {
      light: "apps/superthread/public/marks/test-ship/test-ship.svg",
      dark: "apps/superthread/public/marks/test-ship/test-ship-dark.svg",
    },
  });
  expect(readJson(join(f.root, "receipt.json"))).toEqual(receipt);
  expect(manifest(f).fleet.at(-1)).toMatchObject({
    id: "test-ship",
    name: "test ship",
    target: "soliton",
    url: null,
    kind: "star",
  });
  expect(readJson(join(f.publicMarks, "fleet.json"))).toEqual(manifest(f));
  for (const [name, svg] of Object.entries(before))
    if (name.endsWith(".svg")) expect(read(join(f.publicMarks, name))).toBe(svg);
  for (const file of Object.values(receipt.mark) as string[])
    expect(read(join(f.repo, file))).toContain('viewBox="0 0 16 16"');

  const build = Bun.spawnSync([process.execPath, "scripts/generate.ts"], { cwd: f.root });
  expect(build.stderr.toString()).toBe("");
  expect(build.exitCode).toBe(0);
  const builtFleet = read(join(f.root, "items/lib/fleet.ts"));
  expect(builtFleet).toContain(
    '"id": "test-ship",\n    "name": "test ship",\n    "desc": "a new star",\n    "url": null,',
  );
  expect(builtFleet).not.toContain('"target"');
  expect(run(f, "check").code).toBe(0);
  const after = files(f.repo);
  expect(run(f, ...args).code).toBe(0);
  expect(files(f.repo)).toEqual(after);
  const conflict = run(f, "new", "test-ship");
  expect(conflict.code).toBe(1);
  expect(conflict.stderr).toContain("existing metadata conflicts");
  expect(files(f.repo)).toEqual(after);
});

test("new normalizes explicit URLs, and sheet embeds every mark in both chromes at all three sizes", () => {
  const f = fixture();
  const result = run(f, "new", "url-ship", "--url", "https://example.com/tool/", "--label", "a < ship");
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).url).toBe("https://example.com/tool");
  // the rail links a ship to its url by default, so the generated fleet carries it
  expect(Bun.spawnSync([process.execPath, "scripts/generate.ts"], { cwd: f.root }).exitCode).toBe(0);
  expect(read(join(f.root, "items/lib/fleet.ts"))).toContain('"url": "https://example.com/tool",');
  const resultSheet = run(f, "sheet", "--out", "preview/sheet.html");
  expect(resultSheet.code).toBe(0);
  const html = read(join(f.root, "preview/sheet.html"));
  expect(html).toContain("a &lt; ship");
  expect(html.match(/data:image\/svg\+xml;base64,/g)?.length).toBe(manifest(f).fleet.length * 6);
  for (const size of [16, 32, 48]) expect(html).toContain(`width="${size}" height="${size}"`);
  expect(html).not.toContain('<img src="http');
});

test("the allocator supports several new ships, including a numeric-leading DNS name", () => {
  const f = fixture();
  const allocated: string[] = [];
  for (const id of ["1st-star", "second-star", "third-star"]) {
    const result = run(f, "new", id);
    expect(result.stderr).toBe("");
    expect(result.code).toBe(0);
    const added = manifest(f).fleet.at(-1)!;
    expect(added).toMatchObject({ id, target: "cloudflare", url: `https://${id}.mauricekleine.com` });
    expect(allocated).not.toContain(added.spot.light);
    allocated.push(added.spot.light);
  }
  expect(run(f, "check").code).toBe(0);
});

test("invalid CLI arguments fail without changing the fleet", () => {
  const f = fixture();
  const before = files(f.repo);
  for (const args of [
    ["new"],
    ["new", "../escape"],
    ["new", "UPPER"],
    ["new", "a".repeat(64)],
    ["new", "ship", "--target", "mars"],
    ["new", "ship", "--url", "https://user:password@example.com"],
    ["new", "ship", "--url", "javascript:alert(1)"],
    ["new", "ship", "--url", "https://example.com?key=secret"],
    ["new", "ship", "--label", ""],
    ["check", "--write"],
    ["sheet", "--out"],
    ["new", "ship", "--target", "soliton", "--target", "cloudflare"],
  ]) {
    expect(run(f, ...args).code, args.join(" ")).not.toBe(0);
    expect(files(f.repo)).toEqual(before);
  }
});

test("check rejects geometry, contrast, chromes, colour collisions, and stale provenance at the public CLI", () => {
  const cases: [string, (f: Fixture) => void, string][] = [
    [
      "subpixel geometry",
      (f) => editSvg(f, manifest(f).fleet[0]!, "light", (svg) => svg.replace("M1 0", "M1.5 0")),
      "integer horizontal pixel runs",
    ],
    [
      "missing corner notch",
      (f) => editSvg(f, manifest(f).fleet[0]!, "light", (svg) => svg.replace("M1 0h14v1h-14z", "M0 0h15v1h-15z")),
      "four 1px corner notches",
    ],
    [
      "dim spot region",
      (f) => {
        const m = manifest(f);
        const ship = m.fleet[0]!;
        const old = ship.spot.light;
        ship.spot.light = "#16181e";
        writeJson(join(f.root, "marks/fleet.json"), m);
        editSvg(f, ship, "light", (svg) =>
          svg.replaceAll(old, ship.spot.light).replaceAll('fill="#ffffff"', 'fill="#16181e"'),
        );
      },
      "silhouette or spot disappears",
    ],
    [
      "low screened contrast",
      (f) => {
        const m = manifest(f);
        const ship = m.fleet[0]!;
        const old = ship.spot.dark;
        ship.spot.dark = "#ffffff";
        writeJson(join(f.root, "marks/fleet.json"), m);
        editSvg(f, ship, "dark", (svg) => svg.replaceAll(old, ship.spot.dark));
      },
      "screened region below 3:1",
    ],
    [
      "chromes disagree",
      (f) => editSvg(f, manifest(f).fleet[0]!, "dark", (svg) => svg.replace('fill="#16181d"', 'fill="#ffffff"')),
      "silhouette or spot disappears",
    ],
    [
      "spot collision",
      (f) => {
        const m = manifest(f);
        const a = m.fleet[0]!;
        const b = m.fleet[1]!;
        const old = b.spot.light;
        b.spot.light = a.spot.light;
        writeJson(join(f.root, "marks/fleet.json"), m);
        editSvg(f, b, "light", (svg) => svg.replaceAll(old, b.spot.light));
      },
      "light spots too close",
    ],
    [
      "provenance mismatch",
      (f) => {
        const file = join(f.publicMarks, "orbit/orbit.svg");
        writeFileSync(file, read(file) + "\n");
      },
      "provenance sha256 differs",
    ],
    [
      "public manifest drift",
      (f) => writeFileSync(join(f.publicMarks, "fleet.json"), "{}\n"),
      "public marks/fleet.json differs",
    ],
    ["retired mark removed", (f) => rmSync(join(f.publicMarks, "pilot/pilot.svg")), "retired mark is missing"],
    [
      "generated fleet drift",
      (f) => writeFileSync(join(f.root, "items/lib/fleet.ts"), ""),
      "items/lib/fleet.ts is stale",
    ],
  ];
  for (const [name, corrupt, diagnostic] of cases) {
    const f = fixture();
    corrupt(f);
    const before = files(f.repo);
    const result = run(f, "check");
    expect(result.code, name).toBe(1);
    expect(result.stderr, name).toContain(diagnostic);
    expect(files(f.repo), name).toEqual(before);
    // A broken fleet cannot allocate more marks or publish a sheet either.
    expect(run(f, "new", "blocked-ship").code, name).toBe(1);
    expect(run(f, "sheet", "--out", "bad.html").code, name).toBe(1);
    expect(files(f.repo), name).toEqual(before);
  }
});
