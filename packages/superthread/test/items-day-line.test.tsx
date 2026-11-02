// The day line. happy-dom measures nothing, so these read what a browser keys on: the block's geometry in its inline
// style, its meaning in its aria label, and its state in its data attributes. The registry shape, the catalog and the
// forbidden words live in the generic suites.
import { describe, expect, test } from "bun:test";
import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import {
  DayLine,
  DayLineAction,
  DayLineAllDay,
  DayLineDate,
  type DayLineEvent,
  DayLineFoot,
  DayLineHead,
  DayLineNote,
  DayLineSteps,
  DayLineStrip,
} from "@/components/superthread/blocks/day-line";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { CONTROL_RING, detailsUsed, elements, forbidden, one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const NARROW = "@max-[560px]/day-line:";
const DAY = "2026-11-03";
const ZONE = "Europe/Amsterdam";
const clock = (time: string) => `${DAY}T${time}:00+01:00`;

function meeting(title: string, start: string, end: string, more?: Partial<DayLineEvent>): DayLineEvent {
  return { id: title, title, start: clock(start), end: clock(end), ...more };
}

function strip(events: DayLineEvent[], props?: Partial<ComponentProps<typeof DayLineStrip>>) {
  return server(<DayLineStrip aria-label="tuesday" day={DAY} events={events} timeZone={ZONE} {...props} />);
}

const blocks = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>('[data-slot="day-line-block"]')];
const block = (host: ParentNode, title: string) => {
  const found = blocks(host).find((el) => el.getAttribute("aria-label")?.startsWith(`${title},`));
  expect(found, title).toBeDefined();
  return found!;
};
const label = (host: ParentNode, title: string) => block(host, title).getAttribute("aria-label");
const box = (host: ParentNode, title: string) => block(host, title).parentElement!.style;
const names = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>('[data-slot="day-line-name"]')];
const nameTexts = (host: ParentNode) => names(host).map((el) => el.children[0]?.textContent);
const nextName = (host: ParentNode) => host.querySelector("[data-next]")?.textContent;
const ticks = (host: ParentNode) => host.querySelectorAll('[data-slot="day-line-tick"]');

const standup = meeting("team standup", "09:30", "10:00");
const renewal = meeting("renewal call", "11:00", "11:45", { brief: true });
const pathOf = (html: string) => /<path d="([^"]+)"/.exec(html)?.[1];

describe("the scale", () => {
  test("a block sits at true scale on the working day", () => {
    const host = strip([standup, renewal]);
    expect(box(host, "team standup").left).toBe("15%");
    expect(box(host, "team standup").width).toBe("5%");
    expect(box(host, "renewal call").left).toBe("30%");
    expect(box(host, "renewal call").width).toBe("7.5%");
    expect(ticks(host)).toHaveLength(11);
  });

  test("widens to the whole hours that hold the first start and the last end", () => {
    const host = strip([meeting("early", "07:20", "08:30"), meeting("dinner", "19:00", "20:10")]);
    // 07:00 to 21:00
    expect(box(host, "early").left).toBe("2.38%");
    expect(box(host, "dinner").left).toBe("85.71%");
    expect(ticks(host)).toHaveLength(15);
  });

  test("never widens for now: past the scale the mark waits at the edge and prints the real time", () => {
    const host = strip([standup], { now: clock("22:40") });
    expect(box(host, "team standup").left).toBe("15%");
    expect(ticks(host)).toHaveLength(11);
    expect(one(host, '[data-slot="day-line-strip"]').el.getAttribute("style")).toContain("--now:100%");
    expect(one(host, '[data-slot="day-line-now"] time').el.textContent).toBe("22:40");
  });

  test("places a moment by the clock in the reader's zone", () => {
    const events = [{ id: "a", title: "a", start: "2026-11-03T09:00:00Z", end: "2026-11-03T10:00:00Z" }];
    expect(box(strip(events, { timeZone: "UTC" }), "a").left).toBe("10%");
    expect(box(strip(events, { timeZone: ZONE }), "a").left).toBe("20%");
  });

  test("a plain date is never a block, and an event on another day stays off the strip", () => {
    const host = strip([
      { id: "anna", title: "anna out", start: DAY, end: DAY },
      { id: "monday", title: "monday", start: "2026-11-02T09:00:00+01:00", end: "2026-11-02T10:00:00+01:00" },
      { id: "wednesday", title: "wednesday", start: "2026-11-04T09:00:00+01:00", end: "2026-11-04T10:00:00+01:00" },
      standup,
    ]);
    expect(blocks(host)).toHaveLength(1);
    expect(nameTexts(host)).toEqual(["team standup"]);
  });

  test("a meeting that ends at midnight belongs to the day before", () => {
    const host = strip([
      { id: "late", title: "late", start: "2026-11-02T23:00:00+01:00", end: "2026-11-03T00:00:00+01:00" },
    ]);
    expect(blocks(host)).toHaveLength(0);
  });

  test("an event that crosses midnight clips to the day and keeps its real times in its label", () => {
    const host = strip([
      { id: "night", title: "night shift", start: "2026-11-03T22:00:00+01:00", end: "2026-11-04T01:00:00+01:00" },
    ]);
    // 08:00 to 24:00
    expect(box(host, "night shift").left).toBe("87.5%");
    expect(box(host, "night shift").width).toBe("12.5%");
    expect(label(host, "night shift")).toBe("night shift, 22:00 to 01:00");
  });
});

