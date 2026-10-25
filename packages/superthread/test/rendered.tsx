// What the 2.0 item tests share: render an item, read its classes, and hold them to the rules every skin keeps. The
// fields, actions and layers files keep their own copies; the files for the items 2.0 adds import these.
import { expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { catalog } from "../items/catalog.ts";

const root = join(import.meta.dir, "..");
const details = JSON.parse(readFileSync(join(root, "tokens/details.json"), "utf8")) as { DETAILS: { key: string }[] };
const DETAIL_UTILITIES = new Set(details.DETAILS.map((d) => `texture-${d.key}`));

/** An item's source, as committed. */
export const source = (name: string) => readFileSync(join(root, `items/ui/${name}.tsx`), "utf8");

/** A class split at its top-level colons: the variants, then the utility (`-` and `!` stripped). */
export function parts(cls: string): { variants: string[]; utility: string } {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) {
      segments.push(cls.slice(start, i));
      start = i + 1;
    }
  }
  const last = cls.slice(start);
  return { variants: segments, utility: last.replace(/^!/, "").replace(/!$/, "").replace(/^-/, "") };
}

export type Rendered = { el: Element; classes: string[] };

const classesOf = (el: Element) => (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

export function elements(scope: ParentNode): Rendered[] {
  return [...scope.querySelectorAll("[class]")].map((el) => ({ el, classes: classesOf(el) }));
}

/** Server-rendered markup, parsed back into a DOM so it can be queried. */
export function server(node: ReactNode): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToString(node);
  return host;
}

/** A client render into document.body, for portaled layers. Returns the body and a cleanup. */
export async function client(node: ReactNode): Promise<{ body: HTMLElement; done: () => Promise<void> }> {
  const host = document.createElement("div");
  document.body.append(host);
  const reactRoot = createRoot(host);
  await act(async () => reactRoot.render(node));
  return {
    body: document.body,
    done: async () => {
      await act(async () => reactRoot.unmount());
      host.remove();
    },
  };
}

export function one(scope: ParentNode, selector: string): Rendered {
  const el = scope.querySelector(selector);
  expect(el, selector).not.toBeNull();
  return { el: el!, classes: classesOf(el!) };
}

/**
 * Classes no skin carries: outline-none and outline-hidden null the focus outline, base-nova's rings come off,
 * :focus-within frames a box for a button inside it, and a dark: class second-guesses the tokens.
 */
export function forbidden(rendered: Rendered[]): string[] {
  const hits: string[] = [];
  for (const { el, classes } of rendered)
    for (const cls of classes) {
      const { variants, utility } = parts(cls);
      const why =
        utility === "outline-none" || utility === "outline-hidden"
          ? "nulls the outline"
          : /^ring(-|$)/.test(utility)
            ? "a ring"
            : variants.some((v) => v.includes("focus-within"))
              ? "focus-within"
              : variants.includes("dark")
                ? "a dark: class"
                : /^rounded/.test(utility) && utility !== "rounded-none"
                  ? "a rounded corner"
                  : /^opacity-\d/.test(utility) && variants.some((v) => /disabled/.test(v))
                    ? "disabled by opacity"
                    : null;
      if (why) hits.push(`${el.getAttribute("data-slot") ?? el.tagName}: ${cls} (${why})`);
    }
  return hits;
}

/** The item's own elements: those outside any descendant that carries another item's data-mk. */
export function own(rendered: Rendered[], item: string): Rendered[] {
  return rendered.filter(({ el }) => {
    for (let node: Element | null = el; node; node = node.parentElement) {
      const mk = node.getAttribute("data-mk");
      if (mk !== null && mk !== item) return false;
    }
    return true;
  });
}

/** The component-detail utilities (texture-<DETAILS key>) the item's own elements use. */
export function detailsUsed(rendered: Rendered[], item: string): string[] {
  const used = new Set<string>();
  for (const { classes } of own(rendered, item))
    for (const cls of classes) if (DETAIL_UTILITIES.has(parts(cls).utility)) used.add(parts(cls).utility);
  return [...used].sort();
}

/** The detail the catalog says the item claims, as its utility. */
export function claim(name: string): string[] {
  const item = catalog.find((entry) => entry.name === name);
  expect(item, name).toBeDefined();
  return item!.texture ? [`texture-${item!.texture}`] : [];
}

/** The control focus ring: 2 px of the house ink, 2 px outside. */
export const CONTROL_RING = [
  "focus-visible:outline-2",
  "focus-visible:outline-offset-2",
  "focus-visible:outline-(--ring)",
];

/** The edge a field box draws while it is its own focused control. */
export const SELF_EDGE = ["focus:border-(--fx)", "focus:outline-2", "focus:-outline-offset-2", "focus:outline-(--fx)"];

/** The data-slot values in a source, in order of first appearance. */
export const slotsIn = (code: string) => [...new Set([...code.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]!))];

/** The names a module exports from its closing `export { ... }`. */
export const exportsIn = (code: string) =>
  (code.match(/export\s*\{([^}]*)\}\s*;?\s*$/)?.[1] ?? "")
    .split(",")
    .map((name) =>
      name
        .trim()
        .split(/\s+as\s+/)
        .pop()!,
    )
    .filter(Boolean)
    .sort();
