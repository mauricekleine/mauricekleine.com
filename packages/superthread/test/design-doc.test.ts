import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { oklchCss } from "../scripts/color.ts";
import { blockVars, emittedVars, root } from "../scripts/generate.ts";
import { ELEVATIONS, type Mode } from "../tokens/roles.ts";
import { phone } from "../tokens/scale.ts";

// DESIGN.md restates the emitted tokens for impeccable and designmd lint, and .impeccable/design.json carries what
// its frontmatter has no place for. The frontmatter and the sidecar are held here to the generated
// dist/v2/superthread.css and dist/v2/tokens.json, so neither can drift from what ships. The prose is held only for
// its hex colours and its em dashes; its other numbers are not checked. A frontmatter colour `x` is --x on :root and
// .light, and `dark-x` is --x under .dark.

const read = (path: string) => readFileSync(join(root, path), "utf8");
const doc = read("DESIGN.md");
const parts = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(doc);
if (!parts) throw new Error("DESIGN.md has no frontmatter");
const front = parts[1]!;
const body = parts[2]!;

type Type = { fontFamily: string; fontSize?: string; fontWeight: number; lineHeight?: string; letterSpacing?: string };
const fm = Bun.YAML.parse(front) as {
  colors: Record<string, string>;
  typography: Record<string, Type>;
  rounded: Record<string, string>;
  spacing: Record<string, string>;
};

type Entry = { provisional?: boolean };
const tokens = JSON.parse(read("dist/v2/tokens.json")) as Record<Mode, Record<string, Entry>> & {
  type: { wordmark: { family: string; weight: number; tracking: string } };
  space: { base: number; steps: number[] };
};
const css = read("dist/v2/superthread.css");
const vars = emittedVars(css);

type Named = { name: string; value: string; purpose?: string };
const sidecar = JSON.parse(read(".impeccable/design.json")) as {
  schemaVersion: number;
  extensions: {
    colorMeta: Record<string, { role: string; displayName: string; canonical: string; tonalRamp: string[] }>;
    typographyMeta: Record<string, { displayName: string; purpose: string }>;
    shadows: Named[];
    motion: Named[];
    breakpoints: Named[];
  };
  components: { name: string; html: string; css: string }[];
  narrative: {
    northStar: string;
    overview: string;
    keyCharacteristics: string[];
    rules: { name: string; body: string; section: string }[];
    dos: string[];
    donts: string[];
  };
};

const modeOf = (key: string): [Mode, string] => (key.startsWith("dark-") ? ["dark", key.slice(5)] : ["light", key]);
const roleNames = Object.keys(tokens.light);
const keys = [...roleNames, ...roleNames.map((name) => `dark-${name}`)];

