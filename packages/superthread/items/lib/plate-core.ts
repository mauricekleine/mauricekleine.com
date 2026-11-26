export type BreathStrength = "off" | "gentle" | "balanced" | "vivid";
export type PlateKind = "planes" | "grid";
export type PlateDraw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export type PlateSpec = {
  kind: PlateKind;
  ratios: number[];
  cols: number;
  rows: number;
  seed: number;
  flip: boolean;
  shelf: number;
  cutout: boolean;
  positive?: boolean;
  breath: BreathStrength;
  pitch: number;
};

export type PaintOptions = {
  breath: BreathStrength;
  seconds?: number;
  phaseOffset?: number;
  positive?: boolean;
};

type RGB = readonly [number, number, number];
type PlateInks = {
  dark: boolean;
  stock: RGB;
  ink: RGB;
  plum: RGB;
};

const TAU = Math.PI * 2;
export const PLATE_PITCH = 3.5;
export const PLATE_ANGLES = { key: 45, plum: 15 } as const;

const BREATH: Record<BreathStrength, { lum: number; plum: number; sec: number }> = {
  off: { lum: 0, plum: 0, sec: 12 },
  gentle: { lum: 0.14, plum: 0.2, sec: 11 },
  balanced: { lum: 0.22, plum: 0.34, sec: 9.5 },
  vivid: { lum: 0.32, plum: 0.48, sec: 8 },
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

  const bool = (key: string): boolean | undefined => {
    if (!pairs.has(key)) return undefined;
    const raw = pairs.get(key)?.toLowerCase();
    if (raw === undefined || raw === "1" || raw === "true" || raw === "yes" || raw === "on") return true;
    if (raw === "0" || raw === "false" || raw === "no" || raw === "off") return false;
    return undefined;
  };

  const positive = bool("positive");

  return {
    kind,
    ratios,
    cols: Math.round(num("cols", 6, 2, 16)),
    rows: Math.round(num("rows", 4, 2, 12)),
    seed: Math.round(num("seed", 1, 0, 2147483647)),
    flip: pairs.has("flip"),
    shelf: num("shelf", 0.56, 0, 0.9),
    cutout: bool("cutout") ?? true,
    ...(positive !== undefined ? { positive } : {}),
    breath,
    pitch: num("pitch", PLATE_PITCH, 2, 8),
  };
}