describe("a block's whole meaning in its aria label", () => {
  test.each([
    ["a meeting ahead", standup, undefined, "team standup, 09:30 to 10:00"],
    ["tentative", { ...standup, tentative: true }, undefined, "team standup, 09:30 to 10:00, tentative"],
    ["over", standup, "12:00", "team standup, 09:30 to 10:00, over"],
    ["a brief", { ...renewal }, undefined, "renewal call, 11:00 to 11:45, brief ready"],
    ["an open brief", { ...renewal, selected: true }, undefined, "renewal call, 11:00 to 11:45, brief open"],
    ["selected, with no brief", { ...standup, selected: true }, undefined, "team standup, 09:30 to 10:00, selected"],
    ["happening now", renewal, "11:12", "renewal call, happening now, until 11:45, brief ready"],
    ["stale", { ...standup, stale: true }, undefined, "team standup, 09:30 to 10:00, may be behind"],
    [
      "a ship's own note",
      { ...standup, stale: true, note: "personal calendar may be behind" },
      undefined,
      "team standup, 09:30 to 10:00, personal calendar may be behind",
    ],
  ])("%s", (_, event, now, words) => {
    expect(label(strip([event], { now: now ? clock(now) : undefined }), event.title)).toBe(words);
  });

  test("a block with a place to go is a link in the tab order, and one without is a labelled image", () => {
    const host = strip([{ ...standup, href: "/meetings/1" }, renewal]);
    const link = block(host, "team standup");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/meetings/1");
    expect(link.getAttribute("tabindex")).toBeNull();
    expect(link.getAttribute("role")).toBeNull();
    const plain = block(host, "renewal call");
    expect(plain.tagName).toBe("SPAN");
    expect(plain.getAttribute("role")).toBe("img");
    expect(one(host, '[data-slot="day-line-block"]').classes).toEqual(expect.arrayContaining(CONTROL_RING));
  });

  test("takes a router link through render", () => {
    function RouterLink(props: ComponentProps<"a">) {
      return <a data-router="true" {...props} />;
    }
    const host = strip([{ ...standup, render: <RouterLink href="/meetings/1" /> }]);
    expect(block(host, "team standup").getAttribute("data-router")).toBe("true");
    expect(block(host, "team standup").getAttribute("href")).toBe("/meetings/1");
    expect(one(host, '[data-slot="day-line-name"]').el.getAttribute("data-router")).toBe("true");
  });

  test("the blocks read in time order, whatever order they came in", () => {
    const host = strip([renewal, standup]);
    expect(blocks(host).map((el) => el.getAttribute("aria-label")?.split(",")[0])).toEqual([
      "team standup",
      "renewal call",
    ]);
  });
});

