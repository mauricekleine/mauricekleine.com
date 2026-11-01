// What the base layer reaches, matched on real markup. A base rule loses to every item and utility, so these hold what
// a ship gets by writing nothing: the ring, the two faces, the panel's wrap and the panel's plain link.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { ListRow, ListRowAside, ListRowMeta, ListRows, ListRowTitle } from "@/components/superthread/blocks/list-rows";
import { Section, SectionAction, SectionHeader, SectionTitle } from "@/components/superthread/blocks/section-header";
import { child, parse, type Rule, value } from "./css.ts";
import { one, server } from "./rendered.tsx";

const base = child(parse(readFileSync(join(import.meta.dir, "../tokens/base.css"), "utf8")), "@layer base");
const setting = (prop: string) => base.rules.filter((rule) => value(rule, prop) !== undefined);
const fragment = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
};

describe("the focus ring", () => {
  const ring: Rule = base.rules.find((rule) => rule.sel.endsWith(":focus-visible"))!;
  const control = ring.sel.replace(/:focus-visible$/, "");
  const reaches = (html: string) => fragment(html).firstElementChild!.matches(control);

  test("draws 2 px outside at 2 px", () => {
    expect(ring.decls).toEqual([
      ["outline", "2px solid var(--ring)"],
      ["outline-offset", "2px"],
    ]);
  });

  test.each([
    '<a href="/x"></a>',
    "<button></button>",
    "<summary></summary>",
    '<div role="tab"></div>',
    '<span role="button"></span>',
    '<span role="link" tabindex="0"></span>',
    '<span role="checkbox"></span>',
    '<span role="radio"></span>',
    '<span role="switch"></span>',
    '<span role="slider"></span>',
    '<div role="menuitem"></div>',
    '<div role="menuitemcheckbox"></div>',
    '<div role="menuitemradio"></div>',
    '<div role="option"></div>',
    '<div role="treeitem"></div>',
    '<div tabindex="0"></div>',
  ])("reaches %s", (html) => expect(reaches(html)).toBe(true));

  test.each([
    "<input />",
    '<input role="combobox" />',
    "<textarea></textarea>",
    "<select></select>",
    '<div contenteditable="true" tabindex="0"></div>',
    '<button data-slot="select-trigger"></button>',
    '<main tabindex="-1"></main>',
    "<div></div>",
  ])("leaves %s to its own edge, or has nothing to ring", (html) => expect(reaches(html)).toBe(false));
});

describe("the faces", () => {
  // the last rule that sets a face on an element, the cascade's answer for selectors in source order
  const face = (el: Element) => {
    const rules = setting("font-family").filter((rule) => el.matches(rule.sel));
    return rules.length > 0 ? value(rules.at(-1)!, "font-family") : undefined;
  };

  test("code sets in mono, in a sentence too", () => {
    expect(face(one(fragment("<p>run <code>ls</code></p>"), "code").el)).toBe("var(--font-mono)");
  });

  test.each([
    ["a table cell", "<table><tbody><tr><td><time>11:00</time></td></tr></tbody></table>"],
    ["a fact", "<dl><dd><time>11:00</time></dd></dl>"],
    ["a bare line", "<div><time>11:00</time></div>"],
  ])("a time in %s sets in mono", (_, html) => {
    expect(face(one(fragment(html), "time").el)).toBe("var(--font-mono)");
  });

  test("a time in running text and in a row's line reads with its words", () => {
    expect(face(one(fragment("<p>back at <time>11:00</time></p>"), "time").el)).toBe("inherit");
    const row = server(
      <ListRows aria-label="runs">
        <ListRow>
          <ListRowTitle>standup notes</ListRowTitle>
          <ListRowMeta>
            <time>11:00</time>
          </ListRowMeta>
          <ListRowAside>
            <time>12:00</time>
          </ListRowAside>
        </ListRow>
      </ListRows>,
    );
    expect(face(one(row, '[data-slot="list-row-meta"] time').el)).toBe("inherit");
    // the aside holds a column: its mono reaches the time through the inherit
    expect(one(row, '[data-slot="list-row-aside"]').classes).toContain("font-mono");
  });
});

describe("the panel", () => {
  const panel = server(
    <AppShellPanel>
      <Section>
        <SectionHeader>
          <SectionTitle>runs</SectionTitle>
          <SectionAction href="/runs">all runs</SectionAction>
        </SectionHeader>
        <p>
          read <a href="/notes">the notes</a>
        </p>
        <dl>
          <dd>0xdeadbeefdeadbeefdeadbeef</dd>
        </dl>
        <ListRows aria-label="runs">
          <ListRow>
            <ListRowTitle render={<a href="/run" />}>a run</ListRowTitle>
          </ListRow>
        </ListRows>
      </Section>
    </AppShellPanel>,
  );
  const wrap = setting("overflow-wrap").find((rule) => rule.sel.includes("app-shell-panel"))!;
  const plain = setting("text-decoration-line").find((rule) => rule.sel.includes("app-shell-panel"))!;

  test("is a size container", () => {
    expect(one(panel, '[data-slot="app-shell-panel"]').classes).toContain("@container/panel");
  });

  test.each(["p", "dd", "h2", "li"])("wraps a long word in %s", (tag) => {
    expect(one(panel, tag).el.matches(wrap.sel)).toBe(true);
    expect(value(wrap, "overflow-wrap")).toBe("anywhere");
  });

  test("leaves text outside it and a table's cells alone", () => {
    expect(one(fragment("<p>outside</p>"), "p").el.matches(wrap.sel)).toBe(false);
    // happy-dom can't evaluate a complex selector inside :not, and a table sized by its content needs this exception
    expect(wrap.sel).toEndWith(":not(td *, th *)");
  });

  test("prints an anchor no item owns as a foreground link with a 1 px underline, 4 px down", () => {
    expect(plain.decls).toEqual([
      ["color", "var(--foreground)"],
      ["text-decoration-line", "underline"],
      ["text-decoration-thickness", "1px"],
      ["text-underline-offset", "4px"],
    ]);
    expect(one(panel, 'a[href="/notes"]').el.matches(plain.sel)).toBe(true);
  });

  test("leaves an item's own link to the item, and an anchor outside the panel to the page", () => {
    expect(one(panel, 'a[href="/run"]').el.matches(plain.sel)).toBe(false);
    expect(one(panel, 'a[href="/runs"]').el.matches(plain.sel)).toBe(false);
    expect(one(fragment('<a href="/x"></a>'), "a").el.matches(plain.sel)).toBe(false);
  });
});
