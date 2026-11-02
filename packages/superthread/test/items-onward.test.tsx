// The way onward from a page, and the door out of a finished one. A router link reaches them through render, so the
// tests read one too.
import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Door, Onward } from "@/components/superthread/ui/onward";
import { Icon } from "@/components/superthread/ui/glyphs";
import { CONTROL_RING, elements, forbidden, one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const pathOf = (html: string) => /<path d="([^"]+)"/.exec(html)?.[1];
const arrow = pathOf(renderToString(<Icon name="arrow" />));
const left = pathOf(renderToString(<Icon name="left" />));

describe("onward", () => {
  test("a word and its arrow, in that order, as a link in foreground at the ui step", () => {
    const link = one(server(<Onward href="/week">the week</Onward>), 'a[data-slot="onward"]');
    expect(link.el.getAttribute("href")).toBe("/week");
    expect(link.el.getAttribute("data-mk")).toBe("onward");
    expect(link.classes).toEqual(expect.arrayContaining(["type-ui", "text-foreground", "inline-flex", "gap-2"]));
    const [word, glyph] = link.el.children;
    expect(word?.textContent).toBe("the week");
    expect(glyph?.querySelector("path")?.getAttribute("d")).toBe(arrow!);
  });

  test("back leads with the left arrow", () => {
    const link = one(
      server(
        <Onward back href="/">
          today
        </Onward>,
      ),
      'a[data-slot="onward"]',
    );
    const [glyph, word] = link.el.children;
    expect(glyph?.querySelector("path")?.getAttribute("d")).toBe(left!);
    expect(word?.textContent).toBe("today");
  });

  test("a chrome link: no underline at rest, one on hover 4 px below, and a phone hit area on a positioned box", () => {
    const host = server(<Onward href="/week">the week</Onward>);
    const { classes } = one(host, '[data-slot="onward"]');
    expect(classes).not.toContain("underline");
    expect(classes).toEqual(
      expect.arrayContaining(["hover:underline", "underline-offset-4", "decoration-1", "relative", `${PHONE}hit-area`]),
    );
    expect(forbidden(elements(host))).toEqual([]);
  });

  test("takes a router link through render, keeping its look and its arrow", () => {
    function RouterLink(props: React.ComponentProps<"a">) {
      return <a data-router="true" {...props} />;
    }
    const link = one(server(<Onward render={<RouterLink href="/week" />}>the week</Onward>), '[data-slot="onward"]');
    expect(link.el.getAttribute("data-router")).toBe("true");
    expect(link.el.getAttribute("href")).toBe("/week");
    expect(link.el.textContent).toBe("the week");
    expect(link.el.querySelector("svg")).not.toBeNull();
  });

  test("shows the control ring on keyboard focus", () => {
    const { classes } = one(server(<Onward href="/week">the week</Onward>), '[data-slot="onward"]');
    expect(classes).toEqual(expect.arrayContaining(CONTROL_RING));
  });
});

describe("door", () => {
  const host = () => server(<Door href="/done">see what you finished</Door>);
  const door = () => one(host(), 'a[data-slot="door"]');

  test("one line with an arrow, a target through its own box at 44 px on a phone", () => {
    const { el, classes } = door();
    expect(classes).toEqual(expect.arrayContaining(["flex", "h-10", `${PHONE}h-11`, "type-ui", "text-foreground"]));
    expect(el.getAttribute("data-mk")).toBe("onward");
    const [word, glyph] = el.children;
    expect(word?.textContent).toBe("see what you finished");
    expect(glyph?.querySelector("path")?.getAttribute("d")).toBe(arrow!);
    expect(forbidden(elements(host()))).toEqual([]);
  });

  test("the words truncate before they wrap, and the arrow never shrinks out of the line", () => {
    const { el } = door();
    const [word, glyph] = el.children;
    expect(word?.getAttribute("class")).toContain("truncate");
    expect(glyph?.getAttribute("class")).toContain("shrink-0");
    expect(door().classes).toContain("max-w-full");
  });

  test("only the words underline on hover", () => {
    const { el, classes } = door();
    expect(classes).not.toContain("hover:underline");
    expect(el.children[0]?.getAttribute("class")).toContain("[a:hover>&]:underline");
  });
});
