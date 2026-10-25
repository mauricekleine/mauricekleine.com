// The @mk registry's item list. build-registry.ts reads it, derives every npm and @mk dependency
// from the files' imports (scripts/imports.ts), stamps the files and runs shadcn build.
// Only init and tokens list dependencies by hand: init has no files, and tokens' css imports
// packages that no TS file imports. Sources mirror their install targets under items/.

export type Tier = "style" | "brand" | "pass" | "lib" | "block";

// The apps a composition serves: the fleet apps whose screens repeat it.
export type App = "constellation" | "quanta" | "trisys" | "orbit" | "artifacts" | "www";

// The DETAILS keys in tokens/details.json (steer 4's component details), at most one per item.
export type TextureKey = "contact" | "mixed" | "tabhover" | "rowedge" | "disabled" | "skeleton";

export type FileType = "registry:file" | "registry:lib" | "registry:ui" | "registry:hook" | "registry:component";

export type CatalogFile = {
  // relative to packages/superthread
  path: string;
  type: FileType;
  target: string;
};

export type InitConfig = {
  style: string;
  rsc: boolean;
  tsx: boolean;
  iconLibrary: string;
  // build-registry.ts replaces the @mk URL with the base it builds for
  registries: { "@mk": string };
};

export type CatalogItem = {
  name: string;
  type:
    | "registry:base"
    | "registry:style"
    | "registry:item"
    | "registry:lib"
    | "registry:ui"
    | "registry:hook"
    | "registry:block";
  title: string;
  description: string;
  files: CatalogFile[];
  tier: Tier;
  // the base-nova item it is seeded from, or null
  upstream: string | null;
  texture?: TextureKey;
  // a block's apps, which build-registry.ts serves in its meta
  serves?: App[];
  extends?: "none";
  dependencies?: string[];
  registryDependencies?: string[];
  css?: Record<string, Record<string, never>>;
  config?: InitConfig;
};

const ui = (name: string): CatalogFile => ({
  path: `items/ui/${name}.tsx`,
  type: "registry:ui",
  target: `@components/superthread/ui/${name}.tsx`,
});

const block = (name: string): CatalogFile => ({
  path: `items/blocks/${name}.tsx`,
  type: "registry:component",
  target: `@components/superthread/blocks/${name}.tsx`,
});

const lib = (name: string): CatalogFile => ({
  path: `items/lib/${name}.ts`,
  type: "registry:lib",
  target: `@components/superthread/lib/${name}.ts`,
});

