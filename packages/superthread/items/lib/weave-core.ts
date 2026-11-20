const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((rank) => (rank + 0.5) / 16);
const GRAIN = 2;
const TAU = Math.PI * 2;
const DARK_CAP = 0.55;
const LIGHT = { spread: 0.3, shade: 0.32, dim: 0.12, hold: 0.2, low: 0.22 };

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const linear = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
function smooth(a: number, b: number, x: number) {
  const r = linear(a, b, x);
  return r * r * (3 - 2 * r);
}

type Run = "right" | "down";
type Ramp = "held" | "steady" | "bet" | "fade";
export type WeaveSpec = {
  run: Run;
  phone?: Run;
  fray: number | "arch";
  apex: number;
  sides: number;
  bow: number;
  waves: number;
  amp: number;
  wobble: number;
  period: number;
  ramp: Ramp;
  thread: number;
  strength: number;
  knot?: number;
  knotr: number;
  live: boolean;
  seed: number;
};

const RAMPS = {
  held: {
    density: (r) => (r < 0.62 ? 1 - 0.25 * linear(0, 0.62, r) : 0.75 * (1 - smooth(0.62, 1, r))),
    seam: 0,
  },
  steady: {
    density: (r) => (r < 0.85 ? 1 - 0.75 * linear(0, 0.85, r) : 0.25 * (1 - linear(0.85, 1, r))),
    seam: 0,
  },
  bet: { density: (r) => (r < 0.46 ? 0.5 : 0.125 * (1 - smooth(0.85, 1, r))), seam: 0.46 },
  fade: { density: (r) => 1 - smooth(0, 0.86, r), seam: 0 },
} satisfies Record<Ramp, { density: (r: number) => number; seam: number }>;

export function parseWeave(line: string): WeaveSpec {
  const pairs = new Map(
    line
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [name, value] = pair.split("=", 2);
        return [name!, value];
      }),
  );
  const number = (name: string, fallback: number) => {
    const value = pairs.get(name);
    return value && Number.isFinite(Number(value)) ? Number(value) : fallback;
  };
  const phone = pairs.get("phone");
  const ramp = pairs.get("ramp");
  const knot = number("knot", NaN);
  return {
    run: pairs.get("run") === "down" ? "down" : "right",
    phone: phone === "down" || phone === "right" ? phone : undefined,
    fray: pairs.get("fray") === "arch" ? "arch" : clamp(number("fray", 0.06)),
    apex: clamp(number("apex", 0.24)),
    sides: clamp(number("sides", 0.45)),
    bow: number("bow", 0),
    waves: number("waves", 0),
    amp: number("amp", 3),
    wobble: clamp(number("wobble", 0), 0, 2),
    period: Math.max(1, number("period", 24)),
    ramp: ramp && Object.hasOwn(RAMPS, ramp) ? (ramp as Ramp) : "fade",
    thread: Math.max(0, number("thread", 4)),
    strength: clamp(number("strength", 1)),
    knot: Number.isFinite(knot) ? clamp(knot) : undefined,
    knotr: Math.max(1, number("knotr", 13)),
    live: pairs.has("live") && pairs.get("live") === undefined,
    seed: number("seed", 1),
  };
}

