import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import * as dialogItem from "@/components/superthread/ui/dialog";
import { fleet } from "@/components/superthread/lib/fleet";
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import { Icon, StatusGlyph } from "@/components/superthread/ui/glyphs";
import * as s from "@/components/superthread/ui/sidebar";
import * as toastItem from "@/components/superthread/ui/toast";
import { catalog } from "../items/catalog.ts";

// The layers and frames: dialog, toast, sidebar and the fleet rail. The dialog popup and the toasts are portaled, so
// they render through react-dom/client into happy-dom (GATE.md build ruling 5); everything else renders with
// renderToString. The package's test preload owns the DOM and act()'s globals: it registers happy-dom before any test
// file loads, because Base UI picks its layout effect on import by whether a document exists, and Bun shares that
// module across files. This file registers nothing; it cleans up each render it mounts.

const root = join(import.meta.dir, "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const ITEMS = ["dialog", "toast", "sidebar", "fleet-rail"] as const;
type Item = (typeof ITEMS)[number];
const source = (name: Item) => read(`items/ui/${name}.tsx`);
const upstream = (name: string) =>
  (JSON.parse(read(`upstream/base-nova/${name}.json`)) as { files: { content: string }[] }).files[0]!.content;

const details = JSON.parse(read("tokens/details.json")) as { DETAILS: { key: string }[] };
const DETAIL_UTILITIES = new Set(details.DETAILS.map((d) => `texture-${d.key}`));
// The five places' utilities belong to no component and claim nothing.
const exempt = (utility: string) => utility === "texture-ramp" || utility.startsWith("texture-line-");
const claim = (name: Item) => {
  const texture = catalog.find((item) => item.name === name)?.texture;
  return texture ? [`texture-${texture}`] : [];
};
const LIFT: Partial<Record<Item, string>> = {
  dialog: "[--contact-lift:var(--elevation-sheet-rake)]",
  toast: "[--contact-lift:var(--elevation-leaf-rake)]",
};

const exportsOf = (code: string) =>
  [
    ...[...code.matchAll(/export\s*\{([^}]*)\}/g)].flatMap(([, names]) =>
      names!
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
    ),
    ...[...code.matchAll(/export\s+function\s+(\w+)/g)].map(([, name]) => name!),
  ].sort();
const slotsOf = (code: string) =>
  new Set([...code.matchAll(/data-slot="([^"]+)"|\bslot:\s*"([^"]+)"/g)].map(([, a, b]) => (a ?? b)!));

// The names an item exports beyond shadcn's: the toast's own list and icon, for a stack printed somewhere else.
const ADDED: Partial<Record<Item, string[]>> = { toast: ["ToastIcon", "ToastList"] };
const shadcnExports = (name: Item) => [...exportsOf(upstream(name)), ...(ADDED[name] ?? [])].sort();

