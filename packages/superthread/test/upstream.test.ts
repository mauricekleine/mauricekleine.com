import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { act, createElement, Fragment } from "react";
import { createRoot } from "react-dom/client";
import {
  forwardPortalProps,
  GENERATED,
  ICON_LIBRARIES,
  isStrippedFocusClass,
  PASS_CLASSES,
  SEEDS,
  manifestDrift,
  passFiles,
  transform,
  UPSTREAM,
} from "../scripts/upstream.ts";

// The base-nova mirror: the vendored JSON, the pass-through files regen writes from it, and the brand seeds. The pass
// layers render through react-dom/client into the preload's happy-dom, because Base UI portals them.
const root = join(import.meta.dir, "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const upstreamFile = (name: string) =>
  (JSON.parse(read(`upstream/base-nova/${name}.json`)) as { files: { path: string; content: string }[] }).files[0]!;

/** Every word of every one-line string literal: where class words live. */
const classWords = (src: string) =>
  new Set([...src.matchAll(/"[^"\n]*"|'[^'\n]*'/g)].flatMap(([literal]) => literal.slice(1, -1).split(/\s+/)));

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
  test("the seed strip drops outline-none and outline-hidden under any variant, and keeps outline-0", () => {
    for (const utility of ["outline-none", "outline-hidden"])
      for (const token of [
        utility,
        `focus-visible:${utility}`,
        `focus:${utility}`,
        `data-[state=open]:${utility}`,
        `group-hover/menu-item:focus-visible:${utility}`,
        `!${utility}`,
        `${utility}!`,
      ])
        expect(isStrippedFocusClass(token), token).toBe(true);
    for (const token of ["outline-0", "focus:outline-0", "focus-visible:outline-2", "outline-(--fx)"])
      expect(isStrippedFocusClass(token), token).toBe(false);
    const seed = transform(`const c = "focus-visible:outline-hidden outline-hidden outline-0 px-2"\n`, "probe", {
      seed: true,
    });
    expect(seed).toBe(`const c = "outline-0 px-2"\n`);
  });

  test("print makes every seed without the focus classes the gate rules off (build ruling 2)", () => {
    const ruled = [
      /(?<![\w-])outline-none\b/,
      /(?<![\w-])outline-hidden\b/,
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

  test("served labels go lowercase and upstream's style hooks become our utilities, in seeds and pass items alike", () => {
    const probe = [
      `const a = <span className="sr-only">Close</span>`,
      `const b = <button aria-label="Close toast" title="Toggle Sidebar" />`,
      `const c = <img alt='A Mark' placeholder="Search" />`,
      `const d = "cn-font-heading text-base font-medium"`,
      ``,
    ].join("\n");
    const want = [
      `const a = <span className="sr-only">close</span>`,
      `const b = <button aria-label="close toast" title="toggle sidebar" />`,
      `const c = <img alt='a mark' placeholder="search" />`,
      `const d = "font-display text-base font-medium"`,
      ``,
    ].join("\n");
    expect(transform(probe, "probe")).toBe(want);
    expect(transform(probe, "probe", { seed: true })).toBe(want);
  });

  test("regen applies a pass item's class table, and fails on a stale entry or a style hook with no rule", () => {
    expect(Object.keys(PASS_CLASSES).sort()).toEqual(["sheet", "tooltip"]);
    for (const [name, table] of Object.entries(PASS_CLASSES)) {
      const words = classWords(transform(upstreamFile(name).content, name, { pass: name }));
      for (const [word, replacement] of Object.entries(table)) {
        expect(words.has(word), `${name}: ${word}`).toBe(false);
        for (const replaced of replacement) expect(words.has(replaced), `${name}: ${replaced}`).toBe(true);
      }
    }
    expect(() => transform(`const c = "px-2"\n`, "probe", { pass: "sheet" })).toThrow(/no longer has/);
    expect(() => transform(`const c = "cn-menu-target px-2"\n`, "probe", { pass: "card" })).toThrow(
      /style hook cn-menu-target has no rule/,
    );
    // a brand seed keeps its other hooks for its slice to decide
    expect(transform(`const c = "cn-menu-target px-2"\n`, "probe", { seed: true })).toBe(
      `const c = "cn-menu-target px-2"\n`,
    );
  });

  test("a pass layer's portal takes portalProps, and a layer whose shape moved upstream fails", () => {
    const rule = { component: "ProbeContent", portal: "ProbePortal", props: "Probe.Portal.Props" };
    const probe = [
      "function ProbeContent({",
      "  className,",
      "  ...props",
      "}: Probe.Popup.Props & {",
      "  side?: string",
      "}) {",
      "  return (",
      "    <ProbePortal>",
      "      <Probe.Popup className={className} {...props} />",
      "    </ProbePortal>",
      "  )",
      "}",
      "",
    ].join("\n");
    expect(forwardPortalProps(probe, "probe", rule)).toBe(
      [
        "function ProbeContent({",
        "  className,",
        "  portalProps,",
        "  ...props",
        "}: Probe.Popup.Props & {",
        "  side?: string",
        "} & { portalProps?: Probe.Portal.Props }) {",
        "  return (",
        "    <ProbePortal {...portalProps}>",
        "      <Probe.Popup className={className} {...props} />",
        "    </ProbePortal>",
        "  )",
        "}",
        "",
      ].join("\n"),
    );
    const fails = (src: string) => () => forwardPortalProps(src, "probe", rule);
    expect(fails(probe.replace("ProbeContent", "ProbeBody"))).toThrow(/no longer has one function ProbeContent/);
    expect(fails(probe.replace("  ...props\n", "  ...rest\n"))).toThrow(/no longer end in \.\.\.props/);
    expect(fails(probe.replace("<ProbePortal>", "<Probe.Portal>"))).toThrow(/renders <ProbePortal> 0 times/);
    expect(fails(probe.replace("{...props} />", "{...props} portalProps={p} />"))).toThrow(/already names portalProps/);
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

describe("the pass layers regen writes, rendered", () => {
  test("the sheet and the tooltip render into the container portalProps names, with its class on the portal", async () => {
    // imported here, so a broken item fails this row alone
    const sheet = await import("@/components/superthread/ui/sheet");
    const tooltip = await import("@/components/superthread/ui/tooltip");
    const container = document.createElement("div");
    const host = document.createElement("div");
    document.body.append(container, host);
    const reactRoot = createRoot(host);
    const portalProps = { container, className: "dark" };
    try {
      await act(async () =>
        reactRoot.render(
          createElement(
            Fragment,
            null,
            createElement(
              sheet.Sheet,
              { open: true },
              createElement(sheet.SheetContent, { portalProps }, createElement(sheet.SheetTitle, null, "or-412")),
            ),
            createElement(
              tooltip.Tooltip,
              { open: true },
              createElement(tooltip.TooltipTrigger, null, "search"),
              createElement(tooltip.TooltipContent, { portalProps }, "search the docs"),
            ),
          ),
        ),
      );
      for (const slot of ["sheet-overlay", "sheet-content", "tooltip-content"]) {
        const layer = container.querySelector(`[data-slot="${slot}"]`);
        expect(layer, `${slot} renders into the container`).not.toBeNull();
        expect(layer!.closest(".dark"), `${slot} sits in the portal that takes the class`).not.toBeNull();
      }
      expect(document.body.querySelectorAll("[portalprops]")).toHaveLength(0);
    } finally {
      await act(async () => reactRoot.unmount());
      host.remove();
      container.remove();
    }
  });
});
