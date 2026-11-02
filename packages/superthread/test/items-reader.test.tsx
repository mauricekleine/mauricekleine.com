// The reader, a page of reading with a margin rail, and a meeting brief's parts. happy-dom measures nothing, so these read
// what a browser keys on: the rendered tree, the dark scope against it, and the classes each element carries. The registry
// shape, the catalog and the forbidden words live in the generic suites.
import { describe, expect, test } from "bun:test";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  Reader,
  ReaderBlock,
  ReaderBlocks,
  ReaderBlockTitle,
  ReaderBody,
  ReaderEnd,
  ReaderFoot,
  ReaderGap,
  ReaderHead,
  ReaderLead,
  ReaderLine,
  ReaderNext,
  ReaderNextText,
  ReaderOwed,
  ReaderOwedRow,
  ReaderPaper,
  ReaderPerson,
  ReaderRail,
  ReaderRaised,
  ReaderSection,
  ReaderSectionTitle,
  ReaderText,
  ReaderWho,
  ReaderWide,
} from "@/components/superthread/blocks/reader";
import { Button } from "@/components/superthread/ui/button";
import { Onward } from "@/components/superthread/ui/onward";
import { DARK } from "../scripts/generate.ts";
import { claim, CONTROL_RING, detailsUsed, elements, forbidden, one, parts, server } from "./rendered.tsx";
import { chainOf, inScope } from "./scope.ts";

const PHONE = "[@media(max-width:600px)]:";
const WIDE_READER = "@min-[640px]/reader:";
const WIDE = "[@media(min-width:601px)]:";
const IN_PANEL = "in-data-[slot=app-shell-panel]:";
const slot = (name: string) => `[data-slot="${name}"]`;
const readsDark = (el: Element) => inScope(DARK, chainOf(el));

function brief(rail = true) {
  return server(
    <AppShellPanel>
      <Reader className="extra">
        <ReaderLead>
          <ReaderHead written="written 07:00">tuesday 3 november</ReaderHead>
          <ReaderLine>the chapter 7 notes are the one thing today.</ReaderLine>
          <ReaderNext>
            <ReaderNextText label="next">reply to sam about chapter 7</ReaderNextText>
            <Button size="lg">read the draft</Button>
          </ReaderNext>
        </ReaderLead>
        <ReaderWide>a day line</ReaderWide>
        <ReaderBody>
          <ReaderSection>
            <ReaderSectionTitle>what changed</ReaderSectionTitle>
            <ReaderText>the notes came in this morning.</ReaderText>
          </ReaderSection>
          <ReaderSection>
            <ReaderSectionTitle>what's coming</ReaderSectionTitle>
            <ReaderText>
              the kickoff is at 16:30. <a href="/meetings/kickoff">the meeting brief</a> is ready.
            </ReaderText>
          </ReaderSection>
          <ReaderEnd>that's all for today.</ReaderEnd>
        </ReaderBody>
        {rail && <ReaderRail>a month</ReaderRail>}
        <ReaderFoot>
          <Onward back href="/briefs/monday">
            monday
          </Onward>
          <Onward href="/briefs/wednesday">wednesday</Onward>
        </ReaderFoot>
      </Reader>
    </AppShellPanel>,
  );
}

function meeting() {
  return server(
    <AppShellPanel>
      <ReaderPaper>
        <ReaderSectionTitle render={<h2 />}>project kickoff</ReaderSectionTitle>
        <ReaderRaised label="one thing to raise">the chapter order, before anything is printed.</ReaderRaised>
      </ReaderPaper>
      <ReaderBlocks>
        <ReaderBlock titleId="room">
          <ReaderBlockTitle>who's in the room</ReaderBlockTitle>
          <ReaderWho>
            <ReaderPerson note="edits the series" seen="2 weeks ago">
              sam
            </ReaderPerson>
            <ReaderPerson>mina rao</ReaderPerson>
          </ReaderWho>
        </ReaderBlock>
        <ReaderBlock titleId="last" asWritten>
          <ReaderBlockTitle>last time, as written</ReaderBlockTitle>
          <ReaderText>you agreed the outline.</ReaderText>
        </ReaderBlock>
        <ReaderBlock titleId="owe">
          <ReaderBlockTitle>what you owe them</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow href="/items/notes" when="due thursday">
              the chapter 7 notes
            </ReaderOwedRow>
            <ReaderOwedRow when="since friday">a plain promise</ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock titleId="they">
          <ReaderBlockTitle>what they owe you</ReaderBlockTitle>
          <ReaderGap>not in the record</ReaderGap>
        </ReaderBlock>
      </ReaderBlocks>
    </AppShellPanel>,
  );
}

