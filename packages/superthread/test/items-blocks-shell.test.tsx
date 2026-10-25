// The shell composes the rail, section heads and search without taking over the app's routes or commands.
import { describe, expect, test } from "bun:test";
import { act, useState } from "react";
import {
  AppShell,
  AppShellGround,
  AppShellNav,
  AppShellNavItem,
  AppShellPanel,
} from "@/components/superthread/blocks/app-shell";
import {
  Section,
  SectionAction,
  SectionCount,
  SectionHeader,
  SectionTitle,
} from "@/components/superthread/blocks/section-header";
import {
  SearchPalette,
  SearchPaletteContent,
  SearchPaletteTrigger,
} from "@/components/superthread/blocks/search-palette";
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/superthread/ui/command";
import { client, CONTROL_RING, detailsUsed, elements, forbidden, one, own, server } from "./rendered.tsx";

describe("app shell", () => {
  const frame = () =>
    server(
      <AppShell
        current="orbit"
        hrefs={{ orbit: "/orbit", home: "/" }}
        markBase="/marks"
        label="ships"
        className="min-h-svh"
        sidebar={
          <AppShellNav ship="orbit">
            <AppShellNavItem isActive number="01" count={0} render={<a href="/board" />}>
              board
            </AppShellNavItem>
            <AppShellNavItem render={<a href="/runs" />}>runs</AppShellNavItem>
          </AppShellNav>
        }
      >
        <AppShellGround aria-label="orbit workspace">
          <AppShellPanel>working panel</AppShellPanel>
        </AppShellGround>
      </AppShell>,
    );

  test("passes the rail's identity, destinations, marks, label and classes through", () => {
    const host = frame();
    expect(one(host, '[data-slot="app-shell"]').el.getAttribute("data-mk")).toBe("app-shell");
    expect(one(host, 'nav[aria-label="ships"] a[aria-current="page"]').el.getAttribute("href")).toBe("/orbit");
    expect(one(host, 'nav[aria-label="ships"] img').el.getAttribute("src")).toBe(
      "/marks/superthread/superthread-dark.svg",
    );
    expect(one(host, '[data-mk="fleet-rail"]').classes).toContain("min-h-svh");
  });

  test("the ground is the page's main, or a div inside a layout that owns main", () => {
    const host = frame();
    const ground = one(host, '[data-slot="app-shell-ground"]').el;
    expect(ground.tagName).toBe("MAIN");
    expect(ground.getAttribute("aria-label")).toBe("orbit workspace");
    expect(ground.getAttribute("data-mk")).toBe("app-shell");
    const nested = server(
      <AppShellGround render={<div />}>
        <AppShellPanel>working panel</AppShellPanel>
      </AppShellGround>,
    );
    expect(nested.querySelector("main")).toBeNull();
    expect(one(nested, '[data-slot="app-shell-ground"]').el.hasAttribute("aria-label")).toBe(false);
    expect(one(nested, '[data-slot="app-shell-ground"]').classes).toContain("flex-1");
  });

  test("names the ship nav, keeps real list links and announces a zero count", () => {
    const host = frame();
    const nav = one(host, 'nav[aria-label="orbit"]').el;
    expect(nav.querySelectorAll("ul > li > a")).toHaveLength(2);
    expect(one(nav, 'a[aria-current="page"]').el.getAttribute("href")).toBe("/board");
    expect(one(nav, '[data-slot="app-shell-nav-number"]').el.textContent).toBe("01");
    const count = one(nav, '[data-slot="app-shell-nav-count"]');
    expect(count.el.textContent).toBe("0");
    expect(count.el.getAttribute("aria-live")).toBe("polite");
    expect(count.classes).toEqual(
      expect.arrayContaining(["font-mono", "tabular-nums", "ml-auto", "text-muted-foreground"]),
    );
    expect(one(nav, 'a[href="/runs"]').el.hasAttribute("aria-current")).toBe(false);
    expect(one(nav, "a").classes).toEqual(expect.arrayContaining(CONTROL_RING));
  });

  test("keeps the master measures, wrapped nav and phone gutters", () => {
    const host = frame();
    expect(one(host, '[data-slot="sidebar-header"]').classes).toEqual(
      expect.arrayContaining(["h-[59px]", "[@media(max-width:900px)]:hidden"]),
    );
    expect(one(host, '[data-slot="sidebar-menu"]').classes).toContain("[@media(max-width:900px)]:flex-wrap");
    expect(one(host, "main").classes).toEqual(
      expect.arrayContaining(["min-w-0", "flex-1", "[@media(max-width:900px)]:px-3"]),
    );
    expect(one(host, "main").el.getAttribute("aria-label")).toBe("orbit workspace");
    expect(one(host, '[data-slot="app-shell-panel"]').classes).toEqual(
      expect.arrayContaining([
        "max-w-[880px]",
        "px-12",
        "pt-10",
        "pb-7",
        "shadow-sheet",
        "[@media(max-width:600px)]:px-4",
      ]),
    );
    const rendered = elements(host);
    expect(detailsUsed(rendered, "app-shell")).toEqual([]);
    // The nested blocks remain ours even inside the rail; the sidebar item keeps its own existing dress.
    const blockElements = rendered.filter(({ el }) => el.getAttribute("data-slot")?.startsWith("app-shell"));
    expect(detailsUsed(blockElements, "app-shell")).toEqual([]);
    expect(forbidden(blockElements)).toEqual([]);
  });
});

