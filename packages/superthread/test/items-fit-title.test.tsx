// Fit title. happy-dom measures nothing, so a small model of a browser's line breaking stands in at the DOM getters the
// item reads: it wraps the ruler's words at the box's width, at the size its step class names. The fixtures hold the
// sizes; the steps' real values, and that they hold the job sheet's slots, belong to items-job-sheet.test.tsx.
import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, type ReactNode } from "react";
import { FitTitle } from "@/components/superthread/ui/fit-title";
import { client, CONTROL_RING, elements, forbidden, one, server } from "./rendered.tsx";

const FACES: Record<string, { size: number; line: number }> = {
  "type-display": { size: 76, line: 80 },
  "type-hero": { size: 64, line: 68 },
  "type-headline": { size: 40, line: 44 },
  "type-section": { size: 30, line: 34 },
  "type-long": { size: 26, line: 29 },
};

// What the model reads: the box, and how wide a character prints. A face arriving widens the characters.
let box = { width: 784, height: 136 };
let glyph = 0.6;

const face = (el: HTMLElement) => FACES[el.className] ?? { size: 16, line: 20 };

function layout(el: HTMLElement) {
  const { size, line } = face(el);
  const measure = Math.floor(box.width / (size * glyph));
  const breaking = el.style.overflowWrap === "anywhere";
  let lines = 1;
  let used = 0;
  let widest = 0;
  for (const word of (el.textContent ?? "").split(" ")) {
    widest = Math.max(widest, word.length);
    const needed = used === 0 ? word.length : used + 1 + word.length;
    if (needed <= measure) {
      used = needed;
    } else if (word.length <= measure) {
      if (used > 0) lines++;
      used = word.length;
    } else if (breaking) {
      lines += Math.ceil(word.length / measure) - (used === 0 ? 1 : 0);
      used = word.length % measure;
    } else {
      if (used > 0) lines++;
      used = word.length;
    }
  }
  return {
    height: lines * line,
    width: breaking ? box.width : Math.ceil(widest * size * glyph),
  };
}

const isRuler = (el: HTMLElement) => el.style.visibility === "hidden";

const getters = {
  clientWidth() {
    return box.width;
  },
  clientHeight() {
    return box.height;
  },
  offsetHeight(this: HTMLElement) {
    return isRuler(this) ? layout(this).height : box.height;
  },
  scrollWidth(this: HTMLElement) {
    return isRuler(this) ? Math.max(layout(this).width, box.width) : box.width;
  },
};

class Observer {
  static live = new Set<() => void>();
  callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  observe() {
    Observer.live.add(this.callback);
  }
  unobserve() {}
  disconnect() {
    Observer.live.delete(this.callback);
  }
}

const realGetters = new Map<string, PropertyDescriptor | undefined>();
const realObserver = globalThis.ResizeObserver;
const fonts = new EventTarget();
let unstub: () => void;
let cleanups: (() => Promise<void>)[] = [];

beforeEach(() => {
  box = { width: 784, height: 136 };
  glyph = 0.6;
  for (const [name, get] of Object.entries(getters)) {
    realGetters.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
    Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get });
  }
  globalThis.ResizeObserver = Observer as unknown as typeof ResizeObserver;
  Object.defineProperty(document, "fonts", { configurable: true, value: fonts });
  const computed = spyOn(window, "getComputedStyle").mockImplementation(
    (el: Element) => ({ lineHeight: `${face(el as HTMLElement).line}px` }) as CSSStyleDeclaration,
  );
  unstub = () => computed.mockRestore();
});

afterEach(async () => {
  for (const done of cleanups) await done();
  cleanups = [];
  unstub();
  for (const [name, descriptor] of realGetters) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
  globalThis.ResizeObserver = realObserver;
  delete (document as unknown as { fonts?: unknown }).fonts;
  Observer.live.clear();
});

async function mount(node: ReactNode) {
  const { body, done } = await client(node);
  cleanups.push(done);
  const title = () => one(body, '[data-slot="fit-title"]');
  return { body, title, step: () => title().el.getAttribute("data-step") };
}

const printed = (title: Element) => title.querySelector('[aria-hidden="true"]')?.textContent ?? title.textContent;
const words = (count: number, word = "word") => Array.from({ length: count }, () => word).join(" ");

