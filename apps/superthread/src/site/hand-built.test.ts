// The site draws its shell and the mock pages' contents by hand, so the items' rules reach them only through these copies.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { flat, parse, value } from "../../../../packages/superthread/test/css.ts";
import { holdsHandBuiltRules } from "../../../../packages/superthread/test/hand-built.ts";

const styles = join(import.meta.dir, "../styles");
const file = (name: string) => join(styles, name);

holdsHandBuiltRules(readdirSync(styles).map(file));

describe("every target on a phone reaches 44 px", () => {
  const phone = (name: string, sel: string) => {
    const block = flat(parse(readFileSync(file(name), "utf8"))).find(
      (rule) => rule.sel === "@media (max-width: 600px)",
    );
    return block!.rules.find((rule) => rule.sel === sel)!;
  };

  test.each([
    ["the strip's cells, above its 1 px rule", "shell.css", ".st-strip", "height", "45px"],
    ["a nav link in the phone sheet", "shell.css", ".st-sidenav a", "height", "44px"],
    ["a line of the page's contents", "shell.css", ".st-toc a", "line-height", "44px"],
    ["the copy button", "shell.css", ".st-code button", "min-width", "44px"],
    ["a stacked checkbox row", "components-a.css", ".st-a-check", "min-height", "44px"],
    ["a mock page's contents link, around its 20 px line", "mock.css", ".mock-contents a", "padding-block", "11px"],
  ])("%s", (_, name, sel, prop, size) => expect(value(phone(name, sel), prop)).toBe(size));
});
