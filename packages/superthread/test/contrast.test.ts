import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contrast, de, hexToOklch, lStar, oklchCssToHex, over, parseOklch, tint } from "../scripts/color.ts";
import { emittedVars, root } from "../scripts/generate.ts";

// The port of the master's src/check.py, run on the values the emitted dist/v2/superthread.css prints, never on
// source hex. tokens/check.json lists check.py's assertions (keyed here by label source, with " (2)" on a
// source's second use) and every label it printed for the shipped house ink and status level. Each check below
// names itself with that label, so the coverage tests see a drifted master until its new checks are ported.

const read = (path: string) => readFileSync(join(root, path), "utf8");
const master = JSON.parse(read("tokens/master.json"));
const record = JSON.parse(read("tokens/check.json")) as {
  // the check.py constants these checks read; the record holds more
  constants: {
    FAILED_FLOOR: number;
    WORD_FLOOR: number;
    GLYPH_APART: number;
    CHROMATIC: string[];
    GATE_TEXT: [string, string][];
    GATE_UI: [string, string][];
    TEXT_GROUNDS: string[];
  };
  shipped: { HOUSE_DEFAULT: string; STATUS_LEVEL: string };
  assertions: { fn: string; label: string; floor: { source: string; value: number | null }; line: number }[];
  labels: string[];
};
const C = record.constants;
const vars = emittedVars(read("dist/v2/superthread.css"));
type Mode = "light" | "dark";
const MODES: Mode[] = ["light", "dark"];
const other = (m: Mode): Mode => (m === "light" ? "dark" : "light");
const ink = (m: Mode, name: string) => {
  const value = vars[m][name];
  if (value === undefined) throw new Error(`the emitted css has no --${name} in ${m}`);
  return oklchCssToHex(value);
};
const tag = (m: Mode) => `[${m}]`;

// the status states in the master's order, with the role each emits as
const STATES = Object.entries(
  master.status.states as Record<string, { role: string; dark: Record<string, string> }>,
).map(([state, s]) => ({ state, role: s.role, solid: "solid" in s.dark }));
const roleOf = (state: string) => STATES.find((s) => s.state === state)!.role;
const FLEET = master.fleet as string[];

// the shipped level's chroma ceilings, from the vendored palette.py (check.json records the floor as an expression)
const cmax = (() => {
  const dir = join(root, "scripts/texture/master");
  const code = `import sys, json; sys.path.insert(0, ${JSON.stringify(dir)}); from palette import STATUS_LEVELS; print(json.dumps(STATUS_LEVELS[${JSON.stringify(record.shipped.STATUS_LEVEL)}]["cmax"]))`;
  const run = Bun.spawnSync(["python3", "-I", "-B", "-c", code], { stdout: "pipe", stderr: "pipe" });
  if (run.exitCode !== 0) throw new Error(`palette.py: ${run.stderr.toString()}`);
  return JSON.parse(run.stdout.toString()) as { glyph: number; failed: number; "light fill": number };
})();

type Check = { label: string; value: number; floor: number; at?: "most" };
type Ported = { checks: (floor: number | null) => Check[]; inline?: true; exact?: true };
const need = (label: string, a: string, b: string, floor: number): Check => ({ label, value: contrast(a, b), floor });
const apart = (label: string, d: number, floor: number): Check => ({ label, value: d, floor });
// check.py's chroma(): oklch C at most the ceiling, with 0.002 of slack
const chroma = (label: string, c: string, ceiling: number): Check => ({
  label,
  value: hexToOklch(c)[1],
  floor: ceiling + 0.002,
  at: "most",
});
const perMode = (f: (m: Mode) => Check[]) => MODES.flatMap(f);
const one = (f: (m: Mode) => [string, string, string]) => (floor: number | null) =>
  perMode((m) => {
    const [label, a, b] = f(m);
    return [need(`${tag(m)} ${label}`, ink(m, a), ink(m, b), floor!)];
  });
const closest = (inks: Record<string, string>, n: number) => {
  const names = Object.keys(inks);
  return names
    .flatMap((a, i) => names.slice(i + 1).map((b) => ({ d: de(inks[a]!, inks[b]!), a, b })))
    .sort((x, y) => x.d - y.d || x.a.localeCompare(y.a) || x.b.localeCompare(y.b))
    .slice(0, n);
};
const glyphs = (m: Mode) => Object.fromEntries(STATES.map((s) => [s.state, ink(m, `${s.role}-glyph`)]));
const failedRole = roleOf("failed");

