import { afterAll, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { catalog } from "../items/catalog.ts";

// The registry contract, asserted on what build-registry.ts writes, never on its source.
const root = join(import.meta.dir, "..");
const production = "https://superthread.mauricekleine.com";

type File = { path: string; type: string; target: string; content: string };
type Item = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: File[];
  css?: Record<string, unknown>;
  meta?: { version: string; sha256: string; tier: string; upstream: unknown; serves?: string[] };
  [key: string]: unknown;
};

const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
  version: string;
  devDependencies: Record<string, string>;
};
const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");

const scratch = await mkdtemp(join(tmpdir(), "contract-"));
afterAll(() => rm(scratch, { recursive: true, force: true }));

const { SUPERTHREAD_BASE_URL: _, ...env } = process.env;
const run = Bun.spawnSync(
  [process.execPath, join(root, "scripts/build-registry.ts"), "--out", scratch, "--base-url", production],
  { env, stdout: "pipe", stderr: "pipe" },
);
const items: Item[] =
  run.exitCode === 0
    ? await Promise.all(
        catalog.map(async ({ name }) => JSON.parse(await readFile(join(scratch, "r", `${name}.json`), "utf8")) as Item),
      )
    : [];
const files = items.flatMap((item) => (item.files ?? []).map((file) => ({ item, file })));
const owner = new Map(files.map(({ item, file }) => [file.target, item.name]));

test("the registry builds", () => {
  expect(run.stderr.toString()).toBe("");
  expect(run.exitCode).toBe(0);
  expect(items.map((item) => item.name)).toEqual(catalog.map((item) => item.name));
});

test("every registry dependency is an @mk item", () => {
  const names = new Set(catalog.map((item) => item.name));
  for (const item of items)
    for (const dep of item.registryDependencies ?? []) {
      expect(dep).toStartWith("@mk/");
      expect(names.has(dep.slice("@mk/".length))).toBe(true);
    }
});

test("no item carries cssVars, and only tokens carries css, holding only @import keys", () => {
  for (const item of items) {
    expect(Object.keys(item)).not.toContain("cssVars");
    if (item.name !== "tokens") expect(Object.keys(item)).not.toContain("css");
  }
  const css = items.find((item) => item.name === "tokens")!.css!;
  expect(Object.keys(css).length).toBeGreaterThan(0);
  for (const [key, value] of Object.entries(css)) {
    expect(key).toMatch(/^@import "[^"]+"$/);
    expect(value).toEqual({});
  }
});

test("every target sits under @components/superthread/", () => {
  expect(files.length).toBeGreaterThan(0);
  for (const { file } of files) expect(file.target).toStartWith("@components/superthread/");
});

