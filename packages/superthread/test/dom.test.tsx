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
    ["a node in a map", () => expect<unknown>({ a: new Map([["b", new Text("c")]]) }).toEqual({})],
    ["a node keying a map", () => expect<unknown>(new Map([[new Text("a"), 1]])).toEqual(new Map())],
    ["a node in a set", () => expect<unknown>(new Set([new Text("a")])).toStrictEqual(new Set())],
    ["the window", () => expect<unknown>(window).toStrictEqual({})],
    [
      "a node in a mock's calls",
      () => {
        const called = mock();
        called(document.createElement("p"));
        expect(called).toHaveBeenCalledWith("save");
      },
    ],
    [
      "a node in a mock's calls, by an alias",
      () => {
        const called = mock();
        called(document.createElement("p"));
        expect(called).toBeCalledWith("save");
      },
    ],
    // Without the guard this one passes: it writes the node's whole graph to a snapshot file.
    ["a node it would snapshot", () => expect<unknown>(new Map([["a", new Text("b")]])).toMatchSnapshot()],
  ])("refuses to diff %s", (_, assertion) => {
    expect(failure(assertion)).toContain("can't print a DOM node");
  });
});

describe("every matcher Bun ships", () => {
  // Bun's aliases, such as toBeCalledWith and lastCalledWith, are matchers of their own.
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(expect(null))).filter((name) =>
    /^(to[A-Z]|last|nth)/.test(name),
  );
  const holding = (node: Node) => [
    node,
    [node],
    { a: node },
    new Map([["a", node]]),
    new Map([[node, 1]]),
    new Set([node]),
  ];

  // Detached nodes again. The names come from Bun, so one it adds later lands here too.
  test.each(names)("%s fails on a node without walking it", (name) => {
    const node = document.createElement("p");
    const called = mock();
    called(node);
    const returned = mock(() => node);
    returned();
    for (const received of [...holding(node), called, returned]) {
      for (const expected of [[{ a: 1 }], ["a", { b: 1 }], [1, "save"], ...holding(node).map((value) => [value])]) {
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
