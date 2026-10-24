// The scales tokens.json does not hold as values: type, motion, shape, rows, the code ring offset and the
// shadow inks. Every entry cites where it comes from: M is the master world (worlds/master), and
// tokens/master.json is its tokens.json, vendored. test/tokens.test.ts checks each master.json citation.

export type Family = "sans" | "serif" | "mono" | "display";

export type TypeStep = {
  name: string;
  size: number;
  line: number;
  tracking?: string;
  caps?: true;
  family: Family;
  weight: number;
  phone?: { size: number; line: number; from: string };
  from: string;
};

// P2's step names, plus summary, subtitle, lede and title, which the master prints too.
export const steps: TypeStep[] = [
  {
    name: "meta",
    size: 11,
    line: 14,
    tracking: "0.14em",
    caps: true,
    family: "mono",
    weight: 400,
    from: "M/src/reach.css .lg",
  },
  { name: "instrument", size: 13, line: 20, family: "sans", weight: 400, from: "M/src/reach.css .note" },
  { name: "ui", size: 14, line: 21, family: "sans", weight: 400, from: "M/src/reach.css body (14px/1.5)" },
  { name: "summary", size: 15, line: 24, family: "sans", weight: 400, from: "M/src/reach.css .sh p" },
  { name: "subtitle", size: 18, line: 24, family: "sans", weight: 500, from: "M/src/reach.css .dialog h3" },
  {
    name: "read",
    size: 19,
    line: 32,
    family: "serif",
    weight: 400,
    phone: { size: 18, line: 30, from: "M/src/reach.css .sheet p.r in @media (max-width:900px)" },
    from: "M/src/reach.css .sheet p.r",
  },
  {
    name: "lede",
    size: 21,
    line: 33,
    family: "serif",
    weight: 400,
    phone: { size: 19, line: 31, from: "M/src/reach.css .lede" },
    from: "M/sketch.html .lede",
  },
  {
    name: "title",
    size: 22,
    line: 28,
    tracking: "-0.02em",
    family: "display",
    weight: 300,
    from: "M/src/reach.css .tk h3",
  },
  {
    name: "section",
    size: 30,
    line: 34,
    tracking: "-0.03em",
    family: "display",
    weight: 300,
    from: "M/src/reach.css .sh h2",
  },
  {
    name: "page",
    size: 34,
    line: 40,
    tracking: "-0.01em",
    family: "serif",
    weight: 600,
    phone: { size: 28, line: 34, from: "M/src/reach.css .sheet h3 in @media (max-width:900px)" },
    from: "M/src/reach.css .sheet h3",
  },
  {
    name: "hero",
    size: 64,
    line: 68,
    tracking: "-0.04em",
    family: "display",
    weight: 300,
    phone: { size: 52, line: 56, from: "M/src/reach.css .intro h1 in @media (max-width:900px)" },
    from: "M/src/reach.css .intro h1",
  },
  {
    name: "display",
    size: 76,
    line: 80,
    tracking: "-0.04em",
    family: "display",
    weight: 300,
    from: "M/sketch.html h1",
  },
];

// The phone override applies at this width and below. The master sets these sizes in its 900 px block; the
// site keeps them for phones, the width its band plates and tab strips fold at.
export const phone = { maxWidth: 600, from: "M/src/reach.css @media (max-width:600px), the phone block" };

export const wordmark = {
  family: "display" as Family,
  weight: 400,
  tracking: "-0.02em",
  from: "M/src/reach.css .brand",
};

export const stacks: Record<Family, { value: string; from: string }> = {
  sans: { value: '"Supreme", ui-sans-serif, system-ui, sans-serif', from: "tokens/master.json fonts.ui" },
  serif: { value: '"Erode", ui-serif, Georgia, serif', from: "tokens/master.json fonts.reading" },
  mono: { value: '"Fragment Mono", ui-monospace, monospace', from: "tokens/master.json fonts.mono" },
  display: { value: '"Unbounded", ui-sans-serif, sans-serif', from: "tokens/master.json fonts.display" },
};

export const motion = {
  instant: { value: "120ms", from: "M/src/reach.css .btn (transition .12s)" },
  // the master moves the rail cell, its tab and the switch at .16s; the fleet's step is 180ms
  quick: { value: "180ms", from: "M/src/reach.css .tip, .rb and .sw (transition .16s)" },
  // the master has no travel; the fleet's third step, for anything that crosses the page
  travel: { value: "240ms", from: "M/src/reach.css: no travel transition, the fleet's step" },
  ease: { value: "cubic-bezier(0.22, 1, 0.36, 1)", from: "M/src/reach.css :root --ease" },
};

export const radius = { value: "0px", from: "tokens/master.json shape.radius" };

export const rows = {
  board: { value: 56, from: "tokens/master.json space.rows.board" },
  table: { value: 48, from: "tokens/master.json space.rows.table" },
  nav: { value: 32, from: "tokens/master.json space.rows.nav item" },
};

export const codeRingOffset = { value: "-4px", from: "tokens/master.json code.ring offset" };

// The soft rake's alpha and the contact shadow's, per mode. Light inks the key printed twice, dark inks black.
export const shadowInk = {
  light: { ink: "#020203", rake: 0.62, contact: 0.3, from: "tokens/master.json shadow.light colour" },
  dark: { ink: "#000000", rake: 0.85, contact: 0.4, from: "tokens/master.json shadow.dark colour" },
};
