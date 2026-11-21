import { expect, test } from "bun:test";
import { paint, prepare } from "../items/lib/field-core";
import catalogue from "./fixtures/fields/catalogue.json";
import { constellation, roi } from "./fixtures/fields/masks";

const masks = { constellation, roi };
function concept(id: string) {
  const entry = catalogue.find((sample) => sample.id === id)!;
  const [width, height] = entry.size;
  return prepare(entry.line, width, height, { mask: entry.mask ? masks[entry.mask as keyof typeof masks] : undefined });
}

// Frame-zero fingerprints from the approved renderer. It used the same index for dark solid and stock.
test.each([
  ["468-prs", "4d1aacaab7528cdbd6cc2da200c37de4cb9ddfb36c631c5eb0df013b47563d2c"],
  ["roi", "1d0e0caa7c5432a58195de7a151e699c30f6f65440b7207ba15b718b130a9cca"],
  ["quanta", "611c5d5b0a7227e18fadd4de8c27282413bf968105c41a95d3194f11b0f4b61f"],
])("%s keeps its approved dark still", (id, expected) => {
  const frame = paint(concept(id), "dark");
  const draftIndices = frame.map((ink) => (ink === 3 ? 0 : ink));
  expect(new Bun.CryptoHasher("sha256").update(draftIndices).digest("hex")).toBe(expected);
});

test("the paper solid meets the frame and one plum thread runs the full width", () => {
  const art = prepare("edge=crest base=.78 at=.5 lift=.33 width=.22 ramp=held", 480, 256);
  const frame = paint(art, "light");
  expect(frame.subarray(-art.w).every((ink) => ink === 3)).toBe(true);
  const firstPlum = frame.findIndex((ink, i) => ink === 2 && i % art.w === 0);
  expect(firstPlum).toBeGreaterThanOrEqual(0);
  const visited = new Set([firstPlum]);
  const connected = [firstPlum];
  for (const i of connected) {
    const x = i % art.w;
    const y = Math.floor(i / art.w);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (x + dx < 0 || x + dx >= art.w || y + dy < 0 || y + dy >= art.h) continue;
        const next = i + dy * art.w + dx;
        if (frame[next] !== 2 || visited.has(next)) continue;
        visited.add(next);
        connected.push(next);
      }
    }
  }
  expect(connected.some((i) => i % art.w === art.w - 1)).toBe(true);
  expect(connected.length / frame.reduce((count, ink) => count + Number(ink === 2), 0)).toBeGreaterThan(0.95);
});

test("the dark screen stays under 55% per Bayer tile and prints 468 separate points beyond it", () => {
  const art = concept("468-prs");
  const withoutPoints = { ...art, points: null };
  const screen = paint(withoutPoints, "dark");
  const dark = paint(art, "dark");
  expect(paint(art, "light")).toEqual(paint(withoutPoints, "light"));
  let points = 0;
  for (let y = 0; y < art.h; y += 4) {
    for (let x = 0; x < art.w; x += 4) {
      let inks = 0;
      for (let dy = 0; dy < 4 && y + dy < art.h; dy++) {
        for (let dx = 0; dx < 4 && x + dx < art.w; dx++) {
          const i = (y + dy) * art.w + x + dx;
          if (screen[i] === 1) inks++;
          if (dark[i] === 1 && screen[i] === 0) points++;
        }
      }
      expect(inks).toBeLessThanOrEqual(Math.floor(16 * 0.55));
    }
  }
  expect(points).toBe(468);
});

test("rejects a floating solid and enclosed stock in smooth unions and masks", () => {
  expect(() => prepare("edge=ellipse rx=.15 ry=.2", 480, 256)).toThrow("the solid must meet the frame");
  const union = "edge=ellipse+crest base=.56 rx=.35 ry=.22 b.base=.69 b.at=.5 b.lift=-.2 b.width=.12 threadon=ring";
  expect(() => prepare(union, 480, 256)).toThrow("the solid encloses stock");
  expect(() =>
    prepare("edge=mask knot=.3", 80, 80, {
      mask: (w, h) =>
        Uint8Array.from({ length: w * h }, (_, i) => {
          const x = i % w;
          const y = Math.floor(i / w);
          return Number(y >= 16 && !(x >= 18 && x < 24 && y >= 22 && y < 28));
        }),
    }),
  ).toThrow("the solid encloses stock");
});

test("the 468 prs join still prints when rasterized to a narrow host", () => {
  const line = catalogue.find(({ id }) => id === "468-prs")!.line;
  const frame = paint(prepare(line, 322, 170), "light");
  expect(frame.includes(3)).toBe(true);
  expect(frame.includes(2)).toBe(true);
});

test("rest takes the quarter frame of the same loop and a ring accepts travel in turns", () => {
  const line = catalogue.find(({ id }) => id === "orbit")!.line;
  const circling = prepare(line, 480, 256);
  const swinging = prepare(line + " travel=.125", 480, 256);
  const atQuarter = prepare(line + " travel=.125 rest=.25", 480, 256);
  expect(paint(atQuarter, "dark")).toEqual(paint(swinging, "dark", swinging.spec.duration / 4));
  expect(paint(atQuarter, "dark")).not.toEqual(paint(circling, "dark", circling.spec.duration / 4));
  const staticKnot = prepare(line.replace("knot=.85", "knot=.975").replace("motion=knot", "motion=still"), 480, 256);
  expect(paint(atQuarter, "dark")).toEqual(paint(staticKnot, "dark"));
});

test("prepares and paints a 1200 × 630 still in under 100 ms on a warm renderer", () => {
  concept("roi");
  const times = Array.from({ length: 7 }, () => {
    const start = performance.now();
    const frame = paint(concept("roi"), "light");
    expect(frame.length).toBe(600 * 315);
    return performance.now() - start;
  }).sort((a, b) => a - b);
  const median = times[3];
  console.log(`field 1200 × 630 ROI prepare + paint median ${median.toFixed(1)} ms (7 samples)`);
  expect(median).toBeLessThan(100);
});
