import { expect, test } from "bun:test";
import { readTokens, themeCss, tokensCss } from "../scripts/generate";

const tokens = await readTokens();

test("both modes define the same color roles", () => {
  const roles = (mode: string) =>
    Object.keys(tokens.colors)
      .filter((name) => name.startsWith(`${mode}-`))
      .map((name) => name.slice(mode.length + 1))
      .sort();
  // atmosphere is void-only by design: paper has no dark atmosphere
  const comparable = (mode: string) => roles(mode).filter((role) => !role.startsWith("atmosphere"));
  // a role missing in one mode silently inherits the other mode's color
  expect(comparable("paper")).toEqual(comparable("void"));
});

test("void is :root and paper overrides under data-mode", () => {
  const css = tokensCss(tokens);
  expect(css).toContain(":root {");
  expect(css).toContain('[data-mode="paper"] {');
  expect(css).toContain("--thread: oklch(75% 0.13 55);");
  expect(css).toContain("--thread: oklch(55% 0.13 55);");
  expect(css).toContain("--text-display-xl: clamp(");
});

test("tailwind theme points at the mode-aware variables", () => {
  const theme = themeCss(tokens);
  expect(theme).toContain("@theme inline {");
  expect(theme).toContain("--color-ground: var(--ground);");
  expect(theme).not.toContain("void-");
});

test("dist/ is in sync with DESIGN.md (run `bun run build`)", async () => {
  const dist = (name: string) => Bun.file(new URL(`../dist/${name}`, import.meta.url)).text();
  expect(await dist("tokens.css")).toBe(tokensCss(tokens));
  expect(await dist("theme.css")).toBe(themeCss(tokens));
});