describe("reader", () => {
  test("is an article that takes its name from the lead line, with nothing for the app to wire", () => {
    const host = brief();
    const { el, classes } = one(host, "article");
    expect(el.getAttribute("data-mk")).toBe("reader");
    expect(classes).toContain("extra");
    const line = one(host, slot("reader-line")).el;
    expect(el.getAttribute("aria-labelledby")).toBe(line.id);
    expect(line.id).not.toBe("");
  });

  test("a known title id reaches the line", () => {
    const host = server(
      <Reader titleId="today">
        <ReaderLine>one line</ReaderLine>
      </Reader>,
    );
    expect(one(host, "article").el.getAttribute("aria-labelledby")).toBe("today");
    expect(one(host, "#today").el.textContent).toBe("one line");
  });

  describe("the margin rail", () => {
    const grid = (host: HTMLElement) => one(host, "article > div");

    test("opens a 248 px margin 40 px from the reading column, at 640 px of the reader's own width", () => {
      const { classes } = grid(brief());
      expect(classes).toEqual(
        expect.arrayContaining([
          "grid",
          "grid-cols-[minmax(0,1fr)]",
          "gap-x-10",
          `${WIDE_READER}has-[>[data-slot=reader-rail]]:grid-cols-[minmax(0,1fr)_248px]`,
        ]),
      );
      expect(one(brief(), "article").classes).toContain("@container/reader");
    });

    test("the margin keys on a rail that's a child of the grid, so a reader with no rail reads the whole width", () => {
      expect(grid(brief()).el.querySelector(`:scope > ${slot("reader-rail")}`)).not.toBeNull();
      expect(grid(brief(false)).el.querySelector(`:scope > ${slot("reader-rail")}`)).toBeNull();
    });

    test("sits beside the lead wherever the source puts it, and folds back into the source's order", () => {
      const rail = one(brief(), slot("reader-rail")).classes;
      expect(rail).toEqual(
        expect.arrayContaining([`${WIDE_READER}col-start-2`, `${WIDE_READER}row-start-1`, `${WIDE_READER}mt-0`]),
      );
      expect(one(brief(), slot("reader-lead")).classes).toEqual(
        expect.arrayContaining(["col-start-1", "row-start-1", "min-w-0"]),
      );
      expect(rail.filter((cls) => parts(cls).utility.startsWith("order-"))).toEqual([]);
    });

    test("the rail leaves the source after the writing and before the foot, so the foot stays last in the panel", () => {
      const order = [...grid(brief()).el.children].map((child) => child.getAttribute("data-slot"));
      expect(order).toEqual(["reader-lead", "reader-wide", "reader-body", "reader-rail", "reader-foot"]);
    });

    test("the wide row and the body run under both columns", () => {
      expect(one(brief(), slot("reader-wide")).classes).toContain("col-span-full");
      expect(one(brief(), slot("reader-body")).classes).toContain("col-span-full");
    });
  });

  describe("the lead", () => {
    test("the head sets the date against when it was written, in mono, on the rail's 28 px line", () => {
      const { el, classes } = one(brief(), slot("reader-head"));
      expect(el.tagName).toBe("P");
      expect(classes).toEqual(
        expect.arrayContaining(["flex", "justify-between", "text-instrument", "leading-7", "text-muted-foreground"]),
      );
      const [date, written] = [...el.children];
      expect(date?.textContent).toBe("tuesday 3 november");
      expect(written?.textContent).toBe("written 07:00");
      expect(written?.className).toContain("font-mono");
    });

    test("a head too long for one line wraps, so neither end leaves the column", () => {
      const { el, classes } = one(brief(), slot("reader-head"));
      expect(classes).toContain("flex-wrap");
      for (const end of el.children) expect(end.className).toContain("min-w-0");
    });

    test("the head holds no empty end when nothing says when it was written", () => {
      const host = server(<ReaderHead>tuesday</ReaderHead>);
      expect(one(host, slot("reader-head")).el.children).toHaveLength(1);
    });

    test("the line is a heading at the page step in the first ink", () => {
      const { el, classes } = one(brief(), slot("reader-line"));
      expect(el.tagName).toBe("H2");
      expect(classes).toEqual(expect.arrayContaining(["type-page", "text-first", "text-pretty", "min-w-0"]));
    });

    test("the line renders an h1 and keeps the article's name", () => {
      const host = server(
        <Reader>
          <ReaderLine render={<h1 />}>one line</ReaderLine>
        </Reader>,
      );
      const { el } = one(host, "h1");
      expect(el.getAttribute("data-slot")).toBe("reader-line");
      expect(one(host, "article").el.getAttribute("aria-labelledby")).toBe(el.id);
    });
  });

  describe("the next action", () => {
    const next = () => one(brief(), slot("reader-next")).el.closest(slot("paper"))!;

    test("is one paper, a section named by its label", () => {
      const host = brief();
      expect(host.querySelectorAll(slot("paper"))).toHaveLength(1);
      const section = one(host, `section${slot("paper")}`).el;
      const label = host.querySelector(`[id="${section.getAttribute("aria-labelledby")}"]`);
      expect(label?.textContent).toBe("next");
      expect(section.textContent).toContain("reply to sam about chapter 7");
    });

    test("names itself apart from the reader around it", () => {
      const host = brief();
      expect(one(host, "article").el.getAttribute("aria-labelledby")).not.toBe(next().getAttribute("aria-labelledby"));
    });

    test("on a dark page the paper's root reads the page, and all inside it reads the light roles", () => {
      const host = brief();
      host.className = "dark";
      const paper = one(host, slot("paper")).el;
      expect(readsDark(paper)).toBe(true);
      expect(readsDark(one(paper, "button").el)).toBe(false);
      expect(readsDark(one(paper, slot("reader-next-text")).el)).toBe(false);
    });

    test("hangs 24 px into the left margin in a panel, so its words keep the lead's edge and its right edge the column's", () => {
      const classes = next().className.split(" ");
      expect(classes).toEqual(
        expect.arrayContaining([
          "pl-6",
          `${WIDE}${IN_PANEL}-mx-6`,
          `${WIDE}${IN_PANEL}mr-0`,
          `${PHONE}${IN_PANEL}-mx-(--spacing-panel-inset)`,
        ]),
      );
    });

    test("the words give way and a long pair wraps, so the action stays on the paper", () => {
      const host = brief();
      expect(one(host, slot("reader-next")).classes).toEqual(
        expect.arrayContaining(["flex", "flex-wrap", "justify-between"]),
      );
      expect(one(host, slot("reader-next-text")).classes).toContain("min-w-0");
    });

    test("prints its label in the muted instrument step over the step at the subtitle step", () => {
      const [label, step] = [...one(brief(), slot("reader-next-text")).el.children];
      expect(label?.className).toContain("type-instrument");
      expect(label?.className).toContain("text-muted-foreground");
      expect(step?.className).toContain("type-subtitle");
    });
  });

  describe("the writing", () => {
    test("a section takes its name from its title, a level under the line", () => {
      const host = brief();
      const section = one(host, `section${slot("reader-section")}`).el;
      const title = one(section, slot("reader-section-title")).el;
      expect(title.tagName).toBe("H3");
      expect(section.getAttribute("aria-labelledby")).toBe(title.id);
      expect(title.className).toContain("type-title");
      expect(title.className).toContain("text-first");
    });

    test("a section's title drops to an h4 under a page's h2 sections", () => {
      const host = server(
        <ReaderSection>
          <ReaderSectionTitle render={<h4 />}>what changed</ReaderSectionTitle>
        </ReaderSection>,
      );
      expect(one(host, "section").el.getAttribute("aria-labelledby")).toBe(one(host, "h4").el.id);
    });

    test("sections leave 48 px between them and 32 px on a phone, and the first starts in place", () => {
      const { classes } = one(brief(), slot("reader-section"));
      expect(classes).toEqual(expect.arrayContaining(["not-first:mt-12", `${PHONE}not-first:mt-8`]));
      expect(classes).not.toContain("mt-12");
    });

    test("a paragraph reads at the read step on the reading measure, and a plain anchor stays the panel's link", () => {
      const { el, classes } = one(
        brief(),
        `${slot("reader-section")} + ${slot("reader-section")} ${slot("reader-text")}`,
      );
      expect(classes).toEqual(expect.arrayContaining(["type-read", "max-w-[27.5em]", "text-pretty"]));
      expect(el.querySelector("a")?.hasAttribute("data-slot")).toBe(false);
    });

    // The rule in DESIGN.md: one closing line in Erode italic at the lede step, in muted ink.
    test("the closing line is the lede step in italic, in muted ink, after the sections", () => {
      const { el, classes } = one(brief(), slot("reader-end"));
      expect(el.tagName).toBe("P");
      expect(classes).toEqual(expect.arrayContaining(["type-lede", "italic", "text-muted-foreground"]));
      expect(el.getAttribute("data-mk")).toBe("reader");
      expect(el.nextElementSibling).toBeNull();
    });

    test("the closing line leaves the section step above it", () => {
      expect(one(brief(), slot("reader-end")).classes).toEqual(expect.arrayContaining(["mt-12", `${PHONE}mt-8`]));
    });
  });

  describe("the foot", () => {
    test("is the panel's foot, so it reaches the sheet's edges and its bottom", () => {
      const { el, classes } = one(brief(), slot("reader-foot"));
      expect(el.tagName).toBe("FOOTER");
      expect(classes).toEqual(
        expect.arrayContaining(["-mx-(--spacing-panel-inset)", "-mb-7", "border-t", "col-span-full"]),
      );
    });

    test("prints back at the start and onward at the end", () => {
      const { el, classes } = one(brief(), slot("reader-foot"));
      expect(classes).toContain("justify-between");
      const [back, onward] = [...el.querySelectorAll("a")];
      expect(back?.getAttribute("href")).toBe("/briefs/monday");
      expect(back?.textContent).toBe("monday");
      expect(onward?.getAttribute("href")).toBe("/briefs/wednesday");
    });

    test("its margin beats the panel foot's in cn's merge", () => {
      const { classes } = one(brief(), slot("reader-foot"));
      expect(classes).toEqual(expect.arrayContaining(["mt-6", `${PHONE}mt-4`]));
      expect(classes).not.toContain("mt-3");
      expect(classes).not.toContain(`${PHONE}mt-2`);
    });

    test("renders a named nav", () => {
      const host = server(<ReaderFoot render={<nav aria-label="briefs" />} />);
      expect(one(host, slot("reader-foot")).el.tagName).toBe("NAV");
    });
  });
});

