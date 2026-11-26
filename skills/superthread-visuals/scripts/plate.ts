// Standalone 3.5 px two-ink proof halftone plate renderer (PNG stills and MP4 light-breath loops).
// Matches packages/superthread/items/lib/plate-core.ts exactly, using Bun and ffmpeg with no npm dependencies.
//
// Usage:
//   bun scripts/plate.ts --spec "planes ratios=42,24,18,16 seed=7" --mode light --width 1200 --height 630 --out plate.png
//   bun scripts/plate.ts --src photo.png --mode dark --width 1200 --height 630 --dpr 2 --out photo-dark.png
//   bun scripts/plate.ts --spec "grid cols=6 rows=4 seed=19" --mode light --width 1200 --height 630 --duration 8 --fps 24 --out loop.mp4

import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { deflateSync } from "node:zlib";

export type BreathStrength = "off" | "gentle" | "balanced" | "vivid";
export type PlateKind = "planes" | "grid";
export type Mode = "light" | "dark";

export type PlateSpec = {
  kind: PlateKind;
  ratios: number[];
  cols: number;
  rows: number;
  seed: number;
  flip: boolean;
  shelf: number;
  breath: BreathStrength;
  pitch: number;
};

type RGB = readonly [number, number, number];
export type PlateInks = {
  dark: boolean;
  stock: RGB;
  ink: RGB;
  plum: RGB;
};

const TAU = Math.PI * 2;
export const PLATE_PITCH = 3.5;
export const PLATE_ANGLES = { key: 45, plum: 15 } as const;

export const BREATH: Record<BreathStrength, { lum: number; plum: number; sec: number }> = {
  off: { lum: 0, plum: 0, sec: 12 },
  gentle: { lum: 0.14, plum: 0.2, sec: 11 },
  balanced: { lum: 0.22, plum: 0.34, sec: 9.5 },
  vivid: { lum: 0.32, plum: 0.48, sec: 8 },
};