// Module specifiers in a file's import, export-from and dynamic import statements.
const imported = (code: string) =>
  [
    ...code.matchAll(/^\s*(?:import|export)\b[^;"'`]*?\bfrom\s*["']([^"'\n]+)["']/gm),
    ...code.matchAll(/^\s*import\s*["']([^"'\n]+)["']/gm),
    ...code.matchAll(/\bimport\(\s*["']([^"'\n]+)["']\s*\)/g),
  ].map((match) => match[1]!);

const packageOf = (specifier: string) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

const scripts = files.filter(({ file }) => /\.tsx?$/.test(file.target));

test("every import is declared", () => {
  expect(scripts.length).toBeGreaterThan(0);
  for (const { item, file } of scripts)
    for (const specifier of imported(file.content)) {
      const where = `${item.name} ${file.target} imports ${specifier}`;
      if (specifier.startsWith("@/components/superthread/")) {
        const path = specifier.slice("@/".length).replace(/^components/, "@components");
        const by = [".tsx", ".ts", ""].map((ext) => owner.get(path + ext)).find(Boolean);
        expect(by, where).toBeDefined();
        if (by !== item.name) expect(item.registryDependencies ?? [], where).toContain(`@mk/${by}`);
        continue;
      }
      expect(specifier, `${where}: only the item alias and packages`).toMatch(/^[@a-z]/);
      expect(specifier.startsWith("@/"), where).toBe(false);
      const name = packageOf(specifier);
      if (name === "react" || name === "react-dom") continue;
      expect(
        (item.dependencies ?? []).some((dep) => dep.startsWith(`${name}@`)),
        where,
      ).toBe(true);
    }
});

test("only lib/utils.ts imports cn", () => {
  const importers = scripts
    .filter(({ file }) => imported(file.content).some((specifier) => packageOf(specifier) === "cn"))
    .map(({ file }) => file.target);
  expect(importers).toEqual(["@components/superthread/lib/utils.ts"]);
});

test("every npm dependency is a caret floor, and none is react, react-dom or a type package", () => {
  for (const item of items)
    for (const dep of item.dependencies ?? []) {
      const [, name, floor] = dep.match(/^(@?[^@]+)@\^(\d+\.\d+\.\d+)$/) ?? [];
      expect(name, `${item.name}: ${dep}`).toBeDefined();
      expect(["react", "react-dom"]).not.toContain(name);
      expect(name!.startsWith("@types/"), dep).toBe(false);
      // a package the registry also builds against carries that floor, so a moved pin moves every item
      const range = pkg.devDependencies[name!];
      if (range) expect(floor, `${item.name}: ${dep} against ${range}`).toBe(range.replace(/^[~^]/, ""));
    }
});

test("no icon library outside init's dependency list", () => {
  for (const item of items) {
    const { dependencies, ...rest } = item;
    const text = JSON.stringify(item.name === "init" ? rest : { dependencies, ...rest });
    for (const banned of ["lucide-react", "IconPlaceholder", "@phosphor-icons/react"])
      expect(text.includes(banned), `${item.name} mentions ${banned}`).toBe(false);
  }
});

test("every file carries its stamp: after the last import, else the last line; line 1 in css", () => {
  for (const { item, file } of files) {
    const lines = file.content.split("\n");
    if (file.target.endsWith(".css")) {
      expect(lines[0]).toBe(`/* @mk/${item.name} ${pkg.version} */`);
      continue;
    }
    const stamp = `// @mk/${item.name} ${pkg.version}`;
    // the line on which the last import statement ends
    let end = -1;
    for (let i = 0; i < lines.length; i++) {
      if (!/^import(\s|\{|\*|"|')/.test(lines[i]!)) continue;
      let j = i;
      while (!/\bfrom\s*["'][^"']+["']|^import\s*["'][^"']+["']/.test(lines[j]!) && j < lines.length - 1) j++;
      end = j;
      i = j;
    }
    // with no imports the stamp follows the statements, since shadcn strips a leading comment block on install
    const at = end === -1 ? file.content.trimEnd().split("\n").at(-1) : lines[end + 1];
    expect(at, `${item.name} ${file.target}`).toBe(stamp);
    if (end === -1) expect(file.content.endsWith(`${stamp}\n`), `${item.name} ${file.target}`).toBe(true);
    expect(lines.filter((line) => line.includes(`@mk/${item.name} `))).toEqual([stamp]);
  }
});

test("meta is present and correct", async () => {
  const manifestPath = join(root, "upstream/manifest.json");
  const cli = (await Bun.file(manifestPath).exists())
    ? (JSON.parse(await readFile(manifestPath, "utf8")) as { cli: string }).cli
    : undefined;
  for (const item of items) {
    const entry = catalog.find((c) => c.name === item.name)!;
    const sha = sha256(JSON.stringify((item.files ?? []).map((f) => [f.target, f.content])));
    expect(item.meta, item.name).toBeDefined();
    expect(item.meta!.version).toBe(pkg.version);
    expect(item.meta!.sha256, item.name).toBe(sha);
    expect(item.meta!.tier).toBe(entry.tier);
    expect(item.meta!.serves).toEqual(entry.serves);
    if (entry.upstream === null) expect(item.meta!.upstream).toBeNull();
    else
      expect(item.meta!.upstream).toEqual({
        style: "base-nova",
        item: entry.upstream,
        sha256: sha256(await readFile(join(root, "upstream/base-nova", `${entry.upstream}.json`))),
        cli,
      });
  }
});

test("hosts: no private or foreign host in any file's content", () => {
  const allowed = new URL(production).hostname;
  for (const { item, file } of files) {
    const where = `${item.name} ${file.target}`;
    const code = file.content;
    // comments go first, so a reference link in a comment is allowed but a live http:// is not
    const live = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
    expect(live.includes("http://"), `${where}: http://`).toBe(false);
    expect(code.includes(".ts.net"), `${where}: .ts.net`).toBe(false);
    expect(code.includes("localhost"), `${where}: localhost`).toBe(false);
    for (const [, host] of code.matchAll(/\b[a-z][a-z0-9+.-]*:\/\/([^/\s"'`)<>]+)/gi))
      expect(host, where).toBe(allowed);
    for (const [name] of code.matchAll(/\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|dev|app|wtf|co|ai|sh)\b/gi))
      expect(name, where).toBe(allowed);
  }
});

test("no em dash in any item", () => {
  for (const item of items) expect(JSON.stringify(item).includes("—"), item.name).toBe(false);
});

test("texture claims: every DETAILS key is claimed, and each item claims at most one", async () => {
  const details = JSON.parse(await readFile(join(root, "tokens/details.json"), "utf8")) as {
    DETAILS: { key: string }[];
  };
  const keys = details.DETAILS.map((detail) => detail.key);
  const claims = catalog.filter((item) => item.texture !== undefined);
  for (const item of claims) {
    expect(typeof item.texture, item.name).toBe("string");
    expect(keys, item.name).toContain(item.texture!);
  }
  for (const key of keys)
    expect(
      claims.some((item) => item.texture === key),
      key,
    ).toBe(true);
});
