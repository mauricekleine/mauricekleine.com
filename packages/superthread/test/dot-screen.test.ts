import { expect, test } from "bun:test";
import { DOT_ANGLES, dotThresholds } from "../items/lib/dot-screen";

test.each([1, 1.25, 1.5, 2, 3])("both ink screens print tone as area at %fx", (dpr) => {
  const size = Math.round(192 * dpr);
  for (const angle of Object.values(DOT_ANGLES)) {
    const screen = dotThresholds(size, size, dpr, angle);
    for (const tone of [0, 0.1, 0.25, 0.5, 0.7, 0.9, 1]) {
      let ink = 0;
      for (const threshold of screen) ink += Number(tone * 256 > threshold + 0.5);
      expect(Math.abs(ink / screen.length - tone)).toBeLessThan(0.07);
    }
  }
});

test.each([
  ["key", 45],
  ["plum", 15],
] as const)("%s dots repeat every 4 CSS px on their own rotated grid", (ink, angle) => {
  const dpr = 16;
  const size = 320;
  const screen = dotThresholds(size, size, dpr, DOT_ANGLES[ink]);
  const radians = (angle * Math.PI) / 180;
  const xStep = Math.round(4 * dpr * Math.cos(radians));
  const yStep = Math.round(4 * dpr * Math.sin(radians));
  const on = (x: number, y: number) => screen[y * size + x]! < 64;
  const mismatch = (dx: number, dy: number) => {
    let different = 0;
    for (let y = 64; y < 256; y++) {
      for (let x = 64; x < 256; x++) different += Number(on(x, y) !== on(x + dx, y + dy));
    }
    return different / 192 ** 2;
  };
  expect(mismatch(xStep, yStep)).toBeLessThan(0.025);
  expect(mismatch(-yStep, xStep)).toBeLessThan(0.025);
  expect(mismatch(Math.round(xStep / 2), Math.round(yStep / 2))).toBeGreaterThan(0.4);
});
