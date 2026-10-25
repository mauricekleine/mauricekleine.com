// shadcn's API, kept: every item 2.0 adds exports what its base-nova item exports, keeps every data-slot it sets, and
// marks its root with data-mk. Apps move onto @mk with no call-site edits, so a dropped export or slot is a break.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { catalog } from "../items/catalog.ts";
import { exportsIn, slotsIn, source } from "./rendered.tsx";

const root = join(import.meta.dir, "..");
const upstream = (name: string) =>
  (
    JSON.parse(readFileSync(join(root, "upstream/base-nova", `${name}.json`), "utf8")) as {
      files: { content: string }[];
    }
  ).files[0]!.content;

// the brand items 2.0 adds, each seeded from its base-nova namesake
export const ADDED = [
  "accordion",
  "alert-dialog",
  "breadcrumb",
  "button-group",
  "combobox",
  "command",
  "dropdown-menu",
  "field",
  "kbd",
  "native-select",
  "radio-group",
  "resizable",
  "slider",
  "sonner",
  "switch",
  "toggle",
  "toggle-group",
] as const;

describe("the items 2.0 adds keep shadcn's API", () => {
  test("each is a brand item in the catalog, seeded from its namesake", () => {
    for (const name of ADDED) {
      const item = catalog.find((entry) => entry.name === name);
      expect(item?.tier, name).toBe("brand");
      expect(item?.upstream, name).toBe(name);
    }
  });

  for (const name of ADDED) {
    test(`${name}: every upstream export and data-slot stays, and the root carries data-mk="${name}"`, () => {
      const ours = source(name);
      expect(exportsIn(ours)).toEqual(expect.arrayContaining(exportsIn(upstream(name))));
      expect(slotsIn(ours)).toEqual(expect.arrayContaining(slotsIn(upstream(name))));
      expect(ours).toContain(`data-mk="${name}"`);
    });
  }
});