// A frontmatter colour as the generator emits it: hex, and rgb() with an alpha, become oklch().
function emitted(value: string): string {
  if (value === "transparent") return value;
  if (/^#[0-9a-f]{6}$/.test(value)) return oklchCss(value);
  const rgb = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(value);
  if (!rgb) throw new Error(`not a hex, rgb() or transparent colour: ${value}`);
  const hex = `#${[rgb[1], rgb[2], rgb[3]].map((c) => Number(c).toString(16).padStart(2, "0")).join("")}`;
  return oklchCss(hex, Number(rgb[4]));
}

describe("DESIGN.md colours", () => {
  test("every frontmatter colour equals the emitted token, light and dark", () => {
    const wrong = Object.entries(fm.colors).flatMap(([key, value]) => {
      const [mode, name] = modeOf(key);
      const want = vars[mode][name];
      return emitted(value) === want ? [] : [`${key}: ${value} emits ${emitted(value)}, the css has ${want}`];
    });
    expect(wrong).toEqual([]);
  });

  test("the frontmatter names every emitted colour role in both modes, and nothing else", () => {
    expect(Object.keys(fm.colors).sort()).toEqual([...keys].sort());
  });

  test("a colour is marked provisional exactly when tokens.json marks its role provisional", () => {
    const block = /\ncolors:\n([\s\S]*?)\n(?=[a-z])/.exec(`\n${front}\n`)?.[1] ?? "";
    const marked = Object.fromEntries(
      block.split("\n").flatMap((line) => {
        const m = /^ {2}([a-z0-9-]+): .*?( # provisional)?$/.exec(line);
        return m ? [[m[1]!, m[2] !== undefined]] : [];
      }),
    );
    const want = Object.fromEntries(
      keys.map((key) => {
        const [mode, name] = modeOf(key);
        return [key, tokens[mode][name]!.provisional === true];
      }),
    );
    expect(marked).toEqual(want);
  });
});

describe("DESIGN.md type, radius and space", () => {
  const utilities = [...css.matchAll(/\n@utility type-([a-z]+) \{\n([\s\S]*?)\n\}\n/g)];
  const stack = (family: string) => vars.light[`font-${family}`]!.replaceAll('"', "");

  test("typography restates every emitted type step and its phone size", () => {
    expect(utilities.length).toBeGreaterThan(0);
    const want: Record<string, Type> = {};
    for (const [, step, rules] of utilities) {
      const family = /font-family: var\(--font-([a-z]+)\);/.exec(rules!)![1]!;
      const weight = Number(/font-weight: (\d+);/.exec(rules!)![1]);
      const tracking = vars.light[`text-${step}--letter-spacing`]!;
      const entry: Type = {
        fontFamily: stack(family),
        fontSize: vars.light[`text-${step}`]!,
        fontWeight: weight,
        lineHeight: vars.light[`text-${step}--line-height`]!,
        ...(tracking === "normal" ? {} : { letterSpacing: tracking }),
      };
      want[step!] = entry;
      const small = /@media \(max-width: (\d+)px\) \{\n\s*font-size: ([^;]+);\n\s*line-height: ([^;]+);\n\s*\}/.exec(
        rules!,
      );
      if (small) {
        expect(Number(small[1])).toBe(phone.maxWidth);
        want[`${step}-phone`] = { ...entry, fontSize: small[2]!, lineHeight: small[3]! };
      }
    }
    const { family, weight, tracking } = tokens.type.wordmark;
    want.wordmark = { fontFamily: stack(family), fontWeight: weight, letterSpacing: tracking };
    expect(fm.typography).toEqual(want);
  });

  test("the radius and the row heights equal the emitted tokens", () => {
    expect(fm.rounded).toEqual({ radius: vars.light.radius! });
    const radii = [...css.matchAll(/--radius-[a-z0-9]+: ([^;]+);/g)].map((m) => m[1]);
    expect(radii.length).toBeGreaterThan(0);
    expect(new Set(radii)).toEqual(new Set([vars.light.radius]));
    for (const row of ["board", "table", "nav"]) {
      expect(fm.spacing[`row-${row}`]).toBe(vars.light[`spacing-row-${row}`]!);
    }
  });

  test("the spacing steps are the emitted steps, keyed by Tailwind's multiplier", () => {
    const { base, steps } = tokens.space;
    const want = Object.fromEntries(steps.map((px) => [String(px / base), `${px}px`]));
    for (const row of ["board", "table", "nav"]) want[`row-${row}`] = vars.light[`spacing-row-${row}`]!;
    expect(fm.spacing).toEqual(want);
  });
});

describe("DESIGN.md body", () => {
  test("every hex the prose names is a frontmatter colour", () => {
    const values = new Set(Object.values(fm.colors));
    const named = [...new Set(body.match(/#[0-9a-fA-F]{6}\b/g) ?? [])];
    expect(named.length).toBeGreaterThan(0);
    expect(named.filter((hex) => !values.has(hex))).toEqual([]);
  });

  test("it prints no em dash", () => {
    // built from its code point, so the formatter cannot print the character into this file
    expect(doc.includes(String.fromCodePoint(0x2014))).toBe(false);
  });
});

describe(".impeccable/design.json", () => {
  const { colorMeta, typographyMeta, shadows, motion, breakpoints } = sidecar.extensions;

  test("is schema version 2 and keys its metadata by the frontmatter's names", () => {
    expect(sidecar.schemaVersion).toBe(2);
    expect(Object.keys(colorMeta).sort()).toEqual(Object.keys(fm.colors).sort());
    expect(Object.keys(typographyMeta).sort()).toEqual(Object.keys(fm.typography).sort());
  });

  test("every colour's canonical value is the emitted token, with an 8-step ramp", () => {
    const wrong = Object.entries(colorMeta).flatMap(([key, meta]) => {
      const [mode, name] = modeOf(key);
      return meta.canonical === vars[mode][name] && meta.tonalRamp.length === 8 ? [] : [key];
    });
    expect(wrong).toEqual([]);
  });

  test("its shadows and motion name the emitted inventory, and they and its breakpoints are the emitted values", () => {
    // The inventory is what each mode's own block declares, so an empty or short list cannot pass: every
    // --elevation-<e> and --elevation-<e>-rake is shadow-<e>[-rake] in light and dark-shadow-<e>[-rake] in dark, and
    // the motion tokens are --duration-* and --ease-*.
    const own = { light: blockVars(css, ":root,\n.light"), dark: blockVars(css, ".dark") };
    const elevations = (mode: Mode) =>
      Object.keys(own[mode]).flatMap((v) =>
        v.startsWith("elevation-") ? [`${mode === "dark" ? "dark-" : ""}shadow-${v.slice("elevation-".length)}`] : [],
      );
    const wantShadows = [...elevations("light"), ...elevations("dark")].sort();
    for (const e of ELEVATIONS)
      expect(wantShadows).toEqual(expect.arrayContaining([`shadow-${e}`, `shadow-${e}-rake`, `dark-shadow-${e}`]));
    expect(shadows.map((s) => s.name).sort()).toEqual(wantShadows);
    const wantMotion = Object.keys(own.light)
      .filter((v) => /^(duration|ease)-/.test(v))
      .sort();
    expect(wantMotion.length).toBeGreaterThan(0);
    expect(motion.map((m) => m.name).sort()).toEqual(wantMotion);

    const shadow = (name: string): string | undefined => {
      const m = /^(dark-)?shadow-([a-z]+)(-rake)?$/.exec(name);
      return m ? vars[m[1] ? "dark" : "light"][`elevation-${m[2]}${m[3] ?? ""}`] : undefined;
    };
    expect(shadows.filter((s) => s.value !== shadow(s.name))).toEqual([]);
    expect(motion.filter((m) => m.value !== vars.light[m.name])).toEqual([]);
    expect(breakpoints.find((b) => b.name === "phone")?.value).toBe(`${phone.maxWidth}px`);
    expect(read("items/ui/fleet-rail.tsx")).toContain(breakpoints.find((b) => b.name === "bar")!.value);
  });

  test("its component snippets print with the emitted tokens and ds- classes only", () => {
    // the texture tiles sit in a :root block of their own, beside the colour tokens
    const known = { ...vars.light, ...blockVars(css, ":root") };
    expect(sidecar.components.length).toBeGreaterThanOrEqual(5);
    expect(sidecar.components.length).toBeLessThanOrEqual(10);
    for (const { name, html, css: snippet } of sidecar.components) {
      const used = [...snippet.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]!);
      expect({ name, unknown: used.filter((v) => known[v] === undefined) }).toEqual({ name, unknown: [] });
      expect({ name, hex: snippet.match(/#[0-9a-f]{3,8}\b/gi) ?? [] }).toEqual({ name, hex: [] });
      const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(" "));
      expect({ name, foreign: classes.filter((c) => !c.startsWith("ds-")) }).toEqual({ name, foreign: [] });
    }
  });

  test("its narrative is DESIGN.md's own words", () => {
    const { northStar, overview, keyCharacteristics, rules, dos, donts } = sidecar.narrative;
    expect(body).toContain(`**Creative North Star: "${northStar}"**`);
    for (const paragraph of overview.split("\n\n")) expect(body).toContain(paragraph);
    for (const line of [...keyCharacteristics, ...dos, ...donts]) expect(body).toContain(`\n- ${line}\n`);
    for (const rule of rules) expect(body).toContain(`**${rule.name}.** ${rule.body}`);
    expect(rules.length).toBe(body.match(/\*\*The [^*]+ Rule\.\*\*/g)?.length ?? 0);
  });
});
