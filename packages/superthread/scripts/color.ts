// Colour maths for the tokens, ported from the master's ink.py (vendored at scripts/texture/master/ink.py)
// and check.py: sRGB and linear light, OKLab and OKLCH, the Murray-Davies tint, WCAG contrast and the
// OKLab distance. Every rounding step matches Python's, so a computed hex equals the master's printed one.

export type Rgb = [number, number, number];

// Python's round(): halves go to the even neighbour.
export function roundHalfEven(x: number): number {
  const f = Math.floor(x);
  const d = x - f;
  if (d > 0.5) return f + 1;
  if (d < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(c: number): number {
  const v = Math.min(1, Math.max(0, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}

export function hexToRgb(hex: string): Rgb {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a 6-digit hex colour: ${hex}`);
  const h = m[1]!;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

export function rgbToHex(rgb: Rgb): string {
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function hexToLinear(hex: string): Rgb {
  return hexToRgb(hex).map((v) => srgbToLinear(v / 255)) as Rgb;
}

export function linearToHex(lin: Rgb): string {
  return rgbToHex(lin.map((v) => roundHalfEven(linearToSrgb(v) * 255)) as Rgb);
}

const cbrt = (v: number) => Math.sign(v) * Math.abs(v) ** (1 / 3);

export function linearToOklch(lin: Rgb): [number, number, number] {
  const [r, g, b] = lin;
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const [l_, m_, s_] = [cbrt(l), cbrt(m), cbrt(s)];
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const h = (((Math.atan2(bb, a) * (180 / Math.PI)) % 360) + 360) % 360;
  return [L, Math.hypot(a, bb), h];
}

export function oklchToLinear(L: number, C: number, h: number): Rgb {
  const rad = h * (Math.PI / 180);
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, m, s] = [l_ ** 3, m_ ** 3, s_ ** 3];
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToOklch(hex: string): [number, number, number] {
  return linearToOklch(hexToLinear(hex));
}

// OKLab through OKLCH, as check.py's oklab() does.
export function hexToOklab(hex: string): [number, number, number] {
  const [L, C, h] = hexToOklch(hex);
  const rad = h * (Math.PI / 180);
  return [L, C * Math.cos(rad), C * Math.sin(rad)];
}

export function oklchToHex(L: number, C: number, h: number): string {
  return linearToHex(oklchToLinear(L, C, h));
}

const fixed = (v: number, digits: number) => String(Number(v.toFixed(digits)));

// The emitted form: L and C to 4 decimals, h to 2, achromatic hues as 0, alpha after a slash.
export function oklchParts(hex: string): [string, string, string] {
  const [r, g, b] = hexToRgb(hex);
  const [L, C, h] = hexToOklch(hex);
  const grey = r === g && g === b;
  const c = grey ? "0" : fixed(C, 4);
  return [fixed(L, 4), c, grey || c === "0" ? "0" : fixed(h, 2)];
}

export function oklchCss(hex: string, alpha?: number): string {
  const [L, C, h] = oklchParts(hex);
  return alpha === undefined ? `oklch(${L} ${C} ${h})` : `oklch(${L} ${C} ${h} / ${alpha})`;
}

// Reads back what oklchCss writes: [L, C, h, alpha].
export function parseOklch(css: string): [number, number, number, number] {
  const m = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/.exec(css.trim());
  if (!m) throw new Error(`not an emitted oklch() colour: ${css}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

export function oklchCssToHex(css: string): string {
  const [L, C, h] = parseOklch(css);
  return oklchToHex(L, C, h);
}

// pct of `over` printed on `under`, mixed in linear light (Murray-Davies), as ink.py's tint(ink, stock, t).
export function tint(over: string, under: string, pct: number): string {
  const t = pct / 100;
  const i = hexToLinear(over);
  const s = hexToLinear(under);
  return linearToHex([0, 1, 2].map((k) => s[k]! * (1 - t) + i[k]! * t) as Rgb);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToLinear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG 2 contrast ratio.
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

// OKLab distance times 100, as check.py's de().
export function de(a: string, b: string): number {
  const [p, q] = [hexToOklab(a), hexToOklab(b)];
  return 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

// CIE lightness L*, as the master's tokens.l_star().
export function lStar(hex: string): number {
  const y = luminance(hex);
  return y > 216 / 24389 ? 116 * y ** (1 / 3) - 16 : (y * 24389) / 27;
}

// `ink` at `alpha` over `ground`, composited in 8-bit sRGB as a browser draws a shadow (tokens.under_shadow).
export function over(ground: string, ink: string, alpha: number): string {
  const g = hexToRgb(ground);
  const s = hexToRgb(ink);
  return rgbToHex(g.map((v, k) => roundHalfEven(v * (1 - alpha) + s[k]! * alpha)) as Rgb);
}
