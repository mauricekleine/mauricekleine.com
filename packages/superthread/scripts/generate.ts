// Generates the v2 tokens from tokens/master.json, tokens/roles.ts, tokens/scale.ts, tokens/base.css and
// fonts.ts, plus S1.T's texture tiles when they exist. `--check` writes nothing and exits 1 on any diff.
//
//   bun scripts/generate.ts [--check]

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fontFaces, fonts } from "../fonts.ts";
import { alphaOf, ELEVATIONS, KEY, MODES, PAPER, roles, type Mode, type Role, type Source } from "../tokens/roles.ts";
import * as scale from "../tokens/scale.ts";
import { oklchCss, tint } from "./color.ts";

export const root = join(import.meta.dir, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

export const FONT_BASE = { package: "https://superthread.mauricekleine.com/fonts/", site: "/fonts/" };

export const OUTPUTS = {
  css: "dist/v2/superthread.css",
  site: "dist/v2/site/superthread.css",
  plain: "dist/v2/superthread-plain.css",
  json: "dist/v2/tokens.json",
  tokens: "items/lib/tokens.ts",
  fleet: "items/lib/fleet.ts",
  glyphs: "items/ui/glyphs.tsx",
};

// The dark scope: inside a .dark, and not inside a .light that itself sits inside a .dark. So a dark island (the deep
// ground's gutter) prints dark on an explicit light page, and a light island prints light on a dark page; a dark
// island inside a light island inside a dark page prints light. Tailwind's dark variant, texture.css's dark and light
// branches and the plain variant's `@variant dark` all use it.
export const DARK = "&:is(.dark *):not(.dark .light *)";

// ---------- sources ----------

type Status = { role: string; glyph: string } & Record<Mode, Record<string, string>>;
type Ship = { angle: number; light: { spot: string }; dark: { spot: string }; mark: { light: string; dark: string } };

// The parts of tokens/master.json the generator reads by name; lookup() walks the rest by path.
export type Master = {
  fleet: string[];
  ships: Record<string, Ship>;
  // each ship's one-line descriptor, which the vendor appends from the world's build_reach.py
  desc: Record<string, string>;
  status: { states: Record<string, Status>; "input error glyph": string };
  space: { base: number; steps: number[] };
  texture: { places: string[] };
};

// tokens/details.json: the vendored details.py's data.
export type Details = {
  LEVELS: Record<string, number>;
  CONTACT: { x: number; y: number; pct: number; on: boolean };
  DETAILS: { key: string; component: string; detail: string; job: string }[];
};

export function lookup(master: Master, path: string): unknown {
  let at: unknown = master;
  for (const key of path.split(".")) {
    if (at === null || typeof at !== "object" || !(key in (at as object)))
      throw new Error(`tokens/master.json has no ${path}`);
    at = (at as Record<string, unknown>)[key];
  }
  return at;
}

export function hexAt(master: Master, path: string): string {
  const value = lookup(master, path);
  if (typeof value !== "string" || !/^#[0-9a-f]{6}$/.test(value))
    throw new Error(`${path} is not a hex colour: ${String(value)}`);
  return value;
}

// The hex a source names, or null for a literal css value.
export function hexOf(master: Master, source: Source): string | null {
  if ("path" in source) return hexAt(master, source.path);
  if ("tint" in source) return tint(hexAt(master, source.tint.over), hexAt(master, source.tint.under), source.tint.pct);
  if ("hex" in source) return source.hex;
  return null;
}

export function cssOf(master: Master, source: Source): string {
  const hex = hexOf(master, source);
  return hex === null ? (source as { css: string }).css : oklchCss(hex, alphaOf(source));
}

// A ship's descriptor, which every ship in the fleet must have.
function descOf(master: Master, id: string): string {
  const desc = master.desc?.[id];
  if (typeof desc !== "string" || desc === "") throw new Error(`tokens/master.json desc has no line for ${id}`);
  return desc;
}

// ---------- the pieces ----------

const px = (n: number) => `${n}px`;

export function elevation(master: Master, mode: Mode, e: string, rake = false): string {
  const { ink, rake: soft, contact } = scale.shadowInk[mode];
  const lift = `${lookup(master, `shadow.${e}`)} ${oklchCss(ink, soft)}`;
  if (rake) return lift;
  const parts = [lift, `${lookup(master, `shadow.contact.${e}`)} ${oklchCss(ink, contact)}`];
  if (mode === "dark") parts.push("inset 0 0 0 1px var(--raised-edge)");
  return parts.join(", ");
}

function declarations(master: Master, all: Role[], mode: Mode): string[] {
  const out = all.map((role) => `--${role.name}: ${cssOf(master, role[mode])};`);
  for (const e of ELEVATIONS) out.push(`--elevation-${e}: ${elevation(master, mode, e)};`);
  // the soft rake alone, which texture-contact pairs with its screened contact edge in light
  if (mode === "light")
    for (const e of ELEVATIONS) out.push(`--elevation-${e}-rake: ${elevation(master, mode, e, true)};`);
  return out;
}

// Vars that hold in both modes, declared once on :root and .light.
function shared(): string[] {
  const out = [`--radius: ${scale.radius.value};`];
  for (const [family, stack] of Object.entries(scale.stacks)) out.push(`--font-${family}: ${stack.value};`);
  out.push("--font-heading: var(--font-display);");
  for (const step of scale.steps) {
    out.push(`--text-${step.name}: ${px(step.size)};`);
    out.push(`--text-${step.name}--line-height: ${px(step.line)};`);
    out.push(`--text-${step.name}--letter-spacing: ${step.tracking ?? "normal"};`);
  }
  for (const name of ["instant", "quick", "travel"] as const)
    out.push(`--duration-${name}: ${scale.motion[name].value};`);
  out.push(`--ease-brand: ${scale.motion.ease.value};`);
  for (const [name, row] of Object.entries(scale.rows)) out.push(`--spacing-row-${name}: ${px(row.value)};`);
  out.push(`--code-ring-offset: ${scale.codeRingOffset.value};`);
  return out;
}

export const RADII = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];

function theme(all: Role[]): string[] {
  const out = all.map((role) => `--color-${role.name}: var(--${role.name});`);
  for (const family of [...Object.keys(scale.stacks), "heading"]) out.push(`--font-${family}: var(--font-${family});`);
  for (const step of scale.steps)
    for (const suffix of ["", "--line-height", "--letter-spacing"])
      out.push(`--text-${step.name}${suffix}: var(--text-${step.name}${suffix});`);
  // bare `rounded` reads --radius; every named step is square too
  out.push("--radius: var(--radius);");
  for (const r of RADII) out.push(`--radius-${r}: 0px;`);
  for (const e of ELEVATIONS) out.push(`--shadow-${e}: var(--elevation-${e});`);
  out.push("--ease-brand: var(--ease-brand);");
  for (const name of Object.keys(scale.rows)) out.push(`--spacing-row-${name}: var(--spacing-row-${name});`);
  return out;
}

// One composite utility per step: family, size, line, tracking, weight, case and the phone override.
function typeUtilities(): string {
  return scale.steps
    .map((step) => {
      const body = [
        `font-family: var(--font-${step.family});`,
        `font-size: var(--text-${step.name});`,
        `line-height: var(--text-${step.name}--line-height);`,
        `letter-spacing: var(--text-${step.name}--letter-spacing);`,
        `font-weight: ${step.weight};`,
        `text-transform: ${step.caps ? "uppercase" : "none"};`,
      ];
      const phone = step.phone
        ? `\n\n  @media (max-width: ${scale.phone.maxWidth}px) {\n    font-size: ${px(step.phone.size)};\n    line-height: ${px(step.phone.line)};\n  }`
        : "";
      return `@utility type-${step.name} {\n${body.map((line) => `  ${line}`).join("\n")}${phone}\n}`;
    })
    .join("\n\n");
}

const block = (selector: string, lines: string[]) => `${selector} {\n${lines.map((line) => `  ${line}`).join("\n")}\n}`;

// ---------- texture (S1.T's files) ----------

export type Tile = { w: number; h: number; svg: string; from: string };
export type Texture = { tiles: Record<string, Tile>; css: string | null };

export function readTexture(): Texture | null {
  if (!existsSync(join(root, "texture/tiles.json"))) return null;
  const tiles = JSON.parse(read("texture/tiles.json")) as Record<string, Tile>;
  const css = existsSync(join(root, "tokens/texture.css")) ? read("tokens/texture.css") : null;
  return { tiles, css };
}

function textureVars(texture: Texture, details: Details): string[] {
  const out = Object.entries(texture.tiles).map(
    ([name, tile]) =>
      `--texture-${name}: url("data:image/svg+xml;base64,${Buffer.from(tile.svg).toString("base64")}");`,
  );
  out.push(`--contact-x: ${px(details.CONTACT.x)};`, `--contact-y: ${px(details.CONTACT.y)};`);
  return out;
}

const PSEUDO = new Set([
  "hover",
  "focus",
  "focus-visible",
  "focus-within",
  "active",
  "visited",
  "disabled",
  "enabled",
  "checked",
  "indeterminate",
  "required",
  "invalid",
  "first-child",
  "last-child",
]);

// texture.css with Tailwind's at-rules expanded to plain css: `@utility x` to `.x`, `@variant` to its selector.
export function plainTexture(css: string): string {
  for (const banned of ["@apply", "@custom-variant", "--value(", "--modifier(", "theme("])
    if (css.includes(banned))
      throw new Error(`tokens/texture.css uses ${banned}, which the plain variant cannot expand`);
  return css
    .replace(/@utility\s+([a-z0-9-]+)\s*\{/g, (_, name: string) => {
      if (name.endsWith("-*")) throw new Error(`tokens/texture.css: functional utility ${name} has no plain form`);
      return `.${name} {`;
    })
    .replace(/@variant\s+([a-z0-9-]+)\s*\{/g, (_, name: string) => {
      if (name === "dark") return `${DARK} {`;
      if (PSEUDO.has(name)) return `&:${name} {`;
      if (name === "first" || name === "last") return `&:${name}-child {`;
      if (name.startsWith("data-")) return `&[${name}] {`;
      if (name.startsWith("aria-")) return `&[${name}="true"] {`;
      throw new Error(`tokens/texture.css: @variant ${name} has no plain form in generate.ts`);
    });
}

// ---------- the typed values ----------

function tokenData(master: Master, all: Role[], texture: Texture | null, details: Details) {
  const colour = (source: Source, provisional: boolean) => {
    const hex = hexOf(master, source);
    const alpha = alphaOf(source);
    const value =
      hex === null
        ? { css: (source as { css: string }).css }
        : { hex, oklch: oklchCss(hex, alpha), ...(alpha === undefined ? {} : { alpha }) };
    return provisional ? { ...value, provisional: true } : value;
  };
  const mode = (m: Mode) => Object.fromEntries(all.map((role) => [role.name, colour(role[m], role.provisional)]));
  const hex = (h: string) => ({ hex: h, oklch: oklchCss(h) });
  const key = hexAt(master, KEY);
  const paper = hexAt(master, PAPER);
  const wedge = (m: Mode) =>
    (lookup(master, `wedge.${m}.steps`) as number[]).map((step) => ({
      step,
      ...hex(m === "light" ? tint(key, paper, step) : tint(paper, key, step)),
    }));
  const states = master.status.states;
  const detailNames = new Set(details.DETAILS.map((d) => `${d.component}: ${d.detail}`));
  return {
    light: mode("light"),
    dark: mode("dark"),
    type: {
      steps: Object.fromEntries(scale.steps.map(({ name, ...step }) => [name, step])),
      phone: scale.phone,
      wordmark: scale.wordmark,
    },
    motion: scale.motion,
    shadow: {
      ink: Object.fromEntries(
        MODES.map((m) => [
          m,
          { ...hex(scale.shadowInk[m].ink), rake: scale.shadowInk[m].rake, contact: scale.shadowInk[m].contact },
        ]),
      ),
      elevation: Object.fromEntries(
        ELEVATIONS.map((e) => [
          e,
          {
            light: elevation(master, "light", e),
            dark: elevation(master, "dark", e),
            rake: elevation(master, "light", e, true),
          },
        ]),
      ),
    },
    space: {
      base: master.space.base,
      steps: master.space.steps,
      rows: Object.fromEntries(Object.entries(scale.rows).map(([k, v]) => [k, v.value])),
    },
    radius: scale.radius.value,
    codeRingOffset: scale.codeRingOffset.value,
    fonts: {
      stacks: {
        ...Object.fromEntries(Object.entries(scale.stacks).map(([k, v]) => [k, v.value])),
        heading: "var(--font-display)",
      },
      faces: fonts.map(({ file, family, weight, style }) => ({ file, family, weight, style })),
    },
    wedge: { light: wedge("light"), dark: wedge("dark") },
    ships: Object.fromEntries(
      master.fleet.map((id) => [
        id,
        {
          light: hex(master.ships[id].light.spot),
          dark: hex(master.ships[id].dark.spot),
          angle: master.ships[id].angle,
        },
      ]),
    ),
    status: Object.fromEntries(
      Object.entries(states).map(([state, s]) => [
        state,
        {
          role: s.role,
          glyph: s.glyph,
          ...Object.fromEntries(
            MODES.map((m) => [m, Object.fromEntries(Object.entries(s[m]).map(([k, v]) => [k, hex(v)]))]),
          ),
        },
      ]),
    ),
    surface: { stock: "background", raised: "card", float: "popover", ground: "ground" },
    texture: {
      places: master.texture.places.filter((place) => !detailNames.has(place)),
      details: details.DETAILS.map(({ key, component, detail, job }) => ({
        key,
        component,
        detail,
        job,
      })),
      contact: { x: px(details.CONTACT.x), y: px(details.CONTACT.y) },
      levels: details.LEVELS,
      tiles: texture ? Object.keys(texture.tiles) : [],
    },
  };
}

// ---------- the glyphs ----------

type Art = string[];

// Runs of set cells as whole-pixel squares, as the master's common.art_path draws them.
export function artPath(rows: boolean[][]): string {
  let d = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      let n = 1;
      while (x + n < row.length && row[x + n] === row[x]) n++;
      if (row[x]) d += `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  });
  return d;
}

const NOTCH = new Set(["0,0", "13,0", "0,13", "13,13"]);

// The 14 px square with its corners notched and the glyph knocked out, as the master's common.glyph_url draws it.
function square(art: Art): string {
  return artPath(art.map((row, y) => [...row].map((c, x) => c !== "#" && !NOTCH.has(`${x},${y}`))));
}

function glyphsTsx(
  glyphs: { ICONS: Record<string, Art>; GLYPHS: Record<string, Art> },
  master: Master,
  header: string,
): string {
  const icons = Object.entries({ ...glyphs.ICONS, ...glyphs.GLYPHS }).map(([name, art]) => {
    if (name in glyphs.ICONS && name in glyphs.GLYPHS) throw new Error(`glyphs.json names ${name} twice`);
    return [name, art.length, artPath(art.map((row) => [...row].map((c) => c === "#")))] as const;
  });
  for (const [name, size] of icons)
    if (![12, 14].includes(size)) throw new Error(`glyph ${name} is ${size} cells, not 12 or 14`);
  const states = Object.entries(master.status.states);
  const squares = states.map(([state, s]) => {
    const art = glyphs.GLYPHS[s.glyph];
    if (!art) throw new Error(`status ${state} names glyph ${s.glyph}, which glyphs.json lacks`);
    return [state, s.role, square(art)] as const;
  });
  // The input error glyph prints in failed's glyph ink: error text and the invalid edge follow failed (the master's
  // status.failed rule, and reach.css's .msg i on --failed-g).
  const errorGlyph = master.status["input error glyph"];
  const errorArt = glyphs.GLYPHS[errorGlyph];
  if (!errorArt) throw new Error(`the input error glyph is ${errorGlyph}, which glyphs.json lacks`);
  const failed = master.status.states.failed;
  if (!failed) throw new Error("tokens/master.json has no failed status state");
  const fieldError = [failed.role, square(errorArt)] as const;
  return `${header}
import type { AriaAttributes } from "react"

import { cn } from "@/components/superthread/lib/utils"

// Every pixel icon (12 cells) and status glyph (14 cells) in tokens/glyphs.json, as whole-pixel squares.
const ICONS = {
${icons.map(([name, size, d]) => `  ${JSON.stringify(name)}: [${size}, ${JSON.stringify(d)}],`).join("\n")}
} as const

export type IconName = keyof typeof ICONS

type Aria = AriaAttributes & { className?: string }

// Decorative unless it gets a label.
function labelled(aria: AriaAttributes) {
  const named = aria["aria-label"] !== undefined || aria["aria-labelledby"] !== undefined
  return named ? { role: "img", ...aria } : { "aria-hidden": true, ...aria }
}

export function Icon({ name, className, ...aria }: { name: IconName } & Aria) {
  const [size, d] = ICONS[name]
  return (
    <svg
      viewBox={\`0 0 \${size} \${size}\`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
      {...labelled(aria)}
    >
      <path d={d} />
    </svg>
  )
}

// The 14 px status square, its corners notched and its glyph knocked out, in the state's glyph ink.
const STATUS = {
${squares.map(([state, role, d]) => `  ${JSON.stringify(state)}: ["text-${role}-glyph", ${JSON.stringify(d)}],`).join("\n")}
} as const

export type StatusState = keyof typeof STATUS

export function StatusGlyph({ state, className, ...aria }: { state: StatusState } & Aria) {
  const [ink, d] = STATUS[state]
  return (
    <svg
      viewBox="0 0 14 14"
      width={14}
      height={14}
      shapeRendering="crispEdges"
      fill="currentColor"
      className={cn(ink, className)}
      {...labelled(aria)}
    >
      <path d={d} />
    </svg>
  )
}

// field-error: the input error glyph, the ${errorGlyph} knocked out of the 14 px square in the failed glyph ink. It sits
// before a field's error message, which names what is wrong in the error ink.
const FIELD_ERROR = ${JSON.stringify(fieldError[1])}

export function FieldErrorGlyph({ className, ...aria }: Aria) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={14}
      height={14}
      shapeRendering="crispEdges"
      fill="currentColor"
      className={cn("text-${fieldError[0]}-glyph", className)}
      {...labelled(aria)}
    >
      <path d={FIELD_ERROR} />
    </svg>
  )
}
`;
}

// ---------- reading it back ----------

// The vars one emitted block declares, by its selector as generate writes it.
export function blockVars(css: string, selector: string): Record<string, string> {
  const at = css.indexOf(`\n${selector} {\n`);
  if (at < 0) throw new Error(`no ${JSON.stringify(selector)} block`);
  const start = at + selector.length + 4;
  const lines = css.slice(start, css.indexOf("\n}", start)).split("\n");
  return Object.fromEntries(
    lines.flatMap((line) => {
      const m = /^\s*--([a-z0-9-]+):\s*(.*);$/.exec(line);
      return m ? [[m[1]!, m[2]!]] : [];
    }),
  );
}

// The vars each mode sees: dark falls back to the :root values it leaves alone.
export function emittedVars(css: string): Record<Mode, Record<string, string>> {
  const light = blockVars(css, ":root,\n.light");
  return { light, dark: { ...light, ...blockVars(css, ".dark") } };
}

// ---------- assembly ----------

export function build(): Map<string, string> {
  const raw = read("tokens/master.json");
  const master = JSON.parse(raw) as Master;
  const details = JSON.parse(read("tokens/details.json")) as Details;
  const glyphs = JSON.parse(read("tokens/glyphs.json"));
  const base = read("tokens/base.css").trimEnd();
  const texture = readTexture();
  const all = roles(master as never);
  const sha = createHash("sha256").update(raw).digest("hex").slice(0, 12);
  const said = `generated by scripts/generate.ts from tokens/master.json (sha256 ${sha}); edit the sources, then rerun it`;

  const css = (fontBase: string, plain: boolean) => {
    const parts = [`/* superthread v2 tokens${plain ? ", plain css" : ""}: ${said} */`];
    if (!plain) parts.push(`@custom-variant dark (${DARK});`);
    parts.push(fontFaces(fontBase));
    parts.push(block(":root,\n.light", [...declarations(master, all, "light"), ...shared(), "color-scheme: light;"]));
    parts.push(block(".dark", [...declarations(master, all, "dark"), "color-scheme: dark;"]));
    if (!plain) parts.push(block("@theme inline", theme(all)), typeUtilities());
    parts.push(base);
    if (texture) {
      parts.push(block(":root", textureVars(texture, details)));
      if (texture.css !== null) parts.push((plain ? plainTexture(texture.css) : texture.css).trimEnd());
    }
    return parts.join("\n\n") + "\n";
  };

  const data = tokenData(master, all, texture, details);
  const ships = master.fleet.map((id) => ({
    id,
    name: id,
    desc: descOf(master, id),
    angle: master.ships[id].angle,
    // file names under the consumer's markBase
    mark: {
      light: master.ships[id].mark.light.replace(/^marks\//, ""),
      dark: master.ships[id].mark.dark.replace(/^marks\//, ""),
    },
  }));

  return new Map([
    [OUTPUTS.css, css(FONT_BASE.package, false)],
    [OUTPUTS.site, css(FONT_BASE.site, false)],
    [OUTPUTS.plain, css(FONT_BASE.package, true)],
    [OUTPUTS.json, JSON.stringify(data, null, 2) + "\n"],
    [
      OUTPUTS.tokens,
      `// superthread v2 tokens as typed values: ${said}\n\nexport const tokens = ${JSON.stringify(data, null, 2)} as const\n\nexport type Tokens = typeof tokens\n`,
    ],
    [
      OUTPUTS.fleet,
      `// the fleet, in its order: ${said}\n// desc is the line under a ship's name in the rail's tab. Each mark is a file name under the consumer's mark base;\n// hrefs are the consumer's.\n\nexport const fleet = ${JSON.stringify(ships, null, 2)} as const\n\nexport type Ship = (typeof fleet)[number]\nexport type ShipId = Ship["id"]\n`,
    ],
    [OUTPUTS.glyphs, glyphsTsx(glyphs, master, `// the pixel icons and status glyphs: ${said}`)],
  ]);
}

if (import.meta.main) {
  const check = process.argv.includes("--check");
  const stale: string[] = [];
  for (const [path, content] of build()) {
    const file = join(root, path);
    const current = existsSync(file) ? readFileSync(file, "utf8") : null;
    if (current === content) continue;
    stale.push(path);
    if (!check) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
  }
  if (check && stale.length > 0) {
    console.error(`generate --check: out of date, run bun scripts/generate.ts:\n  ${stale.join("\n  ")}`);
    process.exit(1);
  }
  if (!check) console.log(stale.length > 0 ? `wrote ${stale.join(", ")}` : "up to date");
}
