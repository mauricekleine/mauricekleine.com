// The @mk registry's item list. build-registry.ts reads it, derives every npm and @mk dependency
// from the files' imports (scripts/imports.ts), stamps the files and runs shadcn build.
// Items list dependencies by hand when imports cannot express them. Sources mirror their install targets under items/.

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

const file = (path: string): CatalogFile => ({
  path: `items/${path}`,
  type: "registry:file",
  target: `@components/superthread/${path}`,
});

export const docSectionGroups = {
  openers: ["opener", "sheet-head", "chapter", "hero", "slim-head", "band"],
  lines: ["meta-line", "contents", "lede", "section-head", "steps", "rows", "timeline", "sources"],
  blocks: ["claim", "stat-row", "table", "figure", "before-and-after", "notice", "decisions", "transcript"],
  endings: ["closing-line", "footer", "draft-strip", "chip", "mode-toggle", "notes-toggle"],
} as const;

export const catalog: CatalogItem[] = [
  {
    name: "init",
    type: "registry:base",
    extends: "none",
    title: "Init",
    description: "Sets up an app for @mk: the base-nova style, the tokens, utils and the button",
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
    title: "Tokens",
    description: "The Superthread theme: colour roles for light and dark, type, motion, shape and the texture tiles",
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
    title: "Plain tokens",
    description: "The same tokens as plain CSS with no Tailwind, and as a typed module",
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
    name: "doc",
    type: "registry:item",
    title: "Doc",
    description:
      "Plain HTML document sections, their stylesheet, a mode control, the 3.5 px proof halftone plate runtime, draft highlight notes and the weave runtime",
    files: [
      file("styles/doc.css"),
      file("doc/mode.js"),
      file("doc/plate.js"),
      file("doc/notes.js"),
      file("doc/weave.js"),
      lib("doc-notes"),
      ...Object.values(docSectionGroups)
        .flat()
        .map((name) => file(`doc/sections/${name}.html`)),
    ],
    tier: "lib",
    upstream: null,
    registryDependencies: ["@mk/tokens-plain"],
  },
  {
    name: "doc-react",
    type: "registry:item",
    title: "Documents in React",
    description:
      "React sections for reports and briefs, with the same markup and stylesheet as the plain HTML sections",
    files: [ui("doc-react")],
    tier: "lib",
    upstream: null,
    registryDependencies: ["@mk/doc"],
  },
  {
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "cn, with Superthread's type steps taught to the class merger",
    files: [lib("utils")],
    tier: "lib",
    upstream: "utils",
  },
  {
    name: "fleet",
    type: "registry:lib",
    title: "Fleet",
    description: "The ships: IDs, names, one-line descriptors, rail membership, line-screen angles and mark file names",
    files: [lib("fleet")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "theme",
    type: "registry:lib",
    title: "Theme",
    description: "The fleet's one light and dark choice: the script that sets it before paint, and its store",
    files: [lib("theme")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "time-words",
    type: "registry:lib",
    title: "Time words",
    description: "Time in the fleet's words: since Friday, before 11:00, 48 min until standup, every day at 07:00",
    files: [lib("time-words")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "hotkey",
    type: "registry:lib",
    title: "Hotkey",
    description:
      "Whether a bare key press is the page's to answer, away from typing and from layers that keep their keys",
    files: [lib("hotkey")],
    tier: "lib",
    upstream: null,
  },
  {
    name: "glyphs",
    type: "registry:ui",
    title: "Glyphs",
    description:
      "The pixel icons and status glyphs, drawn as whole-pixel squares in the current colour, and a state word beside its 8 px square",
    files: [ui("glyphs")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description:
      "A button in the house ink on paper and an outline off it, with secondary, outline, ghost, key, link and destructive variants",
    files: [ui("button")],
    tier: "brand",
    upstream: "button",
    texture: "disabled",
  },
  {
    name: "badge",
    type: "registry:ui",
    title: "Badge",
    description: "A badge, with a status variant for each state: done, running, waiting, failed and queued",
    files: [ui("badge")],
    tier: "brand",
    upstream: "badge",
  },
  {
    name: "input",
    type: "registry:ui",
    title: "Input",
    description: "A text field with the one focus edge",
    files: [ui("input")],
    tier: "brand",
    upstream: "input",
    texture: "disabled",
  },
  {
    name: "input-group",
    type: "registry:ui",
    title: "Input group",
    description: "A field box that holds a text control with addons and buttons beside it",
    files: [ui("input-group")],
    tier: "brand",
    upstream: "input-group",
    texture: "disabled",
  },
  {
    name: "textarea",
    type: "registry:ui",
    title: "Textarea",
    description: "A multi-line text field with the one focus edge, and a code form for JSON and keys",
    files: [ui("textarea")],
    tier: "brand",
    upstream: "textarea",
    texture: "disabled",
  },
  {
    name: "select",
    type: "registry:ui",
    title: "Select",
    description: "A select whose trigger is a field and whose list is a raised layer",
    files: [ui("select")],
    tier: "brand",
    upstream: "select",
    texture: "contact",
  },
  {
    name: "dialog",
    type: "registry:ui",
    title: "Dialog",
    description: "A square dialog on the sheet lift",
    files: [ui("dialog")],
    tier: "brand",
    upstream: "dialog",
    texture: "contact",
  },
  {
    name: "tabs",
    type: "registry:ui",
    title: "Tabs",
    description: "Tabs with a solid current tab",
    files: [ui("tabs")],
    tier: "brand",
    upstream: "tabs",
    texture: "tabhover",
  },
  {
    name: "table",
    type: "registry:ui",
    title: "Table",
    description:
      "A table with mono IDs and tabular numbers, an edge beside the row under the pointer, and a full-bleed form that folds at its own width",
    files: [ui("table")],
    tier: "brand",
    upstream: "table",
    texture: "rowedge",
  },
  {
    name: "progress",
    type: "registry:ui",
    title: "Progress",
    description: "A flat foreground bar with a screened leading edge",
    files: [ui("progress")],
    tier: "brand",
    upstream: "progress",
  },
  {
    name: "toast",
    type: "registry:ui",
    title: "Toast",
    description: "Base UI toasts on the leaf lift, with a status glyph for each kind",
    files: [ui("toast")],
    tier: "brand",
    upstream: "toast",
    texture: "contact",
  },
  {
    name: "sidebar",
    type: "registry:ui",
    title: "Sidebar",
    description: "The sidebar on the deep ground, with a neutral current item",
    files: [ui("sidebar")],
    tier: "brand",
    upstream: "sidebar",
  },
  {
    name: "fleet-rail",
    type: "registry:block",
    title: "Fleet rail",
    description:
      "The rail of ship marks for moving between fleet surfaces; each ship links to its fleet URL unless you pass an href",
    files: [ui("fleet-rail")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "checkbox",
    type: "registry:ui",
    title: "Checkbox",
    description: "A square checkbox with a screened mixed state",
    files: [ui("checkbox")],
    tier: "brand",
    upstream: "checkbox",
    texture: "mixed",
  },
  {
    name: "skeleton",
    type: "registry:ui",
    title: "Skeleton",
    description: "Loading rows, screened on whole-pixel bars",
    files: [ui("skeleton")],
    tier: "brand",
    upstream: "skeleton",
    texture: "skeleton",
  },
  {
    name: "switch",
    type: "registry:ui",
    title: "Switch",
    description: "A square switch: foreground when on, a stock square that crosses the track",
    files: [ui("switch")],
    tier: "brand",
    upstream: "switch",
  },
  {
    name: "radio-group",
    type: "registry:ui",
    title: "Radio group",
    description: "Square radios: the chosen one edged in foreground with its 8 px square",
    files: [ui("radio-group")],
    tier: "brand",
    upstream: "radio-group",
  },
  {
    name: "slider",
    type: "registry:ui",
    title: "Slider",
    description: "A slider on a ruled track, with a flat foreground range and a square thumb",
    files: [ui("slider")],
    tier: "brand",
    upstream: "slider",
  },
  {
    name: "toggle",
    type: "registry:ui",
    title: "Toggle",
    description: "A button that stays pressed, with a foreground edge and a tick while it is on",
    files: [ui("toggle")],
    tier: "brand",
    upstream: "toggle",
  },
  {
    name: "toggle-group",
    type: "registry:ui",
    title: "Toggle group",
    description: "Toggles joined on shared 1 px edges, one or several pressed",
    files: [ui("toggle-group")],
    tier: "brand",
    upstream: "toggle-group",
  },
  {
    name: "button-group",
    type: "registry:ui",
    title: "Button group",
    description: "Buttons and fields joined on shared 1 px edges",
    files: [ui("button-group")],
    tier: "brand",
    upstream: "button-group",
  },
  {
    name: "kbd",
    type: "registry:ui",
    title: "Kbd",
    description: "A key, set in mono in a 1 px box",
    files: [ui("kbd")],
    tier: "brand",
    upstream: "kbd",
  },
  {
    name: "dropdown-menu",
    type: "registry:ui",
    title: "Dropdown menu",
    description: "A menu on the leaf lift, with checkbox, radio and sub-menu items",
    files: [ui("dropdown-menu")],
    tier: "brand",
    upstream: "dropdown-menu",
    texture: "contact",
  },
  {
    name: "combobox",
    type: "registry:ui",
    title: "Combobox",
    description: "A field that filters a list on the leaf lift, for one value or several as chips",
    files: [ui("combobox")],
    tier: "brand",
    upstream: "combobox",
    texture: "contact",
  },
  {
    name: "command",
    type: "registry:ui",
    title: "Command",
    description: "A command list with a search field, inline or in a dialog",
    files: [ui("command")],
    tier: "brand",
    upstream: "command",
  },
  {
    name: "alert-dialog",
    type: "registry:ui",
    title: "Alert dialog",
    description: "A dialog that asks before an action, on the sheet lift",
    files: [ui("alert-dialog")],
    tier: "brand",
    upstream: "alert-dialog",
    texture: "contact",
  },
  {
    name: "sonner",
    type: "registry:ui",
    title: "Sonner",
    description: "Sonner's toaster in the toast's dress: the leaf lift and a status glyph for each kind",
    files: [ui("sonner")],
    tier: "brand",
    upstream: "sonner",
    texture: "contact",
  },
  {
    name: "accordion",
    type: "registry:ui",
    title: "Accordion",
    description: "Sections that open in place, ruled edge to edge",
    files: [ui("accordion")],
    tier: "brand",
    upstream: "accordion",
  },
  {
    name: "field",
    type: "registry:ui",
    title: "Field",
    description: "Labels, descriptions and errors around any control, with the bang before an error",
    files: [ui("field")],
    tier: "brand",
    upstream: "field",
  },
  {
    name: "native-select",
    type: "registry:ui",
    title: "Native select",
    description: "The browser's own select in a field box",
    files: [ui("native-select")],
    tier: "brand",
    upstream: "native-select",
  },
  {
    name: "breadcrumb",
    type: "registry:ui",
    title: "Breadcrumb",
    description: "The path to the page, in muted words with the current one in the first ink",
    files: [ui("breadcrumb")],
    tier: "brand",
    upstream: "breadcrumb",
  },
  {
    name: "resizable",
    type: "registry:ui",
    title: "Resizable",
    description: "Panels split by a 1 px rule you can drag, with an optional grip",
    files: [ui("resizable")],
    tier: "brand",
    upstream: "resizable",
  },
  {
    name: "paper",
    type: "registry:ui",
    title: "Paper",
    description: "The one white block on a page, white in every theme and on the slip lift in light",
    files: [ui("paper")],
    tier: "brand",
    upstream: null,
    texture: "contact",
  },
  {
    name: "fit-title",
    type: "registry:ui",
    title: "Fit title",
    description:
      "A title that steps down until it fits its box, by measurement, and cuts at a word only when the whole title can't",
    files: [ui("fit-title")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "inline-answers",
    type: "registry:ui",
    title: "Inline answers",
    description:
      "A suggestion that takes correction in its own slot: a Wrong? control swaps the line for plain answers there",
    files: [ui("inline-answers")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "onward",
    type: "registry:ui",
    title: "Onward",
    description: "The way onward from a page: a word and its arrow, or a door, one line of words with an arrow",
    files: [ui("onward")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "source-line",
    type: "registry:ui",
    title: "Source line",
    description: "A wrapping row of cited sources at the instrument step, and what closes the line at its far side",
    files: [ui("source-line")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "source-mark",
    type: "registry:ui",
    title: "Source mark",
    description: "The 96 px frame a third-party mark prints in, in one ink, with a second frame on hover",
    files: [ui("source-mark")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "plate",
    type: "registry:item",
    title: "Plate",
    description:
      "A 3.5 px two-ink proof halftone plate (key 45 deg and plum 15 deg) with light breath for document openers, chapter breaks and figures",
    files: [lib("plate-core"), ui("plate")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "weave",
    type: "registry:item",
    title: "Weave",
    description: "A screened field for a hero or a band, with four ramps and a plum thread",
    files: [lib("screen-core"), lib("dot-screen"), lib("weave-core"), ui("weave")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "field-art",
    type: "registry:item",
    title: "Field art",
    description: "Screened concept art for figures and openers",
    files: [ui("field-art"), lib("field-core"), lib("field-live"), file("doc/field-art.js")],
    tier: "brand",
    upstream: null,
  },
  {
    name: "collapsible",
    type: "registry:ui",
    title: "Collapsible",
    description: "Base-nova's collapsible, on the Superthread tokens",
    files: [ui("collapsible")],
    tier: "pass",
    upstream: "collapsible",
  },
  {
    name: "card",
    type: "registry:ui",
    title: "Card",
    description: "Base-nova's card, on the Superthread tokens",
    files: [ui("card")],
    tier: "pass",
    upstream: "card",
  },
  {
    name: "label",
    type: "registry:ui",
    title: "Label",
    description: "Base-nova's label, on the Superthread tokens",
    files: [ui("label")],
    tier: "pass",
    upstream: "label",
  },
  {
    name: "separator",
    type: "registry:ui",
    title: "Separator",
    description: "Base-nova's separator, on the Superthread tokens",
    files: [ui("separator")],
    tier: "pass",
    upstream: "separator",
  },
  {
    name: "sheet",
    type: "registry:ui",
    title: "Sheet",
    description: "Base-nova's sheet, on the Superthread tokens",
    files: [ui("sheet")],
    tier: "pass",
    upstream: "sheet",
  },
  {
    name: "tooltip",
    type: "registry:ui",
    title: "Tooltip",
    description: "Base-nova's tooltip, on the Superthread tokens",
    files: [ui("tooltip")],
    tier: "pass",
    upstream: "tooltip",
  },
  {
    name: "use-mobile",
    type: "registry:hook",
    title: "Use mobile",
    description: "Base-nova's hook that tells a phone-width viewport",
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
  {
    name: "use-minute",
    type: "registry:hook",
    title: "Use minute",
    description: "The clock's minute and the reader's day, from one shared timer that stops while the page is hidden",
    files: [
      {
        path: "items/hooks/use-minute.ts",
        type: "registry:hook",
        target: "@components/superthread/hooks/use-minute.ts",
      },
    ],
    tier: "lib",
    upstream: null,
  },
  // compositions: the patterns the fleet's apps repeat, composed from the items above
  {
    name: "page-header",
    type: "registry:block",
    title: "Page header",
    description: "A page's title, with a way back, a lede, its meta and its actions",
    files: [block("page-header")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts", "www"],
  },
  {
    name: "states",
    type: "registry:block",
    title: "States",
    description:
      "What a collection shows while it loads, when it fails and when it is empty, and a page when it's clear",
    files: [block("states")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
  {
    name: "app-shell",
    type: "registry:block",
    title: "App shell",
    description:
      "A ship's frame: the fleet rail, the ship's own nav with a quiet second tier and the working panel on the deep ground",
    files: [block("app-shell")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
  {
    name: "section-header",
    type: "registry:block",
    title: "Section header",
    description: "A section's head, with its count and a link to the rest",
    files: [block("section-header")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "www"],
  },
  {
    name: "search-palette",
    type: "registry:block",
    title: "Search palette",
    description: "One search over everything, opened from its button or its key",
    files: [block("search-palette")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "artifacts"],
  },
  {
    name: "collection-toolbar",
    type: "registry:block",
    title: "Collection toolbar",
    description: "The row above a collection: its filters, how many show, and how to view them",
    files: [block("collection-toolbar")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "orbit", "artifacts"],
  },
  {
    name: "list-rows",
    type: "registry:block",
    title: "List rows",
    description:
      "Ruled rows, each a title with its time, a meta line and its actions, and plain rows that read as words",
    files: [block("list-rows")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "www"],
  },
  {
    name: "item-cards",
    type: "registry:block",
    title: "Item cards",
    description:
      "A grid of cards, each a title with its status, meta and actions, full-width cards that collapse to one line once decided, or full-bleed tiles in ruled cells",
    files: [block("item-cards")],
    tier: "block",
    upstream: null,
    serves: ["trisys", "orbit", "artifacts", "www"],
  },
  {
    name: "data-table",
    type: "registry:block",
    title: "Data table",
    description:
      "A table its heads sort, with chosen rows, a row that opens a detail, sub-entries and a row for when it is empty",
    files: [block("data-table")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
  {
    name: "form-section",
    type: "registry:block",
    title: "Form section",
    description: "A titled group of fields that saves or discards its changes",
    files: [block("form-section")],
    tier: "block",
    upstream: null,
    serves: ["quanta", "trisys", "orbit", "www"],
  },
  {
    name: "quick-add",
    type: "registry:block",
    title: "Quick add",
    description: "One field and its button, for adding a thing by its name",
    files: [block("quick-add")],
    tier: "block",
    upstream: null,
    serves: ["trisys", "orbit", "www"],
  },
  {
    name: "facts",
    type: "registry:block",
    title: "Facts",
    description: "Labelled values in a ruled grid",
    files: [block("facts")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "quanta", "trisys", "orbit", "artifacts"],
  },
  {
    name: "letter",
    type: "registry:block",
    title: "Letter",
    description: "A piece of writing read whole: its subject and kind, the body at the reading measure, and its tools",
    files: [block("letter")],
    tier: "block",
    upstream: null,
    serves: ["orbit", "artifacts"],
  },
  {
    name: "jump-line",
    type: "registry:block",
    title: "Jump line",
    description: "A line of anchors to a long page's sections, each with how many it holds",
    files: [block("jump-line")],
    tier: "block",
    upstream: null,
    serves: ["quanta", "trisys", "orbit"],
  },
  {
    name: "send-bar",
    type: "registry:block",
    title: "Send bar",
    description: "The foot of a review: who it goes to, every address and file, the send and a note under it",
    files: [block("send-bar")],
    tier: "block",
    upstream: null,
    serves: ["orbit", "artifacts"],
  },
  {
    name: "job-sheet",
    type: "registry:block",
    title: "Job sheet",
    description: "The one job on paper: a cue, its title, why, one quiet line and its actions, each in a held slot",
    files: [block("job-sheet")],
    tier: "block",
    upstream: null,
    serves: ["quanta", "trisys", "orbit"],
  },
  {
    name: "day-line",
    type: "registry:block",
    title: "Day line",
    description:
      "A day at true scale: the date, names over blocks, ticks and a now mark, with every state a calendar has",
    files: [block("day-line")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "orbit"],
  },
  {
    name: "month-grid",
    type: "registry:block",
    title: "Month grid",
    description:
      "A month as six weeks: a dot on days with content, today's edge, the open day's bar, mono figures and arrow keys that step it",
    files: [block("month-grid")],
    tier: "block",
    upstream: null,
    serves: ["orbit", "artifacts"],
  },
  {
    name: "reader",
    type: "registry:block",
    title: "Reader",
    description:
      "A page of reading: a lead line, the next action on paper, a margin rail, a closing line and a foot, with a meeting brief's who, owed and raised blocks",
    files: [block("reader")],
    tier: "block",
    upstream: null,
    serves: ["quanta", "trisys", "orbit"],
  },
  {
    name: "notice",
    type: "registry:block",
    title: "Notice",
    description: "A flat notice in the flow: its status glyph, what happened and what to do, or one quiet line",
    files: [block("notice")],
    tier: "block",
    upstream: null,
    serves: ["constellation", "trisys", "orbit", "artifacts"],
  },
];
