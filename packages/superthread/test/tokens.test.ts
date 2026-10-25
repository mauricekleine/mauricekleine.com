import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { oklchCss, oklchCssToHex, tint } from "../scripts/color.ts";
import { blockVars, emittedVars, hexAt, hexOf, lookup, root } from "../scripts/generate.ts";
import { alphaOf, CONSUMED, ELEVATIONS, IGNORED, KEY, MODES, PAPER, roles, V1, type Source } from "../tokens/roles.ts";
import * as scale from "../tokens/scale.ts";

// Reads only the vendored tokens/*.json, the frozen v1 css and this slice's own outputs.
const read = (path: string) => readFileSync(join(root, path), "utf8");
const master = JSON.parse(read("tokens/master.json"));
const check = JSON.parse(read("tokens/check.json"));
const css = read("dist/v2/superthread.css");
const emitted = emittedVars(css);
const all = roles(master);
const hexIn = (value: string) => oklchCssToHex(value);

function leaves(value: unknown, path: string): string[] {
  if (value !== null && typeof value === "object" && !Array.isArray(value))
    return Object.entries(value).flatMap(([key, v]) => leaves(v, `${path}.${key}`));
  return [path];
}
const masterLeaves = Object.entries(master).flatMap(([key, v]) => leaves(v, key));
const covers = (pattern: string, path: string) => {
  const p = pattern.split(".");
  const q = path.split(".");
  return p.length <= q.length && p.every((segment, i) => segment === "*" || segment === q[i]);
};
const sourcePaths = (source: Source) =>
  "path" in source ? [source.path] : "tint" in source ? [source.tint.over, source.tint.under] : [];

