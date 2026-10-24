import { afterAll, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { catalog } from "../items/catalog.ts";

// The served forms: the latest build, the base URL, and the immutable version snapshots.
const root = join(import.meta.dir, "..");
const production = "https://superthread.mauricekleine.com";
const preview = "http://127.0.0.1:4173";
const { version } = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as { version: string };

const sha256 = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
const exists = (path: string) => Bun.file(path).exists();
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));

async function tree(dir: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const entry of await readdir(dir, { recursive: true, withFileTypes: true }))
    if (entry.isFile()) {
      const path = join(entry.parentPath, entry.name);
      out[relative(dir, path)] = sha256(await readFile(path));
    }
  return out;
}

const scratch = await mkdtemp(join(tmpdir(), "registry-"));
afterAll(() => rm(scratch, { recursive: true, force: true }));

const { SUPERTHREAD_BASE_URL: _, ...env } = process.env;
const build = (out: string, args: string[], extra: Record<string, string> = {}) =>
  Bun.spawnSync([process.execPath, join(root, "scripts/build-registry.ts"), "--out", out, ...args], {
    env: { ...env, ...extra },
    stdout: "pipe",
    stderr: "pipe",
  });

const latest = join(scratch, "latest");
const fromEnv = join(scratch, "env");
const snapshot = join(scratch, "snapshot");
const runs = {
  latest: build(latest, ["--base-url", production]),
  env: build(fromEnv, [], { SUPERTHREAD_BASE_URL: preview }),
  snapshot: build(snapshot, ["--snapshot", "--base-url", production]),
};

const versionsDir = join(root, "versions");
const committed = (await readdir(versionsDir).catch(() => [] as string[])).filter((v) => !v.startsWith("."));

test("the three builds pass", () => {
  for (const [name, run] of Object.entries(runs)) {
    expect(run.stderr.toString(), name).toBe("");
    expect(run.exitCode, name).toBe(0);
  }
});

test("r/registry.json lists every catalog item, and each has its own JSON", async () => {
  const registry = await json(join(latest, "r/registry.json"));
  expect(registry.items.map((item: { name: string }) => item.name)).toEqual(catalog.map((item) => item.name));
  for (const { name } of catalog) expect((await json(join(latest, "r", `${name}.json`))).name).toBe(name);
});

test("the latest form holds versions.json and a byte copy of every committed snapshot", async () => {
  const released = [...committed].sort(Bun.semver.order);
  expect(await json(join(latest, "r/versions.json"))).toEqual({ latest: version, versions: released });
  for (const v of released) expect(await tree(join(latest, "r/v", v))).toEqual(await tree(join(versionsDir, v, "r")));
  const top = await readdir(join(latest, "r"));
  if (released.length === 0) expect(top).not.toContain("v");
});

test("the base URL changes the @mk URL inside init and nothing else", async () => {
  expect((await json(join(latest, "r/init.json"))).config.registries["@mk"]).toBe(`${production}/r/{name}.json`);
  expect((await json(join(fromEnv, "r/init.json"))).config.registries["@mk"]).toBe(`${preview}/r/{name}.json`);
  const a = await tree(join(latest, "r"));
  const b = await tree(join(fromEnv, "r"));
  const changed = Object.keys(a).filter((name) => a[name] !== b[name]);
  expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
  expect(changed.sort()).toEqual(["init.json", "registry.json"]);
  const indexA = await json(join(latest, "r/registry.json"));
  const indexB = await json(join(fromEnv, "r/registry.json"));
  indexB.items.find((item: { name: string }) => item.name === "init").config.registries["@mk"] =
    `${production}/r/{name}.json`;
  expect(indexB).toEqual(indexA);
});

test("the snapshot form holds the item JSONs, registry.json and SHA256SUMS, and init pins its version", async () => {
  const names = (await readdir(snapshot)).sort();
  expect(names).toEqual([...catalog.map((item) => `${item.name}.json`), "SHA256SUMS", "registry.json"].sort());
  expect((await json(join(snapshot, "init.json"))).config.registries["@mk"]).toBe(
    `${production}/r/v/${version}/{name}.json`,
  );
});

test.skipIf(!(await exists(join(versionsDir, version, "r/registry.json"))))(
  `the committed ${version} snapshot equals a fresh build, file by file`,
  async () => {
    expect(await tree(snapshot)).toEqual(await tree(join(versionsDir, version, "r")));
  },
);

test("every SHA256SUMS matches the files beside it", async () => {
  for (const dir of [snapshot, ...committed.map((v) => join(versionsDir, v, "r"))]) {
    const sums = (await readFile(join(dir, "SHA256SUMS"), "utf8")).trimEnd().split("\n");
    const listed: Record<string, string> = {};
    for (const line of sums) {
      const [, hash, name] = line.match(/^([0-9a-f]{64}) {2}(\S+)$/) ?? [];
      expect(name, `${dir}: ${line}`).toBeDefined();
      listed[name!] = hash!;
    }
    const { SHA256SUMS: _sums, ...beside } = await tree(dir);
    expect(listed, dir).toEqual(beside);
  }
});

test("every committed snapshot's init points @mk at its own version", async () => {
  for (const v of committed)
    expect((await json(join(versionsDir, v, "r/init.json"))).config.registries["@mk"]).toBe(
      `${production}/r/v/${v}/{name}.json`,
    );
});
