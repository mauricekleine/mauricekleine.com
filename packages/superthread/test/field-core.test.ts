import { expect, test } from "bun:test";
import { fieldScreen, paint as printField, prepare } from "../items/lib/field-core";
import catalogue from "./fixtures/fields/catalogue.json";
import { constellation, roi } from "./fixtures/fields/masks";

const masks = { constellation, roi };
function concept(id: string) {
  const entry = catalogue.find((sample) => sample.id === id)!;
  const [width, height] = entry.size;
  return prepare(entry.line, width, height, { mask: entry.mask ? masks[entry.mask as keyof typeof masks] : undefined });
}

const paint = (art: ReturnType<typeof prepare>, mode: "light" | "dark", time = 0) =>
  printField(art, mode, time, undefined, fieldScreen(art));

test("the cell-sized ink buffer remains valid for an existing caller", () => {
  const art = prepare("edge=crest ramp=held", 479, 255);
  const oldBuffer = new Uint8Array(art.w * art.h);
  expect(printField(art, "dark", 0, oldBuffer)).toBe(oldBuffer);
  expect(oldBuffer.includes(1)).toBe(true);
  expect(paint(art, "dark")).toHaveLength(479 * 255);
});

// Frame-zero fingerprints for three dot-screen concepts. It used the same index for dark solid and stock.
test.each([
  ["468-prs", "5283f030e8cdfc0c56a544c3cecfd19413a40103cbfd777d6ab670b16faef4f7"],
  ["roi", "c98b7cd99587fb8e27d1108ce8503c97be4018a8d7b5c5fce4b422ffc47d5d9a"],
  ["quanta", "4c204f8dfdcca3ebe8ad963b2ef8ee2623ae4463c0023dcb7fa796b31462fc83"],
])("%s keeps its deterministic dark still", (id, expected) => {
  const frame = paint(concept(id), "dark");
  const draftIndices = frame.map((ink) => (ink === 3 ? 0 : ink));
  expect(new Bun.CryptoHasher("sha256").update(draftIndices).digest("hex")).toBe(expected);
});

test("the paper solid meets the frame and one plum thread runs the full width", () => {
  const art = prepare("edge=crest base=.78 at=.5 lift=.33 width=.22 ramp=held", 480, 256);
  const frame = paint(art, "light");
  expect(frame.subarray(-art.width).every((ink) => ink === 3)).toBe(true);
  const firstPlum = frame.findIndex((ink, i) => ink === 2 && i % art.width === 0);
  expect(firstPlum).toBeGreaterThanOrEqual(0);
  const visited = new Set([firstPlum]);
  const connected = [firstPlum];
  for (const i of connected) {
    const x = i % art.width;
    const y = Math.floor(i / art.width);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (x + dx < 0 || x + dx >= art.width || y + dy < 0 || y + dy >= art.height) continue;
        const next = i + dy * art.width + dx;
        if (frame[next] !== 2 || visited.has(next)) continue;
        visited.add(next);
        connected.push(next);
      }
    }
  }
  expect(connected.some((i) => i % art.width === art.width - 1)).toBe(true);
});

test("dark stills print 468 separate points beyond the dot screen", () => {
  const art = concept("468-prs");
  const withoutPoints = { ...art, points: null };
  const screen = paint(withoutPoints, "dark");
  const dark = paint(art, "dark");
  expect(paint(art, "light")).toEqual(paint(withoutPoints, "light"));
  const points = dark.map((ink, i) => Number(ink === 1 && screen[i] !== 1));
  expect(points.reduce((sum, value) => sum + value, 0)).toBe(4 * 468);
  let count = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i] && (i % art.width === 0 || !points[i - 1]) && !points[i - art.width]) count++;
  }
  expect(count).toBe(468);
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

test("desktop and phone frames print within the warm-frame budget", () => {
  // Start with the live RGBA path. The still tests also exercise indexed output, which uses a different buffer type.
  const run = Bun.spawnSync([process.execPath, new URL("./fixtures/fields/timing.ts", import.meta.url).pathname], {
    cwd: new URL("..", import.meta.url).pathname,
  });
  if (!run.success) throw new Error(run.stderr.toString());
  const results = JSON.parse(run.stdout.toString()) as { width: number; height: number; dpr: number; median: number }[];
  expect(results).toHaveLength(2);
  for (const { width, height, dpr, median } of results) {
    console.log(`field ${width} × ${height} at ${dpr}x: warm paint median ${median.toFixed(1)} ms (31 samples)`);
    // Shared CI runners have a portable frame budget. The release check measures 8 ms on Soliton.
    expect(median).toBeLessThan(25);
  }
}, 15_000);
