// The send bar, the foot of a review. happy-dom measures nothing and activates nothing, so these read what a browser keys
// on: the tree the ring inherits through, the classes each element carries, and whether Enter's default survives keydown.
// The registry shape, the catalog and the forbidden words live in the generic suites.
import { describe, expect, test } from "bun:test";
import { act } from "react";
import {
  SendBar,
  SendBarActions,
  SendBarAddress,
  SendBarButton,
  SendBarFact,
  SendBarFacts,
  SendBarFile,
  SendBarLabel,
  SendBarLink,
  SendBarNote,
  SendBarTitle,
  SendBarTo,
} from "@/components/superthread/blocks/send-bar";
import { DARK } from "../scripts/generate.ts";
import { client, elements, forbidden, one, parts, server } from "./rendered.tsx";
import { chainOf, inScope } from "./scope.ts";

function several() {
  return server(
    <SendBar aria-label="where it goes" className="extra">
      <SendBarTo>
        <SendBarTitle>goes to 3 people</SendBarTitle>
        <SendBarFacts>
          <SendBarLabel>to</SendBarLabel>
          <SendBarFact address="sam@quanta.example">sam okafor</SendBarFact>
          <SendBarLabel>cc</SendBarLabel>
          <SendBarFact address="mina@quanta.example">mina rao</SendBarFact>
          <SendBarFact address="lee@quanta.example">lee park</SendBarFact>
          <SendBarLabel>attaches</SendBarLabel>
          <SendBarFile>chapter-7-notes.pdf</SendBarFile>
          <SendBarFile>figures.zip</SendBarFile>
        </SendBarFacts>
      </SendBarTo>
      <SendBarActions>
        <SendBarButton>send to 3 people</SendBarButton>
        <SendBarNote>retry can send it twice, so check first.</SendBarNote>
      </SendBarActions>
    </SendBar>,
  );
}

const press = (el: Element, key: string) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
};

