// The package suite's one DOM, preloaded by bunfig.toml before any test file loads. Base UI picks its layout effect
// when it is first imported, by whether a document exists, and Bun shares that module across test files, so happy-dom
// registers here, before any test imports Base UI, React's client renderer or an item. Tests that mount clean up
// their own renders; this file owns the globals, and how a failed expect prints a DOM value.
import { afterAll, expect } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { GlobalWindow } from "happy-dom";

GlobalRegistrator.register();
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterAll(async () => {
  delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  await GlobalRegistrator.unregister();
});

/**
 * Bun prints what a failed `expect` got by walking the object, and from a DOM node that walk reaches the document, the
 * window and every global: 27 MB for one rendered button, past 100 GB for a page. The inspect hook stops the walk, so
 * a node prints as its markup and the window as a word.
 */
const inspect = Symbol.for("nodejs.util.inspect.custom");
const printedLength = 500;
Object.defineProperty(Node.prototype, inspect, {
  value(this: Node) {
    const printed = this instanceof Element ? this.outerHTML : (this.nodeValue ?? this.nodeName);
    return printed.length > printedLength ? `${printed.slice(0, printedLength)}...` : printed;
  },
});
for (const window of [globalThis, GlobalWindow.prototype]) {
  Object.defineProperty(window, inspect, { value: () => "[window]" });
}

/**
 * An objectContaining matcher holds its sample apart from its properties, and the diff prints it, so the guard keeps each
 * sample beside its matcher. Bun's other asymmetric matchers print as a name.
 */
const samples = new WeakMap<object, unknown>();
type Factories = { objectContaining: (this: unknown, sample: unknown) => object };
for (const factories of [expect, Object.getPrototypeOf(expect.not)] as Factories[]) {
  const { objectContaining } = factories;
  factories.objectContaining = function (sample) {
    const matcher = objectContaining.call(this, sample);
    samples.set(matcher, sample);
    return matcher;
  };
}

function reachesDom(values: unknown[]): boolean {
  const seen = new Set<unknown>();
  for (const value of values) {
    if ((typeof value !== "object" && typeof value !== "function") || !value || seen.has(value)) {
      continue;
    }
    if (value instanceof Node || value instanceof GlobalWindow || value === globalThis) {
      return true;
    }
    seen.add(value);
    // The loop reaches what it pushes. An accessor stays unread, as it does in the diff.
    for (const key of Reflect.ownKeys(value)) {
      values.push(Object.getOwnPropertyDescriptor(value, key)?.value);
    }
    // A map or a set holds its entries apart from its properties, and the diff prints them.
    if (value instanceof Map) {
      for (const [key, entry] of value) {
        values.push(key, entry);
      }
    } else if (value instanceof Set) {
      // One at a time: a spread of 700k entries or more overflows the stack.
      for (const entry of value) {
        values.push(entry);
      }
    } else if (samples.has(value)) {
      values.push(samples.get(value));
    }
  }
  return false;
}

type Matcher = (this: { peekReceived(): void }, ...expected: unknown[]) => unknown;
type Mocked = { mock?: { calls: unknown; results: unknown } } | null | undefined;
const matchers = Object.getPrototypeOf(expect(null)) as Record<string, Matcher>;
let received: unknown;
expect.extend({
  peekReceived(value: unknown) {
    received = value;
    return { message: () => "", pass: !this.isNot };
  },
});

/**
 * The diff behind these matchers, as of Bun 1.4.4, ignores the hook and reads every property by every path, so on a
 * value that reaches the DOM it grows until the machine stops it: 1.7 GB for one rendered button. They refuse that value
 * up front. Bun's aliases, such as toBeCalledWith, are matchers of their own, so the list names them too. The
 * ReturnedWith matchers print through the hook, so the list leaves them out.
 *
 * The refusal lasts until Bun's diff prints a node through the hook. To check a newer Bun, empty this list and run
 * `CI=true bun test test/dom.test.tsx` under a memory cap, so a failing snapshot prints instead of writing; the run
 * still leaves a header-only `test/__snapshots__/dom.test.tsx.snap`, which goes with it. Once its "every matcher Bun
 * ships" tests pass, delete the list, its loop, reachesDom, the objectContaining samples and the refusal tests.
 */
const diffMatchers = [
  "lastCalledWith",
  "nthCalledWith",
  "toBeCalledWith",
  "toEqual",
  "toHaveBeenCalledWith",
  "toHaveBeenLastCalledWith",
  "toHaveBeenNthCalledWith",
  "toHaveProperty",
  "toMatchInlineSnapshot",
  "toMatchObject",
  "toMatchSnapshot",
  "toStrictEqual",
];
for (const name of diffMatchers) {
  const matcher = matchers[name] as Matcher;
  matchers[name] = function (...expected) {
    this.peekReceived();
    const mock = (received as Mocked)?.mock;
    if (reachesDom([received, mock?.calls, mock?.results, ...expected])) {
      throw new Error(`${name} can't print a DOM node: compare its text, or use toBe`);
    }
    return matcher.apply(this, expected);
  };
}
