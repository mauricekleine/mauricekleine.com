import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { catalog } from "../items/catalog.ts";

// Scans every shipped component source, the brand items and the pass items regen writes, as it is served: through
// Bun's transpiler first, so types and comments are gone and JSX text arrives as string children. One test per file,
// so a file's own owner can run its row. Labels a primitive supplies itself never reach the source, so the toast
// viewport, whose Base UI part names itself, is also rendered (into the preload's happy-dom) and its labels read.

const root = join(import.meta.dir, "..");
const FILES = [
  ...new Set(
    catalog
      .flatMap((item) => item.files)
      .filter((file) => file.type === "registry:ui" || file.type === "registry:hook")
      .map((file) => file.path),
  ),
].sort();

/** A source as it is served: transpiled, so types and comments are gone. */
function served(path: string, source = readFileSync(join(root, path), "utf8")): string {
  return new Bun.Transpiler({ loader: path.endsWith(".tsx") ? "tsx" : "ts" }).transformSync(source);
}

/** Every string literal in transpiled code, with its quotes, from `at`. */
const LITERAL = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/y;
const literalAt = (code: string, at: number) => {
  LITERAL.lastIndex = at;
  return LITERAL.exec(code)?.[0];
};
const literals = (code: string) => code.match(new RegExp(LITERAL.source, "g")) ?? [];
const text = (literal: string) => literal.slice(1, -1);

// ---------- motion ----------

/** A class word's variants (`motion-reduce:`) and its utility, split at the last colon outside brackets. */
function split(word: string): { variants: string; utility: string } {
  let depth = 0;
  let last = 0;
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) last = i + 1;
  }
  return { variants: word.slice(0, last), utility: word.slice(last).replace(/^!|!$/g, "") };
}

// `transition`, `transition-all` and `transition-colors` also carry outline-color, so the focus ring would fade in
const WHOLESALE = new Set(["transition", "transition-all", "transition-colors"]);
const NAMES_PROPERTY = /^transition-(?:none|opacity|transform|shadow|\[[^\]]+\])$/;

/**
 * What a class string's motion gets wrong. A duration with no transition property beside it leaves the property at
 * the CSS default, `all`, so it fades the focus ring as a wholesale transition does; the property must sit in the
 * same string, under no variant or the duration's own.
 */
function motionProblems(classes: string): string[] {
  const words = classes
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, ...split(word) }));
  const named = new Set(words.filter((w) => NAMES_PROPERTY.test(w.utility)).map((w) => w.variants));
  const problems: string[] = [];
  for (const w of words) {
    if (WHOLESALE.has(w.utility)) problems.push(`${w.word} transitions everything, the focus ring included`);
    else if (w.utility.startsWith("duration-") && !named.has("") && !named.has(w.variants))
      problems.push(`${w.word} names no transition property, so everything transitions`);
  }
  return problems;
}

// ---------- surfaces ----------

// Tailwind's stock shadows; superthread's lifts are shadow-slip, -leaf, -sheet and -lifted
const STOCK_SHADOW = /^shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?$/;

/**
 * What a class string draws outside the system: a stock shadow instead of a lift, a blur (a layer sits on the
 * world's scrim and never blurs what is under it), a literal radius (the radius tokens keep every corner square), or
 * black or white ink instead of a role.
 */
function surfaceProblems(classes: string): string[] {
  const problems: string[] = [];
  for (const word of classes.split(/\s+/).filter(Boolean)) {
    const { utility } = split(word);
    if (STOCK_SHADOW.test(utility)) problems.push(`${word} is a stock shadow, not one of the lifts`);
    else if (/^(?:backdrop-)?blur(?:-|$)/.test(utility)) problems.push(`${word} blurs`);
    else if (/^rounded(?:-[a-z]+)?-\[/.test(utility)) problems.push(`${word} is a literal radius`);
    else if (/^[a-z-]+-(?:black|white)(?:\/|$)/.test(utility)) problems.push(`${word} is a literal ink`);
  }
  return problems;
}

// ---------- words ----------

/** The string at `at` and, when it opens an array, every string directly inside it. */
function stringsAt(code: string, at: number): string[] {
  const single = literalAt(code, at);
  if (single) return [text(single)];
  if (code[at] !== "[") return [];
  const out: string[] = [];
  let depth = 0;
  for (let i = at; i < code.length; i++) {
    const c = code[i]!;
    const lit = /["'`]/.test(c) ? literalAt(code, i) : undefined;
    if (lit) {
      if (depth === 1) out.push(text(lit));
      i += lit.length - 1;
    } else if ("[({".includes(c)) depth++;
    else if ("])}".includes(c) && --depth === 0) break;
  }
  return out;
}

const LABEL_PROPS = /(?:"aria-(?:label|description|roledescription|valuetext)"|\b(?:title|alt|placeholder))\s*:\s*/g;

/** Every word a component serves as written: JSX text children and the label props. */
function servedWords(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(/\bchildren\s*:\s*/g)) out.push(...stringsAt(code, m.index + m[0].length));
  for (const m of code.matchAll(LABEL_PROPS)) out.push(...stringsAt(code, m.index + m[0].length));
  return out.map((words) => words.replace(/\$\{[^}]*\}/g, "").trim()).filter(Boolean);
}

// ---------- style hooks ----------

/** Upstream's style hooks in a source's strings: `cn-*` classes, which only shadcn's own style sheet defines. */
const styleHooks = (code: string) => [
  ...new Set(
    literals(code)
      .flatMap((literal) => text(literal).split(/\s+/))
      .filter((word) => split(word).utility.startsWith("cn-")),
  ),
];

