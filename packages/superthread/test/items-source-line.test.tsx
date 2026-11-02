// The source line, a wrapping row of cited sources. A router link reaches an item through render, so the tests read one
// too. happy-dom measures nothing, so the wrap and the phone's targets read the classes a browser keys on.
import { describe, expect, test } from "bun:test";
import { SourceLine, SourceLineItem } from "@/components/superthread/ui/source-line";
import { CONTROL_RING, elements, forbidden, one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const slot = (name: string) => `[data-slot="${name}"]`;

function cited() {
  return server(
    <SourceLine className="extra" end="written 07:00" id="cited">
      <SourceLineItem href="/recap">22 sep call recap</SourceLineItem>
      <SourceLineItem href="/mail">sam's mail, mon 2 nov</SourceLineItem>
      <SourceLineItem>a call nobody recorded</SourceLineItem>
    </SourceLine>,
  );
}

describe("source line", () => {
  test("a row at the instrument step in muted ink, which wraps, keeping the app's class and props", () => {
    const root = one(cited(), slot("source-line"));
    expect(root.el.getAttribute("data-mk")).toBe("source-line");
    expect(root.el.id).toBe("cited");
    expect(root.classes).toEqual(
      expect.arrayContaining(["extra", "flex", "flex-wrap", "type-instrument", "text-muted-foreground"]),
    );
  });

  test("reads as a label, the sources in order, then what closes the line", () => {
    const [label, list, end] = one(cited(), slot("source-line")).el.children;
    expect(label?.textContent).toBe("sources");
    expect([...(list?.children ?? [])].map((item) => item.textContent)).toEqual([
      "22 sep call recap",
      "sam's mail, mon 2 nov",
      "a call nobody recorded",
    ]);
    expect(end?.textContent).toBe("written 07:00");
  });

  test("is a list named by its label, whose box gives way so all of it wraps as one row", () => {
    const host = server(
      <SourceLine label="read for this">
        <SourceLineItem href="/recap">the recap</SourceLineItem>
      </SourceLine>,
    );
    const list = one(host, "ul");
    expect(list.el.getAttribute("role")).toBe("list");
    expect(list.classes).toContain("contents");
    const label = host.querySelector(`#${CSS.escape(list.el.getAttribute("aria-labelledby")!)}`);
    expect(label?.textContent).toBe("read for this");
  });

  test("with nothing to close it, no end prints", () => {
    const host = server(
      <SourceLine>
        <SourceLineItem href="/recap">the recap</SourceLineItem>
      </SourceLine>,
    );
    expect(host.querySelector(slot("source-line-end"))).toBeNull();
  });

  test("the end holds the far side in mono, and on a phone joins the words in the interface's face", () => {
    const { classes } = one(cited(), slot("source-line-end"));
    expect(classes).toEqual(expect.arrayContaining(["ml-auto", "font-mono", `${PHONE}ml-0`, `${PHONE}font-sans`]));
  });

  test("a source with an address is a link in foreground, underlined at rest 4 px below, and takes the ring", () => {
    const link = one(cited(), `a${slot("source-line-item")}`);
    expect(link.el.getAttribute("href")).toBe("/recap");
    expect(link.classes).toEqual(
      expect.arrayContaining([
        "[&:is(a)]:text-foreground",
        "[&:is(a)]:underline",
        "decoration-1",
        "underline-offset-4",
        ...CONTROL_RING,
      ]),
    );
  });

  test("a source with no address is a plain name, not a dead link", () => {
    const host = cited();
    const name = one(host, `span${slot("source-line-item")}`);
    expect(name.el.textContent).toBe("a call nobody recorded");
    expect(name.el.hasAttribute("href")).toBe(false);
  });

  test("an item owns its link, so the panel's running-text rule stays off it", () => {
    expect(cited().querySelector("a:not([data-slot])")).toBeNull();
  });

  test("a long source wraps inside the line", () => {
    expect(one(cited(), slot("source-line-item")).classes).toContain("[overflow-wrap:anywhere]");
    expect(one(cited(), "li").classes).toContain("min-w-0");
  });

  test("on a phone a link is its own 44 px box and the lines close up, so two reaches never overlap", () => {
    const host = cited();
    expect(one(host, slot("source-line")).classes).toContain(`${PHONE}gap-y-0`);
    expect(one(host, `a${slot("source-line-item")}`).classes).toEqual(
      expect.arrayContaining([`${PHONE}[&:is(a)]:min-h-11`, `${PHONE}[&:is(a)]:min-w-11`]),
    );
  });

  test("takes a router link through render, keeping its look", () => {
    function RouterLink(props: React.ComponentProps<"a">) {
      return <a data-router="" {...props} />;
    }
    const host = server(
      <SourceLine>
        <SourceLineItem render={<RouterLink href="/recap" />}>the recap</SourceLineItem>
      </SourceLine>,
    );
    const link = one(host, "a[data-router]");
    expect(link.el.getAttribute("href")).toBe("/recap");
    expect(link.el.getAttribute("data-slot")).toBe("source-line-item");
    expect(link.classes).toContain("[&:is(a)]:underline");
    expect(link.el.textContent).toBe("the recap");
  });

  test("carries no forbidden class", () => {
    expect(forbidden(elements(cited()))).toEqual([]);
  });
});