describe("a block's states", () => {
  const ink = (host: ParentNode, title: string) => block(host, title).getAttribute("data-ink");
  const form = (host: ParentNode, title: string) => block(host, title).getAttribute("data-form");
  const word = (host: ParentNode, title: string) => block(host, title).textContent;

  test("a spent meeting dims and loses its word, and its name goes muted", () => {
    const host = strip([renewal, meeting("later", "14:00", "15:00", { brief: true })], { now: clock("12:00") });
    expect(ink(host, "renewal call")).toBe("past");
    expect(word(host, "renewal call")).toBe("");
    expect(ink(host, "later")).toBe("rest");
    expect(word(host, "later")).toBe("brief");
    const [spent, ahead] = names(host);
    expect(spent?.hasAttribute("data-past")).toBe(true);
    expect(ahead?.hasAttribute("data-past")).toBe(false);
  });

  test("a meeting underway keeps its brief, since that's when it's read", () => {
    const host = strip([renewal], { now: clock("11:12") });
    expect(ink(host, "renewal call")).toBe("rest");
    expect(word(host, "renewal call")).toBe("brief");
  });

  test("a brief sits over the mark on the block's own face, so the mark passes behind it and never through it", () => {
    const host = strip([renewal, meeting("hold", "13:00", "13:45", { brief: true, tentative: true })], {
      now: clock("11:12"),
    });
    const brief = one(block(host, "renewal call"), '[data-slot="day-line-brief"]');
    expect(brief.classes).toEqual(expect.arrayContaining(["relative", "z-1", "bg-(--ink)"]));
    // an outline or a dotted block has no fill, so its brief takes the fill of the surface the strip sits on, the
    // panel's card or else the stock, as the mark's own edge does
    const hold = block(host, "hold");
    expect(hold.classList).toContain("group/block");
    expect(one(hold, '[data-slot="day-line-brief"]').classes).toEqual(
      expect.arrayContaining([
        "group-data-[form=outline]/block:bg-(--surface,var(--background))",
        "group-data-[form=dotted]/block:bg-(--surface,var(--background))",
      ]),
    );
    // the track keeps that stacking to itself
    expect(one(host, '[data-slot="day-line-track"]').classes).toContain("isolate");
  });

  test("a meeting that ends this minute is over, and one that starts this minute is underway", () => {
    const host = strip([standup, meeting("next", "10:00", "10:30")], { now: clock("10:00") });
    expect(ink(host, "team standup")).toBe("past");
    expect(label(host, "next")).toContain("happening now");
  });

  test("with no clock, or on a day still to come, nothing is spent and no mark prints", () => {
    for (const now of [undefined, null, "2026-11-02T12:00:00+01:00"]) {
      const host = strip([standup], { now });
      expect(ink(host, "team standup")).toBe("rest");
      expect(host.querySelector('[data-slot="day-line-now-mark"]')).toBeNull();
      expect(host.querySelector('[data-slot="day-line-now"]')).toBeNull();
    }
  });

  test("a day gone by reads as spent all through, with no mark and no next name", () => {
    const host = strip([standup, renewal], { now: "2026-11-04T12:00:00+01:00" });
    expect(ink(host, "team standup")).toBe("past");
    expect(ink(host, "renewal call")).toBe("past");
    expect(label(host, "renewal call")).toBe("renewal call, 11:00 to 11:45, over, brief ready");
    expect(word(host, "renewal call")).toBe("");
    expect(names(host).every((name) => name.hasAttribute("data-past"))).toBe(true);
    expect(host.querySelector("[data-next]")).toBeNull();
    expect(host.querySelector('[data-slot="day-line-now-mark"]')).toBeNull();
  });

  test("a meeting that runs past midnight stays underway on the day it started", () => {
    const night = {
      id: "night",
      title: "night shift",
      start: "2026-11-03T22:00:00+01:00",
      end: "2026-11-04T01:00:00+01:00",
    };
    const host = strip([night], { now: "2026-11-04T00:30:00+01:00" });
    expect(ink(host, "night shift")).toBe("rest");
    expect(label(host, "night shift")).toBe("night shift, happening now, until 01:00");
  });

  test("two blocks that touch take a seam on the later one, and a gap takes none", () => {
    const host = strip([standup, meeting("review", "10:00", "11:00"), meeting("sync", "11:30", "12:00")]);
    expect(block(host, "team standup").hasAttribute("data-seam")).toBe(false);
    expect(block(host, "review").getAttribute("data-seam")).toBe("left");
    expect(block(host, "sync").hasAttribute("data-seam")).toBe(false);
  });

  test("a stale block prints dotted with no fill, and tentative outranks it, because tentative is never dotted", () => {
    const host = strip([
      meeting("a", "09:00", "10:00", { stale: true }),
      meeting("b", "11:00", "12:00", { tentative: true }),
      meeting("c", "13:00", "14:00", { tentative: true, stale: true }),
    ]);
    expect(form(host, "a")).toBe("dotted");
    expect(form(host, "b")).toBe("outline");
    expect(form(host, "c")).toBe("outline");
  });

  test("a tentative meeting says so in its name's time line", () => {
    const host = strip([meeting("hold", "11:15", "12:00", { tentative: true })]);
    expect(names(host)[0]?.children[1]?.textContent).toBe("11:15 · tentative");
  });

  test("a crowded strip drops a tentative meeting's clock and keeps the word, on the title's line", () => {
    const titles = ["team standup", "design review", "renewal call", "1:1 with sam", "quarter planning"];
    const host = strip(
      titles.map((title, index) => meeting(title, `09:${index}0`, `09:${index}5`, { tentative: index === 2 })),
    );
    const [plain, tentative] = [names(host)[0]!, names(host)[2]!];
    const clockIn = (name: Element) => name.children[1]!.firstElementChild!;
    const dropsWhenCrowded = `@min-[561px]/day-line:group-data-crowded/names:hidden`;
    expect(clockIn(plain).getAttribute("class")).toContain(dropsWhenCrowded);
    expect(clockIn(tentative).getAttribute("class")).toContain(dropsWhenCrowded);
    expect(clockIn(tentative).textContent).toBe("09:20 · ");
    expect(tentative.children[1]!.textContent).toBe("09:20 · tentative");
    expect(tentative.children[1]!.getAttribute("class")).not.toContain("hidden");
    expect(tentative.getAttribute("class")).toContain("@min-[561px]/day-line:group-data-crowded/names:flex");
  });

  test("the selected block is the current one, and outranks spent", () => {
    const host = strip([{ ...renewal, selected: true }, standup], { now: clock("12:00") });
    expect(ink(host, "renewal call")).toBe("selected");
    expect(block(host, "renewal call").getAttribute("aria-current")).toBe("true");
    expect(block(host, "team standup").hasAttribute("aria-current")).toBe(false);
  });

  test("a stale selected block keeps its dotted edge in the selected ink", () => {
    const host = strip([{ ...renewal, stale: true, selected: true }]);
    expect(ink(host, "renewal call")).toBe("selected");
    expect(form(host, "renewal call")).toBe("dotted");
  });

  test("a brief carries the word and the drawn glyph, and the block's width and the viewport pick one", () => {
    const host = strip([renewal]);
    const mark = one(block(host, "renewal call"), '[data-slot="day-line-brief"]').el;
    expect(mark.closest('[aria-hidden="true"]')).not.toBeNull();
    const [word, glyph] = mark.children;
    expect(word?.textContent).toBe("brief");
    expect(word?.getAttribute("class")).toContain("[@media(min-width:601px)]:@min-[36px]/block:inline");
    expect(glyph?.getAttribute("class")).toContain("[@media(min-width:601px)]:@min-[36px]/block:hidden");
    expect(glyph?.querySelector("path")?.getAttribute("d")).toBe(pathOf(renderToString(<Icon name="brief" />))!);
  });
});