describe("the ladder", () => {
  test("prints at the largest step that holds the whole title", async () => {
    expect((await mount(<FitTitle>reply to sam about chapter 7</FitTitle>)).step()).toBe("hero");
    for (const [count, step] of [
      [9, "headline"],
      [19, "section"],
      [33, "long"],
    ] as const) {
      const { body, title } = await mount(<FitTitle data-count={count}>{words(count)}</FitTitle>);
      const heading = one(body, `[data-count="${count}"]`).el;
      expect(heading.getAttribute("data-step"), `${count} words`).toBe(step);
      expect(heading.textContent).toBe(words(count));
      expect(title().el.hasAttribute("data-cut")).toBe(false);
    }
  });

  test("steps down by fit: the same number of characters takes the step its words allow", async () => {
    box = { width: 400, height: 88 };
    const even = "abcdefghi abcdefghi abcdefghi";
    const uneven = "abc abcdefghijklmnopqrstuvwxy";
    expect(even.length).toBe(uneven.length);
    const first = await mount(<FitTitle data-title="even">{even}</FitTitle>);
    const second = await mount(<FitTitle data-title="uneven">{uneven}</FitTitle>);
    const stepOf = (name: string, body: HTMLElement) =>
      one(body, `[data-title="${name}"]`).el.getAttribute("data-step");
    expect(stepOf("even", first.body)).toBe("section");
    expect(stepOf("uneven", second.body)).toBe("long");
  });

  test("hero needs a full panel's measure, so a narrower box starts at headline", async () => {
    box = { width: 783, height: 600 };
    const narrow = await mount(<FitTitle data-width="783">renewal call</FitTitle>);
    expect(one(narrow.body, '[data-width="783"]').el.getAttribute("data-step")).toBe("headline");
    box = { width: 784, height: 600 };
    const full = await mount(<FitTitle data-width="784">renewal call</FitTitle>);
    expect(one(full.body, '[data-width="784"]').el.getAttribute("data-step")).toBe("hero");
  });

  test("a ladder of one step keeps it at any width", async () => {
    box = { width: 300, height: 600 };
    const { step } = await mount(<FitTitle steps={["display"]}>all clear.</FitTitle>);
    expect(step()).toBe("display");
  });

  test("steps holds it to a shorter ladder", async () => {
    const { step } = await mount(<FitTitle steps={["section", "long"]}>renewal call</FitTitle>);
    expect(step()).toBe("section");
  });

  test("a word too long for a step drops the title a step, because only the last step may break a word", async () => {
    box = { width: 400, height: 176 };
    const { step, title } = await mount(<FitTitle>{"a".repeat(24)}</FitTitle>);
    expect(step()).toBe("long");
    expect(title().el.hasAttribute("data-cut")).toBe(false);
    expect(title().classes).toContain("[overflow-wrap:anywhere]");
  });

  test("lines sets the room in place of the box's height", async () => {
    box = { width: 400, height: 20 };
    const { step, title } = await mount(
      <FitTitle lines={3} steps={["section", "long"]}>
        {words(13)}
      </FitTitle>,
    );
    expect(step()).toBe("long");
    expect(title().el.hasAttribute("data-cut")).toBe(false);
  });
});