function hash(index: number, seed: number) {
  let h = (index * 374761393 + seed * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** One distance along the run per cell across its breadth. */
export function weaveFray(spec: WeaveSpec, length: number, breadth: number) {
  const frequencies = [0.5, 0.83, 1.37, 2.21].map((f, i) => f * (0.85 + 0.3 * hash(i, spec.seed)));
  const weights = frequencies.map((f, i) => (hash(i + 9, spec.seed) < 0.5 ? -1 : 1) / f);
  const weight = weights.reduce((sum, n) => sum + Math.abs(n), 0);
  const edges = new Float32Array(breadth);

  for (let q = 0; q < Math.ceil(breadth / 2); q++) {
    const middle = (q + 0.5) / breadth - 0.5;
    const curve = 4 * middle * middle;
    const fray = spec.fray === "arch" ? spec.apex + (spec.sides - spec.apex) * curve : spec.fray;
    const bow = spec.bow * (1 - curve);
    const waves = spec.waves ? spec.amp * Math.cos(TAU * spec.waves * middle) : 0;
    const phase = (TAU * middle * breadth) / spec.period;
    const wobble = weights.reduce((sum, n, i) => sum + n * Math.cos(phase * frequencies[i]!), 0) / weight;
    edges[q] = edges[breadth - 1 - q] = fray * length + bow + waves + spec.wobble * wobble;
  }
  return edges;
}

type RGB = readonly [number, number, number];
export type WeaveInks = { solid: RGB; screen: RGB; thread: RGB; dark: boolean };

type Field = ReturnType<typeof prepareWeave>;

/** Prepare a weave at its output size in cells. Reuse the result across frames. */
export function prepareWeave(spec: WeaveSpec, width: number, height: number, phone = false) {
  const down = (phone ? (spec.phone ?? spec.run) : spec.run) === "down";
  const breadth = down ? width : height;
  const length = down ? height : width;
  const ramp = RAMPS[spec.ramp];
  const edges = weaveFray(spec, length, breadth);
  const screen = new Float32Array(width * height);
  const hold = new Float32Array(screen.length);
  const thread = new Float32Array(screen.length);
  const bloom = new Float32Array(screen.length);
  const lineLight = Float32Array.from(edges, (_, q) => {
    const d = ((q + 0.5) / breadth - 0.5) / LIGHT.spread;
    return Math.exp(-d * d);
  });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const t = (down ? y : x) + 0.5;
      const edge = edges[down ? x : y]!;
      const rest = Math.max(1, length - edge);
      const past = t - edge;
      const r = past / rest;
      screen[i] = past < 0 ? -1 : ramp.density(r);
      hold[i] = smooth(0, LIGHT.hold, r);

      if (spec.thread > 0) {
        const d = (past - ramp.seam * rest) / spec.thread;
        const d2 = d * d;
        thread[i] = spec.strength * Math.exp(-d2 * d2);
        // Fade the bloom out before it reaches the adjoining solid.
        bloom[i] = 0.42 * Math.exp(-d2 / 5.5) * (d < 0 ? clamp(t / (3 * spec.thread)) : 1);
      }
    }
  }

  return { spec, width, height, down, breadth, length, edges, screen, hold, thread, bloom, lineLight };
}

function knotAt(field: Field, time: number | undefined) {
  const { spec, breadth, length, edges, down } = field;
  if (spec.knot === undefined) return;
  const at = time === undefined ? spec.knot : 0.5 + 0.3 * Math.sin((TAU * time) / 96);
  const q = clamp(at * breadth - 0.5, 0, breadth - 1);
  const q0 = Math.floor(q);
  const q1 = Math.min(breadth - 1, q0 + 1);
  const edge = edges[q0]! + (edges[q1]! - edges[q0]!) * (q - q0);
  const across = at * breadth;
  const seam = edge + RAMPS[spec.ramp].seam * Math.max(1, length - edge);
  const radius = spec.knotr * (time === undefined ? 1 : 1 + 0.09 * Math.sin((TAU * time) / 7.5));
  return { x: down ? across : seam, y: down ? seam : across, radius };
}

function writePixel(pixels: Uint8ClampedArray, offset: number, ink: RGB) {
  pixels[offset] = ink[0];
  pixels[offset + 1] = ink[1];
  pixels[offset + 2] = ink[2];
  pixels[offset + 3] = 255;
}