export const catalog: CatalogItem[] = [
  {
    name: "init",
    type: "registry:base",
    extends: "none",
    title: "init",
    description: "sets up an app for @mk: the base-nova style, the tokens, utils and the button",
    files: [],
    tier: "style",
    upstream: null,
    config: {
      style: "base-nova",
      rsc: false,
      tsx: true,
      iconLibrary: "phosphor",
      registries: { "@mk": "https://superthread.mauricekleine.com/r/{name}.json" },
    },
    dependencies: ["@base-ui/react@^1.8.0", "class-variance-authority@^0.7.1", "@phosphor-icons/react@^2.1.10"],
    registryDependencies: ["@mk/utils", "@mk/tokens", "@mk/button"],
  },
  {
    name: "tokens",
    type: "registry:style",
    extends: "none",
    title: "tokens",
    description: "the superthread theme: colour roles for light and dark, type, motion, shape and the texture tiles",
    files: [
      {
        path: "dist/v2/superthread.css",
        type: "registry:file",
        target: "@components/superthread/styles/superthread.css",
      },
    ],
    tier: "style",
    upstream: null,
    dependencies: ["tw-animate-css@^1.4.0", "shadcn@^4.22.1"],
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      '@import "./components/superthread/styles/superthread.css"': {},
    },
  },
  {
    name: "tokens-plain",
    type: "registry:item",
    title: "plain tokens",
    description: "the same tokens as plain css with no tailwind, and as a typed module",
    files: [
      {
        path: "dist/v2/superthread-plain.css",
        type: "registry:file",
        target: "@components/superthread/styles/superthread-plain.css",
      },
      lib("tokens"),
    ],
    tier: "lib",
    upstream: null,
  },
  {
    name: "utils",
    type: "registry:lib",
    title: "utils",
    description: "cn, with superthread's type steps taught to the class merger",
    files: [lib("utils")],
    tier: "lib",
    upstream: "utils",
  },
  {
    name: "fleet",
    type: "registry:lib",
    title: "fleet",
    description: "the six ships: ids, names, one-line descriptors, line-screen angles and mark file names",
    files: [lib("fleet")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "glyphs",
    type: "registry:ui",
    title: "glyphs",
    description: "the pixel icons and status glyphs, drawn as whole-pixel squares in the current colour",
    files: [ui("glyphs")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "button",
    type: "registry:ui",
    title: "button",
    description: "a button in the house ink, with secondary, outline, ghost, link and destructive variants",
    files: [ui("button")],
    tier: "brand",
    upstream: "button",
    texture: "disabled",
  },
  {
    name: "badge",
    type: "registry:ui",
    title: "badge",
    description: "a badge, with a status variant for each state: done, running, waiting, failed and queued",
    files: [ui("badge")],
    tier: "brand",
    upstream: "badge",
  },
  {
    name: "input",
    type: "registry:ui",
    title: "input",
    description: "a text field with the one focus edge",
    files: [ui("input")],
    tier: "brand",
    upstream: "input",
    texture: "disabled",
  },
  {
    name: "input-group",
    type: "registry:ui",
    title: "input group",
    description: "a field box that holds a text control with addons and buttons beside it",
    files: [ui("input-group")],
    tier: "brand",
    upstream: "input-group",
    texture: "disabled",
  },
  {
    name: "textarea",
    type: "registry:ui",
    title: "textarea",
    description: "a multi-line text field with the one focus edge",
    files: [ui("textarea")],
    tier: "brand",
    upstream: "textarea",
    texture: "disabled",
  },
  {
    name: "select",
    type: "registry:ui",
    title: "select",
    description: "a select whose trigger is a field and whose list is a raised layer",
    files: [ui("select")],
    tier: "brand",
    upstream: "select",
    texture: "contact",
  },
  {
    name: "dialog",
    type: "registry:ui",
    title: "dialog",
    description: "a square dialog on the sheet lift",
    files: [ui("dialog")],
    tier: "brand",
    upstream: "dialog",
    texture: "contact",
  },
  {
    name: "tabs",
    type: "registry:ui",
    title: "tabs",
    description: "tabs with a solid current tab",
    files: [ui("tabs")],
    tier: "brand",
    upstream: "tabs",
    texture: "tabhover",
  },
  {
    name: "table",
    type: "registry:ui",
    title: "table",
    description: "a table with mono ids and tabular numbers, and an edge beside the row under the pointer",
    files: [ui("table")],
    tier: "brand",
    upstream: "table",
    texture: "rowedge",
  },
  {
    name: "progress",
    type: "registry:ui",
    title: "progress",
    description: "a flat house-ink bar with a screened leading edge",
    files: [ui("progress")],
    tier: "brand",
    upstream: "progress",
  },
  {
    name: "toast",
    type: "registry:ui",
    title: "toast",
    description: "base ui toasts on the leaf lift, with a status glyph for each kind",
    files: [ui("toast")],
    tier: "brand",
    upstream: "toast",
    texture: "contact",
  },
  {
    name: "sidebar",
    type: "registry:ui",
    title: "sidebar",
    description: "the sidebar on the deep ground, with a boxed current item",
    files: [ui("sidebar")],
    tier: "brand",
    upstream: "sidebar",
  },
  {
    name: "fleet-rail",
    type: "registry:block",
    title: "fleet rail",
    description: "the rail of ship marks for moving between fleet surfaces; you pass the hrefs",
    files: [ui("fleet-rail")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "checkbox",
    type: "registry:ui",
    title: "checkbox",
    description: "a square checkbox with a screened mixed state",
    files: [ui("checkbox")],
    tier: "brand",
    upstream: "checkbox",
    texture: "mixed",
  },
  {
    name: "skeleton",
    type: "registry:ui",
    title: "skeleton",
    description: "loading rows, screened on whole-pixel bars",
    files: [ui("skeleton")],
    tier: "brand",
    upstream: "skeleton",
    texture: "skeleton",
  },
  {
    name: "switch",
    type: "registry:ui",
    title: "switch",
    description: "a square switch: the house ink when on, a key square that crosses the track",
    files: [ui("switch")],
    tier: "brand",
    upstream: "switch",
  },
  {
    name: "radio-group",
    type: "registry:ui",
    title: "radio group",
    description: "square radios: the chosen one boxed in the house ink with its 8 px square",
    files: [ui("radio-group")],
    tier: "brand",
    upstream: "radio-group",
  },
  {
    name: "slider",
    type: "registry:ui",
    title: "slider",
    description: "a slider on a ruled track, with a flat house-ink range and a square thumb",
    files: [ui("slider")],
    tier: "brand",
    upstream: "slider",
  },
  {
    name: "toggle",
    type: "registry:ui",
    title: "toggle",
    description: "a button that stays pressed, boxed in the house ink while it is on",
    files: [ui("toggle")],
    tier: "brand",
    upstream: "toggle",
  },
  {
    name: "toggle-group",
    type: "registry:ui",
    title: "toggle group",
    description: "toggles joined on shared 1 px edges, one or several pressed",
    files: [ui("toggle-group")],
    tier: "brand",
    upstream: "toggle-group",
  },
  {
    name: "button-group",
    type: "registry:ui",
    title: "button group",
    description: "buttons and fields joined on shared 1 px edges",
    files: [ui("button-group")],
    tier: "brand",
    upstream: "button-group",
  },
  {
    name: "kbd",
    type: "registry:ui",
    title: "kbd",
    description: "a key, set in mono in a 1 px box",
    files: [ui("kbd")],
    tier: "brand",
    upstream: "kbd",
  },
  {
    name: "dropdown-menu",
    type: "registry:ui",
    title: "dropdown menu",
    description: "a menu on the leaf lift, with checkbox, radio and sub-menu items",
    files: [ui("dropdown-menu")],
    tier: "brand",
    upstream: "dropdown-menu",
    texture: "contact",
  },
  {
    name: "combobox",
    type: "registry:ui",
    title: "combobox",
    description: "a field that filters a list on the leaf lift, for one value or several as chips",
    files: [ui("combobox")],
    tier: "brand",
    upstream: "combobox",
    texture: "contact",
  },
  {
    name: "command",
    type: "registry:ui",
    title: "command",
    description: "a command list with a search field, inline or in a dialog",
    files: [ui("command")],
    tier: "brand",
    upstream: "command",
  },
  {
    name: "alert-dialog",
    type: "registry:ui",
    title: "alert dialog",
    description: "a dialog that asks before an action, on the sheet lift",
    files: [ui("alert-dialog")],
    tier: "brand",
    upstream: "alert-dialog",
    texture: "contact",
  },
  {
    name: "sonner",
    type: "registry:ui",
    title: "sonner",
    description: "sonner's toaster in the toast's dress: the leaf lift and a status glyph for each kind",
    files: [ui("sonner")],
    tier: "brand",
    upstream: "sonner",
    texture: "contact",
  },
  {
    name: "accordion",
    type: "registry:ui",
    title: "accordion",
    description: "sections that open in place, ruled edge to edge",
    files: [ui("accordion")],
    tier: "brand",
    upstream: "accordion",
  },
  {
    name: "field",
    type: "registry:ui",
    title: "field",
    description: "labels, descriptions and errors around any control, with the bang before an error",
    files: [ui("field")],
    tier: "brand",
    upstream: "field",
  },
  {
    name: "native-select",
    type: "registry:ui",
    title: "native select",
    description: "the browser's own select in a field box",
    files: [ui("native-select")],
    tier: "brand",
    upstream: "native-select",
  },
  {
    name: "breadcrumb",
    type: "registry:ui",
    title: "breadcrumb",
    description: "the path to the page, in muted words with the current one in the first ink",
    files: [ui("breadcrumb")],
    tier: "brand",
    upstream: "breadcrumb",
  },
  {
    name: "resizable",
    type: "registry:ui",
    title: "resizable",
    description: "panels split by a 1 px rule you can drag, with an optional grip",
    files: [ui("resizable")],
    tier: "brand",
    upstream: "resizable",
  },
  {
    name: "collapsible",
    type: "registry:ui",
    title: "collapsible",
    description: "base-nova's collapsible, on the superthread tokens",
    files: [ui("collapsible")],
    tier: "pass",
    upstream: "collapsible",
  },
  {
    name: "card",
    type: "registry:ui",
    title: "card",
    description: "base-nova's card, on the superthread tokens",
    files: [ui("card")],
    tier: "pass",
    upstream: "card",
  },
  {
    name: "label",
    type: "registry:ui",
    title: "label",
    description: "base-nova's label, on the superthread tokens",
    files: [ui("label")],
    tier: "pass",
    upstream: "label",
  },
  {
    name: "separator",
    type: "registry:ui",
    title: "separator",
    description: "base-nova's separator, on the superthread tokens",
    files: [ui("separator")],
    tier: "pass",
    upstream: "separator",
  },
  {
    name: "sheet",
    type: "registry:ui",
    title: "sheet",
    description: "base-nova's sheet, on the superthread tokens",
    files: [ui("sheet")],
    tier: "pass",
    upstream: "sheet",
  },
  {
    name: "tooltip",
    type: "registry:ui",
    title: "tooltip",
    description: "base-nova's tooltip, on the superthread tokens",
    files: [ui("tooltip")],
    tier: "pass",
    upstream: "tooltip",
  },
  {
    name: "use-mobile",
    type: "registry:hook",
    title: "use mobile",
    description: "base-nova's hook that tells a phone-width viewport",
    files: [
      {
        path: "items/hooks/use-mobile.ts",
        type: "registry:hook",
        target: "@components/superthread/hooks/use-mobile.ts",
      },
    ],
    tier: "pass",
    upstream: "use-mobile",
  },
  // compositions: the patterns the fleet's apps repeat, composed from the items above
  {
    name: "page-header",
    type: "registry:block",
    title: "page header",
    description: "a page's title, with a way back, a lede, its meta and its actions",
    files: [block("page-header")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts", "www"],
  },
  {
    name: "states",
    type: "registry:block",
    title: "states",
    description: "what a collection shows while it loads, when it fails and when it is empty",
    files: [block("states")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
];
