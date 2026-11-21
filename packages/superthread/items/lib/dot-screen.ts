// Sample the cosine spot at pixel centres. Equal areas of a screen cell
// receive equal ranges of thresholds, so a tone is its printed coverage.
export const DOT_PITCH = 4;
export const DOT_ANGLES = { key: 45, plum: 15 };
const TAU = 2 * Math.PI;
const SAMPLE = 256;
const CURVE_SIZE = 4096;
const spot = (u: number, v: number) => 0.5 - 0.25 * (Math.cos(TAU * u) + Math.cos(TAU * v));
let curve: Uint8Array | undefined;

function coverageCurve() {
  const counts = new Uint32Array(CURVE_SIZE);
  for (let y = 0; y < SAMPLE; y++) {
    for (let x = 0; x < SAMPLE; x++) {
      counts[Math.min(CURVE_SIZE - 1, (spot((x + 0.5) / SAMPLE, (y + 0.5) / SAMPLE) * CURVE_SIZE) | 0)]++;
    }
  }
  let sum = 0;
  return Uint8Array.from(counts, (count) => {
    const rank = Math.min(255, ((sum + count / 2) / SAMPLE ** 2) * 256);
    sum += count;
    return rank;
  });
}

export function dotThresholds(width: number, height: number, dpr: number, angle: number) {
  const a = (angle * Math.PI) / 180;
  const c = (TAU * Math.cos(a)) / (DOT_PITCH * dpr);
  const s = (TAU * Math.sin(a)) / (DOT_PITCH * dpr);
  const thresholds = new Uint8Array(width * height);
  const lut = (curve ??= coverageCurve());
  const cx = Float64Array.from({ length: width }, (_, x) => Math.cos((x + 0.5) * c));
  const sx = Float64Array.from({ length: width }, (_, x) => Math.sin((x + 0.5) * c));
  const cy = Float64Array.from({ length: width }, (_, x) => Math.cos((x + 0.5) * s));
  const sy = Float64Array.from({ length: width }, (_, x) => Math.sin((x + 0.5) * s));
  for (let y = 0; y < height; y++) {
    const py = y + 0.5;
    const uCos = Math.cos(py * s),
      uSin = Math.sin(py * s);
    const vCos = Math.cos(py * c),
      vSin = Math.sin(py * c);
    for (let x = 0; x < width; x++) {
      const a = cx[x] * uCos - sx[x] * uSin;
      const b = cy[x] * vCos + sy[x] * vSin;
      const value = 0.5 - 0.25 * (a + b);
      thresholds[y * width + x] = lut[Math.min(CURVE_SIZE - 1, (value * CURVE_SIZE) | 0)];
    }
  }
  return thresholds;
}

function samples(size: number, count: number) {
  const from = new Uint32Array(size);
  const to = new Uint32Array(size);
  const weight = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const point = Math.max(0, Math.min(count - 1, ((i + 0.5) * count) / size - 0.5));
    from[i] = Math.floor(point);
    to[i] = Math.min(count - 1, from[i] + 1);
    weight[i] = point - from[i];
  }
  const ends = new Uint32Array(count);
  for (let i = 0; i < size; i++) ends[from[i]] = i + 1;
  return { from, to, weight, ends };
}

export function prepareDots(cols: number, rows: number, width: number, height: number, dpr: number) {
  return {
    cols,
    rows,
    width,
    height,
    x: samples(width, cols),
    y: samples(height, rows),
    key: dotThresholds(width, height, dpr, DOT_ANGLES.key),
    plum: dotThresholds(width, height, dpr, DOT_ANGLES.plum),
    // Interpolate vertically once per column, then across the output row.
    row: new Float32Array(cols * 4),
  };
}

export type DotScreen = ReturnType<typeof prepareDots>;

export function screenTones(cols: number, rows: number) {
  // Key and plum coverage in 0..256, then signed distances to the solid
  // and thread centre. The solid uses negative distances on the inside.
  return new Float32Array(cols * rows * 4);
}

export type PrintPixels = Uint8Array | Uint32Array;

export function printDots(screen: DotScreen, tones: Float32Array, pixels: PrintPixels, inks: ArrayLike<number>) {
  const { width, height, cols, x, y, key, plum, row } = screen;
  const stock = inks[0],
    first = inks[1],
    spotInk = inks[2],
    solidInk = inks[3];
  const { ends, weight } = x;
  for (let py = 0; py < height; py++) {
    const a = 4 * y.from[py] * cols;
    const b = 4 * y.to[py] * cols;
    const f = y.weight[py];
    for (let i = 0; i < row.length; i++) {
      const v = tones[a + i];
      row[i] = v + (tones[b + i] - v) * f;
    }
    const start = py * width;
    let left = 0;
    for (let col = 0; col < cols; col++) {
      const end = ends[col];
      if (end <= left) continue;
      const a = 4 * col;
      const b = col + 1 < cols ? a + 4 : a;
      const keyTone = row[a],
        keyStep = row[b] - keyTone;
      const plumTone = row[a + 1],
        plumStep = row[b + 1] - plumTone;
      const solid = row[a + 2],
        solidEnd = row[b + 2];
      const thread = row[a + 3],
        threadEnd = row[b + 3];
      const solidThroughout = solid <= 0 && solidEnd <= 0;
      const openThroughout = solid > 0 && solidEnd > 0;
      const noThread = (thread >= 0.72 && threadEnd >= 0.72) || (thread <= -0.72 && threadEnd <= -0.72);

      if (noThread && plumTone === 0 && plumStep === 0) {
        if (solidThroughout || (openThroughout && keyTone === 0 && keyStep === 0)) {
          const ink = solidThroughout ? solidInk : stock;
          for (let px = left, i = start + left; px < end; px++, i++) pixels[i] = ink;
        } else if (openThroughout) {
          for (let px = left, i = start + left; px < end; px++, i++) {
            pixels[i] = keyTone + keyStep * weight[px] > key[i] + 0.5 ? first : stock;
          }
        } else {
          const solidStep = solidEnd - solid;
          for (let px = left, i = start + left; px < end; px++, i++) {
            const t = weight[px];
            pixels[i] = solid + solidStep * t <= 0 ? solidInk : keyTone + keyStep * t > key[i] + 0.5 ? first : stock;
          }
        }
      } else {
        const threadStep = threadEnd - thread;
        const solidStep = solidEnd - solid;
        for (let px = left, i = start + left; px < end; px++, i++) {
          const t = weight[px];
          pixels[i] =
            Math.abs(thread + threadStep * t) < 0.72 || plumTone + plumStep * t > plum[i] + 0.5
              ? spotInk
              : solid + solidStep * t <= 0
                ? solidInk
                : keyTone + keyStep * t > key[i] + 0.5
                  ? first
                  : stock;
        }
      }
      left = end;
    }
  }
  return pixels;
}

export function packedInks(inks: readonly (readonly number[] | undefined)[]) {
  return new Uint32Array(Uint8Array.from(inks.flatMap((ink) => (ink ? [...ink, 255] : [0, 0, 0, 0]))).buffer);
}

/** Align a backing-store pixel with each device pixel, including fractional DPRs. */
export function canvasRaster(box: DOMRect, dpr: number) {
  const left = Math.floor(box.left * dpr) / dpr - box.left;
  const top = Math.floor(box.top * dpr) / dpr - box.top;
  const width = Math.ceil((box.width - left) * dpr - 1e-7);
  const height = Math.ceil((box.height - top) * dpr - 1e-7);
  return { left, top, width, height, cssWidth: width / dpr, cssHeight: height / dpr };
}
