import {
  BAYER,
  DARK_CAP,
  GRAIN,
  LIGHT,
  RAMPS,
  clamp,
  smooth,
  type RGB,
} from "@/components/superthread/lib/screen-core";

const TAU = 2 * Math.PI;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Standalone PNG and video stock and inks, in sRGB. Live canvases resolve their scope's tokens.
export const INKS = {
  light: [
    [255, 255, 255],
    [22, 24, 29],
    [170, 51, 122],
    [22, 24, 29],
  ],
  dark: [
    [13, 15, 18],
    [228, 228, 228],
    [192, 116, 161],
    [13, 15, 18],
  ],
} satisfies Record<string, [RGB, RGB, RGB, RGB]>;
export type Mode = keyof typeof INKS;
export type FieldMask = (width: number, height: number) => Uint8Array;

const values = {
  base: [0.74, 0.05, 0.96],
  at: [0.5, 0, 1],
  lift: [0.38, -0.8, 0.8],
  width: [0.2, 0.025, 1.5],
  waves: [3, 1, 8],
  settle: [0.66, 0.08, 1.4],
  phase: [0.08, -1, 1],
  steps: [3, 1, 8],
  ease: [0.055, 0.006, 0.3],
  spacing: [0.2, 0.06, 0.7],
  branches: [5, 2, 10],
  fan: [0.82, 0.1, 1.8],
  thin: [0.011, 0.004, 0.09],
  trunk: [0.078, 0.012, 0.4],
  bend: [0.1, -0.65, 0.65],
  turn: [0.56, 0.08, 0.9],
  rx: [0.26, 0.04, 0.85],
  ry: [0.32, 0.04, 0.8],
  blend: [0.024, 0.001, 0.18],
  reach: [0.55, 0.035, 2],
  tex: [0, 0, 0.85],
  pitch: [6.5, 1.5, 14],
  seed: [1, 0, 2147483647],
  thread: [1.5, 0.65, 4],
  knot: [0.5, 0, 1],
  knotr: [9, 2, 24],
  spread: [0.29, 0.08, 0.85],
  level: [0, 0, 1],
  jump: [0, -0.8, 0.8],
  points: [0, 0, 1200],
  masky: [0.5, 0, 1],
  maskfrom: [0, 0, 1],
  duration: [12, 8, 24],
  travel: [0.085, 0, 0.28],
  drift: [0.17, 0, 0.5],
  rest: [0, 0, 1],
} as const;
const integers = new Set(["waves", "steps", "branches", "seed", "points", "duration"]);
const shapes = ["crest", "meander", "terrace", "merge", "ellipse", "mask"] as const;
type Shape = (typeof shapes)[number];
const graph = (shape?: Shape) => shape === "crest" || shape === "meander" || shape === "terrace";
const shapeKeys = [
  "base",
  "at",
  "lift",
  "width",
  "waves",
  "settle",
  "phase",
  "steps",
  "ease",
  "spacing",
  "branches",
  "fan",
  "thin",
  "trunk",
  "bend",
  "rx",
  "ry",
] as const;
const choices = {
  side: ["bottom", "top"],
  ramp: ["fade", "held", "steady", "bet"],
  threadon: ["edge", "axis", "ring"],
  motion: ["still", "knot", "wave", "filaments"],
} as const;

type Numbers = Record<keyof typeof values, number>;
type Choices = { -readonly [K in keyof typeof choices]: (typeof choices)[K][number] };
type ShapeParams = Pick<Numbers, (typeof shapeKeys)[number]>;
type Spec = Numbers &
  Choices & {
    edge: [Shape, Shape?];
    levels: [number, number][];
    secondary: ShapeParams;
    revolve: boolean;
  };