describe("section header", () => {
  test("each section is named by its own title, including a supplied deep-link id", () => {
    const host = server(
      <>
        <Section>
          <SectionHeader>
            <SectionTitle>recent runs</SectionTitle>
            <SectionCount>12</SectionCount>
            <SectionAction href="/runs" />
          </SectionHeader>
          <p>runs</p>
        </Section>
        <Section titleId="drafts">
          <SectionHeader>
            <SectionTitle>drafts</SectionTitle>
            <SectionAction render={<a href="/drafts" />}>all drafts</SectionAction>
          </SectionHeader>
        </Section>
      </>,
    );
    const sections = [...host.querySelectorAll("section")];
    expect(sections).toHaveLength(2);
    for (const section of sections) {
      expect(section.getAttribute("data-mk")).toBe("section-header");
      expect(section.getAttribute("aria-labelledby")).toBe(section.querySelector("h2")!.id);
    }
    expect(sections[1]!.getAttribute("aria-labelledby")).toBe("drafts");
    expect(sections[0]!.getAttribute("aria-labelledby")).not.toBe("drafts");
    expect(one(host, '[data-slot="section-count"]').el.getAttribute("aria-live")).toBe("polite");
    expect(one(host, 'a[href="/runs"]').el.textContent).toBe("more");
    expect(one(host, 'a[href="/drafts"]').el.textContent).toBe("all drafts");
    expect(one(host, "a").el.querySelector("svg")).not.toBeNull();
    expect(one(host, "a").classes).toEqual(expect.arrayContaining(CONTROL_RING));
    expect(one(host, "header").classes).toEqual(
      expect.arrayContaining(["items-baseline", "gap-3", "border-foreground", "pb-3", "mb-4", "flex-wrap"]),
    );
    expect(one(host, "h2").classes).toContain("type-title");
    expect(detailsUsed(elements(host), "section-header")).toEqual([]);
    expect(forbidden(elements(host))).toEqual([]);
  });

  test("a stray title id cannot unname its section", () => {
    const stray = { id: "elsewhere" } as object;
    const host = server(
      <Section>
        <SectionHeader>
          <SectionTitle {...stray}>recent runs</SectionTitle>
        </SectionHeader>
      </Section>,
    );
    const section = one(host, "section").el;
    expect(section.getAttribute("aria-labelledby")).toBe(one(host, "h2").el.id);
    expect(host.querySelector("#elsewhere")).toBeNull();
  });
});

async function key(target: EventTarget, value: string, modifiers: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true, ...modifiers });
  await act(async () => {
    target.dispatchEvent(event);
  });
  return event;
}

