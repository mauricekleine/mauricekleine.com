// The ribbon's upper edge, as a fraction of the band's height at a fraction u of its width. It carries the thread,
// and page stock fills everything below it.
function spanEdge(phone: boolean, u: number) {
  const rise = u * u * (3 - 2 * u);
  const centre = phone ? 0.7 - 0.29 * rise : 0.72 - 0.37 * rise;
  const halfWidth = (phone ? 0.073 : 0.072) + 0.048 * u;
  return centre - halfWidth;
}

function spanMask(phone: boolean) {
  return (width: number, height: number) => {
    const mask = new Uint8Array(width * height);
    for (let x = 0; x < width; x++) {
      const edge = spanEdge(phone, (x + 0.5) / width);
      for (let y = 0; y < height; y++) mask[y * width + x] = Number((y + 0.5) / height >= edge);
    }
    return mask;
  };
}

// The page's column rules rise to the thread: the band below the desktop ribbon's upper edge, as a clip. The rules
// leave the band at 900 px, so the phone crop never needs one.
export const spanRulesClip = `polygon(${Array.from({ length: 33 }, (_, i) => {
  const u = i / 32;
  return `${(u * 100).toFixed(3)}% calc(${(spanEdge(false, u) * 100).toFixed(3)}% + var(--st-rules-drop))`;
}).join(", ")}, 100% 100%, 0 100%)`;

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
