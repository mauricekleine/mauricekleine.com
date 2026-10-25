import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fleet } from "@/components/superthread/lib/fleet";
import { contrast, inkOn, luminance, ratio } from "./colour";
import { markFile, type MarkId } from "./marks";
import { hexOf, modes, recipes } from "./master";

describe("colour arithmetic", () => {
  test("contrast runs from 1 for one ink to 21 for black on white, in either order", () => {
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21, 10);
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 10);
    expect(contrast("#aa337a", "#aa337a")).toBe(1);
  });

  test("a ratio prints at two decimals, as the house ink page shows plum on stock", () => {
    expect(ratio("#aa337a", "#ffffff")).toBe("6.06");
  });

  test("an alpha pair after the hex leaves the luminance alone", () => {
    expect(luminance("#aa337a80")).toBe(luminance("#aa337a"));
  });

  test("a wedge label takes whichever ink reads better on its step", () => {
    expect(inkOn("#16181d", "#ffffff", "#16181d")).toBe("#ffffff");
    expect(inkOn("#f1f1f1", "#ffffff", "#16181d")).toBe("#16181d");
  });
});

describe("the roles table", () => {
  test("every role the master recipe names has a hex in the tokens, in both modes", () => {
    const missing = modes.flatMap((mode) =>
      Object.keys(recipes[mode])
        .filter((role) => role !== "raised-edge" || mode === "dark")
        .filter((role) => !/^#[0-9a-f]{6}$/.test(hexOf(mode, role)))
        .map((role) => `${mode} ${role}`),
    );
    expect(missing).toEqual([]);
  });
});

describe("the served marks", () => {
  const dir = join(import.meta.dir, "../../public/marks");
  const record = JSON.parse(readFileSync(join(dir, "PROVENANCE.json"), "utf8")) as {
    files: Record<string, { sha256: string }>;
  };
  const ids: MarkId[] = ["superthread", ...fleet.map((ship) => ship.id)];

  test("each mark has a light and a dark file, byte for byte the source its provenance records", () => {
    const paths = ids.flatMap((id) => modes.map((mode) => `${id}/${markFile(id, mode)}`));
    expect(Object.keys(record.files).sort()).toEqual([...paths].sort());
    for (const path of paths) {
      const sha = createHash("sha256")
        .update(readFileSync(join(dir, path)))
        .digest("hex");
      expect(sha, path).toBe(record.files[path]?.sha256);
    }
  });
});