/** Print one RGBA frame, with transparent stock. Pass seconds for video or omit time for a still plate. */
export function paintWeave(
  field: Field,
  inks: WeaveInks,
  pixels: Uint8ClampedArray,
  options: { time?: number; reducedMotion?: boolean } = {},
) {
  const { spec, width, height, breadth, down, screen, hold, thread, bloom, lineLight } = field;
  const liveTime = spec.live && !options.reducedMotion ? options.time : undefined;
  const knot = knotAt(field, liveTime);
  const spread = LIGHT.spread * breadth;
  pixels.fill(0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const k = screen[i]!;
      const h = hold[i]!;
      const light = knot
        ? Math.exp(-(((x + 0.5 - knot.x) / spread) ** 2 + ((y + 0.5 - knot.y) / spread) ** 2))
        : lineLight[down ? x : y]!;
      const seam = inks.dark ? Math.max(thread[i]!, bloom[i]!) : thread[i]!;
      const threshold = BAYER[(y & 3) * 4 + (x & 3)]!;
      const plumThreshold = BAYER[((y + 2) & 3) * 4 + ((x + 2) & 3)]!;
      const density = inks.dark
        ? k * DARK_CAP * h * (LIGHT.low + (1 - LIGHT.low) * light)
        : k * (1 - h * (LIGHT.shade * light - LIGHT.dim * (1 - light)));

      if (seam * (0.72 + 0.28 * light) > plumThreshold) writePixel(pixels, i * 4, inks.thread);
      else if (k < 0) writePixel(pixels, i * 4, inks.solid);
      // A 55% target can round up to 9 of 16 cells. Keep the printed tile under the cap too.
      else if (density > threshold && (!inks.dark || threshold < 0.5)) writePixel(pixels, i * 4, inks.screen);
    }
  }

  if (knot) drawKnot(field, inks, pixels, knot, liveTime ?? 0);
  return pixels;
}

function drawKnot(
  { width, height }: Field,
  inks: WeaveInks,
  pixels: Uint8ClampedArray,
  knot: NonNullable<ReturnType<typeof knotAt>>,
  time: number,
) {
  const reach = Math.ceil(knot.radius * (inks.dark ? 4 : 3));
  const lobe2 = (TAU * time) / 11;
  const lobe3 = (TAU * time) / 17;
  const lobe5 = (TAU * time) / 23;
  for (let y = Math.max(0, Math.floor(knot.y - reach)); y <= Math.min(height - 1, Math.ceil(knot.y + reach)); y++) {
    for (let x = Math.max(0, Math.floor(knot.x - reach)); x <= Math.min(width - 1, Math.ceil(knot.x + reach)); x++) {
      const dx = x + 0.5 - knot.x;
      const dy = y + 0.5 - knot.y;
      const angle = Math.atan2(dy, dx);
      const radius =
        knot.radius *
        (1 +
          0.13 * Math.sin(2 * angle + lobe2) +
          0.08 * Math.sin(3 * angle - lobe3 + 1.3) +
          0.05 * Math.sin(5 * angle + lobe5 + 0.4));
      const d2 = (dx * dx + dy * dy) / (radius * radius);
      const core = Math.exp(-d2 * d2);
      const density = inks.dark ? Math.max(core, 0.36 * Math.exp(-d2 / 2.2)) : core;
      const threshold = BAYER[((y + 2) & 3) * 4 + ((x + 2) & 3)]!;
      if (Math.round(density * 8) / 8 > threshold) writePixel(pixels, (y * width + x) * 4, inks.thread);
    }
  }
}

