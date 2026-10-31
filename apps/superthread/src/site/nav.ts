// The nav tree: every page the site serves, in nav order. It is also the prerender list (vite.config.ts), so a page
// that is not here is not built. Plain data, no imports: vite.config.ts loads it before any alias exists.

export type Layout = "docs" | "app";

export type NavSection =
  "overview" | "foundations" | "icons" | "components" | "compositions" | "mock pages" | "install";

export type NavEntry = {
  path: string;
  title: string;
  section: NavSection;
  layout: Layout;
  // the registry item a component page shows, as `@mk/<item>`
  item?: string;
};

const foundation = (slug: string, title = slug): NavEntry => ({
  path: `/foundations/${slug}`,
  title,
  section: "foundations",
  layout: "docs",
});

const component = (item: string, title = item.replaceAll("-", " ")): NavEntry => ({
  path: `/components/${item}`,
  title,
  section: "components",
  layout: "docs",
  item,
});

const composition = (item: string, title = item.replaceAll("-", " ")): NavEntry => ({
  path: `/compositions/${item}`,
  title,
  section: "compositions",
  layout: "docs",
  item,
});

const mock = (slug: string): NavEntry => ({ path: `/mock/${slug}`, title: slug, section: "mock pages", layout: "app" });

export const nav: readonly NavEntry[] = [
  { path: "/", title: "overview", section: "overview", layout: "docs" },
  foundation("colour"),
  foundation("type"),
  foundation("space"),
  foundation("motion"),
  foundation("marks"),
  foundation("texture"),
  { path: "/icons", title: "icons", section: "icons", layout: "docs" },
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
  component("card"),
  component("collapsible"),
  component("label"),
  component("separator"),
  component("sheet"),
  component("skeleton"),
  component("tooltip"),
  component("use-mobile", "use-mobile"),
  composition("app-shell"),
  composition("page-header"),
  composition("section-header"),
  composition("collection-toolbar"),
  composition("list-rows"),
  composition("item-cards"),
  composition("data-table"),
  composition("facts"),
  composition("form-section"),
  composition("quick-add"),
  composition("notice"),
  composition("states"),
  composition("search-palette"),
  mock("board"),
  mock("orbit"),
  mock("reading"),
  { path: "/install", title: "install", section: "install", layout: "docs" },
];

// the nav's groups, in order; overview and install stand alone
export const navSections: readonly NavSection[] = [
  "overview",
  "foundations",
  "icons",
  "components",
  "compositions",
  "mock pages",
  "install",
];

// the groups the docs nav holds at its foot, above the mode control, so the mock pages and install stay in view
// while the rest of the list scrolls
export const navPinned: readonly NavSection[] = ["mock pages", "install"];

// every nav page plus /404, which notFoundHandling serves for any path the site does not have
export const prerenderPaths: readonly string[] = [...nav.map((entry) => entry.path), "/404"];

export const notFound: NavEntry = { path: "/404", title: "not found", section: "overview", layout: "docs" };

export function entryFor(pathname: string): NavEntry {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return nav.find((entry) => entry.path === path) ?? notFound;
}
