export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((rank) => (rank + 0.5) / 16);
export const GRAIN = 2;
export const DARK_CAP = 0.55;
export const LIGHT = { spread: 0.3, shade: 0.32, dim: 0.12, hold: 0.2, low: 0.22 };

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const linear = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
export function smooth(a: number, b: number, x: number) {
  const r = linear(a, b, x);
  return r * r * (3 - 2 * r);
}

export const RAMPS = {
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
} satisfies Record<string, { density: (r: number) => number; seam: number }>;

export type RGB = readonly [number, number, number];
export type ScreenInks = { solid: RGB; screen: RGB; thread: RGB; dark: boolean };

export function readScreenInks(style: CSSStyleDeclaration, probe: CanvasRenderingContext2D): ScreenInks {
  function rgb(role: string): RGB {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = style.getPropertyValue(role).trim();
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r!, g!, b!];
  }

  const dark = style.colorScheme === "dark";
  return {
    dark,
    solid: rgb(dark ? "--ground" : "--key"),
    screen: rgb(dark ? "--foreground" : "--key"),
    thread: rgb("--primary"),
  };
}
