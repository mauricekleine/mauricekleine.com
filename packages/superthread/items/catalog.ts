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
      registries: { "@mk": "https://superthread.mauricekleine.com/r/{name}.json" },
    },
    dependencies: ["@base-ui/react@^1.8.0", "class-variance-authority@^0.7.1"],
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
    description: "the ships: ids, names, one-line descriptors, rail membership, line-screen angles and mark file names",
    files: [lib("fleet")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "theme",
    type: "registry:lib",
    title: "theme",
    description: "the fleet's one light and dark choice: the script that sets it before paint, and its store",
    files: [lib("theme")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "time-words",
    type: "registry:lib",
    title: "time-words",
    description: "time in the fleet's words: since friday, before 11:00, 48 min until standup, every day at 07:00",
    files: [lib("time-words")],
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
    description:
      "a button in the house ink on paper and an outline off it, with secondary, outline, ghost, key, link and destructive variants",
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
    description: "a flat foreground bar with a screened leading edge",
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
    description: "the sidebar on the deep ground, with a neutral current item",
    files: [ui("sidebar")],
    tier: "brand",
    upstream: "sidebar",
  },
  {
    name: "fleet-rail",
    type: "registry:block",
    title: "fleet rail",
    description:
      "the rail of ship marks for moving between fleet surfaces; each ship links to its fleet url unless you pass an href",
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
    description: "a square switch: foreground when on, a stock square that crosses the track",
    files: [ui("switch")],
    tier: "brand",
    upstream: "switch",
  },
  {
    name: "radio-group",
    type: "registry:ui",
    title: "radio group",
    description: "square radios: the chosen one edged in foreground with its 8 px square",
    files: [ui("radio-group")],
    tier: "brand",
    upstream: "radio-group",
  },
  {
    name: "slider",
    type: "registry:ui",
    title: "slider",
    description: "a slider on a ruled track, with a flat foreground range and a square thumb",
    files: [ui("slider")],
    tier: "brand",
    upstream: "slider",
  },
  {
    name: "toggle",
    type: "registry:ui",
    title: "toggle",
    description: "a button that stays pressed, with a foreground edge and a tick while it is on",
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
  {
    name: "app-shell",
    type: "registry:block",
    title: "app shell",
    description: "a ship's frame: the fleet rail, the ship's own nav and the working panel on the deep ground",
    files: [block("app-shell")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
  {
    name: "section-header",
    type: "registry:block",
    title: "section header",
    description: "a section's head, with its count and a link to the rest",
    files: [block("section-header")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "www"],
  },
  {
    name: "search-palette",
    type: "registry:block",
    title: "search palette",
    description: "one search over everything, opened from its button or its key",
    files: [block("search-palette")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "artifacts"],
  },
  {
    name: "collection-toolbar",
    type: "registry:block",
    title: "collection toolbar",
    description: "the row above a collection: its filters, how many show, and how to view them",
    files: [block("collection-toolbar")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "orbit", "artifacts"],
  },
  {
    name: "list-rows",
    type: "registry:block",
    title: "list rows",
    description: "ruled rows, each a title with its time, a meta line and its actions",
    files: [block("list-rows")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "www"],
  },
  {
    name: "item-cards",
    type: "registry:block",
    title: "item cards",
    description: "a grid of cards, each a title with its status, meta and actions",
    files: [block("item-cards")],
    tier: "block",
    upstream: null,
    serves: ["trisys", "orbit", "artifacts", "www"],
  },
  {
    name: "data-table",
    type: "registry:block",
    title: "data table",
    description: "a table its heads sort, with chosen rows and a row for when it is empty",
    files: [block("data-table")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "artifacts"],
  },
  {
    name: "form-section",
    type: "registry:block",
    title: "form section",
    description: "a titled group of fields that saves or discards its changes",
    files: [block("form-section")],
    tier: "block",
    upstream: null,
    serves: ["quanta", "trisys", "orbit", "www"],
  },
  {
    name: "quick-add",
    type: "registry:block",
    title: "quick add",
    description: "one field and its button, for adding a thing by its name",
    files: [block("quick-add")],
    tier: "block",
    upstream: null,
    serves: ["trisys", "orbit", "www"],
  },
  {
    name: "facts",
    type: "registry:block",
    title: "facts",
    description: "labelled values in a ruled grid",
    files: [block("facts")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
  {
    name: "notice",
    type: "registry:block",
    title: "notice",
    description: "a flat notice in the flow: its status glyph, what happened and what to do",
    files: [block("notice")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "orbit", "artifacts"],
  },
];