export function parse(line: string): Spec {
  const numbers = Object.fromEntries(Object.entries(values).map(([key, [value]]) => [key, value])) as Numbers;
  const spec: Spec = {
    ...numbers,
    side: "bottom",
    ramp: "fade",
    threadon: "edge",
    motion: "still",
    edge: ["crest"],
    levels: [],
    secondary: numbers,
    revolve: false,
  };
  const secondary = { ...numbers };
  const seen = new Set<string>();
  for (const pair of line.trim().split(/\s+/).filter(Boolean)) {
    const [input, raw, extra] = pair.split("=");
    if (!raw || extra !== undefined || seen.has(input)) throw new Error("invalid or repeated pair " + pair);
    seen.add(input);
    const second = input.startsWith("b.");
    const key = second ? input.slice(2) : input;
    if (second && !(shapeKeys as readonly string[]).includes(key)) throw new Error("unknown secondary key " + input);
    if (Object.hasOwn(values, key)) {
      const numericKey = key as keyof Numbers;
      const [, low, high] = values[numericKey];
      const value = Number(raw);
      if (!Number.isFinite(value) || value < low || value > high || (integers.has(key) && !Number.isInteger(value))) {
        throw new Error(input + " outside " + low + "…" + high);
      }
      (second ? secondary : spec)[numericKey] = value;
    } else if (key === "edge") {
      const edge = raw.split("+") as [Shape, Shape?];
      if (
        edge.length > 2 ||
        edge.some((name) => !name || !shapes.includes(name)) ||
        (edge.includes("mask") && edge.length !== 1) ||
        (graph(edge[0]) && edge.length === 2 && !graph(edge[1]))
      ) {
        throw new Error("unsupported edge " + raw);
      }
      spec.edge = edge;
    } else if (key === "levels") {
      const levels = raw.split(",").map((pair) => pair.split(":").map(Number));
      const total = levels.reduce((sum, [width]) => sum + width, 0);
      if (
        levels.length < 2 ||
        levels.length > 6 ||
        Math.abs(total - 1) > 0.000001 ||
        levels.some(([width, tone, ...rest]) => rest.length || !(width >= 0.04 && width <= 1 && tone >= 0 && tone <= 1))
      ) {
        throw new Error("levels needs 2…6 width:tone pairs with widths adding to 1");
      }
      let end = 0;
      spec.levels = levels.map(([width, tone]) => [(end += width), tone]);
    } else if (key === "side" && (raw === "bottom" || raw === "top")) {
      spec.side = raw;
    } else if (key === "ramp" && choices.ramp.some((value) => value === raw)) {
      spec.ramp = raw as Choices["ramp"];
    } else if (key === "threadon" && choices.threadon.some((value) => value === raw)) {
      spec.threadon = raw as Choices["threadon"];
    } else if (key === "motion" && choices.motion.some((value) => value === raw)) {
      spec.motion = raw as Choices["motion"];
    } else {
      throw new Error("unknown pair " + pair);
    }
  }
  if ([...seen].some((key) => key.startsWith("b.")) && !spec.edge[1]) throw new Error("b. keys need a second edge");
  if (!seen.has("threadon") && spec.edge[0] === "merge") spec.threadon = "axis";
  if (spec.threadon === "axis" && spec.edge[0] !== "merge") throw new Error("axis requires merge as the first edge");
  if (spec.threadon === "ring" && spec.edge[0] !== "ellipse")
    throw new Error("ring requires ellipse as the first edge");
  if (spec.motion === "wave" && spec.edge[0] !== "crest") throw new Error("wave requires crest as the first edge");
  if (spec.jump && !graph(spec.edge[0])) throw new Error("jump requires a graph edge");
  spec.secondary = secondary;
  spec.revolve = spec.edge[0] === "ellipse" && (!spec.edge[1] || spec.threadon === "ring") && !seen.has("travel");
  return spec;
}

function hash(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number, seed: number) {
  const i = Math.floor(x),
    j = Math.floor(y),
    fx = x - i,
    fy = y - j;
  const u = fx * fx * (3 - 2 * fx),
    v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, seed),
    b = hash(i + 1, j, seed),
    c = hash(i, j + 1, seed),
    d = hash(i + 1, j + 1, seed);
  return mix(mix(a, b, u), mix(c, d, u), v);
}

function fbm(x: number, y: number, seed: number) {
  return (
    0.55 * noise(x, y, seed) + 0.3 * noise(2.03 * x, 2.03 * y, seed + 7) + 0.15 * noise(4.1 * x, 4.1 * y, seed + 13)
  );
}

function ridge(x: number, y: number, seed: number) {
  const wx = fbm(x, y, seed + 101) - 0.5;
  const wy = fbm(x, y, seed + 202) - 0.5;
  const folded = 1 - Math.abs(2 * fbm(x + 1.6 * wx, y + 1.6 * wy, seed) - 1);
  const square = folded * folded;
  return square * square * square * folded;
}