// ---------- rendered labels ----------

/** What a reader hears that is written for them alone: the label attributes and sr-only text, as rendered. */
const LABEL_ATTRIBUTES = [
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "title",
  "alt",
  "placeholder",
];
const renderedLabels = (scope: ParentNode) => [
  ...[...scope.querySelectorAll(".sr-only")].map((el) => el.textContent ?? ""),
  ...LABEL_ATTRIBUTES.flatMap((name) => [...scope.querySelectorAll(`[${name}]`)].map((el) => el.getAttribute(name)!)),
];

// ---------- the scans ----------

describe("the scanners", () => {
  test("motion: a wholesale transition fails, and so does a duration with no property beside it", () => {
    expect(motionProblems("transition duration-200")).toHaveLength(2);
    expect(motionProblems("transition-colors")).toHaveLength(1);
    expect(motionProblems("fixed duration-(--duration-quick) data-open:opacity-100")).toHaveLength(1);
    expect(motionProblems("transition-[opacity] motion-reduce:duration-0")).toEqual([]);
    expect(motionProblems("motion-reduce:transition-none duration-(--duration-quick)")).toHaveLength(1);
    expect(motionProblems("transition-none duration-(--duration-quick)")).toEqual([]);
    expect(motionProblems("transition-[opacity,translate] duration-200 ease-in-out")).toEqual([]);
  });

  test("surfaces: a stock shadow, a blur, a literal radius and a literal ink fail; lifts, the scrim and tokens do not", () => {
    expect(
      surfaceProblems("shadow-lg bg-black/10 supports-backdrop-filter:backdrop-blur-xs rounded-[2px]"),
    ).toHaveLength(4);
    expect(surfaceProblems("shadow active:shadow-xs blur-sm text-white/80 ring-offset-white")).toHaveLength(5);
    expect(
      surfaceProblems(
        "shadow-sheet shadow-none active:shadow-[inset_0_0_0_1px_var(--key)] bg-scrim rounded-md rounded-t-xl bg-foreground",
      ),
    ).toEqual([]);
  });

  test("words: text children, nested text and label props are found, class names are not", () => {
    const code = served(
      "items/probe.tsx",
      `const a = <span className="sr-only">Close</span>;
const b = <div className="sr-only"><h2>Sidebar</h2><p>shows the {x} nav</p></div>;
const c = <button aria-label="Close toast" title={"Toggle"}>x<Icon name="close" /></button>;`,
    );
    expect(servedWords(code).sort()).toEqual(["Close", "Close toast", "Sidebar", "Toggle", "nav", "shows the", "x"]);
  });

  test("style hooks: a cn-* class is found under any variant, the cn() call and other classes are not", () => {
    const code = served(
      "items/probe.tsx",
      `const a = <Icon name="left" className="cn-rtl-flip size-4" />;
const b = cn("px-2 data-open:cn-menu-target", c);`,
    );
    expect(styleHooks(code).sort()).toEqual(["cn-rtl-flip", "data-open:cn-menu-target"]);
    expect(styleHooks(served("items/probe.tsx", `const c = cn("rtl:rotate-180 px-2");`))).toEqual([]);
  });
});

describe("every shipped item, as served", () => {
  for (const path of FILES) {
    test(`${path}: every duration names its transition, and nothing transitions wholesale`, () => {
      const problems = literals(served(path)).flatMap((literal) =>
        motionProblems(text(literal)).map((problem) => `${literal.slice(0, 60)}: ${problem}`),
      );
      expect(problems).toEqual([]);
    });

    test(`${path}: draws with the lifts, the scrim, square corners and the role inks`, () => {
      const problems = literals(served(path)).flatMap((literal) =>
        surfaceProblems(text(literal)).map((problem) => `${literal.slice(0, 60)}: ${problem}`),
      );
      expect(problems).toEqual([]);
    });

    test(`${path}: every word it serves is lowercase`, () => {
      expect(servedWords(served(path)).filter((words) => /[A-Z]/.test(words))).toEqual([]);
    });

    test(`${path}: names no style hook, brand item or pass item`, () => {
      expect(styleHooks(served(path))).toEqual([]);
    });
  }

  test("the scan covers every component the catalog ships", () => {
    expect(FILES.length).toBeGreaterThan(20);
    expect(FILES).toContain("items/ui/sheet.tsx");
    expect(FILES).toContain("items/hooks/use-mobile.ts");
  });
});

describe("labels a primitive supplies, rendered", () => {
  test("items/ui/toast.tsx: every label on the viewport and its toasts is lowercase, Base UI's own included", async () => {
    // imported here, so a broken toast fails this row alone
    const toast = await import("@/components/superthread/ui/toast");
    const manager = toast.createToastManager();
    const host = document.createElement("div");
    document.body.append(host);
    const reactRoot = createRoot(host);
    try {
      await act(async () => reactRoot.render(createElement(toast.Toaster, { toastManager: manager, timeout: 0 })));
      await act(async () => {
        manager.add({
          title: "run done",
          description: "synthetic",
          type: "success",
          actionProps: { children: "undo" },
        });
      });
      const viewport = document.body.querySelector('[data-slot="toast-viewport"]');
      expect(viewport?.getAttribute("aria-label")).toBeTruthy();
      expect(document.body.querySelector('[data-slot="toast"]')).not.toBeNull();
      expect(renderedLabels(document.body).filter((label) => /[A-Z]/.test(label))).toEqual([]);
    } finally {
      await act(async () => reactRoot.unmount());
      host.remove();
    }
  });
});