describe("the cut", () => {
  const TITLE = "check whether the deck still matches the numbers sam sent, after the last call, and fix what moved";

  test("runs only past the last step, and stops at the last whole word that fits", async () => {
    box = { width: 300, height: 87 };
    const { title } = await mount(<FitTitle>{TITLE}</FitTitle>);
    expect(title().el.getAttribute("data-step")).toBe("long");
    expect(title().el.hasAttribute("data-cut")).toBe(true);
    expect(printed(title().el)).toBe("check whether the deck still matches the numbers sam…");
  });

  test("drops the punctuation before the ellipsis", async () => {
    box = { width: 300, height: 29 };
    const { title } = await mount(<FitTitle>check the deck, then fix the numbers and send it back</FitTitle>);
    expect(printed(title().el)).toBe("check the deck…");
  });

  test("cuts inside a first word that can't fit at all", async () => {
    box = { width: 150, height: 29 };
    const { title } = await mount(<FitTitle>{`${"a".repeat(40)} second`}</FitTitle>);
    expect(printed(title().el)).toBe(`${"a".repeat(8)}…`);
  });

  test("keeps every word for a screen reader and the tooltip", async () => {
    box = { width: 300, height: 87 };
    const { title } = await mount(<FitTitle>{TITLE}</FitTitle>);
    expect(title().el.getAttribute("title")).toBe(TITLE);
    expect(one(title().el, ".sr-only").el.textContent).toBe(TITLE);
    expect(title().el.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  test("a whole title prints once, with no tooltip", async () => {
    const { title } = await mount(<FitTitle>renewal call</FitTitle>);
    expect(title().el.textContent).toBe("renewal call");
    expect(title().el.hasAttribute("title")).toBe(false);
    expect(title().el.querySelector(".sr-only")).toBeNull();
  });
});

describe("fitting again", () => {
  const fit = () => act(async () => [...Observer.live].forEach((run) => run()));

  test("follows its box", async () => {
    const { step } = await mount(<FitTitle>{words(9)}</FitTitle>);
    expect(step()).toBe("headline");
    box = { width: 300, height: 136 };
    await fit();
    expect(step()).toBe("section");
  });

  test("follows a face that arrives after the first fit", async () => {
    const { step } = await mount(<FitTitle>{words(13)}</FitTitle>);
    expect(step()).toBe("headline");
    glyph = 1;
    await act(async () => {
      fonts.dispatchEvent(new Event("loadingdone"));
    });
    expect(step()).toBe("section");
  });

  test("stops listening when it unmounts", async () => {
    const { done } = await client(<FitTitle>renewal call</FitTitle>);
    expect(Observer.live.size).toBe(1);
    await done();
    expect(Observer.live.size).toBe(0);
  });

  test("leaves no ruler behind", async () => {
    const { title } = await mount(<FitTitle>renewal call</FitTitle>);
    expect(title().el.children).toHaveLength(0);
  });
});

describe("the title", () => {
  test("a server prints every word, at a step that holds at every width, clipped to its box", () => {
    const { el, classes } = one(server(<FitTitle>{words(40)}</FitTitle>), '[data-slot="fit-title"]');
    expect(el.textContent).toBe(words(40));
    expect(el.getAttribute("data-step")).toBe("headline");
    expect(classes).toContain("overflow-hidden");
  });

  test("gives up its clip once it fits, so a focus ring prints whole", async () => {
    const { title } = await mount(<FitTitle href="/tasks/7">renewal call</FitTitle>);
    expect(title().classes).not.toContain("overflow-hidden");
  });

  test("prints in the first ink as an h1 until the page says otherwise", () => {
    const first = one(server(<FitTitle>renewal call</FitTitle>), "h1");
    expect(first.classes).toContain("text-first");
    const second = one(server(<FitTitle render={<h2 />}>renewal call</FitTitle>), "h2");
    expect(second.el.getAttribute("data-mk")).toBe("fit-title");
  });

  test("every step it can print is a utility the system emits, kept beside the title's ink", async () => {
    const css = readFileSync(join(import.meta.dir, "../dist/v2/superthread.css"), "utf8");
    box = { width: 784, height: 600 };
    for (const step of ["display", "hero", "headline", "section", "long"] as const) {
      const { body } = await mount(
        <FitTitle data-only={step} steps={[step]}>
          renewal call
        </FitTitle>,
      );
      expect(one(body, `[data-only="${step}"]`).classes).toContain(`type-${step}`);
      expect(css).toContain(`@utility type-${step} {`);
    }
  });

  test("hands its heading to the page's ref", async () => {
    const ref: { current: HTMLElement | null } = { current: null };
    const { title } = await mount(<FitTitle ref={ref as React.RefObject<HTMLHeadingElement>}>renewal call</FitTitle>);
    expect(ref.current).toBe(title().el as HTMLElement);
  });
});

describe("the link", () => {
  test("href takes the reader to the whole title, underlined on hover and 44 px on a phone", () => {
    const { el, classes } = one(server(<FitTitle href="/tasks/7">renewal call</FitTitle>), "h1 > a");
    expect(el.getAttribute("href")).toBe("/tasks/7");
    expect(el.getAttribute("data-slot")).toBe("fit-title-link");
    expect(classes).toEqual(
      expect.arrayContaining(["hover:underline", "[@media(max-width:600px)]:min-h-11", ...CONTROL_RING]),
    );
  });

  test("a router's link keeps it", () => {
    const { classes } = one(
      server(<FitTitle link={<a data-router href="/tasks/7" />}>renewal call</FitTitle>),
      "[data-router]",
    );
    expect(classes).toContain("hover:underline");
  });

  test("a cut title keeps its words inside the link", async () => {
    box = { width: 150, height: 29 };
    const { body } = await mount(<FitTitle href="/tasks/7">{words(30)}</FitTitle>);
    expect(one(body, "h1 > a .sr-only").el.textContent).toBe(words(30));
  });

  test("no link prints without a place to go", () => {
    expect(server(<FitTitle>renewal call</FitTitle>).querySelector("a")).toBeNull();
  });
});

test("keeps the system's rules", () => {
  expect(forbidden(elements(server(<FitTitle href="/tasks/7">renewal call</FitTitle>)))).toEqual([]);
});