function profile(name: Shape, p: ShapeParams, u: number, shift = 0) {
  if (name === "crest") {
    const z = (u - p.at - shift) / p.width;
    const cosh = Math.cosh(z);
    return p.base - p.lift / (cosh * cosh);
  }
  if (name === "meander") {
    const rest = 1 - smooth(0, p.settle, u);
    return p.base + p.lift * rest * Math.sin(TAU * ((p.waves * u) / p.settle + p.phase));
  }
  let y = p.base;
  for (let n = 0; n < p.steps; n++) {
    const x = p.at + (n - (p.steps - 1) / 2) * p.spacing;
    y -= (p.lift / p.steps) * smooth(x - p.ease / 2, x + p.ease / 2, u);
  }
  return y;
}

function union(a: number, b: number, blend: number) {
  const t = clamp(0.5 + (0.5 * (b - a)) / blend);
  return mix(b, a, t) - blend * t * (1 - t);
}

type DistanceColumn = ((v: number) => number) & { gaps?: [number, number][] };

function distanceColumn(name: Shape, p: ShapeParams, u: number, aspect: number, side: number): DistanceColumn {
  if (name === "ellipse") {
    const dx = ((u - p.at) / p.rx) ** 2;
    return (v) => (Math.sqrt(dx + ((v - p.base) / p.ry) ** 2) - 1) * p.ry;
  }
  if (name === "merge") {
    const join = Math.max(0.0001, p.at);
    const q = clamp(u / join);
    const t = q ** 3 * (q * (q * 6 - 15) + 10);
    const centre = p.base + p.bend * (1 - t);
    const neck = smooth(0.62, 1, q);
    const paths = Array.from({ length: p.branches }, (_, i) => {
      const offset = (i / (p.branches - 1) - 0.5) * p.fan;
      const skew = 1 + 0.15 * Math.sin(5.3 * i);
      const y = centre + offset * (1 - t);
      const slope = (-(p.bend + offset) * 30 * q * q * (1 - q) ** 2) / (join * aspect);
      const normal = 1 / Math.sqrt(1 + slope * slope);
      return [y, normal, mix(skew * p.thin, p.trunk, neck)] as const;
    });
    const distance: DistanceColumn = (v) => {
      let d = 2;
      for (let i = 0; i < paths.length; i++) {
        const [y, normal, thickness] = paths[i];
        d = union(d, Math.abs(v - y) * normal - thickness, p.thin * 0.8);
      }
      return d;
    };
    distance.gaps = paths.slice(1).map(([y, normal, thickness], i) => {
      const [other, otherNormal, otherThickness] = paths[i];
      return [other + otherThickness / otherNormal, y - thickness / normal];
    });
    return distance;
  }
  const y = profile(name, p, u);
  return (v) => (v - y) * side;
}

type Grid = { spec: Spec; w: number; h: number; mask?: ReturnType<typeof maskGeometry> };
type MaskGrid = Grid & { mask: NonNullable<Grid["mask"]> };
type Geometry = ReturnType<typeof geometry>;

// Two chamfer passes from the probe. Orthogonal and diagonal distances are 1 and sqrt(2).
function chamfer(mask: Uint8Array, w: number, h: number, target: number) {
  const out = Float32Array.from(mask, (value) => (value === target ? 0 : 1e9));
  const diagonal = Math.SQRT2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let d = out[i];
      if (x) d = Math.min(d, out[i - 1] + 1);
      if (y) {
        d = Math.min(d, out[i - w] + 1);
        if (x) d = Math.min(d, out[i - w - 1] + diagonal);
        if (x + 1 < w) d = Math.min(d, out[i - w + 1] + diagonal);
      }
      out[i] = d;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      let d = out[i];
      if (x + 1 < w) d = Math.min(d, out[i + 1] + 1);
      if (y + 1 < h) {
        d = Math.min(d, out[i + w] + 1);
        if (x) d = Math.min(d, out[i + w - 1] + diagonal);
        if (x + 1 < w) d = Math.min(d, out[i + w + 1] + diagonal);
      }
      out[i] = d;
    }
  }
  return out;
}