describe("the layer sources", () => {
  test("each item names exactly the component detail its catalog entry claims", () => {
    const found = Object.fromEntries(
      ITEMS.map((name) => [
        name,
        [...new Set(source(name).match(/(?<![\w-])texture-[a-z0-9-]+/g) ?? [])].filter((u) => !exempt(u)).sort(),
      ]),
    );
    expect(found).toEqual(Object.fromEntries(ITEMS.map((name) => [name, claim(name)])));
    expect(claim("dialog")).toEqual(["texture-contact"]);
    expect(claim("toast")).toEqual(["texture-contact"]);
    for (const name of ITEMS) for (const utility of claim(name)) expect(DETAIL_UTILITIES.has(utility)).toBe(true);
  });

  test("the dialog lifts by the sheet rake and the toast by the leaf rake, on their own elevations", () => {
    expect(source("dialog")).toContain(LIFT.dialog!);
    expect(source("dialog")).toMatch(/(?<![\w-])shadow-sheet\b/);
    expect(source("toast")).toContain(LIFT.toast!);
    expect(source("toast")).toMatch(/(?<![\w-])shadow-leaf\b/);
    for (const name of ["sidebar", "fleet-rail"] as const) expect(source(name)).not.toContain("--contact-lift");
  });

  test("no item is rounded, names a dark: class, or carries the focus classes the gate rules off", () => {
    const ruled = [
      /(?<![\w-])rounded(?![\w])|(?<![\w-])rounded-/,
      /(?<![\w-])dark:/,
      /(?<![\w-])outline-none\b/,
      /(?<![\w-])outline-hidden\b/,
      /(?<![\w-])ring-/,
      /focus-visible:outline-1\b/,
      /focus-visible:border-ring\b/,
    ];
    const hits = ITEMS.flatMap((name) =>
      ruled.filter((pattern) => pattern.test(source(name))).map((pattern) => `${name}: ${pattern}`),
    );
    expect(hits).toEqual([]);
  });

  test("motion comes from the duration and ease tokens", () => {
    const literal = /\b\d+m?s\b|(?<![\w-])duration-\d|(?<![\w-])ease-(linear|in|out|in-out)\b|cubic-bezier/;
    expect(ITEMS.filter((name) => literal.test(source(name)))).toEqual([]);
  });

  test("no item names a host but superthread's own", () => {
    const hosts = ITEMS.flatMap(
      (name) => source(name).match(/\b(?:[a-z0-9-]+\.)+(?:com|dev|io|net|org|app|wtf|ai)\b/g) ?? [],
    );
    expect([...new Set(hosts)]).toEqual(["superthread.mauricekleine.com"]);
  });

  test("each item marks its root, and keeps shadcn's exports and data-slots", () => {
    for (const name of ITEMS) expect(source(name)).toContain(`data-mk="${name}"`);
    for (const name of ["dialog", "toast", "sidebar"] as const) {
      expect(exportsOf(source(name))).toEqual(shadcnExports(name));
      const mine = slotsOf(source(name));
      expect([...slotsOf(upstream(name))].filter((slot) => !mine.has(slot))).toEqual([]);
    }
    expect(exportsOf(source("fleet-rail"))).toEqual(["FleetRail"]);
  });
});

// A focus ring snaps on: `transition-colors` and `transition-all` would also fade outline-color, so no shipped item
// transitions more than the colours it changes on hover (button, tabs and the rail name theirs).
test("no shipped item transitions colours or everything wholesale", () => {
  const files = [...new Set(catalog.flatMap((item) => item.files.map((file) => file.path)))];
  expect(files.length).toBeGreaterThan(20);
  const hits = files.flatMap((path) =>
    [...read(path).matchAll(/(?<![\w-])transition-(?:colors|all)(?![\w-])/g)].map(([hit]) => `${path}: ${hit}`),
  );
  expect(hits).toEqual([]);
});

// ---------------------------------------------------------------------------------------------------------------

type Rendered = { el: Element; classes: string[] };
const classesOf = (el: Element) => (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
const rendered = (scope: ParentNode): Rendered[] =>
  [...scope.querySelectorAll("[class]")].map((el) => ({ el, classes: classesOf(el) }));
// The utility a class applies once its variants are stripped.
const utilityOf = (cls: string) => {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) start = i + 1;
  }
  return cls.slice(start).replace(/^!|!$/g, "");
};
const nullsRing = (scope: ParentNode) =>
  rendered(scope).flatMap(({ el, classes }) =>
    classes
      .filter((c) => ["outline-none", "outline-hidden"].includes(utilityOf(c)))
      .map((c) => `${el.getAttribute("data-slot") ?? el.tagName}: ${c}`),
  );
const textures = (el: Element) => classesOf(el).filter((c) => /^texture-/.test(utilityOf(c)) && !exempt(c));
// The dark scope an element prints in, if any: the nearest element carrying the mode class.
const darkScope = (el: Element | null | undefined) => el?.closest(".dark") ?? null;

function server(node: ReactNode): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToString(node);
  return host;
}