const PORTED: Record<string, Ported> = {
  'f"{tag} [{lv}] house to {label}"': {
    // check.json records the floor as the loop's variable: FAILED_FLOOR for the glyph and solid, WORD_FLOOR for the word
    checks: () =>
      perMode((m) => [
        apart(
          `${tag(m)} house to failed glyph and solid`,
          Math.min(
            de(ink(m, "primary"), ink(m, `${failedRole}-glyph`)),
            de(ink(m, "primary"), ink(m, `${failedRole}-solid`)),
          ),
          C.FAILED_FLOOR,
        ),
        apart(
          `${tag(m)} house to failed word`,
          de(ink(m, "primary"), ink(m, `${failedRole}-foreground`)),
          C.WORD_FLOOR,
        ),
      ]),
  },
  'f"{tag} [{lv}] house to {s_}"': {
    checks: (floor) =>
      perMode((m) =>
        C.CHROMATIC.map((state) => {
          const r = roleOf(state);
          const kinds = ["glyph", "foreground", ...(vars[m][`${r}-solid`] ? ["solid"] : [])];
          return apart(
            `${tag(m)} house to ${state}`,
            Math.min(...kinds.map((k) => de(ink(m, "primary"), ink(m, `${r}-${k}`)))),
            floor!,
          );
        }),
      ),
  },
  'f"{tag} text {fg} on {bg}"': {
    checks: (floor) =>
      perMode((m) =>
        C.GATE_TEXT.map(([fg, bg]) => need(`${tag(m)} text ${fg} on ${bg}`, ink(m, fg), ink(m, bg), floor!)),
      ),
  },
  'f"{tag} ui {fg} on {bg}"': {
    checks: (floor) =>
      perMode((m) => C.GATE_UI.map(([fg, bg]) => need(`${tag(m)} ui ${fg} on ${bg}`, ink(m, fg), ink(m, bg), floor!))),
  },
  'f"{tag} house text on {g}"': {
    checks: (floor) =>
      perMode((m) =>
        C.TEXT_GROUNDS.map((g) => need(`${tag(m)} house text on ${g}`, ink(m, "primary"), ink(m, g), floor!)),
      ),
  },
  'f"{tag} foreground on accent"': { checks: one(() => ["foreground on accent", "foreground", "accent"]) },
  'f"{tag} muted-foreground on accent"': {
    checks: one(() => ["muted-foreground on accent", "muted-foreground", "accent"]),
  },
  'f"{tag} foreground on selection"': { checks: one(() => ["foreground on selection", "foreground", "selection"]) },
  'f"{tag} stock label on house hover"': {
    checks: one(() => ["stock label on house hover", "background", "primary-hover"]),
  },
  'f"{tag} stock label on house pressed"': {
    checks: one(() => ["stock label on house pressed", "background", "primary-press"]),
  },
  'f"{tag} house edge on accent"': { checks: one(() => ["house edge on accent", "primary", "accent"]) },
  'f"{tag} house to {name} spot"': {
    checks: (floor) =>
      perMode((m) =>
        FLEET.map((ship) =>
          apart(`${tag(m)} house to ${ship} spot`, de(ink(m, "primary"), ink(m, `ship-${ship}`)), floor!),
        ),
      ),
  },
  'f"{tag} neutral hover apart from background"': {
    checks: (floor) =>
      perMode((m) => [
        apart(
          `${tag(m)} neutral hover apart from background`,
          de(ink(m, "control-hover"), ink(m, "background")),
          floor!,
        ),
      ]),
  },
  'f"{tag} raised hover apart from card"': {
    checks: (floor) =>
      perMode((m) => [
        apart(`${tag(m)} raised hover apart from card`, de(ink(m, "raised-hover"), ink(m, "card")), floor!),
      ]),
  },
  'f"{tag} raised pressed apart from raised hover"': {
    checks: (floor) =>
      perMode((m) => [
        apart(
          `${tag(m)} raised pressed apart from raised hover`,
          de(ink(m, "raised-press"), ink(m, "raised-hover")),
          floor!,
        ),
      ]),
  },
  'f"{tag} ground-foreground on ground"': {
    checks: one(() => ["ground-foreground on ground", "ground-foreground", "ground"]),
  },
  'f"{tag} card on ground (the raised sheet)"': {
    checks: one(() => ["card on ground (the raised sheet)", "card", "ground"]),
  },
  // the rail's current edge and the progress fill print the house ink's dark value, --sidebar-primary, on the ground
  'f"{tag} house (dark value) on the ground: current edge and progress"': {
    checks: one(() => ["house (dark value) on the ground: current edge and progress", "sidebar-primary", "ground"]),
  },
  // the current box on the ground: the ground's text on the dark accent
  'f"{tag} ground text inside the current box (dark accent)"': {
    checks: one(() => [
      "ground text inside the current box (dark accent)",
      "sidebar-accent-foreground",
      "sidebar-accent",
    ]),
  },
  'f"{tag} package names on the code patch (house dark value)"': {
    checks: one(() => ["package names on the code patch (house dark value)", "code-accent", "code"]),
  },
  'f"{tag} copy link ring on the code patch (house dark value)"': {
    checks: one(() => ["copy link ring on the code patch (house dark value)", "code-ring", "code"]),
  },
  // control_states(): each hover and pressed fill with the label that sits on it; neutral-* emits as --control-*
  'f"[{mode}] {role} on {name}"': {
    checks: (floor) =>
      perMode((m) =>
        (
          [
            ["destructive-foreground", "destructive-hover", "destructive-hover"],
            ["destructive-foreground", "destructive-press", "destructive-press"],
            ["secondary-foreground", "secondary-hover", "secondary-hover"],
            ["secondary-foreground", "secondary-press", "secondary-press"],
            ["foreground", "neutral-hover", "control-hover"],
            ["foreground", "neutral-press", "control-press"],
            ["card-foreground", "raised-hover", "raised-hover"],
            ["card-foreground", "raised-press", "raised-press"],
          ] as const
        ).map(([role, name, emitted]) => need(`${tag(m)} ${role} on ${name}`, ink(m, role), ink(m, emitted), floor!)),
      ),
  },
  'f"[{mode}] rail tip name on first ink"': {
    checks: one(() => ["rail tip name on first ink", "background", "foreground"]),
  },
  'f"[{mode}] rail tip line on first ink"': {
    checks: (floor) =>
      perMode((m) => [
        need(`${tag(m)} rail tip line on first ink`, ink(other(m), "muted-foreground"), ink(m, "foreground"), floor!),
      ]),
  },
  'f"[{mode}] error text on background"': { checks: one(() => ["error text on background", "error", "background"]) },
  'f"[{mode}] code text on the code patch"': {
    checks: one(() => ["code text on the code patch", "code-foreground", "code"]),
  },
  'f"[{mode}] code prompt on the code patch"': {
    checks: one(() => ["code prompt on the code patch", "code-muted", "code"]),
  },
  'f"[{mode}] muted-foreground on card"': {
    checks: one(() => ["muted-foreground on card", "muted-foreground", "card"]),
  },
  'f"{tag} {s} word on its fill"': {
    checks: (floor) =>
      perMode((m) =>
        STATES.map(({ state, role }) =>
          need(`${tag(m)} ${state} word on its fill`, ink(m, `${role}-foreground`), ink(m, `${role}-wash`), floor!),
        ),
      ),
  },
  'f"{tag} {s} glyph on its fill"': {
    checks: (floor) =>
      perMode((m) =>
        STATES.map(({ state, role }) =>
          need(`${tag(m)} ${state} glyph on its fill`, ink(m, `${role}-glyph`), ink(m, `${role}-wash`), floor!),
        ),
      ),
  },
  'f"{tag} {s} glyph on {g}"': {
    checks: (floor) =>
      perMode((m) =>
        STATES.flatMap(({ state, role }) =>
          ["background", "card", "muted"].map((g) =>
            need(`${tag(m)} ${state} glyph on ${g}`, ink(m, `${role}-glyph`), ink(m, g), floor!),
          ),
        ),
      ),
  },
  // check.json records the ceiling as the loop's variable: the failed ceiling for failed, the glyph ceiling for the rest
  'f"{tag} {s} {k}"': {
    checks: () =>
      perMode((m) =>
        STATES.filter((s) => s.state !== "queued").flatMap(({ state, role, solid }) =>
          (["glyph", "text", ...(solid ? ["solid"] : [])] as const).map((k) =>
            chroma(
              `${tag(m)} ${state} ${k}`,
              ink(m, `${role}-${k === "text" ? "foreground" : k}`),
              state === "failed" ? cmax.failed : cmax.glyph,
            ),
          ),
        ),
      ),
  },
  'f"{tag} {s} light fill"': {
    checks: () =>
      STATES.filter((s) => s.state !== "queued").map(({ state, role }) =>
        chroma(`[light] ${state} light fill`, ink("light", `${role}-wash`), cmax["light fill"]),
      ),
  },
  'f"{tag} {s} label on solid"': {
    checks: (floor) =>
      perMode((m) =>
        STATES.filter((s) => s.solid).map(({ state, role }) =>
          need(
            `${tag(m)} ${state} label on solid`,
            ink(m, `${role}-solid-foreground`),
            ink(m, `${role}-solid`),
            floor!,
          ),
        ),
      ),
  },
  'f"{tag} {s} solid on {g}"': {
    checks: (floor) =>
      perMode((m) =>
        STATES.filter((s) => s.solid).flatMap(({ state, role }) =>
          ["background", "card"].map((g) =>
            need(`${tag(m)} ${state} solid on ${g}`, ink(m, `${role}-solid`), ink(m, g), floor!),
          ),
        ),
      ),
  },
  'f"{tag} the failed solid against the {o} badge\'s fill"': {
    checks: (floor) =>
      perMode((m) =>
        STATES.filter((s) => s.state !== "failed").map(({ state, role }) =>
          need(
            `${tag(m)} the failed solid against the ${state} badge's fill`,
            ink(m, `${failedRole}-solid`),
            ink(m, `${role}-wash`),
            floor!,
          ),
        ),
      ),
  },
  // the three closest glyph squares, as check.py picks them
  'f"{tag} status glyphs apart {a} / {b}"': {
    exact: true,
    checks: (floor) =>
      perMode((m) =>
        closest(glyphs(m), 3).map(({ d, a, b }) => apart(`${tag(m)} status glyphs apart ${a} / ${b}`, d, floor!)),
      ),
  },
  'f"[{mode}] {name} dithered region (spot over silhouette at 50 percent) on its tile"': {
    // the mark's tile and silhouette are the two inks: key and paper, as the light mode prints them
    checks: (floor) =>
      perMode((m) => {
        const [key, paper] = [ink("light", "foreground"), ink("light", "background")];
        const [tile, sil] = m === "light" ? [key, paper] : [paper, key];
        return FLEET.map((ship) =>
          need(
            `${tag(m)} ${ship} dithered region (spot over silhouette at 50 percent) on its tile`,
            tint(ink(m, `ship-${ship}`), sil, 50),
            tile,
            floor!,
          ),
        );
      }),
  },
  '"[light] the white sheet on the deep ground"': {
    checks: (floor) => [
      need("[light] the white sheet on the deep ground", ink("light", "card"), ink("light", "ground"), floor!),
    ],
  },
  // the rake's core: the soft shadow's ink at its alpha over the ground, composited in 8-bit srgb, rounded as check.py does
  '"[light] the rake\'s drop in L* beside the sheet, at its core"': {
    checks: (floor) => {
      const shadow = /oklch\([^)]*\)/.exec(vars.light["elevation-sheet-rake"]!)![0];
      const [, , , alpha] = parseOklch(shadow);
      const ground = ink("light", "ground");
      const drop = Math.round((lStar(ground) - lStar(over(ground, oklchCssToHex(shadow), alpha))) * 10) / 10;
      return [apart("[light] the rake's drop in L* beside the sheet, at its core", drop, floor!)];
    },
  },
  // inline (check.py line 401): the six spots and the lead house ink, the five closest pairs at 10
  'f"[{mode}] spots apart {a} / {b}"': {
    inline: true,
    exact: true,
    checks: () =>
      perMode((m) => {
        const inks: Record<string, string> = Object.fromEntries(FLEET.map((ship) => [ship, ink(m, `ship-${ship}`)]));
        for (const lead of master.house.leads as string[]) inks[lead] = ink(m, "primary");
        return closest(inks, 5).map(({ d, a, b }) => apart(`${tag(m)} spots apart ${a} / ${b}`, d, 10));
      }),
  },
  // inline: check.py reports the closest glyph pair with its distance; the port reprints the same line
  'f"{tag} closest glyph squares as seen: {gp[0][1]} / {gp[0][2]} {gp[0][0]:.2f} (floor {GLYPH_APART})"': {
    inline: true,
    exact: true,
    checks: () =>
      perMode((m) => {
        const [{ d, a, b }] = closest(glyphs(m), 1) as [{ d: number; a: string; b: string }];
        return [
          apart(
            `${tag(m)} closest glyph squares as seen: ${a} / ${b} ${d.toFixed(2)} (floor ${C.GLYPH_APART})`,
            d,
            C.GLYPH_APART,
          ),
        ];
      }),
  },
};