function maskGeometry(art: Grid, makeMask?: FieldMask) {
  const { w, h, spec } = art;
  const mask = makeMask?.(w, h);
  if (
    !(mask instanceof Uint8Array) ||
    mask.length !== w * h ||
    mask.some((v) => v !== 0 && v !== 1) ||
    !mask.includes(0) ||
    !mask.some((v, i) => v && (i < w || i >= (h - 1) * w || i % w === 0 || i % w === w - 1))
  ) {
    throw new Error("mask needs a cell-sized Uint8Array with 0 for stock and edge-connected 1 for solid");
  }
  const outside = chamfer(mask, w, h, 1);
  const inside = chamfer(mask, w, h, 0);
  const sd = Float32Array.from(outside, (d, i) => (mask[i] ? 0.5 - inside[i] : d - 0.5) / h);
  const edge = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    let closest = 2;
    for (let y = 1; y < h; y++) {
      const i = y * w + x;
      if (mask[i] === mask[i - w] || mask[i] !== Number(spec.side === "bottom")) continue;
      const next = y / h;
      if (Math.abs(next - spec.masky) < Math.abs(closest - spec.masky)) closest = next;
    }
    edge[x] = closest === 2 ? NaN : closest;
  }
  return { sd, at: (u: number) => edge[clamp(Math.floor(u * w), 0, w - 1)] };
}

function maskThread(art: MaskGrid) {
  const { w, h, spec } = art;
  const distance = new Float32Array(w * h).fill(Infinity);
  const pad = Math.ceil(Math.max(4 * spec.thread, 2 * spec.knotr));
  const at = (x: number) => art.mask.at((x + 0.5) / w) * h - 0.5;
  const first = Math.max(0, Math.ceil(spec.maskfrom * w - 0.5));
  const offset = (spec.side === "bottom" ? -1 : 1) * spec.reach * spec.level * h;
  for (let x = first; x < w; x++) {
    const y = at(x) + offset;
    if (!Number.isFinite(y)) continue;
    const next = x + 1 < w ? at(x + 1) + offset : NaN;
    const dx = Number.isFinite(next) ? 1 : 0;
    const dy = dx ? next - y : 0;
    const lengthSquared = Math.max(1, dx + dy * dy);
    const top = Math.max(0, Math.ceil(Math.min(y, y + dy) - pad));
    const bottom = Math.min(h - 1, Math.floor(Math.max(y, y + dy) + pad));
    const left = Math.max(0, x - pad);
    const right = Math.min(w - 1, x + dx + pad);
    for (let py = top; py <= bottom; py++) {
      for (let px = left; px <= right; px++) {
        const i = py * w + px;
        const t = clamp(((px - x) * dx + (py - y) * dy) / lengthSquared);
        const d = (px - x - dx * t) ** 2 + (py - y - dy * t) ** 2;
        distance[i] = Math.min(distance[i], d);
      }
    }
  }
  for (let i = 0; i < distance.length; i++) distance[i] = Math.sqrt(distance[i]) / h;
  return distance;
}

