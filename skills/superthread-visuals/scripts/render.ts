// bun scripts/render.ts '<spec>' <light|dark> <width> <height> <seconds> <output.png> [mask-module [export-name]] [--dpr <ratio>]
import { deflateSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fieldScreen, INKS, paint, prepare } from "./field.js";

type Mode = "light" | "dark";
const crcTable = Uint32Array.from({ length: 256 }, (_, byte) => {
  for (let i = 0; i < 8; i++) byte = (byte >>> 1) ^ ((byte & 1) ? 0xedb88320 : 0);
  return byte;
});

function chunk(type: string, data: Uint8Array) {
  const out = Buffer.allocUnsafe(12 + data.length);
  out.writeUInt32BE(data.length);
  out.write(type, 4, "ascii");
  out.set(data, 8);
  let crc = 0xffffffff;
  for (let i = 4; i < out.length - 4; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ out[i]) & 255];
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, out.length - 4);
  return out;
}

export type Art = ReturnType<typeof prepare>;
export type Mask = (width: number, height: number) => Uint8Array;

export async function loadMask(modulePath?: string, exportName = "default"): Promise<Mask | undefined> {
  if (!modulePath) return undefined;
  const mask = (await import(pathToFileURL(resolve(modulePath)).href))[exportName];
  if (typeof mask !== "function") throw new Error("no mask function named " + exportName + " in " + modulePath);
  return mask;
}
export function rgbFrame(art: Art, mode: Mode, time: number, screen: ReturnType<typeof fieldScreen>, pixels: Uint8Array) {
  const frame = paint(art, mode, time, pixels, screen);
  const palette = INKS[mode];
  const output = Buffer.allocUnsafe(frame.length * 3);
  for (let i = 0; i < frame.length; i++) {
    const [r, g, b] = palette[frame[i]];
    output[3 * i] = r;
    output[3 * i + 1] = g;
    output[3 * i + 2] = b;
  }
  return output;
}

export function renderArgs(input: string[]) {
  const option = input.indexOf("--dpr");
  const args = [...input];
  const dpr = option < 0 ? 1 : Number(args.splice(option, 2)[1]);
  if (!Number.isFinite(dpr) || dpr <= 0) throw new Error("expected a positive DPR");
  return { args, dpr };
}

export function encodePng(art: Art, mode: Mode, time: number, dpr = 1) {
  const screen = fieldScreen(art, dpr);
  const { width, height } = screen;
  const indices = paint(art, mode, time, undefined, screen);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 2;
  header[9] = 3;
  const palette = chunk("PLTE", Uint8Array.from(INKS[mode].flat()));
  const stride = 1 + Math.ceil(width / 4);
  const scan = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const ink = indices[row + x];
      scan[y * stride + 1 + (x >> 2)] |= ink << (2 * (3 - (x & 3)));
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), palette,
    chunk("IDAT", deflateSync(scan)), chunk("IEND", new Uint8Array()),
  ]);
}

if (import.meta.main) {
  const { args, dpr } = renderArgs(process.argv.slice(2));
  const [line, mode, width, height, seconds, path, maskModule, maskExport] = args;
  if (!line || (mode !== "light" && mode !== "dark") || !path || !seconds || !Number.isFinite(Number(seconds))) {
    throw new Error("usage: bun scripts/render.ts '<spec>' <light|dark> <width> <height> <seconds> <output.png> [mask-module [export-name]] [--dpr <ratio>]");
  }
  const art = prepare(line, Number(width), Number(height), { mask: await loadMask(maskModule, maskExport) });
  await writeFile(path, encodePng(art, mode, Number(seconds), dpr));
}