const mounted: (() => Promise<void>)[] = [];
async function client(node: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const reactRoot = createRoot(host);
  await act(async () => reactRoot.render(node));
  mounted.push(async () => {
    await act(async () => reactRoot.unmount());
    host.remove();
  });
}

// The path a pixel glyph draws, for comparing an item's icon with the one it names.
const pathOf = (scope: ParentNode | null) => scope?.querySelector("svg path")?.getAttribute("d") ?? null;

// What a reader hears that the item writes for them alone: sr-only text, aria-labels and titles.
const labelsOf = (scope: ParentNode) => [
  ...[...scope.querySelectorAll(".sr-only")].map((el) => el.textContent ?? ""),
  ...[...scope.querySelectorAll("[aria-label]")].map((el) => el.getAttribute("aria-label")!),
  ...[...scope.querySelectorAll("[title]")].map((el) => el.getAttribute("title")!),
];

// The properties a [transition-[...]] class names, and the utilities that set a transition at all.
const transitioned = (classes: string[]) =>
  classes.flatMap((c) => /^transition-\[(.+)\]$/.exec(utilityOf(c))?.[1]?.split(",") ?? []);
const transitions = (classes: string[]) => classes.filter((c) => /^transition(?:-|$)/.test(utilityOf(c)));

// A [clip-path:inset(...)] class as its four insets in percent, top, right, bottom, left, by CSS's shorthand.
const insetOf = (cls: string | undefined) => {
  const values = /\[clip-path:inset\(([^)]*)\)\]$/
    .exec(cls ?? "")?.[1]
    ?.split("_")
    .map((v) => parseFloat(v));
  if (!values) return null;
  const [t = 0, r = t, b = t, l = r] = values;
  return [t, r, b, l];
};
const clipsAway = ([t, r, b, l]: number[]) => r! + l! >= 100 || t! + b! >= 100;
const BAR = "[@media(max-width:900px)]:";

// The size happy-dom gives the window, and a way to change it.
const viewport = (window as unknown as { happyDOM: { setViewport(size: { width: number }): void } }).happyDOM;

const HREFS = {
  home: "/",
  orbit: "/orbit",
  quanta: "/quanta",
  trisys: "/trisys",
  constellation: "/constellation",
  artifacts: "/artifacts",
  soliton: "/soliton",
} as const;

// An element's accessible name, as far as these cells need: its label, the text it holds, or an image's alt.
const nameOf = (el: Element) =>
  (
    el.getAttribute("aria-label") ??
    (el.textContent?.trim() || [...el.querySelectorAll("img[alt]")].map((img) => img.getAttribute("alt")).join(" "))
  ).trim();