function geometry(art: Grid, phase: number) {
  const { spec: p, w, h } = art;
  const aspect = w / h;
  const [edge, second] = p.edge;
  const side = p.side === "bottom" ? -1 : 1;
  const shift = p.motion === "wave" ? p.travel * Math.sin(phase) : 0;
  const isGraph = graph(edge);
  const profileAt = (u: number) =>
    profile(edge, p, u, shift) + (second ? profile(second, p.secondary, u) - p.secondary.base : 0);
  const threadAt = (u: number) => {
    const step = p.jump * smooth(p.turn - p.ease / 2, p.turn + p.ease / 2, u);
    return profileAt(u) + side * (p.reach * p.level + step);
  };
  const sd = art.mask?.sd ?? new Float32Array(w * h);
  const gapWidths = edge === "merge" || second === "merge" ? new Float32Array(sd.length) : null;
  const thread = art.mask ? maskThread({ ...art, mask: art.mask }) : new Float32Array(sd.length);
  for (let x = 0; x < w && !art.mask; x++) {
    const u = (x + 0.5) / w,
      halfCell = 0.5 / w;
    const yEdge = isGraph ? profileAt(u) : 0;
    const yThread = isGraph ? threadAt(u) : 0;
    const getDistance = isGraph ? null : distanceColumn(edge, p, u, aspect, side);
    const getSecond = second && !isGraph ? distanceColumn(second, p.secondary, u, aspect, side) : null;
    const threadNormal = isGraph ? 1 / Math.hypot(1, (threadAt(u + halfCell) - threadAt(u - halfCell)) * h) : 1;
    const gaps = getDistance?.gaps ?? getSecond?.gaps;
    if (gaps) {
      for (const [top, bottom] of gaps) {
        const gap = bottom - top;
        if (gap <= 0) continue;
        const start = Math.max(0, Math.ceil(top * h - 0.5));
        const end = Math.min(h, Math.ceil(bottom * h - 0.5));
        for (let y = start; y < end; y++) gapWidths![y * w + x] = gap;
      }
    }
    for (let y = 0; y < h; y++) {
      const i = y * w + x,
        v = (y + 0.5) / h;
      const first = getDistance ? getDistance(v) : (v - yEdge) * side;
      const signed = getSecond ? union(first, getSecond(v), p.blend) : first;
      sd[i] = signed;
      if (isGraph) {
        thread[i] = (v - yThread) * threadNormal;
      } else if (edge === "merge" && p.threadon === "axis") {
        const start = p.at - 0.05;
        const centerline = p.base - p.reach * p.level;
        thread[i] = u < start ? Math.hypot((u - start) * aspect, v - centerline) : v - centerline;
      } else {
        thread[i] = (p.threadon === "ring" || (!second && edge === "ellipse") ? first : signed) - p.reach * p.level;
      }
    }
  }
  return {
    sd,
    gapWidths,
    thread,
    knotAt: (at: number) => {
      if (isGraph) return [at, threadAt(at)];
      if (art.mask) {
        const y = at >= p.maskfrom ? art.mask.at(at) : NaN;
        if (!Number.isFinite(y)) throw new Error("choose a knot on the mask crossing");
        return [at, y + side * p.reach * p.level];
      }
      if (edge === "ellipse" && (!second || p.threadon === "ring")) {
        const radius = 1 + (p.reach * p.level) / p.ry;
        return [p.at + radius * p.rx * Math.cos(TAU * at), p.base + radius * p.ry * Math.sin(TAU * at)];
      }
      if (p.threadon === "axis") {
        return [mix(p.at - 0.05, 1, at), p.base - p.reach * p.level];
      }
      const col = clamp(Math.floor(at * w), 0, w - 1);
      const target = p.side === "bottom" ? 0 : 1;
      let best = 2;
      let position = target;
      for (let y = 1; y < h; y++) {
        const a = thread[(y - 1) * w + col],
          b = thread[y * w + col];
        if (a * b > 0 || a === b) continue;
        const next = (y - 0.5 + a / (a - b)) / h;
        if (Math.abs(next - target) < best) {
          best = Math.abs(next - target);
          position = next;
        }
      }
      if (best === 2) throw new Error("choose a knot on a visible part of the edge");
      return [at, position];
    },
  };
}

function makeTexture({ spec, w, h }: Grid) {
  if (!spec.tex) return null;
  const xPad = spec.motion === "filaments" ? Math.ceil(spec.drift * h) + 2 : 0;
  const yPad = spec.motion === "filaments" ? Math.ceil(spec.drift * 0.7 * h) + 2 : 0;
  const stride = w + 2 * xPad,
    rows = h + 2 * yPad;
  const data = new Float32Array(stride * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < stride; x++) {
      data[y * stride + x] = ridge(((x - xPad) * spec.pitch) / h, ((y - yPad) * spec.pitch) / h, spec.seed);
    }
  }
  return { data, stride, xPad, yPad };
}

function makePoints(art: Grid & { staticGeometry: Geometry }) {
  const { spec, w, h, staticGeometry } = art;
  if (!spec.points) return null;
  const { sd } = staticGeometry;
  const candidates: [number, number][] = [];
  const margin = spec.motion === "wave" ? Math.abs(spec.lift) : 0;
  // Use the common reach so points stay out of thin gaps even where the local ramp is shorter.
  const limit = spec.reach * (spec.ramp === "fade" ? 0.91 : 1) + margin;
  for (let i = 0; i < sd.length; i++) {
    if (sd[i] >= limit && Math.abs(staticGeometry.thread[i]) * h > spec.knotr * 2) {
      candidates.push([hash(i % w, (i / w) | 0, spec.seed + 9), i]);
    }
  }
  candidates.sort((a, b) => a[0] - b[0]);
  // Keep neighboring points from fusing into white flecks. A tiny output can print fewer.
  const map = new Uint8Array(sd.length);
  let count = 0;
  for (const [, i] of candidates) {
    const x = i % w,
      y = (i / w) | 0;
    let free = true;
    for (let yy = Math.max(0, y - 1); yy <= Math.min(h - 1, y + 1); yy++) {
      for (let xx = Math.max(0, x - 1); xx <= Math.min(w - 1, x + 1); xx++) {
        if (map[yy * w + xx]) free = false;
      }
    }
    if (free) {
      map[i] = 1;
      if (++count === spec.points) break;
    }
  }
  return map;
}

