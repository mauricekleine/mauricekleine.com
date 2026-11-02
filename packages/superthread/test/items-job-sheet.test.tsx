// The job sheet. happy-dom lays nothing out, so these read what a browser keys on: the rows the grid holds, the areas the
// parts claim, and the classes each element carries. Those rows are checked against the type steps in tokens/scale.ts, so
// a slot and the step it holds can't drift apart. Clear stands where the job stood, so its rows are read here too. The
// registry shape and the catalog live in the generic suites.
import { describe, expect, test } from "bun:test";
import {
  JobSheet,
  JobSheetActions,
  JobSheetChanged,
  JobSheetCue,
  JobSheetPrimary,
  JobSheetTitle,
  JobSheetToggle,
  JobSheetWhy,
} from "@/components/superthread/blocks/job-sheet";
import { ClearState, ClearStateDoor, ClearStateReason, ClearStateTitle } from "@/components/superthread/blocks/states";
import { Button } from "@/components/superthread/ui/button";
import { InlineAnswers, InlineAnswersLine } from "@/components/superthread/ui/inline-answers";
import { steps } from "../tokens/scale.ts";
import { claim, detailsUsed, elements, forbidden, one, parts, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const step = (name: string) => steps.find((entry) => entry.name === name)!;

function sheet(more?: { changed?: string; why?: boolean }) {
  return server(
    <JobSheet aria-labelledby="job">
      <JobSheetCue>48 min until standup</JobSheetCue>
      <JobSheetTitle id="job" render={<h2 />} href="/tasks/7">
        reply to sam about chapter 7
      </JobSheetTitle>
      {more?.why !== false && <JobSheetWhy>the next draft waits on your answer.</JobSheetWhy>}
      <JobSheetChanged>{more?.changed}</JobSheetChanged>
      <JobSheetActions>
        <JobSheetPrimary reserve="open the draft">read the draft</JobSheetPrimary>
        <Button size="lg" variant="ghost">
          not now
        </Button>
        <JobSheetToggle>only what can&rsquo;t slip</JobSheetToggle>
      </JobSheetActions>
    </JobSheet>,
  );
}

const grid = (host: ParentNode) => one(host, '[data-slot="job-sheet"]');

// The rows a grid holds in a band, read from its class: one with no variants, or one under the variant named.
function rows(host: ParentNode, band: (variants: string[]) => boolean, slot = "job-sheet") {
  const found = one(host, `[data-slot="${slot}"]`).classes.filter((cls) => {
    const { variants, utility } = parts(cls);
    return utility.startsWith("grid-rows-[") && band(variants);
  });
  expect(found).toHaveLength(1);
  const [cue, title, why, changed, actions] = parts(found[0]!)
    .utility.slice("grid-rows-[".length, -1)
    .split("_")
    .map((px) => parseInt(px));
  return { cue: cue!, title: title!, why: why!, changed: changed!, actions: actions! };
}

// Tailwind compiles @max-[784px] to `width < 784px`, so the compact band ends where the full band's 784 px starts.
const FULL = (variants: string[]) => variants.length === 0;
const COMPACT = (variants: string[]) => variants.some((variant) => variant.includes("@max-[784px]/"));
const NARROW = (variants: string[]) => variants.length === 1 && variants[0] === PHONE.slice(0, -1);

describe("the paper", () => {
  test("is the page's one paper, named by its title", () => {
    const { el, classes } = one(sheet(), '[data-slot="paper"]');
    expect(el.tagName).toBe("SECTION");
    expect(el.getAttribute("aria-labelledby")).toBe("job");
    expect(classes).toEqual(expect.arrayContaining(["light", "bg-card"]));
    expect(one(sheet(), "h2").el.getAttribute("id")).toBe("job");
  });

  test("reaches past the panel by its own padding, so the words share the panel's left edge", () => {
    const { classes } = one(sheet(), '[data-slot="paper"]');
    expect(classes).toEqual(expect.arrayContaining(["p-6", "-mx-6", `${PHONE}p-4`, `${PHONE}-mx-4`]));
  });

  test("answers to its own width, with a guard so the phone band's rows win on a phone", () => {
    expect(one(sheet(), '[data-slot="paper"]').classes).toContain("@container/job-sheet");
    const compact = grid(sheet()).classes.filter((cls) => COMPACT(parts(cls).variants));
    expect(compact).toHaveLength(1);
    expect(parts(compact[0]!).variants).toContain("[@media(min-width:601px)]");
  });
});

describe("the held slots", () => {
  test("the title slot holds two lines of hero at a full panel and six of long below it", () => {
    const host = sheet();
    expect(Math.floor(rows(host, FULL).title / step("hero").line)).toBe(2);
    expect(Math.floor(rows(host, COMPACT).title / step("long").line)).toBe(6);
    expect(Math.floor(rows(host, NARROW).title / step("long").line)).toBe(6);
  });

  test("the why slot holds one line of lede at a full panel, and two below it", () => {
    const host = sheet();
    const lede = step("lede");
    expect(rows(host, FULL).why).toBe(lede.line);
    expect(rows(host, COMPACT).why).toBe(lede.line * 2);
    expect(rows(host, NARROW).why).toBe(lede.phone!.line * 2);
  });

  test("inline answers leave the clip off, so a target past the held row isn't cut", () => {
    const host = server(
      <JobSheetWhy>
        <InlineAnswers>
          <InlineAnswersLine>the next draft waits on your answer.</InlineAnswersLine>
        </InlineAnswers>
      </JobSheetWhy>,
    );
    const why = one(host, '[data-slot="job-sheet-why"]');
    expect(why.classes).toContain("has-data-[slot=inline-answers]:overflow-visible");
    expect(why.el.querySelector("[data-slot=inline-answers]")).not.toBeNull();
  });

  test("the what-changed slot and the actions hold their own height in every band", () => {
    const host = sheet();
    for (const band of [FULL, COMPACT, NARROW]) {
      expect(rows(host, band).changed).toBe(step("instrument").line);
      expect(rows(host, band).actions).toBe(48);
    }
  });

  test("a state that drops a part keeps every row and every other part's place", () => {
    const whole = grid(sheet()).classes;
    const host = sheet({ why: false });
    expect(grid(host).classes).toEqual(whole);
    expect(host.querySelector('[data-slot="job-sheet-why"]')).toBeNull();
    for (const [slot, area] of [
      ["job-sheet-cue", "cue"],
      ["job-sheet-actions", "actions"],
    ] as const)
      expect(one(host, `[data-slot="${slot}"]`).classes).toContain(`[grid-area:${area}]`);
    expect(one(host, '[data-slot="fit-title"]').classes).toContain("[grid-area:title]");
    expect(one(host, '[data-slot="notice"]').classes).toContain("[grid-area:changed]");
  });

  test("the why stays in its slot, and leaves room for a ring on a control inside it", () => {
    const { classes } = one(sheet(), '[data-slot="job-sheet-why"]');
    expect(classes).toEqual(
      expect.arrayContaining(["[grid-area:why]", "overflow-clip", "[overflow-clip-margin:4px]", "type-lede"]),
    );
  });
});

describe("the parts", () => {
  test("the title fits through fit-title and takes the page's heading level and link", () => {
    const host = sheet();
    const title = one(host, '[data-mk="fit-title"]');
    expect(title.el.tagName).toBe("H2");
    expect(one(host, "h2 > a").el.getAttribute("href")).toBe("/tasks/7");
  });

  test("the cue holds one line", () => {
    expect(one(sheet(), '[data-slot="job-sheet-cue"]').classes).toEqual(
      expect.arrayContaining(["truncate", "min-w-0", "type-subtitle"]),
    );
  });

  test("what changed is a live region from the start, so words that arrive after the sheet prints are heard and move nothing", () => {
    const host = sheet();
    const line = one(host, '[role="status"]');
    expect(line.el.textContent).toBe("");
    expect(line.classes).toContain("min-h-lh");
    const arrived = one(sheet({ changed: "sam sent the numbers" }), '[role="status"]');
    expect(arrived.el.textContent).toBe("sam sent the numbers");
    expect(arrived.classes).toContain("[&>span]:truncate");
  });

  test("the primary is the large fill, and reserve holds its width unseen and unread", () => {
    const host = sheet();
    const primary = one(host, '[data-slot="job-sheet-primary"]');
    expect(primary.el.getAttribute("data-variant")).toBe("default");
    expect(primary.classes).toEqual(expect.arrayContaining(["h-12", "min-w-28"]));
    const reserved = one(primary.el, '[aria-hidden="true"]');
    expect(reserved.el.textContent).toBe("open the draft");
    expect(reserved.classes).toEqual(expect.arrayContaining(["invisible", "col-start-1", "row-start-1"]));
    expect(one(primary.el, ":not([aria-hidden]).row-start-1").el.textContent).toBe("read the draft");
  });

  test("a primary with no reserve prints its word alone", () => {
    const host = server(<JobSheetPrimary>read the draft</JobSheetPrimary>);
    expect(host.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(host.textContent).toBe("read the draft");
  });

  test("the primary is a link when it leads somewhere, and an outline when nothing presses", () => {
    const link = server(
      <JobSheetPrimary render={<a href="/tasks/7" />} nativeButton={false}>
        read the draft
      </JobSheetPrimary>,
    );
    expect(one(link, "a").el.getAttribute("data-slot")).toBe("job-sheet-primary");
    const outline = server(<JobSheetPrimary variant="outline">read the brief</JobSheetPrimary>);
    expect(one(outline, "button").el.getAttribute("data-variant")).toBe("outline");
  });

  test("on a phone the primary takes what the row leaves, and can shrink rather than push the toggle out", () => {
    expect(one(sheet(), '[data-slot="job-sheet-primary"]').classes).toEqual(
      expect.arrayContaining([`${PHONE}flex-1`, `${PHONE}min-w-0`, `${PHONE}shrink`]),
    );
  });

  test("on a phone the toggle sets its words on two lines at the instrument step", () => {
    expect(one(sheet(), '[data-slot="job-sheet-toggle"]').classes).toEqual(
      expect.arrayContaining([`${PHONE}whitespace-normal`, `${PHONE}type-instrument`, `${PHONE}w-25`]),
    );
  });

  test("keeps the system's rules and claims no detail of its own", () => {
    const rendered = elements(sheet());
    expect(forbidden(rendered)).toEqual([]);
    expect(detailsUsed(rendered, "job-sheet")).toEqual(claim("job-sheet"));
  });
});

describe("clear", () => {
  const clear = (title?: React.ReactElement) =>
    server(
      <ClearState aria-labelledby="clear">
        <ClearStateTitle id="clear" render={title}>
          nothing needs you until 16:30.
        </ClearStateTitle>
        <ClearStateReason>the draft and the deck check are done.</ClearStateReason>
        <ClearStateDoor href="/open">the rest is in open</ClearStateDoor>
      </ClearState>,
    );
  const ROWS = "clear-state-rows";

  test("is the sheet's box with no sheet: no paper, no fill", () => {
    const host = clear();
    expect(host.querySelector('[data-slot="paper"]')).toBeNull();
    const section = one(host, '[data-slot="clear-state"]');
    expect(section.el.tagName).toBe("SECTION");
    expect(section.el.getAttribute("data-mk")).toBe("states");
    expect(section.el.getAttribute("aria-labelledby")).toBe("clear");
    expect(section.classes.filter((cls) => parts(cls).utility.startsWith("bg-"))).toEqual([]);
    expect(section.classes).toEqual(
      expect.arrayContaining(["-mx-6", "mt-5", "px-6", "py-7", `${PHONE}-mx-4`, `${PHONE}mt-4`, `${PHONE}p-4`]),
    );
    expect(one(sheet(), '[data-slot="paper"]').classes).toEqual(
      expect.arrayContaining(["-mx-6", "mt-5", "p-6", "py-7", `${PHONE}-mx-4`, `${PHONE}mt-4`, `${PHONE}p-4`]),
    );
  });

  test("holds the job sheet's rows in every band, so the reason and the door land on the why and the primary", () => {
    for (const band of [FULL, COMPACT, NARROW]) expect(rows(clear(), band, ROWS)).toEqual(rows(sheet(), band));
  });

  test("the title takes the cue's row and the title's, the reason the why's, and the door the actions'", () => {
    const host = clear();
    expect(one(host, `[data-slot="${ROWS}"]`).classes).toContain(
      "[grid-template-areas:'title'_'title'_'reason'_'.'_'door']",
    );
    expect(one(host, '[data-slot="fit-title"]').classes).toContain("[grid-area:title]");
    expect(one(host, '[data-slot="clear-state-reason"]').classes).toContain("[grid-area:reason]");
    expect(one(host, '[data-slot="door"]').classes).toEqual(
      expect.arrayContaining(["[grid-area:door]", "self-center"]),
    );
  });

  test("the title's rows hold two lines of display at a full panel and three of hero below it", () => {
    const span = ({ cue, title }: { cue: number; title: number }, gap: number) => cue + gap + title;
    const host = clear();
    expect(Math.floor(span(rows(host, FULL, ROWS), 12) / step("display").line)).toBe(2);
    expect(Math.floor(span(rows(host, COMPACT, ROWS), 12) / step("hero").line)).toBe(3);
    expect(Math.floor(span(rows(host, NARROW, ROWS), 8) / step("hero").phone!.line)).toBe(3);
  });

  test("keeps the height of the work that's gone in every band, so the panel's edge stays put when the job clears", () => {
    // The work under the sheet: a then head, three rows, a door and the panel's foot. A phone's rows take two lines.
    const below = { full: 240, compact: 240, phone: 291 };
    const held = (band: (variants: string[]) => boolean) => {
      const found = one(clear(), `[data-slot="${ROWS}"]`).classes.filter((cls) => {
        const { variants, utility } = parts(cls);
        return utility.startsWith("min-h-[") && band(variants);
      });
      expect(found).toHaveLength(1);
      return parseInt(parts(found[0]!).utility.slice("min-h-[".length));
    };
    const work = (band: (variants: string[]) => boolean, gap: number) =>
      Object.values(rows(sheet(), band)).reduce((sum, row) => sum + row, 0) + 4 * gap;
    expect(held(FULL)).toBe(work(FULL, 12) + below.full);
    expect(held(COMPACT)).toBe(work(COMPACT, 12) + below.compact);
    expect(held(NARROW)).toBe(work(NARROW, 8) + below.phone);
  });

  test("the title fits through fit-title from display down, and its lines fill from the first", () => {
    const title = one(clear(), "h1");
    expect(title.el.textContent).toBe("nothing needs you until 16:30.");
    expect(title.el.getAttribute("data-mk")).toBe("fit-title");
    // A server can't measure, so it prints hero, the first step that holds at every width; the browser fits up to display.
    expect(title.el.getAttribute("data-step")).toBe("hero");
    expect(title.classes).toEqual(expect.arrayContaining(["type-hero", "text-first", "text-wrap"]));
    expect(title.classes).not.toContain("text-balance");
    expect(one(clear(<h2 />), "h2").el.getAttribute("data-slot")).toBe("fit-title");
  });

  test("the reason reads like the why, and the door is the onward door", () => {
    const host = clear();
    expect(one(host, '[data-slot="clear-state-reason"]').classes).toEqual(
      expect.arrayContaining(["type-lede", "[@media(max-width:420px)]:type-read"]),
    );
    const door = one(host, '[data-slot="door"]');
    expect(door.el.getAttribute("href")).toBe("/open");
    expect(door.el.getAttribute("data-mk")).toBe("onward");
  });

  test("keeps the system's rules", () => {
    expect(forbidden(elements(clear()))).toEqual([]);
  });
});