export const MODE_INKS: Record<Mode, PlateInks> = {
  light: {
    dark: false,
    stock: [255, 255, 255],
    ink: [22, 24, 29],
    plum: [170, 51, 122],
  },
  dark: {
    dark: true,
    stock: [22, 24, 29],
    ink: [231, 231, 231],
    plum: [192, 116, 161],
  },
};

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function hash(index: number, seed: number) {
  let h = (index * 374761393 + seed * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function parsePlate(line: string): PlateSpec {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  let kind: PlateKind = "planes";
  const pairs = new Map<string, string | undefined>();
  for (const token of tokens) {
    if (token === "planes" || token === "grid") {
      kind = token;
      continue;
    }
    const eq = token.indexOf("=");
    if (eq === -1) pairs.set(token, undefined);
    else pairs.set(token.slice(0, eq), token.slice(eq + 1));
  }

  const num = (key: string, fallback: number, min: number, max: number) => {
    const raw = pairs.get(key);
    const parsed = raw !== undefined ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  };

  const ratiosRaw = pairs.get("ratios");
  let ratios = [42, 24, 18, 16];
  if (ratiosRaw) {
    const parsed = ratiosRaw
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
    if (parsed.length >= 2) ratios = parsed;
  }

  const rawBreath = pairs.get("breath");
  const breath: BreathStrength =
    rawBreath === "off" || rawBreath === "gentle" || rawBreath === "balanced" || rawBreath === "vivid"
      ? rawBreath
      : pairs.has("still")
        ? "off"
        : "vivid";

  return {
    kind,
    ratios,
    cols: Math.round(num("cols", 6, 2, 16)),
    rows: Math.round(num("rows", 4, 2, 12)),
    seed: Math.round(num("seed", 1, 0, 2147483647)),
    flip: pairs.has("flip"),
    shelf: num("shelf", 0.56, 0, 0.9),
    breath,
    pitch: num("pitch", PLATE_PITCH, 2, 8),
  };
}

/** Precompute cosine halftone dot thresholds for one screen angle. */
export function buildPlateGrid(w: number, h: number, dpr: number, angleDeg: number, pitchCss = PLATE_PITCH) {
  const a = (angleDeg * Math.PI) / 180;
  const freq = TAU / (pitchCss * dpr);
  const cosA = Math.cos(a) * freq;
  const sinA = Math.sin(a) * freq;
  const grid = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    const ySin = y * sinA;
    const yCos = y * cosA;
    for (let x = 0; x < w; x++) {
      grid[row + x] = 0.5 - 0.25 * (Math.cos(x * cosA - ySin) + Math.cos(x * sinA + yCos));
    }
  }
  return grid;
}

/** Rasterize the exact blocky no-photo tonal composition from plate-core.ts (planes or grid). */
export function sampleGeometry(spec: PlateSpec, w: number, h: number): { lumMap: Float32Array; satMap: Float32Array } {
  const count = w * h;
  const rBuf = new Float32Array(count);
  const gBuf = new Float32Array(count);
  const bBuf = new Float32Array(count);

  if (spec.kind === "grid") {
    const base = 0xf2 / 255;
    rBuf.fill(base);
    gBuf.fill(base);
    bBuf.fill(base);
    const cw = w / spec.cols;
    const ch = h / spec.rows;
    const gradDenom = cw * cw + ch * ch || 1;
    for (let r = 0; r < spec.rows; r++) {
      for (let c = 0; c < spec.cols; c++) {
        const colIndex = spec.flip ? spec.cols - 1 - c : c;
        const idx = r * spec.cols + colIndex;
        const diag = (colIndex / Math.max(1, spec.cols - 1) + r / Math.max(1, spec.rows - 1)) * 0.5;
        const jitter = (hash(idx + 3, spec.seed) - 0.5) * 0.44;
        const tone = clamp(0.92 - diag * 0.72 + jitter, 0.08, 0.97);
        const v = Math.round(tone * 255) / 255;
        const v2 = Math.max(18, Math.round(tone * 255) - 34) / 255;

        const rx0 = c * cw;
        const ry0 = r * ch;
        const rw = Math.max(1, cw - 1);
        const rh = Math.max(1, ch - 1);
        const xStart = Math.max(0, Math.floor(rx0));
        const xEnd = Math.min(w, Math.ceil(rx0 + rw));
        const yStart = Math.max(0, Math.floor(ry0));
        const yEnd = Math.min(h, Math.ceil(ry0 + rh));

        for (let py = yStart; py < yEnd; py++) {
          const row = py * w;
          const dy = py + 0.5 - ry0;
          for (let px = xStart; px < xEnd; px++) {
            const dx = px + 0.5 - rx0;
            const t = clamp((dx * cw + dy * ch) / gradDenom, 0, 1);
            const val = v + (v2 - v) * t;
            const o = row + px;
            rBuf[o] = val;
            gBuf[o] = val;
            bBuf[o] = val;
          }
        }
      }
    }
  } else {
    // Proportional vertical planes with a stepped tonal shelf and crisp light window.
    const base = 0xf5 / 255;
    rBuf.fill(base);
    gBuf.fill(base);
    bBuf.fill(base);

    const total = spec.ratios.reduce((sum, n) => sum + n, 0) || 1;
    const planeCount = spec.ratios.length;
    let cursor = 0;
    for (let i = 0; i < planeCount; i++) {
      const bw = (spec.ratios[i]! / total) * w;
      const x = spec.flip ? w - cursor - bw : cursor;
      cursor += bw;
      const step = i / Math.max(1, planeCount - 1);
      const jitter = (hash(i + 5, spec.seed) - 0.5) * 0.1;
      const topL = clamp(0.88 - step * 0.78 + jitter, 0.09, 0.95);
      const botL = clamp(topL + 0.14, 0.14, 0.98);
      const t0 = Math.round(topL * 255) / 255;
      const t1 = Math.round(botL * 255) / 255;

      const xStart = Math.max(0, Math.floor(x));
      const xEnd = Math.min(w, Math.ceil(x + Math.ceil(bw) + 1));
      for (let py = 0; py < h; py++) {
        const ty = clamp((py + 0.5) / h, 0, 1);
        const val = t0 + (t1 - t0) * ty;
        const row = py * w;
        for (let px = xStart; px < xEnd; px++) {
          const o = row + px;
          rBuf[o] = val;
          gBuf[o] = val;
          bBuf[o] = val;
        }
      }
    }

    if (spec.shelf > 0) {
      const sy = h * spec.shelf;
      const sw = w * (0.58 + 0.22 * hash(19, spec.seed));
      const sx = spec.flip ? w - sw : 0;
      const sh = h - sy;
      const shelfDenom = sw * sw + sh * sh || 1;
      const sR = 22 / 255;
      const sG = 24 / 255;
      const sB = 29 / 255;

      const xStart = Math.max(0, Math.floor(sx));
      const xEnd = Math.min(w, Math.ceil(sx + sw));
      const yStart = Math.max(0, Math.floor(sy));
      for (let py = yStart; py < h; py++) {
        const dy = py + 0.5 - sy;
        const row = py * w;
        for (let px = xStart; px < xEnd; px++) {
          const dx = px + 0.5 - sx;
          const t = clamp((dx * sw + dy * sh) / shelfDenom, 0, 1);
          const alpha = t <= 0.55 ? 0.68 + ((0.3 - 0.68) * t) / 0.55 : 0.3 + ((0.06 - 0.3) * (t - 0.55)) / 0.45;
          const inv = 1 - alpha;
          const o = row + px;
          rBuf[o] = rBuf[o]! * inv + sR * alpha;
          gBuf[o] = gBuf[o]! * inv + sG * alpha;
          bBuf[o] = bBuf[o]! * inv + sB * alpha;
        }
      }
    }

    const wx = w * (spec.flip ? 0.62 : 0.14);
    const wy = h * (0.14 + 0.12 * hash(29, spec.seed));
    const ww = w * 0.18;
    const wh = h * 0.26;
    const wxStart = Math.max(0, Math.floor(wx));
    const wxEnd = Math.min(w, Math.ceil(wx + ww));
    const wyStart = Math.max(0, Math.floor(wy));
    const wyEnd = Math.min(h, Math.ceil(wy + wh));
    for (let py = wyStart; py < wyEnd; py++) {
      const row = py * w;
      for (let px = wxStart; px < wxEnd; px++) {
        const o = row + px;
        rBuf[o] = 1;
        gBuf[o] = 1;
        bBuf[o] = 1;
      }
    }
  }

  const lumMap = new Float32Array(count);
  const satMap = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = rBuf[i]!;
    const g = gBuf[i]!;
    const b = bBuf[i]!;
    lumMap[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    satMap[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }
  return { lumMap, satMap };
}

/** Decode and center-crop an input image into luminance and saturation maps via ffmpeg. */
export function sampleImage(srcPath: string, w: number, h: number): { lumMap: Float32Array; satMap: Float32Array } {
  const resolved = resolve(srcPath);
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      resolved,
      "-vf",
      `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`,
      "-vframes",
      "1",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      "pipe:1",
    ],
    { maxBuffer: w * h * 4 + 65536 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed to decode ${resolved}: ${result.stderr?.toString("utf8").trim() || "unknown error"}`);
  }
  const px = result.stdout;
  const count = w * h;
  if (px.length < count * 4) {
    throw new Error(`expected ${count * 4} RGBA bytes from ffmpeg, got ${px.length}`);
  }
  const lumMap = new Float32Array(count);
  const satMap = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    const a = (px[o + 3] ?? 255) / 255;
    // Composite transparent image areas over white stock so cutouts screen cleanly.
    const r = ((px[o] ?? 255) / 255) * a + (1 - a);
    const g = ((px[o + 1] ?? 255) / 255) * a + (1 - a);
    const b = ((px[o + 2] ?? 255) / 255) * a + (1 - a);
    lumMap[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    satMap[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }
  return { lumMap, satMap };
}

/** Print one 3.5 px two-ink proof halftone frame (key 45 deg + plum 15 deg) with optional light breath. */
export function paintProofPlate(
  lumMap: Float32Array,
  satMap: Float32Array,
  gridK: Float32Array,
  gridP: Float32Array,
  w: number,
  h: number,
  inks: PlateInks,
  out: Uint8Array,
  options: { breath: BreathStrength; seconds?: number; phaseOffset?: number; channels?: 3 | 4 } = { breath: "vivid" },
) {
  const channels = options.channels ?? 3;
  const preset = BREATH[options.breath];
  const active = preset.lum > 0 && options.seconds !== undefined;
  const phase = active ? (options.seconds! / preset.sec) * TAU + (options.phaseOffset ?? 0) : 0;
  const lightX = (0.5 + 0.42 * Math.sin(phase)) * w;
  const lightY = (0.48 + 0.28 * Math.cos(phase * 0.72)) * h;
  const pulse = active ? 0.78 + 0.22 * Math.sin(phase * 1.5) : 0;
  const invRx = 1 / Math.max(1, w * 0.42);
  const invRy = 1 / Math.max(1, h * 0.56);
  const lumSwing = preset.lum * pulse;
  const plumSwing = preset.plum * pulse;
  const aa = 0.085;

  const gxArr = new Float32Array(w);
  if (active) {
    for (let x = 0; x < w; x++) {
      const dx = (x - lightX) * invRx;
      gxArr[x] = Math.exp(-dx * dx);
    }
  }

  if (!inks.dark) {
    const sR = inks.stock[0];
    const sG = inks.stock[1];
    const sB = inks.stock[2];
    const kR = inks.ink[0] / 255;
    const kG = inks.ink[1] / 255;
    const kB = inks.ink[2] / 255;
    const pR = inks.plum[0] / 255;
    const pG = inks.plum[1] / 255;
    const pB = inks.plum[2] / 255;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let gy = 0;
      if (active) {
        const dy = (y - lightY) * invRy;
        gy = Math.exp(-dy * dy);
      }
      for (let x = 0; x < w; x++) {
        const idx = row + x;
        const baseLum = lumMap[idx]!;
        const s = satMap[idx]!;
        const inkPresence = smoothstep(0.96, 0.78, baseLum);
        const wave = active ? gxArr[x]! * gy * inkPresence : 0;

        const l = Math.min(0.98, baseLum + lumSwing * wave * (0.35 + 0.65 * (1 - baseLum)));
        const keyTone = clamp((1 - l) * 1.06 - 0.03);
        const midBand = Math.max(0, 1 - Math.abs(l - 0.46) * 2.3);
        const plumTone = clamp(midBand * 0.44 + s * 0.34 + plumSwing * wave * (0.45 + 0.55 * (1 - baseLum)), 0, 0.86);

        let pr = sR / 255;
        let pg = sG / 255;
        let pb = sB / 255;
        if (plumTone > 0.03) {
          const hit = smoothstep(-aa, aa, plumTone - gridP[idx]!);
          if (hit > 0) {
            pr *= 1 - hit + hit * pR;
            pg *= 1 - hit + hit * pG;
            pb *= 1 - hit + hit * pB;
          }
        }
        if (keyTone > 0.03) {
          const hit = smoothstep(-aa, aa, keyTone - gridK[idx]!);
          if (hit > 0) {
            pr *= 1 - hit + hit * kR;
            pg *= 1 - hit + hit * kG;
            pb *= 1 - hit + hit * kB;
          }
        }
        const o = idx * channels;
        out[o] = (pr * 255) | 0;
        out[o + 1] = (pg * 255) | 0;
        out[o + 2] = (pb * 255) | 0;
        if (channels === 4) out[o + 3] = 255;
      }
    }
    return;
  }

  // Dark mode: calm white dots at rest (~48% max) on key stock, illuminated upward by light breath + dark plum overprint.
  const bgR = inks.stock[0];
  const bgG = inks.stock[1];
  const bgB = inks.stock[2];
  const fgR = inks.ink[0];
  const fgG = inks.ink[1];
  const fgB = inks.ink[2];
  const plR = inks.plum[0];
  const plG = inks.plum[1];
  const plB = inks.plum[2];
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let gy = 0;
    if (active) {
      const dy = (y - lightY) * invRy;
      gy = Math.exp(-dy * dy);
    }
    for (let x = 0; x < w; x++) {
      const idx = row + x;
      const baseLum = lumMap[idx]!;
      const s = satMap[idx]!;
      const inkPresence = smoothstep(0.96, 0.78, baseLum);
      const wave = active ? gxArr[x]! * gy * inkPresence : 0;

      const ink = clamp((1 - baseLum) * 1.04 - 0.02);
      const whiteTone = clamp(ink * 0.48 + lumSwing * 1.15 * wave * (0.35 + 0.65 * ink), 0, 0.88);
      const midBand = Math.max(0, 1 - Math.abs(ink - 0.48) * 2.2);
      const plumTone = clamp(midBand * 0.34 + s * 0.28 + plumSwing * 1.05 * wave * (0.4 + 0.6 * ink), 0, 0.82);

      let pr = bgR;
      let pg = bgG;
      let pb = bgB;
      if (whiteTone > 0.03) {
        const hit = smoothstep(-aa, aa, whiteTone - gridK[idx]!);
        if (hit > 0) {
          pr += (fgR - pr) * hit;
          pg += (fgG - pg) * hit;
          pb += (fgB - pb) * hit;
        }
      }
      if (plumTone > 0.03) {
        const hit = smoothstep(-aa, aa, plumTone - gridP[idx]!);
        if (hit > 0) {
          const a = hit * 0.88;
          pr += (plR - pr) * a;
          pg += (plG - pg) * a;
          pb += (plB - pb) * a;
        }
      }
      const o = idx * channels;
      out[o] = pr | 0;
      out[o + 1] = pg | 0;
      out[o + 2] = pb | 0;
      if (channels === 4) out[o + 3] = 255;
    }
  }
}

const crcTable = Uint32Array.from({ length: 256 }, (_, byte) => {
  for (let i = 0; i < 8; i++) byte = (byte >>> 1) ^ (byte & 1 ? 0xedb88320 : 0);
  return byte;
});

function pngChunk(type: string, data: Uint8Array) {
  const out = Buffer.allocUnsafe(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  out.set(data, 8);
  let crc = 0xffffffff;
  for (let i = 4; i < out.length - 4; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ out[i]!) & 255]!;
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, out.length - 4);
  return out;
}

/** Encode an RGB24 pixel buffer as a standard 8-bit truecolor PNG. */
export function encodeRgbPng(rgb: Uint8Array, width: number, height: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolor RGB
  const rowBytes = width * 3;
  const stride = 1 + rowBytes;
  const scan = Buffer.allocUnsafe(height * stride);
  for (let y = 0; y < height; y++) {
    const dst = y * stride;
    scan[dst] = 0; // filter None
    scan.set(rgb.subarray(y * rowBytes, (y + 1) * rowBytes), dst + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scan)),
    pngChunk("IEND", new Uint8Array()),
  ]);
}

function usage(): string {
  return [
    "Render a 3.5 px two-ink Superthread proof halftone still (.png) or light-breath loop (.mp4).",
    "",
    "Usage:",
    "  bun scripts/plate.ts --out <file.png|file.mp4> [options]",
    "",
    "Input (choose one; defaults to --spec \"planes\"):",
    "  --src <path>            Source image to screen (PNG, JPEG, WebP, etc.; center-cropped)",
    "  --spec <spec>           No-photo geometry spec, e.g. \"planes ratios=42,24,18,16 seed=7\" or \"grid cols=6 rows=4 seed=19\"",
    "",
    "Options:",
    "  --mode <light|dark>     Theme inks (default: light)",
    "  --width <px>            CSS width in pixels (default: 1200)",
    "  --height <px>           CSS height in pixels (default: 630)",
    "  --dpr <ratio>           Device pixel ratio multiplier (default: 1)",
    "  --pitch <px>            CSS dot pitch in pixels (default: 3.5)",
    "  --breath <strength>     vivid | balanced | gentle | off (default: from spec, else vivid)",
    "  --still                 Shortcut for --breath off",
    "  --time <sec>            Timestamp in seconds for a PNG still (default: 0 when breath is active)",
    "  --phase <rad>           Initial breath phase offset in radians (default: 0)",
    "  --duration <sec>        Video loop duration in seconds (default: breath cycle length, 8 for vivid)",
    "  --fps <n>               Video frame rate (default: 24)",
    "  --crf <n>               H.264 quality CRF for MP4 output (default: 14)",
    "  -h, --help              Show this help",
  ].join("\n");
}

type CliOptions = {
  out: string;
  src?: string;
  spec: string;
  mode: Mode;
  width: number;
  height: number;
  dpr: number;
  pitch?: number;
  breath?: BreathStrength;
  still: boolean;
  time?: number;
  phase: number;
  duration?: number;
  fps: number;
  crf: number;
  help: boolean;
};

function parseCli(argv: string[]): CliOptions {
  const opts: CliOptions = {
    out: "",
    spec: "planes",
    mode: "light",
    width: 1200,
    height: 630,
    dpr: 1,
    still: false,
    phase: 0,
    fps: 24,
    crf: 14,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      opts.help = true;
      continue;
    }
    if (arg === "--still") {
      opts.still = true;
      continue;
    }
    const next = () => {
      const val = argv[++i];
      if (val === undefined) throw new Error(`missing value for ${arg}`);
      return val;
    };
    const nextNum = (label: string) => {
      const n = Number(next());
      if (!Number.isFinite(n)) throw new Error(`expected a number for ${label}`);
      return n;
    };

    switch (arg) {
      case "--out":
      case "-o":
        opts.out = next();
        break;
      case "--src":
        opts.src = next();
        break;
      case "--spec":
        opts.spec = next();
        break;
      case "--mode": {
        const m = next();
        if (m !== "light" && m !== "dark") throw new Error(`invalid --mode "${m}" (expected light or dark)`);
        opts.mode = m;
        break;
      }
      case "--width":
        opts.width = nextNum("--width");
        break;
      case "--height":
        opts.height = nextNum("--height");
        break;
      case "--dpr":
        opts.dpr = nextNum("--dpr");
        break;
      case "--pitch":
        opts.pitch = nextNum("--pitch");
        break;
      case "--breath": {
        const b = next();
        if (b !== "off" && b !== "gentle" && b !== "balanced" && b !== "vivid") {
          throw new Error(`invalid --breath "${b}" (expected vivid, balanced, gentle, or off)`);
        }
        opts.breath = b;
        break;
      }
      case "--time":
        opts.time = nextNum("--time");
        break;
      case "--phase":
        opts.phase = nextNum("--phase");
        break;
      case "--duration":
        opts.duration = nextNum("--duration");
        break;
      case "--fps":
        opts.fps = nextNum("--fps");
        break;
      case "--crf":
        opts.crf = nextNum("--crf");
        break;
      default:
        throw new Error(`unknown argument: ${arg}`);
    }
  }
  return opts;
}

async function renderMp4(
  outputPath: string,
  lumMap: Float32Array,
  satMap: Float32Array,
  gridK: Float32Array,
  gridP: Float32Array,
  w: number,
  h: number,
  inks: PlateInks,
  breath: BreathStrength,
  duration: number,
  fps: number,
  phaseOffset: number,
  crf: number,
) {
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const vf =
    w % 2 === 0 && h % 2 === 0
      ? "scale=out_color_matrix=bt709:out_range=limited,format=yuv420p"
      : "pad=ceil(iw/2)*2:ceil(ih/2)*2,scale=out_color_matrix=bt709:out_range=limited,format=yuv420p";

  const encoder = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgb24",
      "-s",
      `${w}x${h}`,
      "-framerate",
      String(fps),
      "-i",
      "-",
      "-an",
      "-vf",
      vf,
      "-c:v",
      "libx264",
      "-crf",
      String(crf),
      "-preset",
      "medium",
      "-color_range",
      "tv",
      "-colorspace",
      "bt709",
      "-color_primaries",
      "bt709",
      "-color_trc",
      "bt709",
      "-x264-params",
      "colorprim=bt709:transfer=bt709:colormatrix=bt709",
      "-movflags",
      "+faststart+write_colr",
      outputPath,
    ],
    { stdio: ["pipe", "ignore", "inherit"] },
  );

  function* frames() {
    for (let n = 0; n < totalFrames; n++) {
      const buf = Buffer.allocUnsafe(w * h * 3);
      paintProofPlate(lumMap, satMap, gridK, gridP, w, h, inks, buf, {
        breath,
        seconds: breath === "off" ? undefined : n / fps,
        phaseOffset,
        channels: 3,
      });
      yield buf;
    }
  }

  try {
    const [, [code]] = await Promise.all([pipeline(Readable.from(frames()), encoder.stdin!), once(encoder, "exit")]);
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);
  } finally {
    if (encoder.exitCode === null && encoder.signalCode === null) encoder.kill();
  }
}

async function main() {
  const opts = parseCli(process.argv.slice(2));
  if (opts.help || !opts.out) {
    console.log(usage());
    if (!opts.help) process.exit(1);
    return;
  }

  if (opts.width < 2 || opts.height < 2) throw new Error("--width and --height must be at least 2");
  if (opts.dpr <= 0) throw new Error("--dpr must be positive");
  if (opts.fps <= 0) throw new Error("--fps must be positive");

  const spec = parsePlate(opts.spec);
  const breath: BreathStrength = opts.still ? "off" : (opts.breath ?? spec.breath);
  const pitch = opts.pitch ?? spec.pitch;
  const w = Math.max(2, Math.round(opts.width * opts.dpr));
  const h = Math.max(2, Math.round(opts.height * opts.dpr));
  const inks = MODE_INKS[opts.mode];

  const { lumMap, satMap } = opts.src ? sampleImage(opts.src, w, h) : sampleGeometry(spec, w, h);
  const gridK = buildPlateGrid(w, h, opts.dpr, PLATE_ANGLES.key, pitch);
  const gridP = buildPlateGrid(w, h, opts.dpr, PLATE_ANGLES.plum, pitch);

  const ext = extname(opts.out).toLowerCase();
  if (ext === ".mp4") {
    const duration = opts.duration ?? BREATH[breath].sec;
    if (duration <= 0) throw new Error("--duration must be positive");
    await renderMp4(opts.out, lumMap, satMap, gridK, gridP, w, h, inks, breath, duration, opts.fps, opts.phase, opts.crf);
    return;
  }

  if (ext !== ".png") {
    throw new Error(`unsupported output extension "${ext}" (expected .png or .mp4)`);
  }

  const rgb = Buffer.allocUnsafe(w * h * 3);
  paintProofPlate(lumMap, satMap, gridK, gridP, w, h, inks, rgb, {
    breath,
    seconds: breath === "off" ? undefined : (opts.time ?? 0),
    phaseOffset: opts.phase,
    channels: 3,
  });
  await writeFile(opts.out, encodeRgbPng(rgb, w, h));
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
