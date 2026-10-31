import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import manifest from "../../../../packages/superthread/marks/fleet.json";
import { markPng } from "../../tools/mark-downloads";

// Read the PNG wire format independently of the encoder: dimensions, colour type and unfiltered RGBA scanlines.
function decode(bytes: Buffer) {
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  expect([...bytes.subarray(24, 29)]).toEqual([8, 6, 0, 0, 0]);
  const data: Buffer[] = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.toString("ascii", offset + 4, offset + 8) === "IDAT")
      data.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const rows = inflateSync(Buffer.concat(data));
  expect(rows.length).toBe(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) expect(rows[y * (width * 4 + 1)]).toBe(0);
  return {
    width,
    height,
    pixel: (x: number, y: number) =>
      rows.subarray(y * (width * 4 + 1) + 1 + x * 4, y * (width * 4 + 1) + 5 + x * 4).toString("hex"),
  };
}

test("each PNG size copies whole cells, including the dither and all four transparent notches", () => {
  const svg = readFileSync(join(import.meta.dir, "../../public/marks/telemetry/telemetry.svg"), "utf8");
  for (const size of [16, 32, 48, 64, 128, 256, 512, 1024]) {
    const image = decode(markPng(svg, size, "telemetry.svg"));
    expect([image.width, image.height]).toEqual([size, size]);
    const scale = size / 16;
    // Hand-read cells from the SVG: outside corners, the key tile, and a spot/paper checker pair in the tall bar.
    for (const [x, y, colour] of [
      [0, 0, "00000000"],
      [15, 0, "00000000"],
      [0, 15, "00000000"],
      [15, 15, "00000000"],
      [1, 0, "16181dff"],
      [13, 4, "14b8a6ff"],
      [14, 4, "ffffffff"],
      [14, 5, "14b8a6ff"],
    ] as const) {
      const block = new Set<string>();
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) block.add(image.pixel(x * scale + dx, y * scale + dy));
      expect([...block]).toEqual([colour]);
    }
  }
});

test("every current SVG rasterises with exactly its three original colours and binary alpha, in both chromes", () => {
  for (const ship of manifest.fleet) {
    for (const mode of ["light", "dark"] as const) {
      const svg = readFileSync(join(import.meta.dir, "../../public/marks", ship.id, ship.mark[mode]), "utf8");
      const image = decode(markPng(svg, 16, ship.mark[mode]));
      const colours = new Set<string>();
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) colours.add(image.pixel(x, y));
      expect([...colours].sort()).toEqual(["00000000", "16181dff", "ffffffff", `${ship.spot[mode].slice(1)}ff`].sort());
      expect(image.pixel(1, 0)).toBe(mode === "light" ? "16181dff" : "ffffffff");
    }
  }
});

test("unsupported SVG geometry and fractional upscales fail instead of making softened or incomplete marks", () => {
  const svg = readFileSync(join(import.meta.dir, "../../public/marks/telemetry/telemetry.svg"), "utf8");
  expect(() => markPng(svg, 24, "telemetry.svg")).toThrow("whole upscale");
  expect(() => markPng(svg.replace("M1 0h14", "M1.5 0h14"), 16, "telemetry.svg")).toThrow("integer horizontal");
});
