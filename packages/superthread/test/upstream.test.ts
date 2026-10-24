import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GENERATED,
  ICON_LIBRARIES,
  SEEDS,
  manifestDrift,
  passFiles,
  transform,
  UPSTREAM,
} from "../scripts/upstream.ts";

// The base-nova mirror: the vendored JSON, the pass-through files regen writes from it, and the brand seeds.
const root = join(import.meta.dir, "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const upstreamFile = (name: string) =>
  (JSON.parse(read(`upstream/base-nova/${name}.json`)) as { files: { path: string; content: string }[] }).files[0]!;

const seedFiles = [...SEEDS.map((name) => `items/ui/${name}.tsx`), "items/ui/fleet-rail.tsx"];
const passPaths = [...passFiles().keys()];

describe("the vendored upstream", () => {
  test("regen --check: the pass-through files are what the vendored JSON makes", () => {
    const run = Bun.spawnSync([process.execPath, join(root, "scripts/upstream.ts"), "regen", "--check"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(run.stderr.toString()).toBe("");
    expect(run.exitCode).toBe(0);
    expect(passPaths.sort()).toEqual(
      [
        "items/hooks/use-mobile.ts",
        ...GENERATED.filter((n) => n !== "use-mobile").map((n) => `items/ui/${n}.tsx`),
      ].sort(),
    );
  });

  test("every manifest sha256 matches its file, and the manifest lists exactly the upstream items", () => {
    expect(manifestDrift()).toEqual([]);
    const manifest = JSON.parse(read("upstream/manifest.json"));
    expect(Object.keys(manifest.files).sort()).toEqual([...UPSTREAM].sort());
    expect(manifest.cli).toMatch(/^\d+\.\d+\.\d+/);
    expect(manifest.fetched).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("seeds and pass-through files", () => {
  const files = [...seedFiles, ...passPaths];

  test("no upstream icon, client directive or upstream path remains", () => {
    const forbidden = [
      /\bIconPlaceholder\b/,
      /["']lucide-react["']/,
      /["']@phosphor-icons\/react["']/,
      /^\s*["']use client["']/m,
      /["']@\/registry\//,
      /["']@\/app\//,
    ];
    const hits = files.flatMap((rel) =>
      forbidden.filter((pattern) => pattern.test(read(rel))).map((pattern) => `${rel}: ${pattern}`),
    );
    expect(hits).toEqual([]);
  });

  test("no Icon carries an icon-library prop", () => {
    const hits: string[] = [];
    for (const rel of files)
      for (const [element] of read(rel).matchAll(/<Icon\b[^>]*\/>/g))
        for (const lib of ICON_LIBRARIES) if (new RegExp(`\\s${lib}=`).test(element)) hits.push(`${rel}: ${element}`);
    expect(hits).toEqual([]);
  });

  // Integration-only while stage 2 runs: it reads S1.3's catalog.ts.
  test("every @/components/superthread import resolves to a file a catalog item owns (integration)", async () => {
    const { catalog } = await import("../items/catalog.ts");
    const owned = new Set(catalog.flatMap((item) => item.files.map((file) => file.path)));
    const missing: string[] = [];
    for (const rel of files)
      for (const [, spec] of read(rel).matchAll(/from\s+["']@\/components\/superthread\/([^"']+)["']/g)) {
        const path = [".tsx", ".ts"].map((ext) => `items/${spec}${ext}`).find((p) => existsSync(join(root, p)));
        if (!path || !owned.has(path)) missing.push(`${rel}: @/components/superthread/${spec}`);
      }
    expect(missing).toEqual([]);
  });
});

describe("the transforms", () => {
  test("print makes every seed without the focus classes the gate rules off (build ruling 2)", () => {
    const ruled = [
      /(?<![\w-])outline-none\b/,
      /(?<![\w-])ring-/,
      /focus-visible:outline-1\b/,
      /focus-visible:border-ring\b/,
    ];
    const hits = SEEDS.flatMap((name) => {
      const out = transform(upstreamFile(name).content, name, { seed: true });
      return ruled.filter((pattern) => pattern.test(out)).map((pattern) => `${name}: ${pattern}`);
    });
    expect(hits).toEqual([]);
  });

  test("an unmapped icon or an unknown icon prop fails instead of dropping silently", () => {
    const icon = (attrs: string) =>
      `import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"\nconst x = <IconPlaceholder ${attrs} />\n`;
    expect(transform(icon(`lucide="XIcon" tabler="IconX"`), "ok")).toContain(`<Icon name="close" />`);
    expect(() => transform(icon(`lucide="RocketIcon"`), "unmapped")).toThrow(/no glyph/);
    expect(() => transform(icon(`lucide="XIcon" size={16}`), "prop")).toThrow(/prop size/);
    expect(() => transform(`import { x } from "@/registry/base-nova/blocks/x"\n`, "path")).toThrow(/has no rule/);
  });
});
