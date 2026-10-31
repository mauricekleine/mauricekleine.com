import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";
import manifest from "../../../packages/superthread/marks/fleet.json" with { type: "json" };
import { pngSizes } from "../src/foundations/mark-downloads.ts";

const modes = ["light", "dark"] as const;
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = (n >>> 1) ^ (n & 1 ? 0xedb88320 : 0);
  return n >>> 0;
});
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255]!;
  return (crc ^ 0xffffffff) >>> 0;
}

// The marks' SVG language is integer horizontal runs, not general vector graphics. Refuse a new language rather
// than silently approximate it. Each cell has one opaque colour, except the four transparent corner notches.
function cellsFromSvg(svg: string): Buffer {
  const body =
    /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">(.*)<\/svg>\s*$/.exec(
      svg,
    )?.[1];
  if (!body) throw new Error("expected a crisp 16x16 master mark");
  const cells = Buffer.alloc(16 * 16 * 4);
  let consumed = "";
  for (const path of body.matchAll(/<path fill="(#[0-9a-f]{6})" d="([^"]+)"\/>/g)) {
    consumed += path[0];
    const colour = Buffer.from(path[1]!.slice(1) + "ff", "hex");
    let consumedRuns = "";
    for (const run of path[2]!.matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g)) {
      consumedRuns += run[0];
      const [x, y, width, back] = run.slice(1).map(Number) as [number, number, number, number];
      if (width < 1 || width !== back || x + width > 16 || y > 15) throw new Error("mark escapes the 16px grid");
      for (let dx = 0; dx < width; dx++) {
        const offset = (y * 16 + x + dx) * 4;
        if (cells[offset + 3]) throw new Error("overlapping mark pixels");
        cells.set(colour, offset);
      }
    }
    if (consumedRuns !== path[2]) throw new Error("mark needs integer horizontal pixel runs");
  }
  if (consumed !== body) throw new Error("unsupported SVG content");
  for (let i = 0; i < 256; i++) {
    if ([0, 15, 240, 255].includes(i) !== (cells[i * 4 + 3] === 0))
      throw new Error("mark needs four transparent corner notches and an opaque tile");
  }
  return cells;
}

function chunk(type: string, data: Buffer): Buffer {
  const bytes = Buffer.alloc(data.length + 12);
  bytes.writeUInt32BE(data.length);
  bytes.write(type, 4, "ascii");
  data.copy(bytes, 8);
  bytes.writeUInt32BE(crc32(bytes.subarray(4, -4)), bytes.length - 4);
  return bytes;
}

export function markPng(svg: string, size: number, source: string): Buffer {
  if (size < 16 || size > 1024 || size % 16 !== 0) throw new Error("size must be a whole upscale, 16 to 1024");
  const cells = cellsFromSvg(svg);
  const scale = size / 16;
  // PNG filter 0 on every row. Copy whole cells; no interpolation or partial alpha enters the image.
  const stride = size * 4 + 1;
  const scanlines = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const cell = (Math.floor(y / scale) * 16 + Math.floor(x / scale)) * 4;
      scanlines.set(cells.subarray(cell, cell + 4), y * stride + 1 + x * 4);
    }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("tEXt", Buffer.from(`Source\0${source}`, "latin1")),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

type File = { name: string; bytes: Buffer };
// PNGs already compress well. Stored ZIP entries avoid a dependency and a second compression pass. Fixed DOS
// timestamps (1980-01-01) make an archive of the same inputs byte-identical, regardless of the build machine.
function zip(files: File[]): Buffer {
  const entries: Buffer[] = [];
  const directory: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc32(file.bytes), 14);
    local.writeUInt32LE(file.bytes.length, 18);
    local.writeUInt32LE(file.bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(20, 4);
    local.copy(central, 6, 4, 28);
    central.writeUInt32LE(offset, 42);
    entries.push(local, name, file.bytes);
    directory.push(central, name);
    offset += local.length + name.length + file.bytes.length;
  }
  const index = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(index.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...entries, index, end]);
}

export function generateMarkDownloads(dir: string): void {
  // These paths belong to this generator; canonical SVGs and their provenance stay byte for byte intact.
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    rmSync(join(dir, entry.name, "png"), { recursive: true, force: true });
    rmSync(join(dir, entry.name, `${entry.name}.zip`), { force: true });
  }
  const files: Record<string, { source: string; sha256: string }> = {};
  const all: File[] = [];
  const write = (name: string, bytes: Buffer, source: string) => {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), bytes);
    files[name] = { source, sha256: createHash("sha256").update(bytes).digest("hex") };
  };
  for (const ship of manifest.fleet) {
    const entries: File[] = [];
    for (const mode of modes) {
      const name = `${ship.id}/${ship.mark[mode]}`;
      const bytes = readFileSync(join(dir, name));
      entries.push({ name, bytes });
      for (const size of pngSizes) {
        const output = `${ship.id}/png/${ship.id}-${mode}-${size}.png`;
        const source = `apps/superthread/public/marks/${name}; integer upscale via tools/mark-downloads.ts`;
        const png = markPng(bytes.toString("utf8"), size, source);
        write(output, png, source);
        entries.push({ name: output, bytes: png });
      }
    }
    write(`${ship.id}/${ship.id}.zip`, zip(entries), `${ship.id}: both SVGs and all PNG sizes`);
    all.push(...entries);
  }
  write("superthread-icons.zip", zip(all), "every current mark: both SVGs and all PNG sizes");
  writeFileSync(
    join(dir, "DOWNLOADS.json"),
    JSON.stringify({ generator: "apps/superthread/tools/mark-downloads.ts", files }, null, 2) + "\n",
  );
}