export function prepare(line: string, width: number, height: number, { mask }: { mask?: FieldMask } = {}) {
  if (![width, height].every((n) => Number.isInteger(n) && n >= 2 && n <= 8192)) {
    throw new Error("width and height must be whole CSS pixels between 2 and 8192");
  }
  const spec = parse(line);
  const grid: Grid = { w: Math.ceil(width / GRAIN), h: Math.ceil(height / GRAIN), spec };
  if (spec.edge[0] === "mask") grid.mask = maskGeometry(grid, mask);
  const staticGeometry = geometry(grid, 0);
  checkBoundaries(staticGeometry.sd, grid.w, grid.h, spec.edge[0]);
  const art = { ...grid, width, height, staticGeometry, texture: makeTexture(grid) };
  const points = makePoints(art);
  const prepared = { ...art, points };
  // A frame-zero anchor must name an actual crossing, including on a mask.
  const phase = TAU * (spec.rest % 1);
  frameGeometry(prepared, phase).knotAt(knotPosition(spec, phase));
  return prepared;
}

export type FieldArt = ReturnType<typeof prepare>;

function frameGeometry(art: Grid & { staticGeometry: Geometry }, phase: number) {
  if (art.spec.motion !== "wave" || phase === 0) return art.staticGeometry;
  const frame = geometry(art, phase);
  checkBoundaries(frame.sd, art.w, art.h, art.spec.edge[0]);
  return frame;
}

function knotPosition(spec: Spec, phase: number) {
  const travel = spec.travel * Math.sin(phase);
  if (spec.motion === "wave") return spec.knot + travel;
  if (spec.motion !== "knot") return spec.knot;
  if (spec.revolve) return spec.knot + phase / TAU;
  const closed = spec.edge[0] === "ellipse" && (!spec.edge[1] || spec.threadon === "ring");
  return closed ? spec.knot + travel : clamp(spec.knot + travel);
}

export function paint(art: FieldArt, mode: Mode, seconds = 0, out: Uint8Array = new Uint8Array(art.w * art.h)) {
  if (!Object.hasOwn(INKS, mode) || !Number.isFinite(seconds))
    throw new Error("expected light or dark and a finite time");
  if (out.length !== art.w * art.h) throw new Error("wrong ink buffer size");
  const { spec: p, w, h, texture } = art;
  const dark = mode === "dark";
  const cycle = (((seconds / p.duration + p.rest) % 1) + 1) % 1;
  const phase = TAU * cycle;
  const { sd, thread, gapWidths, knotAt } = frameGeometry(art, phase);
  const [kx, ky] = knotAt(knotPosition(p, phase));
  const lightX = Float32Array.from({ length: w }, (_, x) => Math.exp(-((((x + 0.5) / w - kx) / p.spread) ** 2)));
  const textureX = texture ? texture.xPad + p.drift * h * Math.sin(phase) * Number(p.motion === "filaments") : 0;
  const textureY = texture
    ? texture.yPad + 0.7 * p.drift * h * (Math.cos(phase) - 1) * 0.5 * Number(p.motion === "filaments")
    : 0;
  const bx = Math.floor(textureX),
    by = Math.floor(textureY);
  const fx = textureX - bx,
    fy = textureY - by;
  const softFilaments = dark ? p.tex : p.tex * 0.28;
  const ramp = RAMPS[p.ramp].density;
  const gapReach = dark ? 0.39 : 0.64;
  for (let y = 0; y < h; y++) {
    const lightY = Math.exp(-((((y + 0.5) / h - ky) / (p.spread * 1.35)) ** 2));
    const dy = y + 0.5 - ky * h;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const dx = x + 0.5 - kx * w;
      const light = lightX[x] * lightY;
      const threshold = BAYER[(y & 3) * 4 + (x & 3)];
      const plumThreshold = BAYER[((y + 2) & 3) * 4 + ((x + 2) & 3)];
      const pd = (thread[i] * h) / p.thread;
      const seam = Math.abs(pd) < 4 ? Math.max(Math.exp(-(pd ** 4)), dark ? 0.26 * Math.exp(-(pd ** 2) / 4.5) : 0) : 0;
      const radius = (dx * dx + dy * dy) / (p.knotr * p.knotr);
      const knot = radius < 5 ? Math.max(Math.exp(-(radius ** 2)), dark ? 0.29 * Math.exp(-radius / 1.7) : 0) : 0;
      if (Math.max(seam * (0.76 + 0.24 * light), knot) > plumThreshold) {
        out[i] = 2;
        continue;
      }
      if (sd[i] <= 0) {
        out[i] = 3;
        continue;
      }
      const gap = gapWidths?.[i];
      const reach = gap ? Math.min(p.reach, gap * gapReach) : p.reach;
      const r = sd[i] / reach;
      if (r >= 1) {
        out[i] = dark && art.points?.[i] ? 1 : 0;
        continue;
      }
      let tone = ramp(r);
      if (texture && tone > 0) {
        const j = (y + by) * texture.stride + x + bx;
        const dots = texture.data;
        const ridgeTone =
          p.motion === "filaments"
            ? mix(mix(dots[j], dots[j + 1], fx), mix(dots[j + texture.stride], dots[j + texture.stride + 1], fx), fy)
            : dots[j];
        const band = smooth(0.025, 0.23, r) * (1 - smooth(0.62, 0.96, r));
        tone = clamp(tone + softFilaments * band * (0.66 * ridgeTone - 0.24));
      }
      if (p.levels.length) tone *= (p.levels.find(([end]) => r < end) ?? p.levels.at(-1)!)[1];
      const hold = smooth(0, LIGHT.hold, r);
      const density = dark
        ? tone * DARK_CAP * hold * (LIGHT.low + (1 - LIGHT.low) * light)
        : tone * (1 - hold * (LIGHT.shade * light - LIGHT.dim * (1 - light)));
      out[i] = (density > threshold && (!dark || threshold < 0.5)) || (dark && art.points?.[i]) ? 1 : 0;
    }
  }
  return out;
}