describe("overlaps", () => {
  const sam = meeting("1:1 with sam", "14:00", "14:45", { href: "/sam" });
  const scope = meeting("scope check", "14:30", "15:15", { href: "/scope", brief: true });

  test("stack at half height, earlier on top, with a seam on the lower", () => {
    const host = strip([scope, sam]);
    expect(box(host, "1:1 with sam").top).toBe("0%");
    expect(box(host, "1:1 with sam").height).toBe("50%");
    expect(box(host, "scope check").top).toBe("50%");
    expect(box(host, "scope check").height).toBe("50%");
    expect(block(host, "scope check").getAttribute("data-seam")).toBe("top");
  });

  test("each says what it overlaps, and neither prints a word", () => {
    const host = strip([sam, scope]);
    expect(label(host, "1:1 with sam")).toBe("1:1 with sam, 14:00 to 14:45, overlaps scope check");
    expect(label(host, "scope check")).toBe("scope check, 14:30 to 15:15, overlaps 1:1 with sam, brief ready");
    expect(block(host, "scope check").textContent).toBe("");
  });

  test("share one name in plain text, with both times", () => {
    const host = strip([sam, scope]);
    expect(names(host)).toHaveLength(1);
    expect(names(host)[0]?.tagName).toBe("SPAN");
    expect(names(host)[0]?.children[0]?.textContent).toBe("1:1 with sam, scope check");
    expect(names(host)[0]?.children[1]?.textContent).toBe("14:00, 14:30");
  });

  test("a chain says only what each really overlaps, and reuses a lane once it frees", () => {
    const host = strip([
      meeting("a", "09:00", "10:00"),
      meeting("b", "09:30", "10:30"),
      meeting("c", "10:15", "11:00"),
    ]);
    expect(label(host, "a")).toBe("a, 09:00 to 10:00, overlaps b");
    expect(label(host, "b")).toBe("b, 09:30 to 10:30, overlaps a, c");
    expect(box(host, "c").top).toBe("0%");
    expect(box(host, "b").height).toBe("50%");
  });

  test("three at once take three lanes", () => {
    const host = strip([
      meeting("a", "09:00", "10:00"),
      meeting("b", "09:15", "10:00"),
      meeting("c", "09:30", "10:00"),
    ]);
    expect(box(host, "c").top).toBe("66.67%");
    expect(box(host, "c").height).toBe("33.33%");
  });

  test("two that only touch stay whole", () => {
    const host = strip([sam, meeting("after", "14:45", "15:15")]);
    expect(box(host, "after").height).toBe("100%");
    expect(names(host)).toHaveLength(2);
  });
});

// New York's clock runs from 01:00 to 02:00 twice on this day: first at -04:00, then at -05:00.
describe("the hour a clock repeats", () => {
  const first = (time: string) => `2026-11-01T${time}:00-04:00`;
  const second = (time: string) => `2026-11-01T${time}:00-05:00`;
  const during = (title: string, start: string, end: string, more?: Partial<DayLineEvent>): DayLineEvent => ({
    id: title,
    title,
    start,
    end,
    ...more,
  });
  const repeated = (events: DayLineEvent[], now?: string) =>
    strip(events, { day: "2026-11-01", timeZone: "America/New_York", now });

  test("a meeting on the second pass is still to come, though its clock reads earlier than now", () => {
    const later = during("later", second("01:05"), second("01:15"), { brief: true });
    const host = repeated([later], first("01:20"));
    expect(label(host, "later")).toBe("later, 01:05 to 01:15, brief ready");
    expect(block(host, "later").getAttribute("data-ink")).toBe("rest");
    expect(block(host, "later").textContent).toContain("brief");
    expect(nextName(host)).toContain("later");
  });

  test("a meeting on the first pass is over, though now's clock reads inside it", () => {
    const host = repeated([during("gone", first("01:05"), first("01:15"))], second("01:10"));
    expect(label(host, "gone")).toBe("gone, 01:05 to 01:15, over");
    expect(block(host, "gone").getAttribute("data-ink")).toBe("past");
  });

  test("the next meeting is the sooner moment, not the earlier clock", () => {
    const events = [
      during("second pass", second("01:10"), second("01:20")),
      during("first pass", first("01:30"), first("01:40")),
    ];
    expect(nextName(repeated(events, first("01:00")))).toContain("first pass");
  });

  test("two meetings that share a clock an hour apart don't say they overlap", () => {
    const events = [during("one", first("01:05"), first("01:15")), during("two", second("01:05"), second("01:15"))];
    const host = repeated(events);
    expect(label(host, "one")).toBe("one, 01:05 to 01:15");
    expect(label(host, "two")).toBe("two, 01:05 to 01:15");
  });
});