function readPlateInks(style: CSSStyleDeclaration, probe: CanvasRenderingContext2D): PlateInks {
  function rgb(role: string, fallback: RGB): RGB {
    const value = style.getPropertyValue(role).trim();
    if (!value) return fallback;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = value;
    probe.fillRect(0, 0, 1, 1);
    const data = probe.getImageData(0, 0, 1, 1).data;
    return [data[0] ?? fallback[0], data[1] ?? fallback[1], data[2] ?? fallback[2]];
  }

  const dark = style.colorScheme === "dark";
  return {
    dark,
    stock: rgb("--background", dark ? [22, 24, 29] : [255, 255, 255]),
    ink: rgb(dark ? "--foreground" : "--key", dark ? [231, 231, 231] : [22, 24, 29]),
    plum: rgb("--primary", dark ? [192, 116, 161] : [170, 51, 122]),
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

/** Draw a blocky no-photo tonal composition (proportional planes or architectural grid). */
export function drawPlateGeometry(ctx: CanvasRenderingContext2D, spec: PlateSpec, w: number, h: number) {
  if (spec.kind === "grid") {
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, w, h);
    const cw = w / spec.cols;
    const ch = h / spec.rows;
    for (let r = 0; r < spec.rows; r++) {
      for (let c = 0; c < spec.cols; c++) {
        const colIndex = spec.flip ? spec.cols - 1 - c : c;
        const idx = r * spec.cols + colIndex;
        const diag = (colIndex / Math.max(1, spec.cols - 1) + r / Math.max(1, spec.rows - 1)) * 0.5;
        const jitter = (hash(idx + 3, spec.seed) - 0.5) * 0.44;
        const tone = clamp(0.92 - diag * 0.72 + jitter, 0.08, 0.97);
        const v = Math.round(tone * 255);
        const v2 = Math.max(18, v - 34);
        const g = ctx.createLinearGradient(c * cw, r * ch, (c + 1) * cw, (r + 1) * ch);
        g.addColorStop(0, `rgb(${v},${v},${v})`);
        g.addColorStop(1, `rgb(${v2},${v2},${v2})`);
        ctx.fillStyle = g;
        ctx.fillRect(c * cw, r * ch, Math.max(1, cw - 1), Math.max(1, ch - 1));
      }
    }
    return;
  }

  // Proportional vertical planes with a stepped tonal shelf and crisp light window.
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, w, h);
  const total = spec.ratios.reduce((sum, n) => sum + n, 0) || 1;
  const count = spec.ratios.length;
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const bw = (spec.ratios[i]! / total) * w;
    const x = spec.flip ? w - cursor - bw : cursor;
    cursor += bw;
    const step = i / Math.max(1, count - 1);
    const jitter = (hash(i + 5, spec.seed) - 0.5) * 0.1;
    const topL = clamp(0.88 - step * 0.78 + jitter, 0.09, 0.95);
    const botL = clamp(topL + 0.14, 0.14, 0.98);
    const t0 = Math.round(topL * 255);
    const t1 = Math.round(botL * 255);
    const g = ctx.createLinearGradient(x, 0, x, h);
    g.addColorStop(0, `rgb(${t0},${t0},${t0})`);
    g.addColorStop(1, `rgb(${t1},${t1},${t1})`);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, Math.ceil(bw) + 1, h);
  }
  if (spec.shelf > 0) {
    const sy = h * spec.shelf;
    const sw = w * (0.58 + 0.22 * hash(19, spec.seed));
    const sx = spec.flip ? w - sw : 0;
    const sg = ctx.createLinearGradient(sx, sy, sx + sw, h);
    sg.addColorStop(0, "rgba(22,24,29,0.68)");
    sg.addColorStop(0.55, "rgba(22,24,29,0.30)");
    sg.addColorStop(1, "rgba(22,24,29,0.06)");
    ctx.fillStyle = sg;
    ctx.fillRect(sx, sy, sw, h - sy);
  }
  if (spec.cutout) {
    const wx = w * (spec.flip ? 0.62 : 0.14);
    const wy = h * (0.14 + 0.12 * hash(29, spec.seed));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(wx, wy, w * 0.18, h * 0.26);
  }
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
  out: Uint8ClampedArray,
  options: PaintOptions = { breath: "vivid" },
) {
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
    const sR = inks.stock[0],
      sG = inks.stock[1],
      sB = inks.stock[2];
    const kR = inks.ink[0] / 255,
      kG = inks.ink[1] / 255,
      kB = inks.ink[2] / 255;
    const pR = inks.plum[0] / 255,
      pG = inks.plum[1] / 255,
      pB = inks.plum[2] / 255;
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

        let pr = sR / 255,
          pg = sG / 255,
          pb = sB / 255;
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
        const o = idx * 4;
        out[o] = (pr * 255) | 0;
        out[o + 1] = (pg * 255) | 0;
        out[o + 2] = (pb * 255) | 0;
        out[o + 3] = 255;
      }
    }
    return;
  }

  // Dark mode: calm white dots at rest (~48% abstract, ~52% positive photo) on key stock, illuminated upward by light
  // breath + dark plum overprint. Real photos use positive polarity so highlights stay bright and shadows stay dark.
  const positive = Boolean(options.positive);
  const restScale = positive ? 0.52 : 0.48;
  const bgR = inks.stock[0],
    bgG = inks.stock[1],
    bgB = inks.stock[2];
  const fgR = inks.ink[0],
    fgG = inks.ink[1],
    fgB = inks.ink[2];
  const plR = inks.plum[0],
    plG = inks.plum[1],
    plB = inks.plum[2];
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
      const inkPresence = positive ? smoothstep(0.04, 0.22, baseLum) : smoothstep(0.96, 0.78, baseLum);
      const wave = active ? gxArr[x]! * gy * inkPresence : 0;

      const ink = positive ? Math.pow(clamp(baseLum * 1.04 - 0.02), 0.9) : clamp((1 - baseLum) * 1.04 - 0.02);
      const whiteTone = clamp(ink * restScale + lumSwing * 1.15 * wave * (0.35 + 0.65 * ink), 0, 0.88);
      const midBand = Math.max(0, 1 - Math.abs(ink - 0.48) * 2.2);
      const plumTone = clamp(midBand * 0.34 + s * 0.28 + plumSwing * 1.05 * wave * (0.4 + 0.6 * ink), 0, 0.82);

      let pr = bgR,
        pg = bgG,
        pb = bgB;
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
      const o = idx * 4;
      out[o] = pr | 0;
      out[o + 1] = pg | 0;
      out[o + 2] = pb | 0;
      out[o + 3] = 255;
    }
  }
}