const RETIRED = "the retired spot-ink alternative (house.ship primary): no ship ink is emitted";
const PAGES =
  "tests the master's own pages and css, not an emitted value; the item tests and the focus shots carry the rule";
const NOT_EMITTED: Record<string, { reason: string; inline?: true }> = {
  'f"{tag} house to {name} spot-ink"': { reason: RETIRED },
  'f"{tag} label on primary"': { reason: RETIRED },
  'f"{tag} ring on background"': { reason: RETIRED },
  'f"{tag} link text on {g}"': { reason: RETIRED },
  'f"{tag} foreground on accent" (2)': { reason: RETIRED },
  'f"{tag} muted-foreground on accent" (2)': { reason: RETIRED },
  'f"{tag} foreground on selection" (2)': { reason: RETIRED },
  'f"{tag} stock label on hover"': { reason: RETIRED },
  'f"{tag} stock label on pressed"': { reason: RETIRED },
  'f"{tag} edge on accent"': { reason: RETIRED },
  'f"{tag} to failed glyph and solid"': { reason: RETIRED },
  'f"{tag} to failed word"': { reason: RETIRED },
  'f"{tag} to {s} glyph, word and edge"': { reason: RETIRED },
  'f"{tag} to the nearest stock colour, {n}"': { reason: RETIRED },
  'f"[light] {name} stock label on spot-ink"': { reason: RETIRED },
  'f"[light] {name} spot-ink as text"': { reason: RETIRED },
  'f"[dark] {name} key label on spot-ink"': { reason: RETIRED },
  'f"[dark] {name} spot-ink as text on {g}"': { reason: RETIRED },
  // inline checks (check.py lines 145, 255 and 290 to 332)
  '"steer 2 level matches snapshots/master-judge-fixed/tokens.json"': {
    inline: true,
    reason: "the steer 2 snapshot: a level that does not ship",
  },
  'f"status-ladder.html: {label}"': { inline: true, reason: "status-ladder.html, the master's level ladder page" },
  'f"{n}: {fp.n} fields, each held by a field box"': { inline: true, reason: PAGES },
  'f"{n}: no !important, so no rule can push a ring past the field\'s own"': { inline: true, reason: PAGES },
  '"focus: no rule silences or frames a field box for a button inside it"': { inline: true, reason: PAGES },
  'f"focus: a field with a button inside it in each pane ({inner}), shot by shoot_focus.sh as Tab onto the button"': {
    inline: true,
    reason: PAGES,
  },
  'f"focus: {label}"': { inline: true, reason: PAGES },
  'f"focus: a disabled field in each pane ({dis}), so it takes no focus"': { inline: true, reason: PAGES },
  "f\"texture: {d['component']}, {d['detail']}, shown and captioned in light and dark ({k})\"": {
    inline: true,
    reason: "the master's captions in reach.html; the site's texture page shows each detail",
  },
  'f"texture: the {pct} percent tile is {cells(pct)} of 16 whole-pixel squares, crisp edges"': {
    inline: true,
    reason: "the tile drawings, which S1.T's texture test checks",
  },
  "f\"texture: a raised layer's screen is its contact edge only ({CONTACT['x']} by {CONTACT['y']} px, light only), never a field\"":
    {
      inline: true,
      reason: "the master's reach.css rule, which S1.T's texture test checks in texture.css",
    },
  "\"texture: the row edge sits inside the table's box, in the first cell's padding\"": { inline: true, reason: PAGES },
  '"texture: the component details never move or blur"': {
    inline: true,
    reason: "the master's reach.css; S1.T's texture test holds texture.css to it",
  },
  'f"marks/{f.name} matches the strip drawing"': { inline: true, reason: "the mark drawings, which S2.4 copies" },
};

