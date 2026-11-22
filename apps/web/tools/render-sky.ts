// Run from apps/web. ImageMagick encodes the plates and composes the social card.
import { join } from "node:path";
import { prepareDots, printDots, screenTones } from "../../../packages/superthread/items/lib/dot-screen";
import { prepareSky } from "../src/sky-field";

function convert(args: string[], stdin?: Uint8Array) {
  const result = Bun.spawnSync(["convert", ...args], { stdin, stdout: "pipe", stderr: "inherit" });
  if (!result.success) throw new Error(`ImageMagick failed: ${args.join(" ")}`);
  return result.stdout;
}

const firstInk = [231, 231, 231] as const;
const plumInk = [192, 116, 161] as const;

function sky(width: number, height: number, dpr: number, phone: boolean, solid: readonly [number, number, number]) {
  const pixels = new Uint32Array(width * height);
  const frame = prepareSky(width, height, dpr, phone, pixels);
  frame.setInks(firstInk, plumInk, [255, 255, 255], solid);
  frame.draw(0, false);
  return new Uint8Array(pixels.buffer);
}

const lightStock = [255, 255, 255] as const;
const darkStock = [22, 24, 29] as const;
const publicDir = join(import.meta.dir, "../public");
for (const [name, width, height, phone] of [
  ["home-desktop", 1440, 324, false],
  ["home-phone", 390, 203, true],
  ["slim-desktop", 1440, 120, false],
  ["slim-phone", 390, 96, true],
] as const) {
  const w = width * 2,
    h = height * 2;
  for (const [suffix, stock] of [
    ["", lightStock],
    ["-dark", darkStock],
  ] as const) {
    convert(
      ["-size", `${w}x${h}`, "-depth", "8", "rgba:-", "-strip", `PNG8:${publicDir}/sky/plate-${name}${suffix}.png`],
      sky(w, h, 2, phone, stock),
    );
  }
}

const portraitInks = [
  [0, 0, 0, 0],
  [...firstInk, 255],
  [...plumInk, 255],
];
for (const size of [136, 196]) {
  const rgb = convert([join(publicDir, "maurice.png"), "-resize", `${size}x${size}`, "-depth", "8", "rgb:-"]);
  const tones = screenTones(size, size);
  for (let i = 0; i < size * size; i++) {
    const r = rgb[3 * i],
      g = rgb[3 * i + 1],
      b = rgb[3 * i + 2];
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // Deepen the shadows and let plum print in warm midtones.
    const tone = Math.max(0, Math.min(1, (luma - 0.12) / 0.8));
    const warmth = Math.max(0, Math.min(1, (r - b) / 72));
    tones.set([256 * tone ** 2, 72 * warmth * 4 * tone * (1 - tone), 1, 1], 4 * i);
  }
  for (const dpr of [1, 2, 3]) {
    const side = size * dpr;
    const pixels = new Uint8Array(side * side);
    printDots(prepareDots(size, size, side, side, dpr), tones, pixels, [0, 1, 2, 0]);
    const rgba = new Uint8Array(pixels.length * 4);
    for (let i = 0; i < pixels.length; i++) rgba.set(portraitInks[pixels[i]], 4 * i);

    convert(
      [
        "-size",
        `${side}x${side}`,
        "-depth",
        "8",
        "rgba:-",
        "-strip",
        `PNG8:${publicDir}/portrait/maurice-${size}-${dpr}x.png`,
      ],
      rgba,
    );
  }
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
    "(",
    join(publicDir, "portrait/maurice-196-1x.png"),
    "-background",
    "#16181d",
    "-alpha",
    "remove",
    "-crop",
    "196x176+0+0",
    "+repage",
    ")",
    "-geometry",
    "+956+404",
    "-composite",
    "-strip",
    "PNG24:-",
  ],
  sky(1200, 230, 1, false, lightStock),
);
await Bun.write(card, image);
