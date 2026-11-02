// The one test of what a bare key may do: a letter never lands in a field and never reaches past a layer that keeps it.
import { afterEach, describe, expect, test } from "bun:test";
import { isPageKey } from "@/components/superthread/lib/hotkey";

afterEach(() => {
  document.body.replaceChildren();
});

/** A keydown on the `data-target` element of `html`, as the document's listener receives it. */
function press(html: string, init: KeyboardEventInit = {}) {
  document.body.innerHTML = html;
  const target = document.body.querySelector("[data-target]")!;
  let seen = false;
  const listener = (event: Event) => {
    seen = isPageKey(event as KeyboardEvent, "n");
  };
  document.addEventListener("keydown", listener);
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true, ...init }));
  document.removeEventListener("keydown", listener);
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
