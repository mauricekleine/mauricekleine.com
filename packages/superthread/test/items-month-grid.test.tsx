// The month grid. Six weeks that never change height, so a step moves nothing under it, its marks, and the keys that walk
// it and turn the month. happy-dom measures nothing, so the print reads the states and classes a browser keys on; the
// keys run on a real client render, with focus. The registry shape and the forbidden words live in the generic suites.
import { afterEach, describe, expect, test } from "bun:test";
import { act, type ComponentProps, useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { MonthGrid, type MonthGridEntry } from "@/components/superthread/blocks/month-grid";
import { Reader, ReaderHead, ReaderRail } from "@/components/superthread/blocks/reader";
import { client, CONTROL_RING, elements, forbidden, one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const IN_PANEL = "in-data-[slot=app-shell-panel]:";
const slot = (name: string) => `[data-slot="${name}"]`;
const link = (date: string): MonthGridEntry => ({ date, href: `/briefs/${date}` });

const figures = (scope: ParentNode) =>
  [...scope.querySelectorAll(slot("month-grid-day"))].map((el) => el.textContent ?? "");
const dayCell = (scope: ParentNode, nth: number) =>
  scope.querySelectorAll(`${slot("month-grid-day")}`)[nth] as HTMLElement;

describe("six weeks from a monday", () => {
  test.each([
    ["starts on a sunday, and runs to the sixth row", "2026-11", "26", "6"],
    ["starts on a monday, so its own first row opens it", "2027-02", "1", "14"],
    ["starts on a thursday", "2026-10", "28", "8"],
    ["a leap february", "2028-02", "31", "12"],
  ])("%s", (_, month, first, last) => {
    const host = server(<MonthGrid month={month} />);
    expect(host.querySelectorAll("tbody tr")).toHaveLength(6);
    const printed = figures(host);
    expect(printed).toHaveLength(42);
    expect(printed[0]).toBe(first);
    expect(printed.at(-1)).toBe(last);
  });

  test("the grid prints the same days in any zone", () => {
    const machine = process.env.TZ;
    const read = (TZ: string) => {
      process.env.TZ = TZ;
      return figures(server(<MonthGrid month="2026-03" />));
    };
    try {
      expect(read("Pacific/Auckland")).toEqual(read("America/Los_Angeles"));
    } finally {
      process.env.TZ = machine;
    }
  });

  test("the head names the month, and the table takes that name", () => {
    const host = server(<MonthGrid aria-label="briefs by month" month="2026-11" />);
    const name = one(host, `${slot("month-grid-head")} p`);
    expect(name.el.textContent).toBe("november 2026");
    expect(one(host, slot("month-grid")).el.getAttribute("aria-label")).toBe("briefs by month");
    expect(one(host, "table").el.getAttribute("aria-labelledby")).toBe(name.el.id);
  });

  test("in a reader's rail the month's name sits level with the date line beside it", () => {
    const host = server(
      <Reader>
        <ReaderHead>tue 3 nov</ReaderHead>
        <ReaderRail>
          <MonthGrid month="2026-11" />
        </ReaderRail>
      </Reader>,
    );
    expect(one(host, slot("month-grid-head")).classes).toContain("in-data-[slot=reader-rail]:-mt-0.5");
  });

  test("the columns start on monday and say their whole name to a screen reader", () => {
    const heads = [...server(<MonthGrid month="2026-11" />).querySelectorAll("thead th")];
    expect(heads.map((head) => head.textContent)).toEqual(["mo", "tu", "we", "th", "fr", "sa", "su"]);
    expect(heads[0]?.getAttribute("aria-label")).toBe("monday");
    expect(heads[6]?.getAttribute("aria-label")).toBe("sunday");
  });
});

describe("the week column", () => {
  const weekFigures = (month: string) =>
    [...server(<MonthGrid month={month} weeks={[]} />).querySelectorAll(slot("month-grid-week"))].map(
      (el) => el.textContent,
    );

  test("prints only when weeks are given, even an empty list", () => {
    const host = server(<MonthGrid month="2026-11" />);
    expect(host.querySelector(slot("month-grid-week"))).toBeNull();
    expect(host.querySelectorAll("thead th")).toHaveLength(7);
    const weeks = server(<MonthGrid month="2026-11" weeks={[]} />);
    expect(weeks.querySelectorAll("thead th")).toHaveLength(8);
    expect(one(weeks, "thead th").el.textContent).toBe("wk");
  });

  test("numbers weeks as a calendar does, through a year's turn", () => {
    expect(weekFigures("2026-11")).toEqual(["44", "45", "46", "47", "48", "49"]);
    expect(weekFigures("2027-01")).toEqual(["53", "1", "2", "3", "4", "5"]);
    expect(weekFigures("2026-01")).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  test("a week's own cell is a row head under a rule", () => {
    const host = server(<MonthGrid month="2026-11" weeks={[]} />);
    const cell = one(host, 'tbody th[scope="row"]');
    expect(cell.classes).toEqual(expect.arrayContaining(["border-r", "border-border"]));
    expect(cell.el.querySelector(slot("month-grid-week"))).not.toBeNull();
  });

  test("any day names its week, and a week with a link says which", () => {
    const host = server(<MonthGrid month="2026-11" weeks={[{ ...link("2026-10-29"), label: "read the week" }]} />);
    const week = one(host, `a${slot("month-grid-week")}`);
    expect(week.el.textContent).toBe("44");
    expect(week.el.getAttribute("href")).toBe("/briefs/2026-10-29");
    expect(week.el.getAttribute("aria-label")).toBe("read the week: week of 26 oct");
  });
});

describe("what a day prints", () => {
  const month = (props: Partial<ComponentProps<typeof MonthGrid>>) =>
    server(<MonthGrid month="2026-11" today="2026-11-03" {...props} />);
  const inkOf = (el: Element | null) => el?.getAttribute("data-ink") ?? null;

  test("a figure holds its column in mono at the instrument step, with a ring on what takes focus", () => {
    const { classes } = one(month({ days: [link("2026-11-02")] }), `a${slot("month-grid-day")}`);
    expect(classes).toEqual(expect.arrayContaining(["font-mono", "text-instrument", ...CONTROL_RING]));
  });

  test("a day with content prints a 4 px dot in its own ink, and a day with nothing prints none", () => {
    const host = month({ days: [link("2026-11-02")] });
    const dot = one(host, `a${slot("month-grid-day")} > span`);
    expect(dot.classes).toEqual(expect.arrayContaining(["size-1", "bg-current", "absolute"]));
    expect(dot.el.getAttribute("aria-hidden")).toBe("true");
    expect(host.querySelectorAll(`${slot("month-grid-day")} > span[aria-hidden]`)).toHaveLength(1);
  });

  test("ink says what a day holds: content, content in the month beside it, or nothing", () => {
    const host = month({ days: [link("2026-11-02"), link("2026-10-26")], today: undefined });
    expect(inkOf(host.querySelector('a[href="/briefs/2026-11-02"]'))).toBe("on");
    expect(inkOf(host.querySelector('a[href="/briefs/2026-10-26"]'))).toBe("off");
    expect(inkOf(dayCell(host, 12))).toBeNull();
    expect(one(host, `a${slot("month-grid-day")}`).classes).toEqual(
      expect.arrayContaining([
        "text-disabled",
        "data-[ink=on]:text-foreground",
        "data-[ink=off]:text-muted-foreground",
      ]),
    );
  });

  test("today prints its 1 px edge and aria-current, in foreground with nothing on it or in the month beside it", () => {
    const host = month({ today: "2026-10-27", days: [link("2026-10-27")] });
    const today = one(host, '[aria-current="date"]');
    expect(today.el.textContent).toBe("27");
    expect(today.el.hasAttribute("data-today")).toBe(true);
    expect(inkOf(today.el)).toBe("on");
    expect(today.classes).toContain("data-today:shadow-[inset_0_0_0_1px_var(--foreground)]");
    expect(inkOf(one(month({}), '[aria-current="date"]').el)).toBe("on");
  });

  test("the open day prints its 2 px bar, and aria-current says so", () => {
    const host = month({ days: [{ ...link("2026-11-02"), selected: true }] });
    const open = one(host, '[aria-current="true"]');
    expect(open.el.textContent).toBe("2");
    expect(open.el.hasAttribute("data-selected")).toBe(true);
    expect(open.classes).toContain("data-[selected]:shadow-[inset_0_-2px_0_var(--foreground)]");
  });

  test("a day that is open and today prints both marks, and the words carry what aria-current can't", () => {
    const host = month({ days: [{ ...link("2026-11-03"), label: "read the brief", selected: true }] });
    const day = one(host, '[aria-current="date"]');
    expect(day.classes).toContain(
      "data-today:data-[selected]:shadow-[inset_0_0_0_1px_var(--foreground),inset_0_-2px_0_var(--foreground)]",
    );
    expect(day.el.getAttribute("aria-label")).toBe("read the brief: tue 3 nov, selected");
  });

  test("a link says what it does before its date, and a day alone says its date", () => {
    const host = month({ days: [{ ...link("2026-11-02"), label: "read the brief" }, link("2026-11-05")] });
    expect(host.querySelector('a[href="/briefs/2026-11-02"]')?.getAttribute("aria-label")).toBe(
      "read the brief: mon 2 nov",
    );
    expect(host.querySelector('a[href="/briefs/2026-11-05"]')?.getAttribute("aria-label")).toBe("thu 5 nov");
  });

  test("a day with content and nowhere to go is a labelled image, so its dot isn't lost", () => {
    const host = month({ days: [{ date: "2026-11-02", label: "a brief" }] });
    expect(host.querySelector(`a${slot("month-grid-day")}`)).toBeNull();
    const day = one(host, `[role="img"]${slot("month-grid-day")}`);
    expect(day.el.getAttribute("aria-label")).toBe("a brief: mon 2 nov");
    expect(host.querySelectorAll(`${slot("month-grid-day")} > span[aria-hidden]`)).toHaveLength(1);
    expect(host.querySelector("[data-cell]")).toBeNull();
  });

  test("takes a router link through render, keeping its look and its dot", () => {
    function RouterLink(props: ComponentProps<"a">) {
      return <a data-router="" {...props} />;
    }
    const host = month({ days: [{ date: "2026-11-02", render: <RouterLink href="/briefs/monday" /> }] });
    const day = one(host, "a[data-router]");
    expect(day.el.getAttribute("href")).toBe("/briefs/monday");
    expect(day.el.getAttribute("data-slot")).toBe("month-grid-day");
    expect(day.classes).toContain("font-mono");
    expect(day.el.querySelector("span[aria-hidden]")).not.toBeNull();
  });

  test("an item owns its links, so the panel's running-text underline stays off them", () => {
    const host = month({ days: [link("2026-11-02")] });
    expect(host.querySelector("a:not([data-slot])")).toBeNull();
  });

  test("a table of links is a grid, and a table of figures stays a table", () => {
    expect(one(month({ days: [link("2026-11-02")] }), "table").el.getAttribute("role")).toBe("grid");
    expect(one(month({}), "table").el.hasAttribute("role")).toBe(false);
  });

  test("keeps the app's class and props, and carries no forbidden class", () => {
    const host = month({ className: "extra", id: "the-month", days: [link("2026-11-02")], weeks: [] });
    const root = one(host, slot("month-grid"));
    expect(root.el.getAttribute("data-mk")).toBe("month-grid");
    expect(root.classes).toContain("extra");
    expect(root.el.id).toBe("the-month");
    expect(forbidden(elements(host))).toEqual([]);
  });
});

describe("while the days are unread", () => {
  test("the grid holds its shape, says it's busy and marks where a dot could land", () => {
    const host = server(<MonthGrid loading month="2026-11" />);
    expect(one(host, "table").el.getAttribute("aria-busy")).toBe("true");
    expect(figures(host)).toHaveLength(42);
    expect(host.querySelectorAll(`${slot("month-grid-day")} ${slot("skeleton")}`)).toHaveLength(42);
  });

  test("a read month says neither", () => {
    const host = server(<MonthGrid month="2026-11" />);
    expect(one(host, "table").el.hasAttribute("aria-busy")).toBe(false);
    expect(host.querySelector(slot("skeleton"))).toBeNull();
  });
});

describe("on a phone", () => {
  test("every cell and step reaches 44 px on a box of its own, so two reaches never overlap", () => {
    const host = server(<MonthGrid month="2026-11" onMonthChange={() => {}} days={[link("2026-11-02")]} />);
    expect(one(host, slot("month-grid-day")).classes).toContain(`${PHONE}h-11`);
    expect(one(host, slot("month-grid-step")).classes).toContain(`${PHONE}size-11`);
    expect(one(host, slot("month-grid-head")).classes).toContain(`${PHONE}h-11`);
  });

  test("with the week column the grid hangs into a panel's margin, so eight cells fit at 44 px", () => {
    const hang = `${PHONE}${IN_PANEL}-mx-[9px]`;
    const grid = (weeks?: MonthGridEntry[]) =>
      one(
        server(
          <AppShellPanel>
            <MonthGrid month="2026-11" weeks={weeks} />
          </AppShellPanel>,
        ),
        "table",
      ).classes;
    expect(grid([])).toContain(hang);
    expect(grid(undefined)).not.toContain(hang);
  });
});

describe("the steps", () => {
  const steps = (scope: ParentNode) => [...scope.querySelectorAll<HTMLButtonElement>(slot("month-grid-step"))];
  const after: (() => Promise<void>)[] = [];
  afterEach(async () => {
    for (const done of after.splice(0)) await done();
  });

  test("print only when the app can take the change", () => {
    expect(steps(server(<MonthGrid month="2026-11" />))).toHaveLength(0);
    expect(steps(server(<MonthGrid month="2026-11" onMonthChange={() => {}} />))).toHaveLength(2);
  });

  test("name the month they show, with the year, through a year's turn", () => {
    const [back, on] = steps(server(<MonthGrid month="2026-12" onMonthChange={() => {}} />));
    expect(back?.getAttribute("aria-label")).toBe("show november 2026");
    expect(on?.getAttribute("aria-label")).toBe("show january 2027");
  });

  test("a click asks for the month beside this one", async () => {
    const asked: string[] = [];
    const { body, done } = await client(<MonthGrid month="2027-01" onMonthChange={(month) => asked.push(month)} />);
    after.push(done);
    const [back, on] = steps(body);
    await act(async () => back?.click());
    await act(async () => on?.click());
    expect(asked).toEqual(["2026-12", "2027-02"]);
  });

  test("at min and max a step stays where it is and can hold focus, but does nothing", async () => {
    const asked: string[] = [];
    const { body, done } = await client(
      <MonthGrid max="2026-11" min="2026-11" month="2026-11" onMonthChange={(month) => asked.push(month)} />,
    );
    after.push(done);
    const [back, on] = steps(body);
    for (const step of [back, on]) {
      expect(step?.getAttribute("aria-disabled")).toBe("true");
      expect(step?.hasAttribute("disabled")).toBe(false);
      await act(async () => step?.click());
    }
    expect(asked).toEqual([]);
  });

  test("a bound reaches only the side it closes", () => {
    const [back, on] = steps(server(<MonthGrid max="2026-11" month="2026-11" onMonthChange={() => {}} />));
    expect(back?.getAttribute("aria-disabled")).not.toBe("true");
    expect(on?.getAttribute("aria-disabled")).toBe("true");
  });

  test("a closed step prints a faint arrow, and no fill or edge", () => {
    const { classes } = one(
      server(<MonthGrid max="2026-11" month="2026-11" onMonthChange={() => {}} />),
      '[aria-disabled="true"]',
    );
    expect(classes).toEqual(
      expect.arrayContaining(["data-disabled:text-disabled", "data-disabled:hover:bg-transparent"]),
    );
  });
});

describe("the keys", () => {
  const november = [link("2026-10-26"), link("2026-11-02"), link("2026-11-03"), link("2026-11-16"), link("2026-11-24")];
  const october = [link("2026-10-05"), link("2026-10-19"), link("2026-10-26")];
  const everything: Record<string, MonthGridEntry[]> = { "2026-10": october, "2026-11": november, "2026-12": [] };

  // An app holding the month, whose days arrive with it, as a real one does.
  function Holder({ start = "2026-11", ...props }: Partial<ComponentProps<typeof MonthGrid>> & { start?: string }) {
    const [month, setMonth] = useState(start);
    return <MonthGrid days={everything[month]} month={month} onMonthChange={setMonth} {...props} />;
  }

  const after: (() => Promise<void>)[] = [];
  afterEach(async () => {
    for (const done of after.splice(0)) await done();
  });

  async function open(node: React.ReactNode) {
    const { body, done } = await client(node);
    after.push(done);
    return body;
  }

  const dayLink = (body: HTMLElement, date: string) => body.querySelector<HTMLElement>(`[data-cell="${date}"]`)!;
  const focused = () => document.activeElement?.getAttribute("data-cell");
  const stops = (body: HTMLElement) =>
    [...body.querySelectorAll('[data-cell][tabindex="0"]')].map((el) => el.getAttribute("data-cell"));

  async function press(key: string, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    await act(async () => document.activeElement?.dispatchEvent(event));
    return event;
  }

  async function focus(el: HTMLElement) {
    await act(async () => el.focus());
  }

  test.each<[string, Partial<ComponentProps<typeof MonthGrid>>, string]>([
    [
      "the open day",
      { days: [link("2026-11-02"), { ...link("2026-11-03"), selected: true }], today: "2026-11-02" },
      "2026-11-03",
    ],
    ["else today", { days: [link("2026-11-02"), link("2026-11-03")], today: "2026-11-03" }, "2026-11-03"],
    ["else the first link", {}, "2026-10-26"],
  ])("the grid is one tab stop: %s", async (_, props, stop) => {
    expect(stops(await open(<Holder {...props} />))).toEqual([stop]);
  });

  test("left and right walk the links in reading order, past the days with nothing", async () => {
    const body = await open(<Holder />);
    await focus(dayLink(body, "2026-11-02"));
    await press("ArrowRight");
    expect(focused()).toBe("2026-11-03");
    await press("ArrowRight");
    expect(focused()).toBe("2026-11-16");
    await press("ArrowLeft");
    expect(focused()).toBe("2026-11-03");
  });

  test("right walks through a week's cell, as reading does", async () => {
    const body = await open(<Holder weeks={[link("2026-11-16")]} />);
    await focus(dayLink(body, "2026-11-03"));
    await press("ArrowRight");
    expect(focused()).toBe("week-2026-11-16");
    await press("ArrowRight");
    expect(focused()).toBe("2026-11-16");
  });

  test("up and down keep the column, past a line with nothing in it", async () => {
    const body = await open(<Holder days={[link("2026-11-03"), link("2026-11-17"), link("2026-11-20")]} />);
    await focus(dayLink(body, "2026-11-03"));
    await press("ArrowDown");
    expect(focused()).toBe("2026-11-17");
    await press("ArrowUp");
    expect(focused()).toBe("2026-11-03");
  });

  test("up and down stop at the column's end and leave the month alone", async () => {
    const body = await open(<Holder />);
    await focus(dayLink(body, "2026-11-24"));
    await press("ArrowDown");
    expect(focused()).toBe("2026-11-24");
    expect(body.querySelector(`${slot("month-grid-head")} p`)?.textContent).toBe("november 2026");
  });

  test("the tab stop follows the keys, so tab comes back where it left", async () => {
    const body = await open(<Holder />);
    await focus(dayLink(body, "2026-11-02"));
    await press("ArrowRight");
    expect(stops(body)).toEqual(["2026-11-03"]);
  });

  test("the keys claim an arrow and leave the browser's own shortcuts alone", async () => {
    const body = await open(<Holder />);
    await focus(dayLink(body, "2026-11-02"));
    expect((await press("ArrowRight")).defaultPrevented).toBe(true);
    expect((await press("Enter")).defaultPrevented).toBe(false);
    for (const init of [{ altKey: true }, { metaKey: true }, { ctrlKey: true }, { shiftKey: true }]) {
      const before = focused();
      expect((await press("ArrowLeft", init)).defaultPrevented).toBe(false);
      expect(focused()).toBe(before);
    }
  });

  test("right past the last link opens the next month and carries on from that date", async () => {
    const body = await open(<Holder start="2026-10" />);
    await focus(dayLink(body, "2026-10-26"));
    await press("ArrowRight");
    expect(body.querySelector(`${slot("month-grid-head")} p`)?.textContent).toBe("november 2026");
    expect(focused()).toBe("2026-11-02");
  });

  test("left past the first link opens the month before and carries on from that date", async () => {
    const body = await open(<Holder />);
    await focus(dayLink(body, "2026-10-26"));
    await press("ArrowLeft");
    expect(body.querySelector(`${slot("month-grid-head")} p`)?.textContent).toBe("october 2026");
    expect(focused()).toBe("2026-10-19");
  });

  test("a month with no link past that date hands the keys to its step, so the walk has somewhere to go", async () => {
    const body = await open(<Holder />);
    await focus(dayLink(body, "2026-11-24"));
    await press("ArrowRight");
    expect(body.querySelector(`${slot("month-grid-head")} p`)?.textContent).toBe("december 2026");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("show january 2027");
  });

  test("a bound stops the walk where it stands", async () => {
    const body = await open(<Holder max="2026-11" min="2026-11" />);
    await focus(dayLink(body, "2026-11-24"));
    await press("ArrowRight");
    expect(focused()).toBe("2026-11-24");
    await focus(dayLink(body, "2026-10-26"));
    await press("ArrowLeft");
    expect(focused()).toBe("2026-10-26");
    expect(body.querySelector(`${slot("month-grid-head")} p`)?.textContent).toBe("november 2026");
  });

  test("with no way to change the month the walk stops at its ends", async () => {
    const body = await open(<MonthGrid days={november} month="2026-11" />);
    await focus(dayLink(body, "2026-11-24"));
    await press("ArrowRight");
    expect(focused()).toBe("2026-11-24");
  });

  test("a step's click keeps focus on the step and lands nothing in the grid", async () => {
    const body = await open(<Holder />);
    const [back] = [...body.querySelectorAll<HTMLButtonElement>(slot("month-grid-step"))];
    await focus(back!);
    await act(async () => back?.click());
    expect(document.activeElement).toBe(back!);
    expect(stops(body)).toHaveLength(1);
  });
});
