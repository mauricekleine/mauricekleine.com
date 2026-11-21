import { expect, test } from "bun:test";
import { prepareDots } from "../items/lib/dot-screen";
import { paintWeave, parseWeave, prepareWeave, weaveFray, type WeaveInks } from "../items/lib/weave-core";

const inks: WeaveInks = { solid: [1, 0, 0], screen: [2, 0, 0], thread: [3, 0, 0], dark: false };

test("every fray mirrors across odd and even breadths", () => {
  for (const shape of ["fray=.06", "fray=.06 bow=-4", "fray=.06 waves=2 amp=3", "fray=arch apex=.24 sides=.45"]) {
    for (const breadth of [57, 102]) {
      const edges = weaveFray(parseWeave(`${shape} wobble=2 period=24 seed=23`), 160, breadth);
      expect([...edges]).toEqual([...edges].reverse());
    }
  }
});

test("a dark weave screen stays below its 45 percent density cap over a wide patch", () => {
  const width = 320;
  const height = 192;
  const field = prepareWeave(parseWeave("ramp=held fray=.24 thread=0"), width / 2, height / 2);
  const rgba = paintWeave(field, { ...inks, dark: true }, new Uint8ClampedArray(width * height * 4), {
    raster: prepareDots(width / 2, height / 2, width, height, 1),
  });
  // Sample under the fixed light, past the hold and before the held ramp falls away.
  let lit = 0;
  for (let y = 64; y < 128; y++) {
    for (let x = 130; x < 210; x++) lit += Number(rgba[(y * width + x) * 4] === inks.screen[0]);
  }
  expect(lit / (64 * 80)).toBeGreaterThan(0.2);
  expect(lit / (64 * 80)).toBeLessThan(0.45);
});

test("the bet thread runs at the ramp break, 46 percent past the fray", () => {
  const width = 120;
  const height = 48;
  const field = prepareWeave(parseWeave("ramp=bet fray=.25 thread=1.5"), width / 2, height / 2);
  const rgba = paintWeave(field, inks, new Uint8ClampedArray(width * height * 4), {
    raster: prepareDots(width / 2, height / 2, width, height, 1),
  });
  // The fray is at 30, and 46% of the remaining 90 puts the seam at 71.4.
  for (let y = 0; y < height; y++) {
    const plum: number[] = [];
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4] === inks.thread[0]) plum.push(x);
    }
    expect(plum.filter((x) => x >= 69 && x <= 73)).toHaveLength(5);
    expect(plum.every((x) => x >= 59 && x <= 83)).toBe(true);
  }
});

test("reduced motion prints the specified still knot even when time advances", () => {
  const field = prepareWeave(parseWeave("run=down fray=arch knot=.36 knotr=8 live"), 120, 64);
  const render = (options?: Parameters<typeof paintWeave>[3]) =>
    paintWeave(field, inks, new Uint8ClampedArray(120 * 64 * 4), options);
  const still = render();
  expect(render({ time: 12, reducedMotion: true })).toEqual(still);
  expect(render({ time: 35, reducedMotion: true })).toEqual(still);
  expect(render({ time: 12 })).not.toEqual(render({ time: 35 }));
});
