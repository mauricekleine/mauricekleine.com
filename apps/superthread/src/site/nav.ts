// The nav tree: every page the site serves, in nav order. It is also the prerender list (vite.config.ts), so a page
// that is not here is not built. Plain data, no imports: vite.config.ts loads it before any alias exists.

export type Layout = "docs" | "app";

export type NavSection =
  "Overview" | "Foundations" | "Icons" | "Components" | "Compositions" | "Mock pages" | "Install";

export type NavEntry = {
  path: string;
  title: string;
  section: NavSection;
  layout: Layout;
  // the registry item a component page shows, as `@mk/<item>`
  item?: string;
};

const sentence = (slug: string) => {
  const words = slug.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const foundation = (slug: string, title = sentence(slug)): NavEntry => ({
  path: `/foundations/${slug}`,
  title,
  section: "Foundations",
  layout: "docs",
});

const component = (item: string, title = sentence(item)): NavEntry => ({
  path: `/components/${item}`,
  title,
  section: "Components",
  layout: "docs",
  item,
});

const composition = (item: string, title = sentence(item)): NavEntry => ({
  path: `/compositions/${item}`,
  title,
  section: "Compositions",
  layout: "docs",
  item,
});

const mock = (slug: string): NavEntry => ({
  path: `/mock/${slug}`,
  title: sentence(slug),
  section: "Mock pages",
  layout: "app",
});

export const nav: readonly NavEntry[] = [
  { path: "/", title: "Overview", section: "Overview", layout: "docs" },
  foundation("colour"),
  foundation("type"),
  foundation("space"),
  foundation("motion"),
  foundation("marks"),
  foundation("texture"),
  { path: "/icons", title: "Icons", section: "Icons", layout: "docs" },
  component("button"),
  component("button-group"),
  component("toggle"),
  component("toggle-group"),
  component("badge"),
  component("kbd"),
  component("input"),
  component("input-group"),
  component("textarea"),
  component("field"),
  component("select"),
  component("native-select"),
  component("combobox"),
  component("checkbox"),
  component("radio-group"),
  component("switch"),
  component("slider"),
  component("dialog"),
  component("alert-dialog"),
  component("dropdown-menu"),
  component("command"),
  component("tabs"),
  component("accordion"),
  component("breadcrumb"),
  component("table"),
  component("progress"),
  component("toast"),
  component("sonner"),
  component("sidebar"),
  component("fleet-rail"),
  component("resizable"),
  component("glyphs"),
  component("paper"),
  component("fit-title"),
  component("inline-answers"),
  component("onward"),
  component("source-line"),
  component("source-mark"),
  component("plate"),
  component("weave"),
  component("field-art"),
  component("card"),
  component("collapsible"),
  component("label"),
  component("separator"),
  component("sheet"),
  component("skeleton"),
  component("tooltip"),
  component("time-words", "time-words"),
  component("use-mobile", "use-mobile"),
  component("use-minute", "use-minute"),
  component("hotkey", "hotkey"),
  composition("app-shell"),
  composition("page-header"),
  composition("section-header"),
  composition("collection-toolbar"),
  composition("list-rows"),
  composition("jump-line"),
  composition("item-cards"),
  composition("data-table"),
  composition("facts"),
  composition("form-section"),
  composition("quick-add"),
  composition("letter"),
  composition("send-bar"),
  composition("job-sheet"),
  composition("day-line"),
  composition("month-grid"),
  composition("reader"),
  composition("notice"),
  composition("states"),
  composition("search-palette"),
  composition("doc", "Documents"),
  mock("board"),
  mock("orbit"),
  mock("reading"),
  { path: "/install", title: "Install", section: "Install", layout: "docs" },
];

// the nav's groups, in order; Overview and Install stand alone
export const navSections: readonly NavSection[] = [
  "Overview",
  "Foundations",
  "Icons",
  "Components",
  "Compositions",
  "Mock pages",
  "Install",
];

// the groups the docs nav holds at its foot, above the mode control, so the mock pages and Install stay in view
// while the rest of the list scrolls
export const navPinned: readonly NavSection[] = ["Mock pages", "Install"];

// every nav page plus /404, which notFoundHandling serves for any path the site does not have
export const prerenderPaths: readonly string[] = [...nav.map((entry) => entry.path), "/404"];

export const notFound: NavEntry = { path: "/404", title: "Not found", section: "Overview", layout: "docs" };

export function entryFor(pathname: string): NavEntry {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return nav.find((entry) => entry.path === path) ?? notFound;
}
