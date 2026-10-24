// The face manifest: one set of woff2 files, served from one host. The tokens css points at
// https://superthread.mauricekleine.com/fonts/, the site at /fonts/. The licence class here is the only
// source for the font headers: OFL faces send `Access-Control-Allow-Origin: *`, ITF faces only to own origins.

export type Face = {
  file: string;
  family: "Unbounded" | "Supreme" | "Erode" | "Fragment Mono";
  weight: 300 | 400 | 500 | 600;
  style: "normal" | "italic";
  licence: "OFL" | "ITF FFL";
  acao: "*" | "own origins";
  // the site preloads the faces the first view prints
  preload: boolean;
};

export const fonts: readonly Face[] = [
  {
    file: "unbounded-300.woff2",
    family: "Unbounded",
    weight: 300,
    style: "normal",
    licence: "OFL",
    acao: "*",
    preload: true,
  },
  {
    file: "unbounded-400.woff2",
    family: "Unbounded",
    weight: 400,
    style: "normal",
    licence: "OFL",
    acao: "*",
    preload: false,
  },
  {
    file: "supreme-400.woff2",
    family: "Supreme",
    weight: 400,
    style: "normal",
    licence: "ITF FFL",
    acao: "own origins",
    preload: true,
  },
  {
    file: "supreme-500.woff2",
    family: "Supreme",
    weight: 500,
    style: "normal",
    licence: "ITF FFL",
    acao: "own origins",
    preload: true,
  },
  {
    file: "erode-400.woff2",
    family: "Erode",
    weight: 400,
    style: "normal",
    licence: "ITF FFL",
    acao: "own origins",
    preload: true,
  },
  {
    file: "erode-400-italic.woff2",
    family: "Erode",
    weight: 400,
    style: "italic",
    licence: "ITF FFL",
    acao: "own origins",
    preload: false,
  },
  {
    file: "erode-500.woff2",
    family: "Erode",
    weight: 500,
    style: "normal",
    licence: "ITF FFL",
    acao: "own origins",
    preload: false,
  },
  {
    file: "erode-600.woff2",
    family: "Erode",
    weight: 600,
    style: "normal",
    licence: "ITF FFL",
    acao: "own origins",
    preload: false,
  },
  {
    file: "fragment-mono-400.woff2",
    family: "Fragment Mono",
    weight: 400,
    style: "normal",
    licence: "OFL",
    acao: "*",
    preload: true,
  },
];

// One @font-face block per face, `base` ending in a slash.
export function fontFaces(base: string): string {
  if (!base.endsWith("/")) throw new Error(`font base must end in a slash: ${base}`);
  return fonts
    .map((face) =>
      [
        "@font-face {",
        `  font-family: "${face.family}";`,
        `  src: url("${base}${face.file}") format("woff2");`,
        `  font-weight: ${face.weight};`,
        `  font-style: ${face.style};`,
        "  font-display: swap;",
        "}",
      ].join("\n"),
    )
    .join("\n\n");
}
