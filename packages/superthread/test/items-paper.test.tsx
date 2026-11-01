// Paper, the one white block on a page, and the letter, a piece of writing read whole. happy-dom measures nothing, so
// these read what a browser keys on: the dark scope against the rendered tree, and the classes each element carries. The
// registry shape, the catalog and the forbidden words live in the generic suites.
import { describe, expect, test } from "bun:test";
import {
  Letter,
  LetterActions,
  LetterBody,
  LetterHead,
  LetterKind,
  LetterSource,
  LetterSubject,
  LetterTools,
} from "@/components/superthread/blocks/letter";
import { Button } from "@/components/superthread/ui/button";
import { Paper } from "@/components/superthread/ui/paper";
import { DARK } from "../scripts/generate.ts";
import { claim, detailsUsed, elements, forbidden, one, parts, server } from "./rendered.tsx";
import { chainOf, inScope } from "./scope.ts";

const PHONE = "[@media(max-width:600px)]:";
const IN_PANEL = `${PHONE}in-data-[slot=app-shell-panel]:`;

const readsDark = (el: Element) => inScope(DARK, chainOf(el));

function paperOn(mode: "light" | "dark") {
  const host = server(
    <Paper>
      <Button>read the draft</Button>
    </Paper>,
  );
  host.className = mode;
  return { root: one(host, '[data-slot="paper"]'), button: one(host, 'button[data-slot="button"]') };
}

describe("paper", () => {
  test("carries the white fill and its ink in every theme", () => {
    expect(paperOn("dark").root.classes).toEqual(expect.arrayContaining(["bg-card", "text-card-foreground"]));
  });

  test("on a dark page, what sits on it reads light while its root reads the page", () => {
    const { root, button } = paperOn("dark");
    expect(readsDark(button.el)).toBe(false);
    expect(readsDark(root.el)).toBe(true);
  });

  test("on a light page, nothing in it is in the dark scope", () => {
    const { root, button } = paperOn("light");
    expect(readsDark(root.el)).toBe(false);
    expect(readsDark(button.el)).toBe(false);
  });

  test("lifts through the contact edge alone, so a dark page prints it flat", () => {
    const { root } = paperOn("light");
    expect(root.classes).toEqual(
      expect.arrayContaining(["texture-contact", "[--contact-lift:var(--elevation-slip-rake)]"]),
    );
    expect(root.classes.filter((cls) => parts(cls).utility.startsWith("shadow-"))).toEqual([]);
  });

  test("stays positioned and never clips, or the contact edge goes", () => {
    const { root } = paperOn("light");
    expect(root.classes).toContain("relative");
    expect(root.classes.filter((cls) => parts(cls).utility.startsWith("overflow-"))).toEqual([]);
  });

  test("takes the element the page needs and keeps its skin", () => {
    const host = server(
      <Paper render={<section aria-label="the next job" />} className="extra">
        now
      </Paper>,
    );
    const { el, classes } = one(host, 'section[aria-label="the next job"]');
    expect(el.getAttribute("data-slot")).toBe("paper");
    expect(el.getAttribute("data-mk")).toBe("paper");
    expect(classes).toEqual(expect.arrayContaining(["light", "bg-card", "extra"]));
  });

  test("keeps the system's rules and claims the one detail its catalog entry names", () => {
    const rendered = elements(server(<Paper>now</Paper>));
    expect(forbidden(rendered)).toEqual([]);
    expect(detailsUsed(rendered, "paper")).toEqual(claim("paper"));
    expect(claim("paper")).toEqual(["texture-contact"]);
  });
});

const LONG_BODY = Array.from({ length: 400 }, (_, i) => `line ${i} of the draft.`).join("\n");

function whole() {
  return server(
    <Letter aria-label="the draft">
      <LetterHead>
        <LetterSubject>re: chapter 7 notes</LetterSubject>
        <LetterKind>reply · mail</LetterKind>
      </LetterHead>
      <LetterBody>{LONG_BODY}</LetterBody>
      <LetterTools>
        <LetterActions>
          <Button variant="ghost">edit</Button>
          <Button variant="outline">reject</Button>
        </LetterActions>
        <LetterSource href="/threads/7">sam&rsquo;s mail</LetterSource>
      </LetterTools>
    </Letter>,
  );
}