describe("the layers rendered", () => {
  afterEach(async () => {
    for (const done of mounted.splice(0).reverse()) await done();
  });

  test("the fleet rail: six ships and home, the hrefs it is given, one current ship, a name on every cell", () => {
    const dom = server(<FleetRail current="quanta" hrefs={HREFS} markBase="/marks" />);

    const rail = dom.querySelector('nav[aria-label="fleet"]')!;
    expect(rail).not.toBeNull();
    const home = rail.querySelector('[data-slot="fleet-rail-home"]')!;
    const cells = [...rail.querySelectorAll('[data-slot="fleet-rail-cell"]')];
    expect(cells.map(nameOf)).toEqual(fleet.map((ship) => ship.name));
    expect(home.getAttribute("href")).toBe("/");
    expect(cells.map((cell) => cell.getAttribute("href"))).toEqual(fleet.map((ship) => HREFS[ship.id]));
    expect([home, ...cells].every((el) => el.tagName === "A")).toBe(true);

    const current = [...dom.querySelectorAll("[aria-current]")];
    expect(current.map((el) => [el.getAttribute("aria-current"), nameOf(el)])).toEqual([["page", "quanta"]]);
    expect([home, ...cells].map(nameOf).every(Boolean)).toBe(true);
    expect(nameOf(home)).toBe("superthread");

    expect(dom.querySelector('[data-mk="fleet-rail"]')).not.toBeNull();
    expect(dom.querySelector('[data-mk="sidebar"]')).toBeNull();
  });

  test("markBase prefixes every mark, the dark mark at rest and the light one for the inverted cell", () => {
    const srcs = (node: ReactNode) => [...server(node).querySelectorAll("img")].map((img) => img.getAttribute("src")!);

    const local = srcs(<FleetRail current="orbit" hrefs={HREFS} markBase="/marks" />);
    expect(local.sort()).toEqual(
      [
        "/marks/superthread/superthread-dark.svg",
        ...fleet.flatMap((ship) => [`/marks/${ship.id}/${ship.mark.dark}`, `/marks/${ship.id}/${ship.mark.light}`]),
      ].sort(),
    );
    expect(srcs(<FleetRail current="orbit" hrefs={HREFS} markBase="/marks/" />).sort()).toEqual(local);
    const remote = srcs(<FleetRail current="orbit" hrefs={HREFS} />);
    expect(remote.length).toBe(local.length);
    expect(remote.every((src) => src.startsWith("https://superthread.mauricekleine.com/marks/"))).toBe(true);
  });

  test("with no hrefs the rail links nowhere: every ship is a disabled cell that keeps its name", () => {
    const dom = server(<FleetRail current="orbit" label="ships" />);

    // React hoists a preload link for each image, so look inside the frame.
    expect(dom.querySelector('[data-mk="fleet-rail"]')!.querySelector("a, [href]")).toBeNull();
    const rail = dom.querySelector('nav[aria-label="ships"]')!;
    const cells = [...rail.querySelectorAll('[data-slot="fleet-rail-cell"]')];
    expect(cells.map(nameOf)).toEqual(fleet.map((ship) => ship.name));
    expect(cells.every((cell) => cell.getAttribute("aria-disabled") === "true")).toBe(true);
    expect(nameOf(rail.querySelector('[data-slot="fleet-rail-home"]')!)).toBe("superthread");
    expect([...dom.querySelectorAll("[aria-current]")].map(nameOf)).toEqual(["orbit"]);
  });

  // The world's `gutter dk`: on the deep ground the frame (the rail and the ship's sidebar) prints in the dark palette
  // in both modes, and the page beside it keeps the page's mode. The pixels (the ground kept, the inks) are the
  // browser proof's.
  test("the rail holds the ship's sidebar in its dark frame and the page beside it, and names no detail", () => {
    const dom = server(
      <FleetRail
        current="orbit"
        hrefs={HREFS}
        sidebar={
          <s.SidebarContent>
            <s.SidebarMenu>
              <s.SidebarMenuItem>
                <s.SidebarMenuButton isActive>board</s.SidebarMenuButton>
              </s.SidebarMenuItem>
            </s.SidebarMenu>
          </s.SidebarContent>
        }
      >
        <main>the board</main>
      </FleetRail>,
    );
    const wrapper = dom.querySelector('[data-mk="fleet-rail"]')!;
    const frame = wrapper.querySelector('[data-slot="fleet-rail-frame"]')!;
    const button = frame.querySelector('[data-slot="sidebar"] [data-slot="sidebar-menu-button"]');
    expect(button?.textContent).toBe("board");
    expect(wrapper.querySelector("main")?.textContent).toBe("the board");
    expect(rendered(wrapper).flatMap(({ el }) => textures(el))).toEqual([]);
    expect(nullsRing(dom)).toEqual([]);

    expect(darkScope(wrapper)).toBeNull();
    expect(darkScope(frame)).toBe(frame);
    const cells = [...frame.querySelectorAll('[data-slot="fleet-rail-cell"], [data-slot="fleet-rail-home"]')];
    expect(cells.length).toBe(fleet.length + 1);
    for (const el of [...cells, button]) expect(frame.contains(darkScope(el))).toBe(true);
    expect(darkScope(wrapper.querySelector("main"))).toBeNull();
  });

  test("the sidebar marks its wrapper, keeps its slots, and names no detail on its own parts", () => {
    const menu = (
      <s.SidebarContent>
        <s.SidebarGroup>
          <s.SidebarGroupLabel>orbit</s.SidebarGroupLabel>
          <s.SidebarGroupAction>+</s.SidebarGroupAction>
          <s.SidebarGroupContent>
            <s.SidebarMenu>
              <s.SidebarMenuItem>
                <s.SidebarMenuButton isActive>board</s.SidebarMenuButton>
                <s.SidebarMenuAction>more</s.SidebarMenuAction>
                <s.SidebarMenuBadge>3</s.SidebarMenuBadge>
              </s.SidebarMenuItem>
              <s.SidebarMenuItem>
                <s.SidebarMenuButton>runs</s.SidebarMenuButton>
                <s.SidebarMenuSub>
                  <s.SidebarMenuSubItem>
                    <s.SidebarMenuSubButton isActive href="#">
                      today
                    </s.SidebarMenuSubButton>
                  </s.SidebarMenuSubItem>
                </s.SidebarMenuSub>
              </s.SidebarMenuItem>
            </s.SidebarMenu>
          </s.SidebarGroupContent>
        </s.SidebarGroup>
      </s.SidebarContent>
    );
    const dom = server(
      <>
        <s.SidebarProvider>
          <s.Sidebar collapsible="none">
            <s.SidebarHeader>orbit</s.SidebarHeader>
            {menu}
            <s.SidebarFooter>synthetic</s.SidebarFooter>
          </s.Sidebar>
          <s.SidebarInset>page</s.SidebarInset>
        </s.SidebarProvider>
        <s.SidebarProvider>
          <s.Sidebar collapsible="icon">
            {menu}
            <s.SidebarRail />
          </s.Sidebar>
        </s.SidebarProvider>
      </>,
    );

    const wrappers = [...dom.querySelectorAll('[data-slot="sidebar-wrapper"]')];
    expect(wrappers.map((el) => el.getAttribute("data-mk"))).toEqual(["sidebar", "sidebar"]);
    expect(dom.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]').length).toBe(2);
    expect(dom.querySelectorAll('[data-slot="sidebar-menu-sub-button"][data-active]').length).toBe(2);
    const own = rendered(dom).filter(({ el }) => (el.getAttribute("data-slot") ?? "").startsWith("sidebar"));
    expect(own.length).toBeGreaterThan(20);
    expect(own.flatMap(({ el }) => textures(el))).toEqual([]);
    expect(nullsRing(dom)).toEqual([]);

    // The world's `gutter dk` again: what the sidebar holds prints in the dark palette, inside the element that
    // paints the ground, which keeps the page's mode, as do the wrapper and the page.
    const grounds = [
      dom.querySelector('[data-slot="sidebar"]:not([data-state])')!,
      dom.querySelector('[data-slot="sidebar-inner"]')!,
    ];
    for (const ground of grounds) {
      expect(darkScope(ground)).toBeNull();
      const parts = ground.querySelectorAll('[data-slot^="sidebar-"]');
      expect(parts.length).toBeGreaterThan(10);
      for (const part of parts) expect(ground.contains(darkScope(part))).toBe(true);
    }
    for (const el of [...wrappers, dom.querySelector('[data-slot="sidebar-inset"]')!]) expect(darkScope(el)).toBeNull();
  });

  test("the open dialog: a square sheet on the contact lift, a subtitle and the close glyph", async () => {
    await client(
      <dialogItem.Dialog defaultOpen>
        <dialogItem.DialogContent>
          <dialogItem.DialogHeader>
            <dialogItem.DialogTitle>delete the run</dialogItem.DialogTitle>
            <dialogItem.DialogDescription>
              the run and its three logs go. this cannot be undone.
            </dialogItem.DialogDescription>
          </dialogItem.DialogHeader>
          <dialogItem.DialogFooter showCloseButton />
        </dialogItem.DialogContent>
      </dialogItem.Dialog>,
    );

    const popups = [...document.body.querySelectorAll('[data-mk="dialog"]')];
    expect(popups.length).toBe(1);
    const popup = popups[0]!;
    expect(popup.getAttribute("data-slot")).toBe("dialog-content");
    expect(textures(popup)).toEqual(claim("dialog"));
    expect(classesOf(popup)).toContain(LIFT.dialog!);
    expect(classesOf(popup)).toContain("shadow-sheet");
    expect(classesOf(popup.querySelector('[data-slot="dialog-title"]')!)).toContain("type-subtitle");
    const overlay = document.body.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    // The sheet and the scrim fade by animation, which their duration sets, and transition nothing.
    for (const el of [popup, overlay!]) expect(transitions(classesOf(el))).toEqual(["transition-none"]);
    // The texture's whole-pixel rule: the centring offsets round to whole pixels (the browser proof measures it).
    const placement = classesOf(popup).filter((c) =>
      /^(?:-?inset|-?top|-?left|-?right|-?bottom|-?translate|\[translate|m-auto|-?m[xy]?-)/.test(utilityOf(c)),
    );
    expect(placement.sort()).toEqual([
      "[translate:round(-50%,1px)_round(-50%,1px)]",
      "left-[round(50%,1px)]",
      "top-[round(50%,1px)]",
    ]);

    const close = popup.querySelector('[data-slot="dialog-close"]');
    expect(pathOf(close)).toBe(pathOf(server(<Icon name="close" />)));
    expect(labelsOf(popup)).toEqual(["close"]);
    expect(popup.querySelector('[data-slot="dialog-footer"]')?.textContent).toBe("close");
    expect(nullsRing(document.body)).toEqual([]);
  });

  test("toasts: each on the contact lift with its kind's status glyph, warning on the pause", async () => {
    const manager = toastItem.createToastManager();
    await client(<toastItem.Toaster toastManager={manager} limit={10} timeout={0} />);
    const kinds = {
      success: "done",
      info: "running",
      warning: "waiting",
      error: "failed",
      loading: "running",
    } as const;
    await act(async () => {
      for (const type of Object.keys(kinds)) manager.add({ title: `${type} toast`, description: "synthetic", type });
      manager.add({ title: "plain toast", actionProps: { children: "undo" } });
    });

    const toasts = [...document.body.querySelectorAll('[data-mk="toast"]')];
    expect(toasts.length).toBe(6);
    for (const toast of toasts) {
      expect(toast.getAttribute("data-slot")).toBe("toast");
      expect(textures(toast)).toEqual(claim("toast"));
      expect(classesOf(toast)).toContain(LIFT.toast!);
      expect(classesOf(toast)).toContain("shadow-leaf");
      // The stack moves a textured root only by translation: a scale would resample its contact screen.
      expect(classesOf(toast).filter((c) => /scale/.test(c))).toEqual([]);
    }
    const byTitle = (title: string) =>
      toasts.find((toast) => toast.querySelector('[data-slot="toast-title"]')?.textContent === title)!;
    for (const [type, state] of Object.entries(kinds))
      expect(pathOf(byTitle(`${type} toast`).querySelector('[data-slot="toast-icon"]'))).toBe(
        pathOf(server(<StatusGlyph state={state} />)),
      );
    const plain = byTitle("plain toast");
    expect(plain.querySelector('[data-slot="toast-icon"]')).toBeNull();
    expect(plain.querySelector('[data-slot="toast-action"]')?.textContent).toBe("undo");
    expect(plain.querySelector('[data-slot="toast-close"]')?.getAttribute("aria-label")).toBe("close toast");
    expect(nullsRing(document.body)).toEqual([]);
  });

  test("the dialog and the toaster hand portalProps to their portals", async () => {
    const pane = document.createElement("div");
    pane.className = "dark";
    document.body.append(pane);
    mounted.push(async () => pane.remove());
    const manager = toastItem.createToastManager();
    await client(
      <>
        <dialogItem.Dialog defaultOpen>
          <dialogItem.DialogContent portalProps={{ container: pane }}>
            <dialogItem.DialogTitle>rename the ship</dialogItem.DialogTitle>
          </dialogItem.DialogContent>
        </dialogItem.Dialog>
        <toastItem.Toaster toastManager={manager} timeout={0} portalProps={{ container: pane }} />
      </>,
    );
    await act(async () => {
      manager.add({ title: "or-412 picked up", type: "info" });
    });

    for (const slot of ["dialog-overlay", "dialog-content", "toast-viewport", "toast"])
      expect([slot, pane.querySelectorAll(`[data-slot="${slot}"]`).length]).toEqual([slot, 1]);
  });

  test("ToastList prints a provider's toasts in a viewport of your own, each with its ToastIcon", async () => {
    const manager = toastItem.createToastManager();
    await client(
      <toastItem.ToastProvider toastManager={manager}>
        <toastItem.ToastViewport data-testid="own" className="relative">
          <toastItem.ToastList />
        </toastItem.ToastViewport>
      </toastItem.ToastProvider>,
    );
    await act(async () => {
      manager.add({ title: "artifacts is waiting", description: "a review needs you.", type: "warning", timeout: 0 });
    });

    const toasts = [...document.body.querySelectorAll('[data-testid="own"] [data-mk="toast"]')];
    expect(toasts.map((el) => el.querySelector('[data-slot="toast-title"]')?.textContent)).toEqual([
      "artifacts is waiting",
    ]);
    const waiting = pathOf(server(<StatusGlyph state="waiting" />));
    expect(pathOf(toasts[0]!.querySelector('[data-slot="toast-icon"]'))).toBe(waiting);
    expect(pathOf(server(<toastItem.ToastIcon type="warning" />))).toBe(waiting);
    expect(server(<toastItem.ToastIcon type={undefined} />).innerHTML).toBe("");
  });

  test("the rail takes a className on the wrapper that paints the ground, merged with its own", () => {
    const wrapper = server(<FleetRail current="orbit" className="st-frame min-h-0" />).querySelector(
      '[data-mk="fleet-rail"]',
    )!;
    const classes = classesOf(wrapper);
    for (const cls of ["st-frame", "min-h-0", "bg-sidebar"]) expect(classes).toContain(cls);
    expect(classes).not.toContain("min-h-svh");
  });

  // The tab hides by its clip: drawn back to its left edge on the rail, up to its top edge on the bar. Crossing 900 px
  // moves the clip from one form to the other, and halfway it uncovers a corner of the tab, a sliver beside every
  // cell, unless the tab is also invisible while it is hidden.
  test("the rail's hidden tab never shows as the viewport crosses 900 px, and each cell keeps its ship's name", () => {
    const dom = server(<FleetRail current="orbit" hrefs={{ orbit: "/orbit" }} />);
    const cells = [...dom.querySelectorAll('[data-slot="fleet-rail-cell"]')];
    expect(cells.length).toBe(fleet.length);
    for (const cell of cells) {
      const classes = classesOf(cell.querySelector('[data-slot="fleet-rail-label"]')!);
      const rail = insetOf(classes.find((c) => c.startsWith("[clip-path:")))!;
      const bar = insetOf(classes.find((c) => c.startsWith(`${BAR}[clip-path:`))) ?? rail;
      expect([clipsAway(rail), clipsAway(bar)]).toEqual([true, true]);
      if (clipsAway(rail.map((v, i) => (v + bar[i]!) / 2))) continue;
      expect(classes).toContain("invisible");
      for (const shown of ["group-hover/cell:visible", "group-focus-visible/cell:visible"])
        expect(classes).toContain(shown);
      expect(transitioned(classes)).toEqual(expect.arrayContaining(["clip-path", "visibility"]));
    }
    // An invisible tab names nothing, so the cell names its ship.
    expect(cells.map((cell) => cell.getAttribute("aria-label"))).toEqual(fleet.map((ship) => ship.name));
  });

  test("a menu skeleton draws the same bar on the server and in the client that hydrates it", async () => {
    const tree = (
      <s.SidebarProvider>
        <s.SidebarMenu>
          {[0, 1, 2].map((row) => (
            <s.SidebarMenuItem key={row}>
              <s.SidebarMenuSkeleton showIcon />
            </s.SidebarMenuItem>
          ))}
        </s.SidebarMenu>
      </s.SidebarProvider>
    );
    const widths = (scope: ParentNode) =>
      [...scope.querySelectorAll('[data-sidebar="menu-skeleton-text"]')].map(
        (el) => /--skeleton-width:\s*([^;]+)/.exec(el.getAttribute("style") ?? "")?.[1] ?? "",
      );

    // A drawn width would differ between renders: every draw here gives a new number.
    const random = Math.random;
    let draws = 0;
    Math.random = () => (++draws * 0.37) % 1;
    const errors: string[] = [];
    const error = console.error;
    try {
      const html = renderToString(tree);
      expect(renderToString(tree)).toBe(html);
      const host = document.createElement("div");
      host.innerHTML = html;
      document.body.append(host);
      console.error = (...args: unknown[]) => void errors.push(args.map(String).join(" "));
      let hydrated: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        hydrated = hydrateRoot(host, tree);
      });
      mounted.push(async () => {
        await act(async () => hydrated?.unmount());
        host.remove();
      });
      expect(errors.filter((message) => /hydrat/i.test(message))).toEqual([]);

      const served = widths(host);
      expect(served.length).toBe(3);
      expect(served.every((w) => /^\d+%$/.test(w) && parseInt(w) >= 50 && parseInt(w) < 90)).toBe(true);
      expect(new Set(served).size).toBeGreaterThan(1);
    } finally {
      Math.random = random;
      console.error = error;
    }
  });

  test("the sidebar names its trigger, its rail and its mobile sheet in lowercase", async () => {
    const desktop = server(
      <s.SidebarProvider>
        <s.Sidebar collapsible="icon">
          <s.SidebarRail />
        </s.Sidebar>
        <s.SidebarInset>
          <s.SidebarTrigger />
        </s.SidebarInset>
      </s.SidebarProvider>,
    );
    expect(labelsOf(desktop)).toEqual(["toggle sidebar", "toggle sidebar", "toggle sidebar"]);

    // A phone's window: the sidebar opens as a sheet, titled for a reader alone.
    const width = window.innerWidth;
    await act(async () => viewport.setViewport({ width: 500 }));
    try {
      await client(
        <s.SidebarProvider>
          <s.Sidebar>
            <s.SidebarContent>runs</s.SidebarContent>
          </s.Sidebar>
          <s.SidebarTrigger />
        </s.SidebarProvider>,
      );
      await act(async () => (document.body.querySelector('[data-slot="sidebar-trigger"]') as HTMLElement).click());
      const sheet = document.body.querySelector('[data-slot="sidebar"][data-mobile="true"]');
      expect(sheet).not.toBeNull();
      const header = [...sheet!.querySelectorAll('[data-slot="sheet-title"], [data-slot="sheet-description"]')];
      expect(header.map((el) => el.textContent)).toEqual(["sidebar", "displays the mobile sidebar."]);
    } finally {
      await act(async () => viewport.setViewport({ width }));
    }
  });

  test("the dialog and the toast export shadcn's names, and the toast its list and icon", () => {
    expect(Object.keys(dialogItem).sort()).toEqual(shadcnExports("dialog"));
    expect(Object.keys(toastItem).sort()).toEqual(shadcnExports("toast"));
  });
});
