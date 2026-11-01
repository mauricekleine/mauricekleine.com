// What a surface drawn by hand owes the items it sits beside. www and the site print these rules in their own CSS, where
// no item test reaches them, so each app runs them over its stylesheets. The pixels are the browser proof's.
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { flat, parse, value } from "./css.ts";

const INK = ["color", "border-color", "background", "background-color"];

export function holdsHandBuiltRules(files: string[]) {
  const rules = files.flatMap((file) => flat(parse(readFileSync(file, "utf8"))));

  test("a current item prints the selected role, so plum stays out of state", () => {
    const current = rules.filter(({ sel }) => sel.includes("[aria-current") && !sel.includes(":not("));
    expect(current.length).toBeGreaterThan(0);
    for (const { sel, decls } of current)
      for (const [prop, ink] of decls.filter(([prop]) => INK.includes(prop)))
        expect({ sel, prop, ink }).toEqual({ sel, prop, ink: "var(--selected)" });
  });

  test("a nav item has a box, so it hovers with its fill and no underline", () => {
    const hovers = rules.filter(({ sel }) => /(nav|contents) a\S*:hover$/.test(sel));
    expect(hovers.length).toBeGreaterThan(0);
    for (const rule of hovers) {
      expect(value(rule, "background")).toBe("var(--control-hover)");
      expect(value(rule, "text-decoration")).toBeUndefined();
      expect(value(rule, "text-decoration-line")).toBeUndefined();
    }
  });

  test("a title in the display face prints in the first ink", () => {
    const display = /var\(--font-display\)/;
    const titles = rules.filter(
      (rule) => display.test(value(rule, "font") ?? "") || display.test(value(rule, "font-family") ?? ""),
    );
    expect(titles.length).toBeGreaterThan(0);
    for (const rule of titles)
      expect({ sel: rule.sel, ink: value(rule, "color") }).toEqual({ sel: rule.sel, ink: "var(--first)" });
  });
}
