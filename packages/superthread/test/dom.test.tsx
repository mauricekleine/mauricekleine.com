// How a failed expect prints a DOM value, which the preload in dom.ts owns. Without it one failing assertion on a
// rendered item prints megabytes to gigabytes and can take the machine down with it.
import { describe, expect, mock, test } from "bun:test";
import { Button } from "@/components/superthread/ui/button";
import { client } from "./rendered.tsx";

type Matcher = (...expected: unknown[]) => unknown;

/** What an assertion prints, if anything. */
function said(assertion: () => unknown): string {
  try {
    assertion();
  } catch (error) {
    return (error as Error).message;
  }
  return "";
}

/** What a failed assertion prints, so a test can hold its size. */
function failure(assertion: () => unknown): string {
  const printed = said(assertion);
  if (!printed) {
    throw new Error("The assertion passed");
  }
  return printed;
}

async function page() {
  const { body, done } = await client(
    <main>
      <Button>send</Button>
      <p>{"a long line ".repeat(100)}</p>
    </main>,
  );
  return { button: body.querySelector("button"), done };
}

describe("a failed expect on the DOM", () => {
  test.each([
    ["a node it got", (button: HTMLElement | null) => expect(button).toBeNull()],
    ["a node on both sides", (button: HTMLElement | null) => expect(button).toBe(document.body)],
    ["a node inside a value", (button: HTMLElement | null) => expect<unknown>([button]).toContain("save")],
  ])("prints %s as markup", async (_, assertion) => {
    const { button, done } = await page();
    try {
      const printed = failure(() => assertion(button));
      expect(printed).toContain("<button");
      expect(printed.length).toBeLessThan(2000);
    } finally {
      await done();
    }
  });

  test("cuts a long node short", async () => {
    const { done } = await page();
    try {
      expect(Bun.inspect(document.body).length).toBeLessThan(600);
    } finally {
      await done();
    }
  });

  test("prints the window as a word", () => {
    expect(Bun.inspect(window)).toContain("[window]");
  });

  // Detached nodes, so a regression fails here rather than printing a whole page's graph.
  test.each([
    ["a node", () => expect<unknown>(document.createElement("p")).toEqual({ a: 1 })],
    ["a node it expects", () => expect<unknown>({ a: 1 }).toEqual(document.createElement("p"))],
    ["a node deep in a value", () => expect<unknown>({ a: [document.createElement("p")] }).toEqual({})],
    ["a node in a symbol key", () => expect<unknown>({ [Symbol("a")]: new Text("b") }).toMatchObject({})],
    ["the window", () => expect<unknown>(window).toStrictEqual({})],
    [
      "a node in a mock's calls",
      () => {
        const called = mock();
        called(document.createElement("p"));
        expect(called).toHaveBeenCalledWith("save");
      },
    ],
  ])("refuses to diff %s", (_, assertion) => {
    expect(failure(assertion)).toContain("can't print a DOM node");
  });
});

describe("every matcher Bun ships", () => {
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(expect(null))).filter((name) => /^to[A-Z]/.test(name));

  // Detached nodes again. The names come from Bun, so one it adds later lands here too.
  test.each(names)("%s fails on a node without walking it", (name) => {
    const node = document.createElement("p");
    for (const received of [node, [node], { a: node }]) {
      for (const expected of [[{ a: 1 }], [node], [[node]], ["a", { b: 1 }]]) {
        const matchers = expect<unknown>(received) as unknown as Record<string, Matcher>;
        expect(said(() => matchers[name]?.(...expected)).length).toBeLessThan(2000);
      }
    }
  });
});

describe("a failed expect on plain data", () => {
  test("keeps its own diff", () => {
    const printed = failure(() => expect({ a: 1 }).toEqual({ a: 2 }));
    expect(printed).toContain("toEqual");
    expect(printed).toContain('"a": 2');
  });

  test("still resolves a promise and honours not", async () => {
    await expect(Promise.resolve({ a: 1 })).resolves.toEqual({ a: 1 });
    expect({ a: 1 }).not.toEqual({ a: 2 });
    expect(() => expect({ a: 1 }).not.toEqual({ a: 1 })).toThrow();
  });
});
