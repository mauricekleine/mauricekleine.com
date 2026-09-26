// builds css variables and the tailwind v4 theme from DESIGN.md.
// DESIGN.md is the only source; everything under dist/ is generated.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

type Typography = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number | string;
  letterSpacing?: string;
};

type Tokens = {
  colors: Record<string, string>;
  typography: Record<string, Typography>;
  rounded: Record<string, string>;
  spacing: Record<string, string>;
};

const root = join(import.meta.dir, "..");
const MODES = ["void", "paper"] as const;

// display sizes are fluid; DESIGN.md holds the max, the clamp lives here
const FLUID: Record<string, string> = {
  "display-xl": "clamp(1.85rem, 4.5vw + 0.85rem, 2.9rem)",
};

const STACKS: Record<string, string> = {
  Panchang: '"Panchang", ui-sans-serif, system-ui, sans-serif',
  Supreme: '"Supreme", ui-sans-serif, system-ui, sans-serif',
  Erode: '"Erode", Charter, "Iowan Old Style", Georgia, serif',
  "Fragment Mono": '"Fragment Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

export async function readTokens(path = join(root, "DESIGN.md")): Promise<Tokens> {
  const source = await readFile(path, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("DESIGN.md has no front matter");
  return Bun.YAML.parse(match[1]) as Tokens;
}

// void-ground -> ground; the mode prefix becomes a selector instead
function roles(colors: Tokens["colors"], mode: string) {
  return Object.entries(colors)
    .filter(([name]) => name.startsWith(`${mode}-`))
    .map(([name, value]) => [name.slice(mode.length + 1), value] as const);
}

export function tokensCss(tokens: Tokens) {
  const shared = Object.entries(tokens.colors).filter(
    ([name]) => !MODES.some((mode) => name.startsWith(`${mode}-`)) && name !== "primary",
  );
  const block = (pairs: ReadonlyArray<readonly [string, string]>) =>
    pairs.map(([name, value]) => `  --${name}: ${value};`).join("\n");

  const type = Object.entries(tokens.typography).flatMap(([name, t]) => [
    `  --font-${name}: ${STACKS[t.fontFamily] ?? `"${t.fontFamily}"`};`,
    `  --text-${name}: ${FLUID[name] ?? t.fontSize};`,
    `  --weight-${name}: ${t.fontWeight};`,
    `  --leading-${name}: ${t.lineHeight};`,
    ...(t.letterSpacing ? [`  --tracking-${name}: ${t.letterSpacing};`] : []),
  ]);

  return `/* generated from DESIGN.md by scripts/generate.ts. do not edit. */

/* void is the default mode */
:root {
  color-scheme: dark;
${block(roles(tokens.colors, "void"))}
${block(shared)}
${block(Object.entries(tokens.rounded).map(([k, v]) => [`radius-${k}`, v] as const))}
${block(Object.entries(tokens.spacing).map(([k, v]) => [`space-${k}`, String(v)] as const))}
${type.join("\n")}
  --ease-drift: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-snap: cubic-bezier(0.22, 1, 0.36, 1);
}

[data-mode="paper"] {
  color-scheme: light;
${block(roles(tokens.colors, "paper"))}
}
`;
}

// tailwind v4 reads theme variables from @theme; `inline` keeps them pointing
// at the mode-aware custom properties, so utilities follow data-mode
export function themeCss(tokens: Tokens) {
  const colorNames = roles(tokens.colors, "void").map(([name]) => name);
  const shared = Object.keys(tokens.colors).filter(
    (name) => !MODES.some((mode) => name.startsWith(`${mode}-`)) && name !== "primary",
  );
  const lines = [
    ...[...colorNames, ...shared].map((name) => `  --color-${name}: var(--${name});`),
    ...Object.keys(tokens.rounded).map((k) => `  --radius-${k}: var(--radius-${k});`),
    ...Object.keys(tokens.spacing).map((k) => `  --spacing-${k}: var(--space-${k});`),
    ...Object.keys(tokens.typography).map((k) => `  --font-${k}: var(--font-${k});`),
    ...Object.keys(tokens.typography).map((k) => `  --text-${k}: var(--text-${k});`),
    "  --ease-drift: var(--ease-drift);",
    "  --ease-snap: var(--ease-snap);",
  ];
  return `/* generated from DESIGN.md by scripts/generate.ts. do not edit. */
@theme inline {
${lines.join("\n")}
}
`;
}

if (import.meta.main) {
  const tokens = await readTokens();
  const out = join(root, "dist");
  await mkdir(out, { recursive: true });
  await writeFile(join(out, "tokens.css"), tokensCss(tokens));
  await writeFile(join(out, "theme.css"), themeCss(tokens));
  await writeFile(
    join(out, "tokens.json"),
    `${JSON.stringify(tokens, null, 2)}\n`,
  );
  console.log(`wrote ${join(dirname(out), "dist")}/{tokens.css,theme.css,tokens.json}`);
}
