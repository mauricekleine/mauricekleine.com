// Run from apps/web. ImageMagick encodes the fallback plates and composes the social card.
import { join } from "node:path";
import { prepareSky } from "../src/sky-field";

function convert(args: string[], stdin?: Uint8Array) {
  const result = Bun.spawnSync(["convert", ...args], { stdin, stdout: "pipe", stderr: "inherit" });
  if (!result.success) throw new Error(`ImageMagick failed: ${args.join(" ")}`);
  return result.stdout;
}

function sky(width: number, height: number, dpr: number, phone: boolean) {
  const pixels = new Uint32Array(width * height);
  const frame = prepareSky(width, height, dpr, phone, pixels);
  frame.setInks([231, 231, 231], [192, 116, 161], [255, 255, 255]);
  frame.draw(0, false);
  return new Uint8Array(pixels.buffer);
}

const publicDir = join(import.meta.dir, "../public");
for (const [name, width, height, phone] of [
  ["home-desktop", 1440, 324, false],
  ["home-phone", 390, 203, true],
  ["slim-desktop", 1440, 120, false],
  ["slim-phone", 390, 96, true],
] as const) {
  const w = width * 2,
    h = height * 2;
  convert(
    ["-size", `${w}x${h}`, "-depth", "8", "rgba:-", "-strip", `PNG8:${publicDir}/sky/plate-${name}.png`],
    sky(w, h, 2, phone),
  );
}

// The title and lede above the band are the typography of the existing card.
const card = join(publicDir, "og.png");
const image = convert(
  [
    "-size",
    "1200x230",
    "-depth",
    "8",
    "rgba:-",
    "-background",
    "#16181d",
    "-alpha",
    "remove",
    "(",
    card,
    "-crop",
    "1200x400+0+0",
    "+repage",
    ")",
    "+swap",
    "-append",
    join(publicDir, "portrait/maurice-196-dark.png"),
    "-geometry",
    "+956+418",
    "-composite",
    "-strip",
    "PNG24:-",
  ],
  sky(1200, 230, 1, false),
);
await Bun.write(card, image);
