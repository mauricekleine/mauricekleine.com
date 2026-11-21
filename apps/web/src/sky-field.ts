import { fieldScreen, paint, prepare } from "@/components/superthread/lib/field-core";
import { packedInks } from "@/components/superthread/lib/dot-screen";
import { GRAIN, smooth, type RGB } from "@/components/superthread/lib/screen-core";

const desktop =
  "edge=meander+crest base=.815 lift=.16 waves=2 settle=1.34 phase=.65 b.at=.64 b.lift=-.105 b.width=.17 ramp=held reach=.47 thread=1.25 knot=.23 knotr=6 tex=.85 pitch=5.4 spread=.29 seed=57 motion=filaments drift=.27 duration=22";
const mobile =
  "edge=meander+crest base=.835 lift=.118 waves=1 settle=1.26 phase=.57 b.at=.77 b.lift=-.085 b.width=.25 ramp=held reach=.325 thread=1.15 knot=.25 knotr=5 tex=.64 pitch=6.4 spread=.235 seed=57 motion=filaments drift=.23 duration=22";

function makeStars(width: number, height: number) {
  let seed = 57;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const count = Math.min(220, Math.round((width * height * GRAIN ** 2) / 900));
  return Array.from({ length: count }, () => ({
    depth: 0.3 + random() * 0.7,
    x: random() * width,
    y: random() * height,
    size: random() < 0.06 ? 1 : 0,
    alpha: 0.35 + random() * 0.65,
    phase: random() * Math.PI * 2,
    speed: 0.4 + random() * 1.1,
    drift: 0.0012 + random() * 0.003,
  }));
}

export function prepareSky(width: number, height: number, dpr: number, phone: boolean, pixels: Uint32Array) {
  const art = prepare(phone ? mobile : desktop, Math.round(width / dpr), Math.round(height / dpr));
  const raster = fieldScreen(art, dpr, width, height);
  const stars = makeStars(art.w, art.h);
  const scaleX = width / art.w;
  const scaleY = height / art.h;

  function centre(x: number, y: number) {
    return Math.floor((y + 0.5) * scaleY) * width + Math.floor((x + 0.5) * scaleX);
  }

  function distance(x: number, y: number) {
    if (x < 0 || y < 0 || x >= art.w || y >= art.h || pixels[centre(x, y)] !== 0) return 0;
    return art.staticGeometry.sd[y * art.w + x]!;
  }

  function dot(x: number, y: number, ink: number, density = 1, spot = false) {
    if (x < 0 || y < 0 || x >= art.w || y >= art.h) return;
    const right = Math.round((x + 1) * scaleX);
    const bottom = Math.round((y + 1) * scaleY);
    const left = Math.round(x * scaleX);
    const thresholds = spot ? raster.plum : raster.key;
    for (let py = Math.round(y * scaleY); py < bottom; py++) {
      for (let px = left; px < right; px++) {
        const i = py * width + px;
        if (density * 256 > thresholds[i]! + 0.5) pixels[i] = ink;
      }
    }
  }

  function drawStar(x: number, y: number, size: number, ink: number) {
    dot(x, y, ink);
    for (let r = 1; r <= size; r++) {
      if (distance(x - r, y) > 0) dot(x - r, y, ink);
      if (distance(x + r, y) > 0) dot(x + r, y, ink);
      if (distance(x, y - r) > 0) dot(x, y - r, ink);
      if (distance(x, y + r) > 0) dot(x, y + r, ink);
    }
  }

  let palette: Uint32Array;
  let first: number;
  function setInks(screen: RGB, thread: RGB, star: RGB) {
    palette = packedInks([undefined, screen, thread, undefined, star]);
    first = palette[4]!;
  }

  function draw(t: number, animate: boolean, pointerX = 0, pointerY = 0, boost = 0) {
    paint(art, "dark", t / 1000, pixels, raster, palette);
    for (const s of stars) {
      const twinkle = animate ? 0.72 + 0.28 * Math.sin(s.phase + (t / 1000) * s.speed) : 0.85;
      const drift = animate ? ((t * s.drift * s.depth) / GRAIN) % (art.h + 4) : 0;
      const x = Math.round(s.x + (animate ? (pointerX * 10 * s.depth) / GRAIN : 0));
      let y = s.y - drift;
      if (y < -2) y += art.h + 4;
      y = Math.round(y + (animate ? (pointerY * 6 * s.depth) / GRAIN : 0));
      const sd = distance(x, y);
      if (sd <= 0 || s.depth > 0.3 + 0.7 * smooth(0, art.spec.reach, sd)) continue;
      if (s.size === 0 && s.alpha * twinkle * 256 <= raster.key[centre(x, y)]! + 0.5) continue;
      drawStar(x, y, s.size + (boost > 0.35 ? 1 : 0), first);
    }
  }

  return { art, dot, draw, setInks };
}
