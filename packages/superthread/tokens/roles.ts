// The role map: every colour var the v2 css declares, with its source in tokens/master.json per mode.
// A source is a master path to a hex, a tint of two such paths, a hex from scale.ts, or a literal css value.
// The status and ship roles are read from the master's own lists (status.states and fleet), never from
// today's names. `provisional` marks every role v1's dist/superthread.css does not declare.

import { shadowInk } from "./scale.ts";

export type Mode = "light" | "dark";
export const MODES: Mode[] = ["light", "dark"];

export type Source =
  | { path: string }
  | { tint: { over: string; under: string; pct: number } }
  | { hex: string; from: string }
  | { css: string };

export type Role = { name: string; light: Source; dark: Source; provisional: boolean };

// The colour vars v1 declares in :root and .dark.
export const V1 = new Set([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

// The two inks: key, the first ink in light, and the stock (paper) it prints on.
export const KEY = "inks.key.hex";
export const PAPER = "inks.stock.hex";

// shadcn's roles, from the master's mode blocks unchanged.
export const SHADCN = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
];

// The chart series, in the order a chart takes them.
export const CHARTS = ["orbit", "constellation", "quanta", "artifacts", "trisys"];

// The four lifts, with geometry from shadow.<e> and shadow.contact.<e>.
export const ELEVATIONS = ["slip", "leaf", "sheet", "lifted"];

type Master = {
  house: { default: string };
  fleet: string[];
  light: Record<string, string>;
  dark: Record<string, string>;
  extra: Record<Mode, Record<string, string>>;
  status: { states: Record<string, { role: string } & Record<Mode, Record<string, string>>> };
};

const path = (p: string): Source => ({ path: p });
const each = (f: (m: Mode) => Source) => ({ light: f("light"), dark: f("dark") });

export function roles(master: Master): Role[] {
  const out: Omit<Role, "provisional">[] = [];
  const add = (name: string, sources: { light: Source; dark: Source }) => out.push({ name, ...sources });

  for (const name of SHADCN)
    add(
      name,
      each((m) => path(`${m}.${name}`)),
    );

  // the deep ground is dark in both modes, so the rail and the nav on it take the dark tokens' inks
  add(
    "sidebar",
    each((m) => path(`extra.${m}.ground`)),
  );
  add(
    "sidebar-foreground",
    each((m) => path(`extra.${m}.ground-foreground`)),
  );
  add(
    "sidebar-primary",
    each(() => path("dark.primary")),
  );
  add(
    "sidebar-primary-foreground",
    each(() => path("dark.primary-foreground")),
  );
  add(
    "sidebar-accent",
    each(() => path("dark.accent")),
  );
  add(
    "sidebar-accent-foreground",
    each((m) => path(`extra.${m}.ground-foreground`)),
  );
  add(
    "sidebar-hover",
    each((m) => ({ tint: { over: PAPER, under: `extra.${m}.ground`, pct: 5 } })),
  );
  // the master draws every rule on the ground in the dark rule ink (.gutter .rail, .shipnav b in reach.css)
  add(
    "sidebar-border",
    each(() => path("extra.dark.rule")),
  );
  add(
    "sidebar-ring",
    each(() => path("dark.ring")),
  );

  for (const [state, s] of Object.entries(master.status.states)) {
    const r = s.role;
    const base = (m: Mode) =>
      r in master[m]
        ? path(`${m}.${r}`)
        : r in master.extra[m]
          ? path(`extra.${m}.${r}`)
          : path(`status.states.${state}.${m}.glyph`);
    add(r, each(base));
    add(
      `${r}-glyph`,
      each((m) => path(`status.states.${state}.${m}.glyph`)),
    );
    add(
      `${r}-foreground`,
      each((m) => path(`status.states.${state}.${m}.text`)),
    );
    add(
      `${r}-wash`,
      each((m) => path(`status.states.${state}.${m}.fill`)),
    );
    add(
      `${r}-edge`,
      each((m) => path(`status.states.${state}.${m}.edge`)),
    );
    if ("solid" in s.light && "solid" in s.dark) {
      add(
        `${r}-solid`,
        each((m) => path(`status.states.${state}.${m}.solid`)),
      );
      // check.py holds the stock label to 4.5:1 on the solid in both modes
      add(
        `${r}-solid-foreground`,
        each(() => path(PAPER)),
      );
    }
  }

  add(
    "ground",
    each((m) => path(`extra.${m}.ground`)),
  );
  add(
    "ground-foreground",
    each((m) => path(`extra.${m}.ground-foreground`)),
  );
  for (const name of ["rule", "selection", "disabled", "faint"])
    add(
      name,
      each((m) => path(`extra.${m}.${name}`)),
    );

  const house = master.house.default;
  add(
    "code",
    each((m) => path(`code.${m}.patch`)),
  );
  add(
    "code-foreground",
    each((m) => path(`code.${m}.text`)),
  );
  add(
    "code-muted",
    each((m) => path(`code.${m}.prompt`)),
  );
  add(
    "code-border",
    each((m) => path(`code.${m}.separator`)),
  );
  add(
    "code-accent",
    each((m) => path(`code.${m}.packages.${house}`)),
  );
  add(
    "code-ring",
    each((m) => path(`code.${m}.ring.${house}`)),
  );

  add(
    "primary-hover",
    each((m) => path(`states.${m}.house.primary hover`)),
  );
  add(
    "primary-press",
    each((m) => path(`states.${m}.house.primary pressed`)),
  );
  for (const [name, from] of [
    ["secondary", "secondary"],
    ["control", "neutral"],
    ["raised", "raised"],
    ["destructive", "destructive"],
  ] as const) {
    add(
      `${name}-hover`,
      each((m) => path(`states.${m}.controls.${from}-hover`)),
    );
    add(
      `${name}-press`,
      each((m) => path(`states.${m}.controls.${from}-press`)),
    );
  }
  // the 1 px paper 6 edge a raised layer carries in dark (shadow["dark colour"])
  add("raised-edge", { light: { css: "transparent" }, dark: { tint: { over: PAPER, under: KEY, pct: 6 } } });

  CHARTS.forEach((ship, i) =>
    add(
      `chart-${i + 1}`,
      each((m) => path(`ships.${ship}.${m}.spot`)),
    ),
  );
  for (const ship of master.fleet)
    add(
      `ship-${ship}`,
      each((m) => path(`ships.${ship}.${m}.spot`)),
    );

  add(
    "shadow-ink",
    each((m) => ({ hex: shadowInk[m].ink, from: shadowInk[m].from })),
  );

  return out.map((role) => ({ ...role, provisional: !V1.has(role.name) }));
}

// Master keys the generator reads for structure or for a non-colour value, not as a colour role.
export const CONSUMED: { path: string; by: string }[] = [
  { path: "status.states.*.role", by: "names the status roles" },
  { path: "status.states.*.glyph", by: "glyphs.tsx StatusGlyph" },
  { path: "fleet", by: "the ship roles and fleet.ts, in this order" },
  { path: "ships.*.angle", by: "fleet.ts, the line-screen angle" },
  { path: "ships.*.mark", by: "fleet.ts, the mark files" },
  { path: "shadow.slip", by: "--elevation-slip" },
  { path: "shadow.leaf", by: "--elevation-leaf" },
  { path: "shadow.sheet", by: "--elevation-sheet" },
  { path: "shadow.lifted", by: "--elevation-lifted" },
  { path: "shadow.contact", by: "the contact part of every --elevation-<e>" },
  { path: "shadow.light colour", by: "scale.ts shadowInk.light" },
  { path: "shadow.dark colour", by: "scale.ts shadowInk.dark" },
  { path: "code.ring offset", by: "scale.ts codeRingOffset, --code-ring-offset" },
  { path: "house.default", by: "picks the code patch's package and ring ink" },
  { path: "inks.key.hex", by: "the key in every computed tint and the dark wedge's stock" },
  { path: "inks.stock.hex", by: "the paper in every computed tint and the light wedge's stock" },
  { path: "wedge.light.steps", by: "tokens.ts wedge" },
  { path: "wedge.dark.steps", by: "tokens.ts wedge" },
  { path: "space.rows", by: "scale.ts rows, --spacing-row-*" },
  { path: "space.base", by: "tokens.ts space; Tailwind's --spacing is the same 4 px" },
  { path: "space.steps", by: "tokens.ts space" },
  { path: "shape.radius", by: "scale.ts radius" },
  { path: "fonts", by: "scale.ts stacks" },
  { path: "texture.places", by: "tokens.ts texture" },
];

// Master keys that reach no output, each with the reason.
export const IGNORED: { path: string; reason: string }[] = [
  { path: "extra.*.code", reason: "the same ink as code.<m>.patch, which --code reads" },
  { path: "states.*.recipe", reason: "prose: how each state is mixed; the hex values sit beside it" },
  {
    path: "status.states.*.contrast",
    reason: "the master's printed ratios; contrast.test.ts recomputes them from the emitted css",
  },
  { path: "code.rule", reason: "prose" },
  { path: "code.*.packages", reason: "the other house candidates; --code-accent reads house.default's" },
  { path: "code.*.ring", reason: "the other house candidates; --code-ring reads house.default's" },
  { path: "code.*.contrast", reason: "the master's printed ratios; contrast.test.ts recomputes them" },
  { path: "shadow.rule", reason: "prose" },
  { path: "shadow.where", reason: "prose: which layer takes which lift" },
  { path: "shadow.on stock", reason: "prose: texture-contact (S1.T) carries it" },
  { path: "shadow.on the deep ground", reason: "prose" },
  { path: "shadow.measured on the ground", reason: "prose" },
  { path: "shadow.before", reason: "prose: the judge round's geometry, replaced" },
  {
    path: "shadow.measured",
    reason: "the master's measurements; contrast.test.ts recomputes the light sheet and drop",
  },
  { path: "ships.*.light.tile", reason: "the mark's silhouette, drawn into marks/*.svg" },
  { path: "ships.*.light.ink", reason: "the retired spot-ink alternative (house.ship primary)" },
  { path: "ships.*.dark.tile", reason: "the mark's silhouette, drawn into marks/*.svg" },
  { path: "ships.*.dark.ink", reason: "the retired spot-ink alternative (house.ship primary)" },
  { path: "ships.*.spot name", reason: "prose" },
  { path: "ships.*.hue", reason: "the spot's oklch hue, already in its hex" },
  { path: "ships.*.oklch", reason: "printed oklch; the css emits its own from the hex" },
  { path: "ships.*.contrast", reason: "the master's printed ratios; contrast.test.ts recomputes them" },
  { path: "ships.*.use", reason: "prose" },
  {
    path: "ships.*.nearest lead house ink",
    reason: "the master's printed distances; contrast.test.ts recomputes them",
  },
  { path: "house.candidates", reason: "only house.default ships, through light.primary and dark.primary" },
  { path: "font_sources", reason: "where the faces came from; fonts.ts lists the files" },
  { path: "recipe", reason: "prose: the wedge step each role names" },
];