describe("a meeting brief's parts", () => {
  test("the paper hangs 24 px into both margins of a panel and runs its whole width on a phone, only in a panel", () => {
    const { classes } = one(meeting(), slot("paper"));
    expect(classes).toEqual(
      expect.arrayContaining([`${WIDE}${IN_PANEL}-mx-6`, `${PHONE}${IN_PANEL}-mx-(--spacing-panel-inset)`]),
    );
    expect(classes.join(" ")).not.toMatch(/(^| )-m[xlr]-/);
  });

  test("where the paper hangs, a light page draws its 1 px edge in border inside its box, since white on a white panel can't show its top and left", () => {
    // An outline set inside the box moves nothing. A dark page's white is its own edge, and a paper outside a panel
    // hangs into nothing, so neither draws it.
    const { classes } = one(meeting(), slot("paper"));
    const edge = `${IN_PANEL}not-dark:`;
    expect(classes).toEqual(
      expect.arrayContaining([`${edge}outline`, `${edge}-outline-offset-1`, `${edge}outline-border`]),
    );
    expect(classes.filter((cls) => /^-?outline/.test(parts(cls).utility) && !cls.startsWith(edge))).toEqual([]);
  });

  test("the raised line is its muted label over the lede step, held to a 32 em measure", () => {
    const { el, classes } = one(meeting(), slot("reader-raised"));
    expect(el.getAttribute("data-mk")).toBe("reader");
    expect(classes).toEqual(expect.arrayContaining(["mt-4", `${PHONE}mt-3`]));
    const [label, line] = [...el.children];
    expect(label?.textContent).toBe("one thing to raise");
    expect(label?.className).toContain("text-muted-foreground");
    expect(line?.className).toContain("type-lede");
    expect(line?.className).toContain("max-w-[32em]");
    expect(line?.className).toContain("text-pretty");
  });

  test("the blocks answer to their own width, two to a row at 640 px, so they need no reader around them", () => {
    const host = meeting();
    expect(host.querySelector("article")).toBeNull();
    const { el, classes } = one(host, slot("reader-blocks"));
    expect(classes).toContain("@container/reader-blocks");
    expect(one(el, ":scope > div").classes).toEqual(
      expect.arrayContaining([
        "grid-cols-[minmax(0,1fr)]",
        "@min-[640px]/reader-blocks:grid-cols-[repeat(2,minmax(0,1fr))]",
      ]),
    );
  });

  test("a block takes its name from its title, in the muted instrument step", () => {
    const host = meeting();
    const section = one(host, "section#room, section[aria-labelledby=room]").el;
    const title = one(section, "#room");
    expect(title.el.tagName).toBe("H3");
    expect(title.el.getAttribute("data-slot")).toBe("reader-block-title");
    expect(title.classes).toEqual(expect.arrayContaining(["type-instrument", "text-muted-foreground"]));
  });

  describe("who", () => {
    const who = () => one(meeting(), slot("reader-who"));

    test("is a list of people", () => {
      const { el } = who();
      expect(el.tagName).toBe("UL");
      expect(el.querySelectorAll("li")).toHaveLength(2);
    });

    test("names, notes and sightings share columns across the rows", () => {
      const { el, classes } = who();
      expect(classes).toContain("grid-cols-[fit-content(40%)_minmax(0,1fr)_fit-content(50%)]");
      for (const person of el.querySelectorAll("li")) {
        expect(person.className).toContain("grid-cols-subgrid");
        expect(person.className).toContain("col-span-full");
      }
    });

    test("prints the name in the ui step, the note and the sighting quiet, and holds the sighting in mono", () => {
      const person = one(who().el, "li");
      const [name, note, seen] = [...person.el.children];
      expect(person.classes).toContain("type-ui");
      expect(name?.textContent).toBe("sam");
      expect(name?.className).toContain("min-w-11");
      expect(note?.className).toContain("text-muted-foreground");
      expect(note?.className).toContain("text-instrument");
      expect(note?.className).not.toContain("truncate");
      expect(seen?.className).toContain("font-mono");
      expect(seen?.className).toContain("col-start-3");
    });

    test("a name alone takes the whole row", () => {
      const person = who().el.querySelectorAll("li")[1]!;
      expect(person.children).toHaveLength(1);
      expect(person.className).toContain("[&>:only-child]:col-span-full");
    });

    test("a sighting with no note keeps its column", () => {
      const host = server(
        <ReaderWho>
          <ReaderPerson seen="monday">sam</ReaderPerson>
        </ReaderWho>,
      );
      const [, seen] = [...one(host, "li").el.children];
      expect(seen?.className).toContain("col-start-3");
    });

    test("a person's row takes 12 px of padding above and below on a phone", () => {
      expect(one(who().el, "li").classes).toEqual(expect.arrayContaining(["py-1", `${PHONE}py-3`]));
    });
  });

  describe("owed", () => {
    const owed = () => one(meeting(), slot("reader-owed"));
    const row = (n: number) => owed().el.querySelectorAll(slot("reader-owed-row"))[n]!;

    test("is a list, with an item around each row", () => {
      const { el } = owed();
      expect(el.tagName).toBe("UL");
      expect([...el.children].map((child) => child.tagName)).toEqual(["LI", "LI"]);
    });

    test("with an href the whole row is one link, and only its words underline", () => {
      const link = row(0);
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("/items/notes");
      expect(link.textContent).toBe("the chapter 7 notesdue thursday");
      expect(link.children[0]?.className).toContain("[a:hover>&]:underline");
      expect(link.children[1]?.className).not.toContain("underline");
    });

    test("a linked row carries the control ring", () => {
      expect(row(0).className.split(" ")).toEqual(expect.arrayContaining(CONTROL_RING));
    });

    test("takes the app's router link through render", () => {
      const host = server(
        <ReaderOwedRow render={<a href="/router" data-router="" />} when="thursday">
          the notes
        </ReaderOwedRow>,
      );
      const { el } = one(host, slot("reader-owed-row"));
      expect(el.tagName).toBe("A");
      expect(el.hasAttribute("data-router")).toBe(true);
      expect(el.textContent).toBe("the notesthursday");
    });

    test("with neither it's a plain line that prints the same, and nothing a keyboard stops on", () => {
      const line = row(1);
      expect(line.tagName).toBe("SPAN");
      expect(line.hasAttribute("href")).toBe(false);
      expect(line.className).toContain("grid-cols-[minmax(0,1fr)_auto]");
      expect(line.className).toContain("type-ui");
    });

    test("holds when in mono at the row's end, and drops it under the words on a phone in the interface's face", () => {
      expect(row(0).className.split(" ")).toEqual(
        expect.arrayContaining([`${PHONE}grid-cols-[minmax(0,1fr)]`, "items-baseline"]),
      );
      const when = row(0).children[1]!.className.split(" ");
      expect(when).toEqual(
        expect.arrayContaining([
          "font-mono",
          "justify-self-end",
          "text-right",
          `${PHONE}font-sans`,
          `${PHONE}justify-self-start`,
          `${PHONE}text-left`,
        ]),
      );
    });

    test("a row reaches 44 px on a phone through its own box, so nothing overlaps", () => {
      expect(row(0).className.split(" ")).toEqual(
        expect.arrayContaining([`${PHONE}min-h-11`, `${PHONE}content-center`]),
      );
    });

    test("a row with no when prints its words alone", () => {
      const host = server(<ReaderOwedRow href="/items/notes">the notes</ReaderOwedRow>);
      expect(one(host, "a").el.children).toHaveLength(1);
    });
  });

  describe("as written", () => {
    const block = (asWritten: boolean) =>
      one(
        server(
          <ReaderBlock titleId="room" asWritten={asWritten}>
            <ReaderBlockTitle>who's in the room</ReaderBlockTitle>
            <ReaderWho>
              <ReaderPerson note="edits the series">sam</ReaderPerson>
            </ReaderWho>
            <ReaderOwed>
              <ReaderOwedRow href="/items/notes">the notes</ReaderOwedRow>
            </ReaderOwed>
            <ReaderText>you agreed the outline.</ReaderText>
          </ReaderBlock>,
        ),
        "section",
      );

    test("turns the block's ink muted, and it prints in foreground otherwise", () => {
      expect(block(true).classes).toContain("text-muted-foreground");
      expect(block(true).classes).not.toContain("text-foreground");
      expect(block(false).classes).toContain("text-foreground");
    });

    test("names, rows and paragraphs take no ink of their own, so the block's ink reaches them", () => {
      const { el } = block(true);
      const inked = [
        el.querySelector("li > span"),
        one(el, slot("reader-owed-row")).el,
        one(el, slot("reader-text")).el,
      ];
      for (const part of inked) {
        expect(
          part?.className.split(" ").filter((cls) => /^text-(foreground|first|card-foreground)$/.test(cls)),
        ).toEqual([]);
      }
      expect(one(el, slot("reader-person")).classes).not.toContain("text-foreground");
    });
  });

  test("a gap sits where a first row would, so it lines up with the list beside it", () => {
    const host = meeting();
    const gap = one(host, slot("reader-gap"));
    expect(gap.el.textContent).toBe("not in the record");
    expect(gap.classes).toEqual(expect.arrayContaining(["type-ui", "text-muted-foreground", "mt-1", "py-1"]));
    expect(one(host, slot("reader-owed")).classes).toContain("mt-1");
    expect(one(host, slot("reader-who")).classes).toContain("mt-1");
    expect(one(host, slot("reader-person")).classes).toContain("py-1");
  });
});

describe("every part", () => {
  test("carries no class the skins forbid", () => {
    expect(forbidden(elements(brief()))).toEqual([]);
    expect(forbidden(elements(meeting()))).toEqual([]);
  });

  test("claims no detail: the paper's edge is the paper's", () => {
    expect(detailsUsed(elements(brief()), "reader")).toEqual(claim("reader"));
    expect(detailsUsed(elements(meeting()), "reader")).toEqual(claim("reader"));
  });
});
