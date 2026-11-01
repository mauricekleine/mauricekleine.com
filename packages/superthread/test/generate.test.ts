import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DARK, FONT_BASE, OUTPUTS, plainTexture, root } from "../scripts/generate.ts";
import { fonts } from "../fonts.ts";
import { fleet } from "../items/lib/fleet.ts";
import { steps } from "../tokens/scale.ts";

const read = (path: string) => readFileSync(join(root, path), "utf8");
const fontUrls = (css: string) => [...css.matchAll(/url\("([^"]*)"\) format\("woff2"\)/g)].map((m) => m[1]!);

describe("generate", () => {
  test("generate --check finds every output current", () => {
    const run = Bun.spawnSync(["bun", "scripts/generate.ts", "--check"], { cwd: root, stdout: "pipe", stderr: "pipe" });
    expect(run.stderr.toString()).toBe("");
    expect(run.exitCode).toBe(0);
  });

  test("the two superthread.css variants differ only in the font base", () => {
    const pkg = read(OUTPUTS.css);
    const site = read(OUTPUTS.site);
    expect(fontUrls(pkg)).toEqual(fonts.map((face) => `${FONT_BASE.package}${face.file}`));
    expect(fontUrls(site)).toEqual(fonts.map((face) => `${FONT_BASE.site}${face.file}`));
    expect(pkg.replaceAll(`url("${FONT_BASE.package}`, `url("${FONT_BASE.site}`)).toBe(site);
    expect(pkg).not.toBe(site);
  });

  test("the texture section is present exactly when texture/tiles.json exists", () => {
    const css = read(OUTPUTS.css);
    if (!existsSync(join(root, "texture/tiles.json"))) {
      expect(css).not.toContain("--texture-");
      return;
    }
    const tiles = JSON.parse(read("texture/tiles.json")) as Record<string, unknown>;
    for (const name of Object.keys(tiles)) expect(css).toContain(`--texture-${name}: url("data:image/svg+xml;base64,`);
    expect(css).toContain("--contact-x: ");
    expect(css).toContain("--contact-y: ");
    // the tiles ship base64, so the svg namespace url never reaches the css: the font host is the only host
    const hosts = new Set([...css.matchAll(/\bhttps?:\/\/([^/"')\s]+)/g)].map((m) => m[1]));
    expect(hosts).toEqual(new Set([new URL(FONT_BASE.package).hostname]));
  });

  test("items/lib/fleet.ts keeps the master ships' descriptors as the fleet grows", () => {
    const master = JSON.parse(read("tokens/master.json")) as { fleet: string[]; desc: Record<string, string> };
    const descs: string[][] = fleet
      .filter((ship) => master.fleet.includes(ship.id))
      .map((ship) => [ship.id, ship.desc]);
    expect(descs).toEqual(master.fleet.map((id) => [id, master.desc[id]!]));
  });

  test("items/lib/utils.ts merges exactly the type steps as font sizes", () => {
    const utils = read("items/lib/utils.ts");
    const list = /"font-size":\s*\[\s*\{\s*text:\s*\[([^\]]*)\]/.exec(utils);
    expect(list).not.toBeNull();
    const names = [...list![1]!.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(names).toEqual(steps.map((step) => step.name));
  });
});

describe("plain texture", () => {
  test("expands utilities and variants to plain selectors", () => {
    const css = [
      "@utility texture-row {",
      "  background-image: var(--texture-25);",
      "  @variant hover {",
      "    background-image: var(--texture-50);",
      "  }",
      "  @variant dark {",
      "    background-image: none;",
      "  }",
      "  @variant data-current {",
      "    background-image: var(--texture-75);",
      "  }",
      "  @variant aria-selected {",
      "    background-image: var(--texture-75);",
      "  }",
      "}",
    ].join("\n");
    expect(plainTexture(css)).toBe(
      [
        ".texture-row {",
        "  background-image: var(--texture-25);",
        "  &:hover {",
        "    background-image: var(--texture-50);",
        "  }",
        `  ${DARK} {`,
        "    background-image: none;",
        "  }",
        "  &[data-current] {",
        "    background-image: var(--texture-75);",
        "  }",
        '  &[aria-selected="true"] {',
        "    background-image: var(--texture-75);",
        "  }",
        "}",
      ].join("\n"),
    );
  });

  test("refuses what it cannot expand", () => {
    expect(() => plainTexture(".a { @apply bg-muted; }")).toThrow("@apply");
    expect(() => plainTexture("@utility texture-* { --x: --value(integer); }")).toThrow();
    expect(() => plainTexture("@utility a { @variant peer-hover { color: red; } }")).toThrow("peer-hover");
  });
});

// ---------- the dark scope ----------

// An element as its chain of class lists, the root first and the element last.
type Chain = string[][];

// A descendant chain of `.class` and `*` compounds, matched as css does: the last compound on the element, each
// earlier one on a further ancestor (the nearest that matches, which is enough for descendant combinators alone).
function chainMatches(complex: string, chain: Chain): boolean {
  const compounds = complex.trim().split(/\s+/);
  const fits = (compound: string, classes: string[]) => {
    if (compound === "*") return true;
    if (!/^(\.[a-z-]+)+$/.test(compound)) throw new Error(`no matcher for ${compound}`);
    return compound
      .split(".")
      .slice(1)
      .every((name) => classes.includes(name));
  };
  let at = chain.length - 1;
  if (!fits(compounds.at(-1)!, chain[at]!)) return false;
  for (const compound of compounds.slice(0, -1).reverse()) {
    at--;
    while (at >= 0 && !fits(compound, chain[at]!)) at--;
    if (at < 0) return false;
  }
  return true;
}

// `&` followed by :is() and :not() over lists of descendant chains: DARK's grammar.
function inScope(selector: string, chain: Chain): boolean {
  const body = selector.replace(/^&/, "");
  const parts = [...body.matchAll(/:(is|not)\(([^()]*)\)/g)];
  if (parts.map((m) => m[0]).join("") !== body) throw new Error(`no matcher for ${selector}`);
  return parts.every(([, fn, list]) => list!.split(",").some((c) => chainMatches(c, chain)) === (fn === "is"));
}

describe("the dark scope", () => {
  const cases: [string, Chain, boolean][] = [
    ["no mode class anywhere", [[], [], []], false],
    ["inside a .dark page", [["dark"], [], []], true],
    ["inside a .light page", [["light"], [], []], false],
    ["the element that carries .dark itself (its descendants are in scope)", [[], ["dark"]], false],
    ["a dark island on a page with no class", [[], ["dark"], []], true],
    ["a dark island on a .light page", [["light"], ["dark"], []], true],
    ["a light island on a .dark page", [["dark"], ["light"], []], false],
    ["a light island inside a dark island on a .light page", [["light"], ["dark"], ["light"], []], false],
  ];
  for (const [name, chain, dark] of cases)
    test(`${name}: ${dark ? "dark" : "light"}`, () => expect(inScope(DARK, chain)).toBe(dark));

  test("tailwind's dark variant and every hand-written dark and light branch are DARK, and the plain css declares no variant", () => {
    for (const out of [OUTPUTS.css, OUTPUTS.site]) expect(read(out)).toContain(`\n@custom-variant dark (${DARK});\n`);
    expect(read(OUTPUTS.plain)).not.toContain("@custom-variant");
    const branches = (file: string) =>
      read(file)
        .split("\n")
        .filter((line) => /\.(dark|light)\b/.test(line) && line.trimEnd().endsWith("{"))
        .map((line) => line.trim());
    expect(branches("tokens/texture.css")).toEqual([`&:not(${DARK.slice(1)}) {`, `${DARK}::after {`]);
    expect(branches("tokens/utilities.css")).toEqual([`${DARK} {`]);
  });

  test("the Tailwind outputs carry the item utilities and the plain css leaves them out", () => {
    for (const name of ["off-paper", "hit-area", "link-quiet"]) {
      for (const out of [OUTPUTS.css, OUTPUTS.site]) expect(read(out)).toContain(`\n@utility ${name} {\n`);
      expect(read(OUTPUTS.plain)).not.toContain(name);
    }
  });
});