/** Mount a decorative canvas into a sized element with a data-weave spec. Returns its cleanup. */
export function mountWeave(element: HTMLElement) {
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  if (!win) return;
  const canvas = doc.createElement("canvas");
  const context = canvas.getContext("2d");
  const probe = doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context || !probe) return;

  canvas.setAttribute("aria-hidden", "true");
  element.append(canvas);

  const phone = win.matchMedia("(max-width: 600px)");
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const print = win.matchMedia("print");
  let printing = print.matches;
  let visible = false;
  let animation: number | undefined;
  let elapsed = 0;
  let lastFrame: number | undefined;
  let field: Field | undefined;
  let image: ImageData | undefined;
  let inks: WeaveInks;
  let line: string;
  let isPhone: boolean;

  function draw(time?: number) {
    if (!field || !image) return;
    paintWeave(field, inks, image.data, { time });
    context!.putImageData(image, 0, 0);
  }

  function canAnimate() {
    return field?.spec.live && field.spec.knot !== undefined && visible && !doc.hidden && !reduced.matches && !printing;
  }

  function tick(now: number) {
    animation = undefined;
    if (lastFrame === undefined || now - lastFrame >= 40) {
      if (lastFrame !== undefined) elapsed += (now - lastFrame) / 1000;
      lastFrame = now;
      draw(elapsed);
    }
    updateAnimation();
  }

  function updateAnimation() {
    if (canAnimate()) {
      animation ??= win!.requestAnimationFrame(tick);
    } else if (animation !== undefined) {
      win!.cancelAnimationFrame(animation);
      animation = lastFrame = undefined;
    }
  }

  function rgb(style: CSSStyleDeclaration, role: string): RGB {
    probe!.clearRect(0, 0, 1, 1);
    probe!.fillStyle = style.getPropertyValue(role).trim();
    probe!.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe!.getImageData(0, 0, 1, 1).data;
    return [r!, g!, b!];
  }

  function repaint() {
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) {
      field = undefined;
      updateAnimation();
      return;
    }
    const dpr = win!.devicePixelRatio;
    const cell = Math.max(1, Math.round(GRAIN * dpr)) / dpr;
    const width = Math.ceil(box.width / cell);
    const height = Math.ceil(box.height / cell);
    const spec = element.dataset.weave ?? "";
    const style = win!.getComputedStyle(element);
    const dark = style.colorScheme === "dark";
    inks = {
      dark,
      solid: rgb(style, dark ? "--ground" : "--key"),
      screen: rgb(style, dark ? "--foreground" : "--key"),
      thread: rgb(style, "--primary"),
    };
    if (!field || field.width !== width || field.height !== height || line !== spec || isPhone !== phone.matches) {
      line = spec;
      isPhone = phone.matches;
      field = prepareWeave(parseWeave(line), width, height, isPhone);
      canvas.width = width;
      canvas.height = height;
      image = context!.createImageData(width, height);
    }
    canvas.style.width = `${width * cell}px`;
    canvas.style.height = `${height * cell}px`;
    draw(reduced.matches || printing ? undefined : elapsed || undefined);
    updateAnimation();
  }

  const resize = new ResizeObserver(repaint);
  resize.observe(element);
  const mode = new MutationObserver(repaint);
  for (let scope: HTMLElement | null = element; scope; scope = scope.parentElement) {
    mode.observe(scope, { attributes: true, attributeFilter: ["class", "style", "data-theme", "data-weave"] });
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry!.isIntersecting;
    updateAnimation();
  });
  intersection.observe(element);

  let resolution: MediaQueryList;
  function watchResolution() {
    resolution?.removeEventListener("change", watchResolution);
    resolution = win!.matchMedia(`(resolution: ${win!.devicePixelRatio}dppx)`);
    resolution.addEventListener("change", watchResolution);
    repaint();
  }
  const beforePrint = () => {
    printing = true;
    repaint();
  };
  const afterPrint = () => {
    printing = false;
    repaint();
  };
  const printChanged = () => (print.matches ? beforePrint() : afterPrint());
  print.addEventListener("change", printChanged);
  win.addEventListener("beforeprint", beforePrint);
  win.addEventListener("afterprint", afterPrint);
  doc.addEventListener("visibilitychange", updateAnimation);
  phone.addEventListener("change", repaint);
  reduced.addEventListener("change", repaint);
  watchResolution();

  return () => {
    resize.disconnect();
    mode.disconnect();
    intersection.disconnect();
    resolution.removeEventListener("change", watchResolution);
    print.removeEventListener("change", printChanged);
    win.removeEventListener("beforeprint", beforePrint);
    win.removeEventListener("afterprint", afterPrint);
    doc.removeEventListener("visibilitychange", updateAnimation);
    phone.removeEventListener("change", repaint);
    reduced.removeEventListener("change", repaint);
    if (animation !== undefined) win.cancelAnimationFrame(animation);
    canvas.remove();
  };
}
