// The masthead search over the nav: an item's exact name finds its page, as its words do.
import { describe, expect, test } from "bun:test";
import { nav } from "./nav";
import { searchNav } from "./Search";

const hyphenated = nav.filter((entry) => entry.item?.includes("-"));

describe("searchNav", () => {
  test("the nav has hyphenated item names to search for", () => {
    expect(hyphenated.map((entry) => entry.item)).toEqual(
      expect.arrayContaining(["input-group", "fleet-rail", "use-mobile", "app-shell"]),
    );
  });

  test.each(hyphenated.map((entry) => [entry.item as string, entry.path]))(
    "%s finds its page first, typed with the hyphen or a space",
    (item, path) => {
      for (const query of [item, item.replaceAll("-", " ")]) {
        expect(searchNav(query)[0]?.path).toBe(path);
      }
    },
  );

  test("a query of separators alone finds nothing", () => {
    expect(searchNav(" - ")).toEqual([]);
  });
});