let plateSequence = 0;

/** Mount a 3.5 px proof halftone canvas inside a sized host element carrying data-plate or data-plate-src. */
export function mountPlate(element: HTMLElement, draw?: PlateDraw) {
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  if (!win) return;

  const canvas = doc.createElement("canvas");
  const context = canvas.getContext("2d");
  const probe = doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const offscreen = doc.createElement("canvas");
  const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!context || !probe || !offCtx) return;

  if (win.getComputedStyle(element).position === "static") element.style.position = "relative";
  element.style.overflow = "hidden";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
  });
  element.append(canvas);

  const motion = win.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motion.matches;
  const print = win.matchMedia("print");
  let printing = print.matches;
  const phaseOffset = (plateSequence++ % 7) * 1.15;

  let visible = true;
  let disposed = false;
  let animation: number | undefined;
  let elapsed = 0;
  let lastFrame: number | undefined;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let pitch = PLATE_PITCH;
  let gridK: Float32Array | undefined;
  let gridP: Float32Array | undefined;
  let lumMap: Float32Array | undefined;
  let satMap: Float32Array | undefined;
  let image: ImageData | undefined;
  let inks: PlateInks;
  let spec: PlateSpec;
  let loadedSrc = "";
  let loadedImage: HTMLImageElement | undefined;
  let subjectKey = "";
  let usingImage = false;

  function activeBreath(): BreathStrength {
    if (reduced || printing || element.hasAttribute("data-plate-still")) return "off";
    const attr = element.dataset.plateBreath;
    if (attr === "off" || attr === "gentle" || attr === "balanced" || attr === "vivid") return attr;
    return spec?.breath ?? "vivid";
  }

  function isPositive(): boolean {
    const attr = element.dataset.platePositive?.trim().toLowerCase();
    if (attr === "1" || attr === "true" || attr === "yes" || attr === "on") return true;
    if (attr === "0" || attr === "false" || attr === "no" || attr === "off") return false;
    if (spec?.positive !== undefined) return spec.positive;
    return usingImage;
  }

  function resolveSourceImage(): HTMLImageElement | undefined {
    const src = element.dataset.plateSrc?.trim() ?? "";
    if (src) {
      if (src !== loadedSrc) {
        loadedSrc = src;
        const img = new win!.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          subjectKey = "";
          if (!disposed) repaint();
        };
        img.src = src;
        loadedImage = img;
      }
      return loadedImage;
    }
    const child = element.querySelector<HTMLImageElement>("img");
    if (child) {
      child.style.opacity = "0";
      child.style.pointerEvents = "none";
      if (!child.complete) {
        child.addEventListener(
          "load",
          () => {
            subjectKey = "";
            if (!disposed) repaint();
          },
          { once: true },
        );
      }
      return child;
    }
    return undefined;
  }

  function sampleSubject(targetW: number, targetH: number) {
    const img = resolveSourceImage();
    const nextKey = `${element.dataset.plate ?? ""}|${img?.currentSrc || img?.src || ""}|${Boolean(img?.complete && img?.naturalWidth)}|${Boolean(draw)}|${targetW}x${targetH}`;
    if (nextKey === subjectKey && lumMap && satMap) return;
    subjectKey = nextKey;

    offscreen.width = targetW;
    offscreen.height = targetH;
    offCtx!.clearRect(0, 0, targetW, targetH);
    if (draw) {
      usingImage = false;
      draw(offCtx!, targetW, targetH);
    } else if (img && img.complete && img.naturalWidth > 0) {
      usingImage = true;
      const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      offCtx!.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
    } else {
      usingImage = false;
      drawPlateGeometry(offCtx!, spec, targetW, targetH);
    }

    const px = offCtx!.getImageData(0, 0, targetW, targetH).data;
    const count = targetW * targetH;
    lumMap = new Float32Array(count);
    satMap = new Float32Array(count);
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
  }

  function render(seconds?: number) {
    if (!image || !gridK || !gridP || !lumMap || !satMap) return;
    paintProofPlate(lumMap, satMap, gridK, gridP, w, h, inks, image.data, {
      breath: activeBreath(),
      seconds,
      phaseOffset,
      positive: isPositive(),
    });
    context!.putImageData(image, 0, 0);
  }

  function canAnimate() {
    return !disposed && activeBreath() !== "off" && visible && !doc.hidden && w > 0 && h > 0;
  }

  function tick(now: number) {
    animation = undefined;
    if (!canAnimate()) {
      lastFrame = undefined;
      return;
    }
    if (lastFrame === undefined || now - lastFrame >= 33) {
      if (lastFrame !== undefined) elapsed += (now - lastFrame) / 1000;
      lastFrame = now;
      render(elapsed);
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

  function repaint() {
    if (disposed) return;
    const box = element.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) {
      w = h = 0;
      updateAnimation();
      return;
    }
    spec = parsePlate(element.dataset.plate ?? "");
    inks = readPlateInks(win!.getComputedStyle(element), probe!);
    const nextDpr = Math.min(win!.devicePixelRatio || 1, 1.5);
    const nextW = Math.max(2, Math.round(box.width * nextDpr));
    const nextH = Math.max(2, Math.round(box.height * nextDpr));
    if (nextW !== w || nextH !== h || nextDpr !== dpr || spec.pitch !== pitch || !image) {
      w = nextW;
      h = nextH;
      dpr = nextDpr;
      pitch = spec.pitch;
      canvas.width = w;
      canvas.height = h;
      image = context!.createImageData(w, h);
      gridK = buildPlateGrid(w, h, dpr, PLATE_ANGLES.key, pitch);
      gridP = buildPlateGrid(w, h, dpr, PLATE_ANGLES.plum, pitch);
    }
    sampleSubject(w, h);
    render(activeBreath() === "off" ? undefined : elapsed);
    updateAnimation();
  }

  const resize = new ResizeObserver(repaint);
  resize.observe(element);
  const observer = new MutationObserver(repaint);
  for (let scope: HTMLElement | null = element; scope; scope = scope.parentElement) {
    observer.observe(scope, {
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "data-theme",
        "data-plate",
        "data-plate-src",
        "data-plate-breath",
        "data-plate-still",
        "data-plate-positive",
      ],
    });
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    updateAnimation();
  });
  intersection.observe(element);

  const beforePrint = () => {
    printing = true;
    repaint();
  };
  const afterPrint = () => {
    printing = false;
    repaint();
  };
  const printChanged = () => (print.matches ? beforePrint() : afterPrint());
  const motionChanged = (event: MediaQueryListEvent) => {
    reduced = event.matches;
    repaint();
  };
  print.addEventListener("change", printChanged);
  win.addEventListener("beforeprint", beforePrint);
  win.addEventListener("afterprint", afterPrint);
  doc.addEventListener("visibilitychange", updateAnimation);
  motion.addEventListener("change", motionChanged);
  repaint();

  return () => {
    disposed = true;
    resize.disconnect();
    observer.disconnect();
    intersection.disconnect();
    print.removeEventListener("change", printChanged);
    win.removeEventListener("beforeprint", beforePrint);
    win.removeEventListener("afterprint", afterPrint);
    doc.removeEventListener("visibilitychange", updateAnimation);
    motion.removeEventListener("change", motionChanged);
    if (animation !== undefined) win.cancelAnimationFrame(animation);
    canvas.remove();
  };
}
