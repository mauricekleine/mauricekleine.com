import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DARK, FONT_BASE, OUTPUTS, plainTexture, root } from "../scripts/generate.ts";
import { fonts } from "../fonts.ts";
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