describe("send bar", () => {
  test("is a named section of paper that keeps the app's class", () => {
    const { el, classes } = one(several(), 'section[aria-label="where it goes"]');
    expect(el.getAttribute("data-slot")).toBe("paper");
    expect(classes).toEqual(expect.arrayContaining(["light", "bg-card", "extra"]));
  });

  test("on a dark page, everything in the bar reads the light roles", () => {
    const host = several();
    host.className = "dark";
    expect(inScope(DARK, chainOf(one(host, "button").el))).toBe(false);
    expect(inScope(DARK, chainOf(one(host, '[data-slot="send-bar-title"]').el))).toBe(false);
  });

  test("sets the ring below the .light element, whose own --ring would beat a utility on it", () => {
    const host = several();
    const holders = elements(host).filter(({ classes }) => classes.includes("[--ring:var(--first)]"));
    expect(holders).toHaveLength(1);
    const holder = holders[0]!.el;
    expect(holder.classList.contains("light")).toBe(false);
    expect(holder.parentElement?.closest(".light")).not.toBeNull();
    expect(holder.contains(one(host, "button").el)).toBe(true);
  });

  test("prints the title for a screen reader to follow, and a single address under it", () => {
    const host = server(
      <SendBar aria-label="where it goes">
        <SendBarTo>
          <SendBarTitle>sam okafor</SendBarTitle>
          <SendBarAddress>a-very-long-address@quanta.example</SendBarAddress>
        </SendBarTo>
      </SendBar>,
    );
    const title = one(host, '[data-slot="send-bar-title"]');
    expect(title.el.getAttribute("aria-live")).toBe("polite");
    expect(title.classes).toEqual(expect.arrayContaining(["type-title", "text-first"]));
    expect(one(host, '[data-slot="send-bar-address"]').classes).toEqual(
      expect.arrayContaining(["font-mono", "[overflow-wrap:anywhere]"]),
    );
  });

  test("names every recipient and file as a description list, several under one label", () => {
    const list = one(several(), "dl").el;
    expect([...list.children].map((child) => child.tagName)).toEqual(["DT", "DD", "DT", "DD", "DD", "DT", "DD", "DD"]);
    expect(list.textContent).toContain("lee@quanta.example");
    expect(list.textContent).toContain("figures.zip");
  });

  test("an address sits in the fact's own column, and a fact without one spans the row", () => {
    const host = server(
      <dl>
        <SendBarFact address="sam@quanta.example">sam okafor</SendBarFact>
        <SendBarFact>the whole of finance</SendBarFact>
      </dl>,
    );
    const [withAddress, without] = [...host.querySelectorAll("dd")];
    expect(withAddress!.children).toHaveLength(2);
    expect(without!.children).toHaveLength(1);
    expect(one(host, "dd").classes).toEqual(
      expect.arrayContaining(["grid-cols-subgrid", "[&>:only-child]:col-span-full"]),
    );
  });

  test("folds against the width the bar itself declares, so it fits any column", () => {
    const rendered = elements(several());
    const root = one(several(), '[data-slot="paper"]');
    expect(root.classes).toContain("@container/send-bar");
    const queries = rendered.flatMap(({ classes }) =>
      classes.flatMap((cls) => parts(cls).variants.filter((variant) => variant.startsWith("@"))),
    );
    expect(new Set(queries).size).toBeGreaterThan(1);
    expect(queries.every((query) => query.endsWith("/send-bar"))).toBe(true);
  });

  test("the send prints in key and fills the column, and a second action prints in outline beside it", () => {
    const host = server(
      <SendBarActions>
        <SendBarButton>open sent items</SendBarButton>
        <SendBarButton variant="outline">retry</SendBarButton>
      </SendBarActions>,
    );
    const [send, retry] = [...host.querySelectorAll("button")];
    expect(send!.getAttribute("data-variant")).toBe("key");
    expect(send!.classList.contains("flex-1")).toBe(true);
    expect(retry!.getAttribute("data-variant")).toBe("outline");
    expect(retry!.classList.contains("flex-none")).toBe(true);
  });

  test("a long word wraps inside the button instead of leaving the column", () => {
    const { classes } = one(
      server(<SendBarButton>send to everyone who asked</SendBarButton>),
      '[data-slot="send-bar-button"]',
    );
    expect(classes).toEqual(expect.arrayContaining(["min-h-12", "whitespace-normal"]));
    expect(classes).not.toContain("whitespace-nowrap");
  });

  test("sent, the button drops its fill for a readable word and keeps its column", () => {
    const button = one(server(<SendBarButton disabled>sent to 3 people</SendBarButton>), "button");
    expect((button.el as HTMLButtonElement).disabled).toBe(true);
    expect(button.classes).toEqual(
      expect.arrayContaining(["disabled:bg-transparent", "disabled:text-foreground", "flex-1", "texture-disabled"]),
    );
    expect(button.classes).not.toContain("disabled:text-disabled");
  });

  test("Enter never fires a send or a retry, and Space stays the keyboard path", async () => {
    const seen: string[] = [];
    const { body, done } = await client(
      <SendBarActions>
        <SendBarButton onKeyDown={(event) => seen.push(`send ${event.key}`)}>send</SendBarButton>
        <SendBarButton variant="outline" onKeyDown={(event) => seen.push(`retry ${event.key}`)}>
          retry
        </SendBarButton>
      </SendBarActions>,
    );
    try {
      const [send, retry] = [...body.querySelectorAll("button")];
      await act(async () => {
        expect(press(send!, "Enter").defaultPrevented).toBe(true);
        expect(press(retry!, "Enter").defaultPrevented).toBe(true);
        expect(press(send!, " ").defaultPrevented).toBe(false);
      });
      expect(seen).toEqual(["send Enter", "retry Enter", "send  "]);
    } finally {
      await done();
    }
  });

  test("a handoff is a real link in key, with Enter left to the browser", async () => {
    const { body, done } = await client(<SendBarLink href="/outlook">open in outlook</SendBarLink>);
    try {
      const link = one(body, 'a[data-slot="send-bar-link"]');
      expect(link.el.getAttribute("href")).toBe("/outlook");
      expect(link.classes).toEqual(expect.arrayContaining(["bg-first", "text-background", "flex-1"]));
      expect(press(link.el, "Enter").defaultPrevented).toBe(false);
    } finally {
      await done();
    }
  });

  test("a handoff takes the app's router link", () => {
    const link = one(
      server(<SendBarLink render={<a href="/outlook" data-router="" />}>open in outlook</SendBarLink>),
      "a",
    );
    expect(link.el.hasAttribute("data-router")).toBe(true);
    expect(link.classes).toContain("bg-first");
  });

  test("carries no forbidden class", () => {
    expect(forbidden(elements(several()))).toEqual([]);
  });
});
