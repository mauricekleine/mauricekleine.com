import { packedInks } from "../../../items/lib/dot-screen";
import { fieldScreen, INKS, paint, prepare } from "../../../items/lib/field-core";
import catalogue from "./catalogue.json";

const sky = catalogue.find(({ id }) => id === "amsterdam")!;
const inks = packedInks([undefined, INKS.dark[1], INKS.dark[2], undefined]);
const warmupFrames = 180;
const sampleFrames = 31;

const results = [
  { name: "desktop", size: sky.size, line: sky.line, dpr: 2 },
  { name: "phone", ...sky.phone!, dpr: 3 },
].map(({ name, size: [width, height], line, dpr }) => {
  const art = prepare(line, width, height);
  const raster = fieldScreen(art, dpr);
  const pixels = new Uint32Array(raster.width * raster.height);
  for (let frame = 0; frame < warmupFrames; frame++) paint(art, "dark", frame / 24, pixels, raster, inks);

  const samples = Array.from({ length: sampleFrames }, (_, index) => {
    const start = performance.now();
    paint(art, "dark", (index + warmupFrames) / 24, pixels, raster, inks);
    return performance.now() - start;
  }).sort((a, b) => a - b);

  return { name, width, height, dpr, median: samples[Math.floor(sampleFrames / 2)]! };
});
console.log(JSON.stringify(results));
