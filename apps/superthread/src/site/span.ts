function spanMask(phone: boolean) {
  return (width: number, height: number) => {
    const mask = new Uint8Array(width * height);
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const rise = u * u * (3 - 2 * u);
      const centre = phone ? 0.7 - 0.29 * rise : 0.72 - 0.37 * rise;
      const halfWidth = (phone ? 0.073 : 0.072) + 0.048 * u;
      // The ribbon's upper edge carries the thread. Page stock fills everything below it.
      const edge = centre - halfWidth;
      for (let y = 0; y < height; y++) mask[y * width + x] = Number((y + 0.5) / height >= edge);
    }
    return mask;
  };
}

export const span = {
  desktop: {
    width: 1440,
    home: 324,
    slim: 120,
    line: "edge=mask side=bottom masky=.49 ramp=steady reach=.205 thread=1.15 knot=.51 knotr=6 spread=.28 tex=.39 pitch=6.4 seed=81 motion=knot travel=.18 duration=14",
    mask: spanMask(false),
  },
  phone: {
    width: 390,
    home: 203,
    slim: 96,
    line: "edge=mask side=bottom masky=.49 ramp=steady reach=.195 thread=1.05 knot=.50 knotr=4 spread=.31 tex=.33 pitch=5.8 seed=81 motion=knot travel=.18 duration=14",
    mask: spanMask(true),
  },
} as const;

export type SpanCrop = keyof typeof span;
export type OpenerKind = "home" | "slim";

export function spanPlate(kind: OpenerKind, crop: SpanCrop, mode: "light" | "dark", dpr: 1 | 2) {
  return `/opener/span-${kind}-${crop}-${mode}-${dpr}x.png`;
}