describe("the role map", () => {
  test("every master key under the mapped sections is mapped, consumed or ignored", () => {
    const sections = ["light", "dark", "extra", "status.states", "states", "code", "shadow", "ships", "fleet"];
    const mapped = new Set(all.flatMap((role) => MODES.flatMap((m) => sourcePaths(role[m]))));
    const uncovered = masterLeaves
      .filter((leaf) => sections.some((section) => covers(section, leaf)))
      .filter((leaf) => !mapped.has(leaf))
      .filter((leaf) => ![...CONSUMED, ...IGNORED].some((entry) => covers(entry.path, leaf)));
    expect(uncovered).toEqual([]);
  });

  test("every consumed and ignored entry names a key the master has, with a reason", () => {
    for (const entry of [
      ...CONSUMED.map((c) => ({ path: c.path, why: c.by })),
      ...IGNORED.map((i) => ({ path: i.path, why: i.reason })),
    ]) {
      expect(
        masterLeaves.some((leaf) => covers(entry.path, leaf)),
        entry.path,
      ).toBe(true);
      expect(entry.why.length, entry.path).toBeGreaterThan(0);
    }
  });

  test("every source path resolves to a hex, and only the light raised edge is a literal", () => {
    const literals: string[] = [];
    for (const role of all)
      for (const m of MODES) {
        for (const path of sourcePaths(role[m])) expect(hexAt(master, path)).toMatch(/^#[0-9a-f]{6}$/);
        if (hexOf(master, role[m]) === null) literals.push(`${role.name} ${m}`);
      }
    expect(literals).toEqual(["raised-edge light"]);
  });

  test("role names are unique", () => {
    expect(new Set(all.map((role) => role.name)).size).toBe(all.length);
  });

  test("provisional is set on exactly the roles v1 does not declare", () => {
    const v1 = read("dist/superthread.css");
    const declared = new Set([...v1.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((m) => m[1]!));
    const v1Colours = [...blockVarsOf(v1, ":root")].filter((name) => name !== "radius");
    expect(new Set(v1Colours)).toEqual(V1);
    for (const role of all) expect(role.provisional, role.name).toBe(!declared.has(role.name));
    const json = JSON.parse(read("dist/v2/tokens.json"));
    for (const m of MODES)
      for (const role of all)
        expect(json[m][role.name].provisional === true, `${m} ${role.name}`).toBe(role.provisional);
  });
});

function blockVarsOf(text: string, selector: string): string[] {
  const at = text.indexOf(`\n${selector} {\n`);
  const body = text.slice(at, text.indexOf("\n}", at + 1));
  return [...body.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((m) => m[1]!);
}

describe("the emitted css", () => {
  test("every role is emitted in both modes, in the documented oklch form", () => {
    for (const m of MODES)
      for (const role of all) {
        const hex = hexOf(master, role[m]);
        const value = emitted[m][role.name];
        const alpha = alphaOf(role[m]);
        expect(value, `${m} ${role.name}`).toBe(hex === null ? (role[m] as { css: string }).css : oklchCss(hex, alpha));
        if (hex !== null)
          expect(value).toMatch(
            alpha === undefined
              ? /^oklch\(\d+(\.\d{1,4})? \d+(\.\d{1,4})? \d+(\.\d{1,2})?\)$/
              : /^oklch\(\d+(\.\d{1,4})? \d+(\.\d{1,4})? \d+(\.\d{1,2})? \/ (0|1|0?\.\d+)\)$/,
          );
      }
  });

  test("every emitted oklch() converts back to its source hex", () => {
    let seen = 0;
    for (const m of MODES) {
      const own = blockVars(css, m === "light" ? ":root,\n.light" : ".dark");
      for (const [name, value] of Object.entries(own)) {
        const found = [...value.matchAll(/oklch\([^)]*\)/g)].map((x) => x[0]);
        if (found.length === 0) continue;
        const role = all.find((r) => r.name === name);
        const expected = role
          ? hexOf(master, role[m])
          : name.startsWith("elevation-")
            ? scale.shadowInk[m].ink
            : undefined;
        expect(expected, `${m} --${name} has no source`).toBeDefined();
        for (const colour of found) {
          expect(hexIn(colour), `${m} --${name}`).toBe(expected!);
          seen++;
        }
      }
    }
    const blocks = [blockVars(css, ":root,\n.light"), blockVars(css, ".dark")];
    const total = blocks
      .flatMap((b) => Object.values(b))
      .join(" ")
      .match(/oklch\(/g)!.length;
    expect(seen).toBe(total);
  });

  test("paper over key at 6 is the dark secondary hover, and the dark raised edge", () => {
    const edge = tint(hexAt(master, PAPER), hexAt(master, KEY), 6);
    expect(edge).toBe(master.states.dark.controls["secondary-hover"]);
    expect(hexIn(emitted.dark["raised-edge"]!)).toBe(edge);
    expect(emitted.light["raised-edge"]).toBe("transparent");
  });

  test("the key holds in both modes, and the scrim is the key at 42 percent in light and black at 60 in dark", () => {
    const key = hexAt(master, KEY);
    for (const m of MODES) expect(hexIn(emitted[m].key!), m).toBe(key);
    expect(scale.scrim.light.ink).toBe(key);
    expect(emitted.light.scrim).toBe(oklchCss(key, 0.42));
    expect(emitted.dark.scrim).toBe(oklchCss("#000000", 0.6));
    const json = JSON.parse(read("dist/v2/tokens.json"));
    expect(json.light.scrim).toMatchObject({ hex: key, alpha: 0.42, provisional: true });
    expect(json.dark.scrim).toMatchObject({ hex: "#000000", alpha: 0.6, provisional: true });
  });

  test("the sidebar hover is the master's printed --gnd-h in each mode", () => {
    for (const m of MODES) expect(hexIn(emitted[m]["sidebar-hover"]!), m).toBe(check.printed["--gnd-h"][m]);
  });

  test("the wedge step the recipe names for light muted-foreground prints it", () => {
    const [, step] = /^key (\d+)$/.exec(master.recipe.light["muted-foreground"])!;
    expect(master.wedge.light.steps).toContain(Number(step));
    const hex = tint(hexAt(master, KEY), hexAt(master, PAPER), Number(step));
    expect(hex).toBe(master.light["muted-foreground"]);
    expect(hexIn(emitted.light["muted-foreground"]!)).toBe(hex);
  });

  test("every key and paper step in the recipe reprints the master's hex", () => {
    const key = hexAt(master, KEY);
    const paper = hexAt(master, PAPER);
    let n = 0;
    for (const m of MODES)
      for (const [role, recipe] of Object.entries(master.recipe[m] as Record<string, string>)) {
        const step = /^(?:key|paper) (\d+)$/.exec(recipe);
        if (!step) continue;
        const want = master[m][role] ?? master.extra[m][role];
        expect(
          m === "light" ? tint(key, paper, Number(step[1])) : tint(paper, key, Number(step[1])),
          `${m} ${role}`,
        ).toBe(want);
        n++;
      }
    expect(n).toBeGreaterThan(20);
  });

  test("success, warning and info are their state's glyph, error is the master's error ink", () => {
    for (const m of MODES) {
      for (const s of Object.values(master.status.states) as {
        role: string;
        light: { glyph: string };
        dark: { glyph: string };
      }[])
        if (["success", "warning", "info"].includes(s.role))
          expect(hexIn(emitted[m][s.role]!), `${m} ${s.role}`).toBe(s[m].glyph);
      expect(hexIn(emitted[m].error!)).toBe(master.extra[m].error);
    }
  });

  test("each light rake is the soft shadow alone, in the light ink at the rake alpha", () => {
    const ink = scale.shadowInk.light;
    for (const e of ELEVATIONS) {
      const rake = emitted.light[`elevation-${e}-rake`]!;
      expect(rake).toBe(`${master.shadow[e]} ${oklchCss(ink.ink, ink.rake)}`);
      expect(rake.match(/oklch\(/g)!.length).toBe(1);
      expect(emitted.light[`elevation-${e}`]).toBe(
        `${rake}, ${master.shadow.contact[e]} ${oklchCss(ink.ink, ink.contact)}`,
      );
      expect(Object.keys(blockVars(css, ".dark"))).not.toContain(`elevation-${e}-rake`);
      expect(blockVars(css, ".dark")[`elevation-${e}`]).toEndWith("inset 0 0 0 1px var(--raised-edge)");
    }
  });
});

describe("scale.ts", () => {
  test("every entry carries from", () => {
    const missing: string[] = [];
    const walk = (value: unknown, at: string) => {
      if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${at}[${i}]`));
      if (value === null || typeof value !== "object") return;
      const o = value as Record<string, unknown>;
      if (["value", "size", "ink", "maxWidth", "weight"].some((k) => k in o) && typeof o.from !== "string")
        missing.push(at);
      for (const [k, v] of Object.entries(o)) walk(v, `${at}.${k}`);
    };
    for (const [name, value] of Object.entries(scale)) walk(value, name);
    expect(missing).toEqual([]);
  });

  test("the steps include P2's names", () => {
    const names = scale.steps.map((step) => step.name);
    for (const name of ["meta", "instrument", "ui", "read", "section", "page", "hero", "display"])
      expect(names).toContain(name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every tokens/master.json citation holds the value scale.ts gives", () => {
    const at = (from: string) => lookup(master, from.replace(/^tokens\/master\.json /, ""));
    for (const row of Object.values(scale.rows)) expect(at(row.from)).toBe(row.value);
    expect(`${at(scale.radius.from)}px`).toBe(scale.radius.value);
    expect(at(scale.codeRingOffset.from)).toBe(scale.codeRingOffset.value);
    for (const stack of Object.values(scale.stacks))
      expect(stack.value.startsWith(`"${at(stack.from)}",`), stack.from).toBe(true);
    for (const ink of Object.values(scale.shadowInk)) {
      const prose = at(ink.from) as string;
      expect(prose).toContain(ink.ink === "#000000" ? "black" : ink.ink);
      expect(prose).toContain(`${Math.round(ink.rake * 100)} percent alpha`);
      expect(prose).toContain(`contact shadow at ${Math.round(ink.contact * 100)}`);
    }
  });
});
