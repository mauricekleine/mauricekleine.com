import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// www and the share Worker import this frozen theme directly.
test("the v1 CSS stays byte-identical", async () => {
  const css = await readFile(new URL("../dist/superthread.css", import.meta.url));
  expect(createHash("sha256").update(css).digest("hex")).toBe(
    "f2ad0b4b6a63477cd53d96bdde326826299c33ad956ef5866aecc77f11c6f8fd",
  );
});
