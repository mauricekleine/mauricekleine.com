import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { applyTheme, themeKey } from "@/components/superthread/lib/theme";
import { docExamples } from "./fixtures/doc-examples";
import { client } from "./rendered";

const dir = new URL("../items/doc/sections/", import.meta.url);
const sections = readdirSync(dir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => name.slice(0, -5));

test("each plain HTML section has a React example", () => {
  expect(Object.keys(docExamples).sort()).toEqual(sections.sort());
});

test.each(sections)("the %s twin renders the plain section's markup", (name) => {
  const example = docExamples[name as keyof typeof docExamples];
  const html = readFileSync(new URL(`${name}.html`, dir), "utf8");
  expect(markup(renderToStaticMarkup(example))).toEqual(markup(html));
});

function markup(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return Array.from(template.content.childNodes).flatMap(contents);
}

// Compare parsed tags, attributes and text. Ignore attribute order and layout whitespace in the source files.
function contents(node: Node): unknown[] {
  if (node instanceof Element) {
    const attributes = node
      .getAttributeNames()
      .sort()
      .map((name) => [name, node.getAttribute(name)]);
    return [[node.localName, attributes, Array.from(node.childNodes).flatMap(contents)]];
  }
  if (node.nodeType !== Node.TEXT_NODE) return [];
  const text = node.textContent ?? "";
  const normalized = text.includes("\n") ? text.replace(/\s+/g, " ").trim() : text;
  return normalized ? [normalized] : [];
}

test("the document mode button switches the fleet mode and names the next mode", async () => {
  const root = document.documentElement;
  const attrs = [...root.attributes].map(({ name, value }) => ({ name, value }));
  const stored = localStorage.getItem(themeKey);
  applyTheme("dark");
  const { body, done } = await client(docExamples["mode-toggle"]);
  try {
    const button = body.querySelector<HTMLButtonElement>("[data-doc-mode]")!;
    expect(button.getAttribute("aria-label")).toBe("switch to light mode");
    await act(async () => button.click());
    expect(root.getAttribute("data-theme-choice")).toBe("light");
    expect(root.classList.contains("light")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("switch to dark mode");
    expect(localStorage.getItem(themeKey)).toBe("light");
  } finally {
    await done();
    for (const name of root.getAttributeNames()) root.removeAttribute(name);
    for (const { name, value } of attrs) root.setAttribute(name, value);
    document.cookie = `${themeKey}=; path=/; max-age=0`;
    if (stored === null) localStorage.removeItem(themeKey);
    else localStorage.setItem(themeKey, stored);
  }
});