describe("letter", () => {
  test("prints every line of the body, with no clamp, cap or clip anywhere in the box", () => {
    const host = whole();
    expect(one(host, '[data-slot="letter-body"]').el.textContent).toBe(LONG_BODY);
    const limits = elements(host).flatMap(({ classes }) =>
      classes.filter((cls) => /^(line-clamp-|truncate$|text-ellipsis$|max-h-|overflow-)/.test(parts(cls).utility)),
    );
    expect(limits).toEqual([]);
  });

  test("keeps the line breaks a plain string was written with and wraps a long link", () => {
    const { classes } = one(whole(), '[data-slot="letter-body"]');
    expect(classes).toEqual(expect.arrayContaining(["whitespace-pre-wrap", "[overflow-wrap:anywhere]"]));
  });

  test("sets the body at the reading measure, on its content box so the padding never eats it", () => {
    const { classes } = one(whole(), '[data-slot="letter-body"]');
    expect(classes).toEqual(expect.arrayContaining(["type-read", "box-content", "max-w-[27.5em]"]));
  });

  test("takes no padding of its own, so a foot reaches both edges", () => {
    const { el, classes } = one(whole(), '[data-slot="letter"]');
    expect(el.tagName).toBe("ARTICLE");
    expect(el.getAttribute("aria-label")).toBe("the draft");
    expect(classes.filter((cls) => /^p[xytrbl]?-/.test(parts(cls).utility))).toEqual([]);
  });

  test("gives up its side edges for the working panel's width on a phone, and only there", () => {
    const { classes } = one(whole(), '[data-slot="letter"]');
    expect(classes).toEqual(expect.arrayContaining([`${IN_PANEL}-mx-4`, `${IN_PANEL}border-x-0`]));
    expect(classes).toEqual(expect.arrayContaining(["border", "border-border"]));
  });

  test("runs down to the panel's foot only as the panel's last block", () => {
    const { classes } = one(whole(), '[data-slot="letter"]');
    expect(classes).toEqual(expect.arrayContaining([`${IN_PANEL}last:-mb-4`, `${IN_PANEL}last:border-b-0`]));
  });

  test("the subject is a heading that takes its level from the page", () => {
    expect(one(whole(), '[data-slot="letter-subject"]').el.tagName).toBe("H2");
    const under = server(<LetterSubject render={<h3 />}>re: chapter 7 notes</LetterSubject>);
    expect(one(under, '[data-slot="letter-subject"]').el.tagName).toBe("H3");
    expect(one(under, "h3").classes).toContain("text-ui");
  });

  test("a long subject wraps beside the kind, which stays whole", () => {
    const host = whole();
    expect(one(host, '[data-slot="letter-subject"]').classes).toEqual(
      expect.arrayContaining(["min-w-0", "[overflow-wrap:anywhere]"]),
    );
    expect(one(host, '[data-slot="letter-kind"]').classes).toContain("shrink-0");
  });

  test("the source is the quiet link, and a router's link keeps it", () => {
    const anchor = one(whole(), '[data-slot="letter-source"]');
    expect(anchor.el.tagName).toBe("A");
    expect(anchor.el.getAttribute("href")).toBe("/threads/7");
    expect(anchor.classes).toEqual(expect.arrayContaining(["link-quiet", "ml-auto"]));
    const routed = server(<LetterSource render={<a data-router href="/threads/7" />}>sam</LetterSource>);
    expect(one(routed, "[data-router]").classes).toContain("link-quiet");
  });

  test("a leading ghost's word takes the text's edge and an outline keeps its box", () => {
    const host = whole();
    const actions = one(host, '[data-slot="letter-actions"]');
    expect(actions.classes).toContain("[&>[data-variant=ghost]:first-child]:-ml-[19px]");
    expect(one(host, '[data-slot="letter-actions"] > [data-variant=ghost]:first-child').el.textContent).toBe("edit");
    expect(host.querySelector('[data-slot="letter-actions"] > [data-variant=outline]:first-child')).toBeNull();
    const outlineFirst = server(
      <LetterActions>
        <Button variant="outline">reject</Button>
        <Button variant="ghost">edit</Button>
      </LetterActions>,
    );
    expect(outlineFirst.querySelector("[data-variant=ghost]:first-child")).toBeNull();
  });

  test("keeps the system's rules", () => {
    expect(forbidden(elements(whole()))).toEqual([]);
  });
});