const inStock = (distance: number) => distance > 0;
const inSolid = (distance: number) => distance <= 0;

// Flood stock from the frame. Separate solid islands are allowed, as in ROI.
function checkBoundaries(distance: Float32Array, w: number, h: number, edge: Shape) {
  if (graph(edge)) {
    // Each column is monotone, so stock and solid both open vertically.
    const top = distance.subarray(0, w);
    const bottom = distance.subarray(distance.length - w);
    if ((top.some(inStock) || bottom.some(inStock)) && (top.some(inSolid) || bottom.some(inSolid))) return;
    throw new Error("the solid must meet the frame and leave room for stock");
  }

  let solidAtFrame = false;
  let stock = 0;
  let head = 0;
  let tail = 0;
  const seen = new Uint8Array(distance.length);
  const queue = new Uint32Array(distance.length);
  function visit(i: number) {
    if (!seen[i] && inStock(distance[i])) {
      seen[i] = 1;
      queue[tail++] = i;
    }
  }

  for (let i = 0; i < distance.length; i++) {
    const empty = distance[i] > 0;
    if (empty) stock++;
    if (i < w || i >= distance.length - w || i % w === 0 || i % w === w - 1) {
      if (empty) visit(i);
      else solidAtFrame = true;
    }
  }
  if (!solidAtFrame || !stock) throw new Error("the solid must meet the frame and leave room for stock");
  while (head < tail) {
    const i = queue[head++];
    const left = i % w > 0;
    const right = i % w < w - 1;
    if (left) visit(i - 1);
    if (right) visit(i + 1);
    // Stock can meet between diagonal solid cells at a rasterized edge.
    if (i >= w) {
      visit(i - w);
      if (left) visit(i - w - 1);
      if (right) visit(i - w + 1);
    }
    if (i < distance.length - w) {
      visit(i + w);
      if (left) visit(i + w - 1);
      if (right) visit(i + w + 1);
    }
  }
  if (tail === stock) return;
  // A vector edge can leave subcell flecks at a join when sampled on the screen grid.
  // Mask cells are exact, so even a single enclosed stock cell is an error.
  const tolerance = edge === "mask" ? 0 : 0.5 / h;
  if (distance.some((d, i) => !seen[i] && d > tolerance)) {
    throw new Error("the solid encloses stock; open the pocket to the frame");
  }
  for (let i = 0; i < distance.length; i++) {
    if (!seen[i] && inStock(distance[i])) distance[i] = 0;
  }
}
