// www draws its nav, foot and link lists by hand, so the items' rules reach them only through these copies.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { flat, parse, value } from "../../../packages/superthread/test/css.ts";
import { holdsHandBuiltRules } from "../../../packages/superthread/test/hand-built.ts";

const site = join(import.meta.dir, "styles/site.css");

holdsHandBuiltRules([site]);

describe("every target on a phone reaches 44 px", () => {
  const phone = flat(parse(readFileSync(site, "utf8"))).find((rule) => rule.sel === "@media (max-width: 600px)")!;

  test.each([".mk-nav a", ".mk-foot a", ".more-link a", ".waypoint-name", ".essay-list li > a:not(.essay-cover)"])(
    "%s keeps its box and takes the hit area",
    (link) => {
      const rule = phone.rules.find(({ sel }) => sel.split(", ").includes(link));
      expect(rule?.decls).toEqual(
        expect.arrayContaining([
          ["position", "relative"],
          ["@apply hit-area", ""],
        ]),
      );
    },
  );

  test("a link cell grows", () => {
    expect(
      value(
        phone.rules.find(({ sel }) => sel === ".icons a")!,
        "height",
      ),
    ).toBe("44px");
  });
});
