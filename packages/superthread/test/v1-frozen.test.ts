import { afterAll, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// v1 is frozen: its sources stay byte-identical at their paths, and www serves the committed JSON.
// The constants are what www served at fc72a25, measured live.
const root = join(import.meta.dir, "..");

const sources = {
  "dist/superthread.css": "f2ad0b4b6a63477cd53d96bdde326826299c33ad956ef5866aecc77f11c6f8fd",
  "registry.json": "1cf7e7dd14110abc04b93e14834031a2bc4cc20e9679bb4359121db7e0024b74",
  "registry/ui/fleet-rail.tsx": "c70246d70a0265b7e1b543b844c7a6f2de32afc1bbf6714d4138409e6ce85e10",
};

const served = {
  "fleet-rail.json": "dc8464fe6036ef70f23779fc4bdbe980522b7b44a937bb100eee601b2ce736ae",
  "registry.json": "1cf7e7dd14110abc04b93e14834031a2bc4cc20e9679bb4359121db7e0024b74",
  "superthread.json": "f6bb52619ffed2106b17892a0e82942c78981a5c001e1824f6f70c0d0347aae9",
};

const sha256 = async (path: string) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");

const hashes = async (dir: string, names: string[]) =>
  Object.fromEntries(await Promise.all(names.map(async (name) => [name, await sha256(join(dir, name))])));

const scratch = await mkdtemp(join(tmpdir(), "v1-frozen-"));
afterAll(() => rm(scratch, { recursive: true, force: true }));

test("the v1 sources are byte-identical at their paths", async () => {
  expect(await hashes(root, Object.keys(sources))).toEqual(sources);
});

test("the committed v1/r holds exactly what www serves", async () => {
  const dir = join(root, "v1/r");
  expect((await readdir(dir)).sort()).toEqual(Object.keys(served));
  expect(await hashes(dir, Object.keys(served))).toEqual(served);
});

test("publish-v1 writes www's bytes into --out", async () => {
  const out = join(scratch, "x");
  const run = Bun.spawnSync([process.execPath, join(root, "scripts/publish-v1.ts"), "--out", out], {
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(run.stderr.toString()).toBe("");
  expect(run.exitCode).toBe(0);
  expect((await readdir(out)).sort()).toEqual(Object.keys(served));
  expect(await hashes(out, Object.keys(served))).toEqual(served);
});