function Palette({
  onSelect,
  ...props
}: Omit<React.ComponentProps<typeof SearchPalette>, "onSelect"> & { onSelect?: (value: string) => void }) {
  return (
    <SearchPalette {...props}>
      <SearchPaletteTrigger />
      <SearchPaletteContent onSelect={onSelect}>
        {(select) => (
          <CommandGroup heading="pages">
            <CommandItem value="board" onSelect={select}>
              board<CommandShortcut>b</CommandShortcut>
            </CommandItem>
            <CommandItem value="drafts" onSelect={select}>
              drafts
            </CommandItem>
          </CommandGroup>
        )}
      </SearchPaletteContent>
    </SearchPalette>
  );
}

const isOpen = (body: HTMLElement) =>
  one(body, '[data-slot="search-palette-trigger"]').el.getAttribute("aria-expanded") === "true";

describe("search palette", () => {
  test("server renders its roots and a named field-shaped button with a shortcut", () => {
    const host = server(<Palette />);
    expect(host.querySelectorAll('[data-mk="search-palette"]')).toHaveLength(3);
    const trigger = one(host, "button");
    expect(trigger.el.getAttribute("aria-label")).toBe("search");
    expect(trigger.el.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.el.getAttribute("type")).toBe("button");
    expect(host.querySelector("input")).toBeNull();
    expect(trigger.el.textContent).toContain("search everything");
    expect(one(host, "kbd").el.textContent).toBe("⌘/ctrl k");
    expect(trigger.classes).toEqual(expect.arrayContaining(["h-10", "border-input", ...CONTROL_RING]));
    expect(detailsUsed(elements(host), "search-palette")).toEqual([]);
    expect(forbidden(own(elements(host), "search-palette")).filter((hit) => !hit.startsWith("kbd:"))).toEqual([]);
  });

  test("the trigger opens a named dialog with named search and live results", async () => {
    const view = await client(<Palette />);
    try {
      await act(async () => {
        one(view.body, '[data-slot="search-palette-trigger"]').el.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
      });
      expect(isOpen(view.body)).toBe(true);
      const dialog = one(view.body, '[role="dialog"]').el;
      const labelId = dialog.getAttribute("aria-labelledby")!;
      expect(document.getElementById(labelId)?.textContent).toBe("search");
      expect(one(view.body, 'input[role="combobox"]').el.getAttribute("aria-label")).toBe("search");
      expect(one(view.body, '[role="listbox"]').el.getAttribute("aria-label")).toBe("search results");
      expect(one(view.body, '[role="listbox"]').el.getAttribute("aria-live")).toBe("polite");
      const controls = one(view.body, '[data-slot="search-palette-trigger"]').el.getAttribute("aria-controls")!;
      expect(document.getElementById(controls)).not.toBeNull();
      expect(detailsUsed(elements(view.body), "search-palette")).toEqual([]);
      // The command and kbd seeds are skinned by their own implementation slice.
      const owned = own(elements(view.body), "search-palette").filter(
        ({ el }) => !el.closest('[data-slot="command"], [data-slot="kbd"]'),
      );
      expect(forbidden(owned)).toEqual([]);
    } finally {
      await view.done();
    }
  });

  test("command and control toggle even from a text field, while repeats do not", async () => {
    const view = await client(<Palette />);
    try {
      expect((await key(document, "k", { metaKey: true })).defaultPrevented).toBe(true);
      expect(isOpen(view.body)).toBe(true);
      await key(document, "k", { metaKey: true, repeat: true });
      expect(isOpen(view.body)).toBe(true);
      await key(one(view.body, "input").el, "k", { ctrlKey: true });
      expect(isOpen(view.body)).toBe(false);
      await key(document, "K", { ctrlKey: true });
      expect(isOpen(view.body)).toBe(true);
    } finally {
      await view.done();
    }
  });

  test("slash leaves editable controls, composition and other shortcuts alone", async () => {
    const view = await client(
      <>
        <Palette />
        <input />
        <textarea />
        <select />
        <div contentEditable suppressContentEditableWarning>
          <span data-editable>text</span>
        </div>
        <div role="textbox" />
      </>,
    );
    try {
      for (const editable of view.body.querySelectorAll('input, textarea, select, [data-editable], [role="textbox"]')) {
        expect((await key(editable, "/")).defaultPrevented).toBe(false);
        expect(isOpen(view.body)).toBe(false);
      }
      for (const modifiers of [{ ctrlKey: true }, { shiftKey: true }, { altKey: true }, { isComposing: true }]) {
        await key(document, "/", modifiers);
        expect(isOpen(view.body)).toBe(false);
      }
      expect((await key(document, "/")).defaultPrevented).toBe(true);
      expect(isOpen(view.body)).toBe(true);
    } finally {
      await view.done();
    }
  });

  test("a custom letter replaces k, null disables both shortcuts, and unmount removes the listener", async () => {
    const calls: boolean[] = [];
    const view = await client(<Palette hotkey="p" onOpenChange={(open) => calls.push(open)} />);
    try {
      await key(document, "k", { metaKey: true });
      expect(isOpen(view.body)).toBe(false);
      await key(document, "p", { ctrlKey: true });
      expect(isOpen(view.body)).toBe(true);
      expect(one(view.body, "kbd").el.textContent).toBe("⌘/ctrl p");
    } finally {
      await view.done();
    }
    await key(document, "p", { ctrlKey: true });
    expect(calls).toEqual([true]);
    const disabled = await client(<Palette hotkey={null} />);
    try {
      await key(document, "k", { metaKey: true });
      await key(document, "/");
      expect(isOpen(disabled.body)).toBe(false);
      expect(disabled.body.querySelector("kbd")).toBeNull();
    } finally {
      await disabled.done();
    }
  });

  test("controlled state remains owned by the app", async () => {
    const calls: boolean[] = [];
    const view = await client(<Palette open={false} onOpenChange={(open) => calls.push(open)} />);
    try {
      await key(document, "k", { ctrlKey: true });
      expect(calls).toEqual([true]);
      expect(isOpen(view.body)).toBe(false);
    } finally {
      await view.done();
    }
  });

  test("slash opens from a checkbox, and escape dismisses an initially open palette", async () => {
    const view = await client(
      <>
        <Palette defaultOpen />
        <input type="checkbox" />
      </>,
    );
    try {
      expect(isOpen(view.body)).toBe(true);
      await key(one(view.body, '[data-slot="command-input"]').el, "Escape");
      expect(isOpen(view.body)).toBe(false);
      await key(one(view.body, 'input[type="checkbox"]').el, "/");
      expect(isOpen(view.body)).toBe(true);
    } finally {
      await view.done();
    }
  });

  test("portalProps mount the dialog inside the app's own container", async () => {
    const scope = document.createElement("div");
    scope.className = "dark";
    document.body.append(scope);
    const view = await client(
      <SearchPalette defaultOpen>
        <SearchPaletteContent portalProps={{ container: scope }} />
      </SearchPalette>,
    );
    try {
      expect(scope.querySelector('[data-slot="command-input"]')).not.toBeNull();
    } finally {
      await view.done();
      scope.remove();
    }
  });

  test("filtering shows the default empty words and selecting runs the app callback and closes", async () => {
    const selected: string[] = [];
    function Controlled() {
      const [open, setOpen] = useState(true);
      return <Palette open={open} onOpenChange={setOpen} onSelect={(value) => selected.push(value)} />;
    }
    const view = await client(<Controlled />);
    try {
      const input = one(view.body, "input").el as HTMLInputElement;
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "no match");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expect(one(view.body, '[cmdk-empty=""]').el.textContent).toBe("nothing by that name");
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "board");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await key(input, "Enter");
      expect(selected).toEqual(["board"]);
      expect(isOpen(view.body)).toBe(false);
    } finally {
      await view.done();
    }
  });
});