describe("the names", () => {
  test("are for the eye: a screen reader takes the blocks, and a name's link stays out of the tab order", () => {
    const host = strip([{ ...standup, href: "/meetings/1" }, renewal]);
    const [linked, plain] = names(host);
    expect(linked?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(linked?.tagName).toBe("A");
    expect(linked?.getAttribute("href")).toBe("/meetings/1");
    expect(linked?.getAttribute("tabindex")).toBe("-1");
    expect(plain?.tagName).toBe("SPAN");
    expect(plain?.hasAttribute("tabindex")).toBe(false);
  });

  test("print a title over its time, in the mono face", () => {
    const [name] = names(strip([standup]));
    expect(name?.children[0]?.textContent).toBe("team standup");
    expect(name?.children[1]?.textContent).toBe("09:30");
    expect(name?.children[1]?.getAttribute("class")).toContain("font-mono");
  });

  const rooms = (host: ParentNode) => names(host).map((el) => el.parentElement!.style.getPropertyValue("--room"));

  test("each stops at the next, and the last has what's left of the strip", () => {
    expect(rooms(strip([standup, renewal]))).toEqual(["calc(15% - 8px)", "70%"]);
  });

  test("a name alone in its row has the whole strip, so it can slide back as far as it needs", () => {
    expect(rooms(strip([meeting("wrap", "17:00", "17:30")]))).toEqual(["100%"]);
  });

  test("a long late name stops short of the name before it in its row, so a crowded strip loses neither", () => {
    const host = strip([
      meeting("standup", "16:00", "16:20"),
      meeting("review", "16:30", "16:50"),
      meeting("quarterly planning with the whole team", "17:00", "17:45"),
    ]);
    expect(host.querySelector("[data-crowded]")).not.toBeNull();
    // standup keeps the 7.31% its own words need, and the late name truncates in the rest.
    expect(rooms(host)).toEqual(["calc(7.31% - 8px)", "100%", "12.69%"]);
  });

  test("a long name keeps its floor against a late name, and no name slides forward to make room", () => {
    const host = strip([
      meeting("the whole company all hands and questions", "14:00", "14:20"),
      meeting("review", "14:30", "14:50"),
      meeting("quarterly planning with the whole team", "17:00", "17:45"),
    ]);
    // 60% plus the floor of 12% stops the late name at 72%, short of the 68.46% it would slide to on its own.
    expect(rooms(host)).toEqual(["calc(12% - 8px)", "100%", "28%"]);
    const packed = strip([
      meeting("the first long name in this row", "16:00", "16:20"),
      meeting("review", "16:30", "16:50"),
      meeting("the last long name in this row", "17:00", "17:45"),
    ]);
    expect(rooms(packed)).toEqual(["calc(10% - 8px)", "100%", "10%"]);
  });

  test.each([
    ["the first ahead of now", "08:42", "team standup09:30"],
    ["the one underway", "09:40", "team standup09:30"],
    ["the next after a gap", "10:30", "renewal call11:00"],
  ])("the next name on a narrow strip: %s", (_, now, text) => {
    expect(nextName(strip([standup, renewal], { now: clock(now) }))).toBe(text);
  });

  test("the selected meeting outranks the clock as the next name", () => {
    const host = strip([standup, { ...renewal, selected: true }], { now: clock("08:00") });
    expect(nextName(host)).toBe("renewal call11:00");
  });

  test("with no clock the first meeting is next, and once all are spent none is", () => {
    expect(nextName(strip([standup, renewal]))).toBe("team standup09:30");
    expect(strip([standup, renewal], { now: clock("12:00") }).querySelector("[data-next]")).toBeNull();
  });

  test("a narrow strip prints only the next name, and past the middle it ends at its block's right edge", () => {
    const host = strip([meeting("kickoff", "16:30", "17:30")], { now: clock("08:00") });
    const wrapper = one(host, "[data-next]");
    expect(wrapper.classes).toEqual(expect.arrayContaining([`${NARROW}hidden`, `${NARROW}data-next:flex`]));
    expect(wrapper.classes).toContain(`${NARROW}pr-(--tail)`);
    expect((wrapper.el as HTMLElement).style.getPropertyValue("--tail")).toBe("5%");
    const early = one(strip([standup]), "[data-next]").el as HTMLElement;
    expect(early.style.getPropertyValue("--tail")).toBe("0%");
  });

  test("a day that would collide staggers onto two rows and drops its times on a wide strip", () => {
    const titles = ["team standup", "design review", "renewal call", "1:1 with sam", "quarter planning"];
    const host = strip(titles.map((title, index) => meeting(title, `09:${index}0`, `09:${index}5`)));
    expect(host.querySelector("[data-crowded]")).not.toBeNull();
    const rows = names(host).map((el) => el.parentElement!.hasAttribute("data-low"));
    expect(rows).toEqual([false, true, false, true, false]);
    expect(names(host)[0]?.children[1]?.firstElementChild?.getAttribute("class")).toContain(
      "@min-[561px]/day-line:group-data-crowded/names:hidden",
    );
  });

  test("a day with room stays on one row", () => {
    const host = strip([standup, renewal]);
    expect(host.querySelector("[data-crowded]")).toBeNull();
    expect(host.querySelector("[data-low]")).toBeNull();
  });
});

describe("the strip", () => {
  test("on a timeline solid means an event: past the blocks, nothing on the track carries a fill but the rule's ticks and the mark", () => {
    const host = strip([standup, renewal], { now: clock("11:12") });
    const track = one(host, '[data-slot="day-line-track"]').el;
    // a brief inside a block stands on the block's own face, so it's part of the event
    const outsideBlocks = elements(track).filter(
      ({ el }) => !el.parentElement?.closest('[data-slot="day-line-block"]'),
    );
    const filled = outsideBlocks.filter(({ classes }) => classes.some((cls) => /^bg-(?!clip|transparent)/.test(cls)));
    expect(filled.map(({ el }) => el.getAttribute("data-slot")).sort()).toEqual([
      "day-line-block",
      "day-line-block",
      "day-line-now-mark",
      ...Array.from({ length: 11 }, () => "day-line-tick"),
    ]);
    expect(one(track, '[data-slot="day-line-now-mark"]').classes).toContain("w-0.5");
    expect(one(track, '[data-slot="day-line-tick"]').classes).toContain("w-px");
  });

  test("the mark takes an edge in the surface it sits on, so it holds against a block it crosses", () => {
    const host = strip([standup], { now: clock("09:40") });
    expect(one(host, '[data-slot="day-line-now-mark"]').classes).toEqual(
      expect.arrayContaining(["outline-1", "outline-(--surface,var(--background))"]),
    );
  });

  test("prints now under its mark, naming it for a screen reader", () => {
    const host = strip([standup], { now: clock("11:12") });
    expect(one(host, '[data-slot="day-line-strip"]').el.getAttribute("style")).toContain("--now:32%");
    const now = one(host, '[data-slot="day-line-now"]');
    expect(now.el.textContent).toBe("now 11:12");
    expect(now.classes).toEqual(expect.arrayContaining(["font-mono", "text-first"]));
    expect(now.el.querySelector("time")?.getAttribute("datetime")).toBe("2026-11-03T10:12:00.000Z");
  });

  test("takes the now of a Date as readily as a string", () => {
    const host = strip([standup], { now: new Date("2026-11-03T10:12:00Z") });
    expect(one(host, '[data-slot="day-line-now"] time').el.textContent).toBe("11:12");
  });

  test("a stale read says when, on the side away from now", () => {
    const morning = one(strip([standup], { asOf: "as of 08:10", now: clock("09:00") }), '[data-slot="day-line-as-of"]');
    expect(morning.el.textContent).toBe("as of 08:10");
    expect((morning.el as HTMLElement).style.right).toBe("0px");
    const evening = one(strip([standup], { asOf: "as of 08:10", now: clock("16:00") }), '[data-slot="day-line-as-of"]');
    expect((evening.el as HTMLElement).style.left).toBe("0px");
  });

  test("a day with no timed event prints its children in the names' place, to every reader", () => {
    const host = strip([], { children: "nothing fixed today", now: clock("11:12") });
    const message = one(host, '[data-slot="day-line-message"]');
    expect(message.el.textContent).toBe("nothing fixed today");
    expect(message.el.closest('[aria-hidden="true"]')).toBeNull();
    expect(host.querySelector('[data-slot="day-line-now-mark"]')).not.toBeNull();
    expect(ticks(host)).toHaveLength(11);
  });

  test("an all-day event alone still reads as a day with no timed event", () => {
    const host = strip([{ id: "anna", title: "anna out", start: DAY, end: DAY }], { children: "nothing fixed today" });
    expect(one(host, '[data-slot="day-line-message"]').el.textContent).toBe("nothing fixed today");
  });

  test("loading holds the shape with bars in the band and nothing solid on the track", () => {
    const host = strip([], { children: "nothing fixed today", loading: true, now: clock("11:12") });
    expect(one(host, '[data-slot="day-line-strip"]').el.getAttribute("aria-busy")).toBe("true");
    const status = one(host, '[role="status"]');
    expect(status.el.getAttribute("aria-label")).toBe("loading");
    expect(status.el.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(host.querySelector('[data-slot="day-line-message"]')).toBeNull();
    expect(host.querySelector('[data-slot="day-line-track"] [data-slot="skeleton"]')).toBeNull();
    expect(blocks(host)).toHaveLength(0);
    expect(ticks(host)).toHaveLength(11);
  });

  test("a refresh keeps the blocks it has", () => {
    const host = strip([standup], { loading: true });
    expect(blocks(host)).toHaveLength(1);
    expect(host.querySelector('[role="status"]')).toBeNull();
    expect(one(host, '[data-slot="day-line-strip"]').el.hasAttribute("aria-busy")).toBe(false);
  });

  test("on a phone neither a block nor a name takes the pointer", () => {
    const host = strip([{ ...standup, href: "/meetings/1" }]);
    expect(one(host, '[data-slot="day-line-block"]').classes).toContain(`${PHONE}pointer-events-none`);
    expect(one(host, '[data-slot="day-line-name"]').classes).toContain(`${PHONE}pointer-events-none`);
  });

  test("the band and the track tighten on a narrow strip, whose own width decides", () => {
    const host = strip([standup]);
    expect(one(host, '[data-slot="day-line-strip"]').classes).toContain("@container/day-line");
    expect(one(host, '[data-slot="day-line-band"]').classes).toEqual(expect.arrayContaining(["h-10", `${NARROW}h-5`]));
    expect(one(host, '[data-slot="day-line-track"]').classes).toEqual(
      expect.arrayContaining(["h-[29px]", `${NARROW}h-[25px]`, "border-b", "border-rule"]),
    );
  });

  test("carries the aria label it's given, and its root takes the item's mark", () => {
    const root = one(strip([standup]), "section");
    expect(root.el.getAttribute("aria-label")).toBe("tuesday");
    expect(root.el.getAttribute("data-mk")).toBe("day-line");
  });
});

describe("the foot", () => {
  const faulted = (
    <DayLineFoot action={<DayLineAction>try again</DayLineAction>}>
      outlook isn&rsquo;t answering · as of 08:10
    </DayLineFoot>
  );

  test("holds the same box with a fault or without, so one coming or going moves nothing", () => {
    const empty = one(server(<DayLineFoot />), '[data-slot="day-line-foot"]');
    const full = one(server(faulted), '[data-slot="day-line-foot"]');
    expect(empty.classes).toEqual(full.classes);
    expect(full.classes).toEqual(expect.arrayContaining(["h-6", "min-w-0"]));
    // the live region is there before the words, so a screen reader hears them arrive
    expect(empty.el.querySelector('[role="status"]')).not.toBeNull();
  });

  test("its words are a status and truncate first, and its one action stands beside them, whole", () => {
    const foot = server(faulted);
    const words = one(foot, '[role="status"]');
    expect(words.el.textContent).toBe("outlook isn’t answering · as of 08:10");
    expect(words.classes).toEqual(expect.arrayContaining(["min-w-0", "truncate"]));
    const action = one(foot, '[data-slot="day-line-action"]');
    expect(words.el.contains(action.el)).toBe(false);
    expect(action.el.tagName).toBe("BUTTON");
    expect(action.el.getAttribute("type")).toBe("button");
    expect(action.classes).toContain("shrink-0");
  });

  test("the action is a quiet word, foreground beside the muted words, with a 44 px phone target", () => {
    const action = one(server(faulted), '[data-slot="day-line-action"]');
    const link = one(server(<Button variant="link" size="xs" />), "button");
    expect(action.classes).toEqual(link.classes);
    expect(action.classes).toEqual(expect.arrayContaining(["text-foreground", "hover:underline", `${PHONE}hit-area`]));
    expect(one(server(faulted), '[data-slot="day-line-foot"]').classes).toContain("text-muted-foreground");
  });

  test("inside the day line it sits right under the strip, and nowhere else does it pull up", () => {
    const host = server(
      <DayLine>
        <DayLineHead>
          <DayLineDate>tue 3 nov</DayLineDate>
        </DayLineHead>
        <DayLineStrip day={DAY} events={[standup]} timeZone={ZONE} />
        {faulted}
      </DayLine>,
    );
    const line = one(host, '[data-slot="day-line"]');
    const hug = "[&>[data-slot=day-line-strip]+[data-slot=day-line-foot]]:-mt-4";
    expect(line.classes).toEqual(expect.arrayContaining(["gap-4", hug]));
    expect(one(host, '[data-slot="day-line-strip"] + [data-slot="day-line-foot"]').el).toBeDefined();
    expect(one(host, '[data-slot="day-line-foot"]').classes.some((cls) => cls.includes("-mt-"))).toBe(false);
  });

  test("holds the rules every skin keeps, with no texture detail of its own", () => {
    const host = server(faulted);
    expect(forbidden(elements(host))).toEqual([]);
    expect(detailsUsed(elements(host), "day-line")).toEqual([]);
  });
});

describe("the head", () => {
  const head = () =>
    server(
      <DayLine>
        <DayLineHead>
          <DayLineDate href="/day" aria-expanded={true}>
            tue 3 nov
          </DayLineDate>
          <DayLineNote>times in new york</DayLineNote>
          <DayLineAllDay>anna out of office</DayLineAllDay>
          <DayLineSteps>
            <a href="/tomorrow">tomorrow</a>
          </DayLineSteps>
        </DayLineHead>
        <DayLineStrip day={DAY} events={[standup]} timeZone={ZONE} />
      </DayLine>,
    );

  test("a linked date is the phone's way into the day, and keeps its underline while it's open", () => {
    const date = one(head(), 'a[data-slot="day-line-date"]');
    expect(date.el.getAttribute("href")).toBe("/day");
    expect(date.el.getAttribute("aria-expanded")).toBe("true");
    expect(date.classes).toEqual(
      expect.arrayContaining(["type-subtitle", "relative", "aria-expanded:underline", ...CONTROL_RING]),
    );
    expect(date.classes).not.toContain("underline");
  });

  // A class gated on :is() reaches an element only when the element matches, so these ask what a browser asks.
  const reaches = ({ el, classes }: { el: Element; classes: string[] }, utility: string) => {
    const gated = classes.find((cls) => cls.endsWith(utility));
    const selector = gated && /\[&(:is\([^)]*\))\]/.exec(gated)?.[1];
    return gated !== undefined && (selector === undefined || el.matches(selector));
  };

  test.each([
    ["a link", <DayLineDate href="/day">tue 3 nov</DayLineDate>],
    [
      "a button that opens the day in place",
      <DayLineDate render={<button type="button" />} aria-expanded={false}>
        tue 3 nov
      </DayLineDate>,
    ],
  ])("the date as %s takes the 44 px phone target and the hover underline", (_, date) => {
    const found = one(server(date), '[data-slot="day-line-date"]');
    expect(reaches(found, ":hit-area")).toBe(true);
    expect(reaches(found, ":hover:underline")).toBe(true);
  });

  test("plain words take neither", () => {
    const found = one(server(<DayLineDate>tue 3 nov</DayLineDate>), '[data-slot="day-line-date"]');
    expect(reaches(found, ":hit-area")).toBe(false);
    expect(reaches(found, ":hover:underline")).toBe(false);
  });

  test("the date can stay plain words, or title the page", () => {
    expect(one(server(<DayLineDate>tue 3 nov</DayLineDate>), '[data-slot="day-line-date"]').el.tagName).toBe("SPAN");
    expect(one(server(<DayLineDate render={<h1 />}>tue 3 nov</DayLineDate>), "h1").el.textContent).toBe("tue 3 nov");
  });

  test("all-day words say what they are, and hang under the date in the gap before the strip", () => {
    const allDay = one(head(), '[data-slot="day-line-all-day"]');
    expect(allDay.el.textContent).toBe("all day: anna out of office");
    expect(allDay.classes).toEqual(
      expect.arrayContaining(["[grid-area:all]", "h-[15px]", "leading-[15px]", "truncate"]),
    );
    expect(one(head(), '[data-slot="day-line-head"]').classes).toEqual(
      expect.arrayContaining(["h-6", "grid-rows-[24px_0]", "[grid-template-areas:'date_note_steps'_'all_all_all']"]),
    );
  });

  test("on a phone the note joins the all-day line under the date, out of the date's target", () => {
    const host = head();
    expect(one(host, '[data-slot="day-line-head"]').classes).toContain(
      `${PHONE}[grid-template-areas:'date_date_steps'_'all_note_note']`,
    );
    expect(one(host, '[data-slot="day-line-note"]').classes).toEqual(
      expect.arrayContaining([`${PHONE}pointer-events-none`, `${PHONE}h-[15px]`, "truncate"]),
    );
  });

  test("on a phone the all-day words give way first, so the note keeps its whole width", () => {
    const allDayFirst = `${PHONE}has-data-[slot=day-line-all-day]:grid-cols-[minmax(0,1fr)_auto_auto]`;
    expect(one(head(), '[data-slot="day-line-head"]').classes).toContain(allDayFirst);
  });

  test("holds the rules every skin keeps, with no texture detail of its own", () => {
    const host = head();
    expect(forbidden(elements(host))).toEqual([]);
    expect(detailsUsed(elements(host), "day-line")).toEqual([]);
  });
});
