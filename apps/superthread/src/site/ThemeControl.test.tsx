// The mode control on a page, after the inline script has run: what a choice does when the system mode changes, with
// storage blocked, and when another tab writes storage. The control renders into happy-dom, registered here before
// React's client renderer loads; the system's colour scheme is the one fake, because the test turns it.
import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { act } from "react";
import type { Root } from "react-dom/client";
import { themeKey, themeScript } from "@/components/superthread/lib/theme";
import { ThemeControl } from "./ThemeControl";

const globals = globalThis as Record<string, unknown>;
let createRoot: typeof import("react-dom/client").createRoot;
let root: Root | null = null;
let container: HTMLElement;

beforeAll(async () => {
  GlobalRegistrator.register();
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import("react-dom/client"));
});

afterAll(async () => {
  delete globals.IS_REACT_ACT_ENVIRONMENT;
  await GlobalRegistrator.unregister();
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  container.remove();
  const html = document.documentElement;
  html.removeAttribute("class");
  html.removeAttribute("style");
  html.removeAttribute("data-theme");
  html.removeAttribute("data-theme-choice");
});

const define = (name: string, value: unknown) =>
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });

// the system's `prefers-color-scheme: dark` query, which `turn` flips and announces as the browser does
function systemDark(dark: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: dark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_type: "change", listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: "change", listener: () => void) => listeners.delete(listener),
  };
  define("matchMedia", () => query);
  return {
    turn: (next: boolean) =>
      act(async () => {
        query.matches = next;
        listeners.forEach((listener) => listener());
      }),
  };
}

// storage that throws on every read and write, as a browser with site data blocked does
function blockStorage() {
  const blocked = () => {
    throw new DOMException("blocked", "SecurityError");
  };
  define("localStorage", { getItem: blocked, setItem: blocked, removeItem: blocked });
}

// the page as it loads: the inline script runs first, then the control renders
async function load() {
  new Function(themeScript)();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<ThemeControl />));
}

const choose = (option: string) =>
  act(async () => container.querySelector<HTMLButtonElement>(`[data-theme-option="${option}"]`)?.click());

const page = () => {
  const html = document.documentElement;
  return {
    theme: html.getAttribute("data-theme"),
    choice: html.getAttribute("data-theme-choice"),
    dark: html.classList.contains("dark"),
    checked: [...container.querySelectorAll('[role="radio"][aria-checked="true"]')].map((radio) => radio.textContent),
  };
};

describe("the mode control with storage blocked", () => {
  test("a chosen mode holds when the system mode changes", async () => {
    const system = systemDark(true);
    blockStorage();
    await load();
    await choose("dark");
    expect(page()).toEqual({ theme: "dark", choice: "dark", dark: true, checked: ["dark"] });

    await system.turn(false);
    expect(page()).toEqual({ theme: "dark", choice: "dark", dark: true, checked: ["dark"] });
  });

  test("auto follows the system mode", async () => {
    const system = systemDark(true);
    blockStorage();
    await load();
    await choose("dark");
    await choose("auto");
    expect(page()).toEqual({ theme: "dark", choice: "auto", dark: true, checked: ["auto"] });

    await system.turn(false);
    expect(page()).toEqual({ theme: "light", choice: "auto", dark: false, checked: ["auto"] });
    await system.turn(true);
    expect(page()).toEqual({ theme: "dark", choice: "auto", dark: true, checked: ["auto"] });
  });
});

describe("the mode control with storage", () => {
  test("follows a choice another tab stores", async () => {
    systemDark(false);
    const stored = new Map<string, string>();
    define("localStorage", {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
    });
    await load();
    await choose("light");
    expect(page()).toEqual({ theme: "light", choice: "light", dark: false, checked: ["light"] });

    document.cookie = `${themeKey}=dark`;
    await act(async () => void window.dispatchEvent(new StorageEvent("storage", { key: themeKey })));
    expect(page()).toEqual({ theme: "dark", choice: "dark", dark: true, checked: ["dark"] });
  });

  test("follows a choice another ship stored when the page comes back", async () => {
    systemDark(false);
    await load();
    await choose("light");

    document.cookie = `${themeKey}=dark`;
    await act(async () => void window.dispatchEvent(new Event("focus")));
    expect(page()).toEqual({ theme: "dark", choice: "dark", dark: true, checked: ["dark"] });
  });
});