// ---------- matching labels to their sources ----------

const keyed = (() => {
  const seen = new Map<string, number>();
  return record.assertions.map((a) => {
    const n = (seen.get(a.label) ?? 0) + 1;
    seen.set(a.label, n);
    return { ...a, key: n === 1 ? a.label : `${a.label} (${n})` };
  });
})();
const floorOf = (key: string) => keyed.find((a) => a.key === key)!.floor.value;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A label source as a regex over printed labels: the level tag goes (labels are the shipped level's), the house
// tag prints as the mode, a bare name is one word, and anything else is any text.
function pattern(source: string): RegExp {
  const body = source
    .replace(/ \(\d+\)$/, "")
    .replace(/^f?"/, "")
    .replace(/"$/, "")
    .replace(/\\'/g, "'")
    .replace("[{lv}] ", "");
  let out = "";
  for (const part of body.split(/(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/)) {
    if (!part.startsWith("{")) out += escape(part);
    else if (part === "{tag}") out += "\\[(?:light|dark)\\]";
    else if (part === "{mode}") out += "(?:light|dark)";
    else if (part === "{label}") out += ".+";
    else if (/^\{[a-z_]+\}$/.test(part)) out += "[a-z0-9.-]+";
    else out += ".+?";
  }
  return new RegExp(`^${out}$`);
}

const entries = [
  ...Object.entries(PORTED).map(([key, e]) => ({ key, inline: e.inline === true })),
  ...Object.entries(NOT_EMITTED).map(([key, e]) => ({ key, inline: e.inline === true })),
];

describe("coverage", () => {
  test("every check.json assertion is ported or not emitted, and neither list names one it lacks", () => {
    const assertions = keyed.map((a) => a.key).sort();
    const listed = entries
      .filter((e) => !e.inline)
      .map((e) => e.key)
      .sort();
    expect(listed).toEqual(assertions);
    for (const key of Object.keys(PORTED)) expect(key in NOT_EMITTED, key).toBe(false);
  });

  test("every printed label belongs to an entry, and every inline entry still prints", () => {
    const patterns = entries.map((e) => ({ ...e, re: pattern(e.key) }));
    const loose = record.labels.filter((label) => !patterns.some((p) => p.re.test(label)));
    expect(loose).toEqual([]);
    for (const p of patterns.filter((e) => e.inline))
      expect(
        record.labels.some((label) => p.re.test(label)),
        p.key,
      ).toBe(true);
  });

  test("every ported check names itself with a label check.py printed", () => {
    const printed = new Set(record.labels);
    for (const [key, e] of Object.entries(PORTED)) {
      const labels = e.checks(e.inline ? null : floorOf(key)).map((c) => c.label);
      expect(labels.length, key).toBeGreaterThan(0);
      expect(
        labels.filter((label) => !printed.has(label)),
        key,
      ).toEqual([]);
      if (e.exact)
        expect(new Set(labels), key).toEqual(new Set(record.labels.filter((label) => pattern(key).test(label))));
    }
  });

  test("every not-emitted entry carries a reason", () => {
    for (const [key, e] of Object.entries(NOT_EMITTED)) expect(e.reason.length, key).toBeGreaterThan(0);
  });
});

describe("check.py on the emitted css", () => {
  for (const [key, e] of Object.entries(PORTED))
    test(key, () => {
      const floor = e.inline ? null : floorOf(key);
      if (!e.inline && floor === null)
        expect(key).toBeOneOf(['f"{tag} [{lv}] house to {label}"', 'f"{tag} {s} {k}"', 'f"{tag} {s} light fill"']);
      const fails = e
        .checks(floor)
        .filter((c) => (c.at === "most" ? c.value > c.floor : c.value < c.floor))
        .map((c) => `${c.label}: ${c.value.toFixed(3)} ${c.at === "most" ? ">" : "<"} ${c.floor}`);
      expect(fails).toEqual([]);
    });
});

// The sidebar and the rail frame keep each mode's deep ground and print on it in the dark palette, as the world's
// `gutter dk` does (GATE.md, S1.F round 1, review 4). check.py checks no status glyph on the ground, so this holds
// every status glyph's dark value to check.py's glyph floor on each mode's sidebar ground.
describe("the deep ground", () => {
  test("every status glyph's dark value clears the glyph floor on each mode's sidebar ground", () => {
    const floor = floorOf('f"{tag} {s} glyph on {g}"')!;
    const fails = perMode((m) =>
      STATES.map((s) =>
        need(
          `${tag(m)} ${s.state} glyph (dark) on the sidebar`,
          ink("dark", `${s.role}-glyph`),
          ink(m, "sidebar"),
          floor,
        ),
      ),
    )
      .filter((c) => c.value < c.floor)
      .map((c) => `${c.label}: ${c.value.toFixed(3)} < ${c.floor}`);
    expect(floor).toBe(3);
    expect(fails).toEqual([]);
  });
});
