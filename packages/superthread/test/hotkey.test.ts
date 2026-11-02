// The one test of what a bare key may do: a letter never lands in a field and never reaches past a layer that keeps it.
import { afterEach, describe, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { isPageKey } from "@/components/superthread/lib/hotkey";
import { ownClasses } from "./rendered.tsx";

afterEach(() => {
  document.body.replaceChildren();
});

/**
 * A keydown on the `data-target` element of `html`, as the listener on its document receives it. The page is the test's
 * own document unless another is given, whose elements answer to their own classes, and the event is built from that
 * document's window, as a browser's would be.
 */
function press(html: string, init: KeyboardEventInit = {}, page: Document = document) {
  page.body.innerHTML = html;
  if (page !== document) ownClasses(page.body);
  const target = page.body.querySelector("[data-target]")!;
  const view = page.defaultView as unknown as typeof globalThis;
  let seen = false;
  const listener = (event: Event) => {
    seen = isPageKey(event as KeyboardEvent, "n");
  };
  page.addEventListener("keydown", listener);
  target.dispatchEvent(new view.KeyboardEvent("keydown", { key: "n", bubbles: true, ...init }));
  page.removeEventListener("keydown", listener);
  return seen;
}

describe("isPageKey", () => {
  test("a keydown with no key, as a browser's autofill sends, answers nothing and throws nothing", () => {
    expect(isPageKey(new Event("keydown") as KeyboardEvent, "n")).toBe(false);
  });

  test("answers the key on the page, on a button and on an input that takes no text", () => {
    for (const html of [
      "<main data-target></main>",
      "<button data-target>x</button>",
      '<input data-target type="checkbox">',
      '<input data-target type="radio">',
      '<div data-target contenteditable="false">x</div>',
    ])
      expect(press(html), html).toBe(true);
  });

  test("leaves anywhere that takes text alone, and what sits inside it", () => {
    for (const html of [
      "<input data-target>",
      '<input data-target type="search">',
      "<textarea data-target></textarea>",
      "<select data-target></select>",
      "<div contenteditable><span data-target>x</span></div>",
      '<div data-target role="textbox"></div>',
      '<div data-target role="searchbox"></div>',
      '<button data-target role="combobox"></button>',
    ])
      expect(press(html), html).toBe(false);
  });

  test("a modal or a list that jumps by letter keeps the key, even on a plain button inside it", () => {
    for (const role of ["dialog", "alertdialog", "menu", "listbox"])
      expect(press(`<div role="${role}"><button data-target>x</button></div>`), role).toBe(false);
  });

  test("a native dialog keeps the key, though it has no role to read", () => {
    expect(press("<dialog open><button data-target>x</button></dialog>")).toBe(false);
  });

  test("in another window's document, as an iframe's or a window the page opened, the same targets answer alike", async () => {
    const other = new Window();
    const page = other.document as unknown as Document;
    try {
      for (const [html, answers] of [
        ["<button data-target>x</button>", true],
        ['<input data-target type="checkbox">', true],
        ["<input data-target>", false],
        ["<textarea data-target></textarea>", false],
        ["<div contenteditable><span data-target>x</span></div>", false],
        ['<div role="dialog"><button data-target>x</button></div>', false],
      ] as const)
        expect(press(html, {}, page), html).toBe(answers);
    } finally {
      await other.happyDOM.close();
    }
  });

  test("takes no modifier, no held key, no composition and no other key", () => {
    for (const init of [
      { metaKey: true },
      { ctrlKey: true },
      { altKey: true },
      { shiftKey: true },
      { repeat: true },
      { isComposing: true },
      { key: "m" },
    ])
      expect(press("<main data-target></main>", init), JSON.stringify(init)).toBe(false);
  });

  test("a letter matches with caps lock on", () => {
    expect(press("<main data-target></main>", { key: "N" })).toBe(true);
  });

  test("a key something else has taken stays taken", () => {
    document.body.innerHTML = "<button>x</button>";
    const button = document.body.querySelector("button")!;
    button.addEventListener("keydown", (event) => event.preventDefault());
    let seen = true;
    const listener = (event: Event) => {
      seen = isPageKey(event as KeyboardEvent, "n");
    };
    document.addEventListener("keydown", listener);
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true, cancelable: true }));
    document.removeEventListener("keydown", listener);
    expect(seen).toBe(false);
  });
});
