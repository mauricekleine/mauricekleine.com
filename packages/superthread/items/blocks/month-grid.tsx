import { useEffect, useId, useRef, useState } from "react";
import { useRender } from "@base-ui/react/use-render";
import { clockWords, dateWords, monthWords } from "@/components/superthread/lib/time-words";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Skeleton } from "@/components/superthread/ui/skeleton";

// A month at a glance. It always prints six whole weeks from a monday, so stepping the month never moves what sits under
// it. Every date in here is plain, with no clock face, so the grid reads the same on the server and in any zone.

/** A day or a week that holds something, which prints its 4 px dot. Give it `href` or a router link through `render`. */
export type MonthGridEntry = {
  /** A plain date, like `2026-11-02`. A week takes any day in it. */
  date: string;
  /** What the link does, said before its date: `read the brief` reads `read the brief: mon 2 nov`. */
  label?: string;
  /** The one open now, which prints the 2 px bar. */
  selected?: boolean;
  href?: string;
  render?: useRender.ComponentProps<"a">["render"];
};

const DAY_MS = 86_400_000;
const WEEKS = 6;
// A plain date reads the same in every zone, so this spares each cell asking the machine for one.
const PLAIN = { timeZone: "UTC" };

const WEEKDAYS = [
  ["mo", "monday"],
  ["tu", "tuesday"],
  ["we", "wednesday"],
  ["th", "thursday"],
  ["fr", "friday"],
  ["sa", "saturday"],
  ["su", "sunday"],
] as const;

const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;
const plainDate = (day: number) => new Date(day * DAY_MS).toISOString().slice(0, 10);

// getUTCDay counts from sunday
const mondayOf = (day: number) => day - ((new Date(day * DAY_MS).getUTCDay() + 6) % 7);

// A week belongs to the year its thursday falls in, and week 1 holds that year's first thursday.
function weekNumber(monday: number) {
  const thursday = monday + 3;
  const newYear = Date.UTC(new Date(thursday * DAY_MS).getUTCFullYear(), 0, 1) / DAY_MS;
  return Math.floor((thursday - newYear) / 7) + 1;
}

const named = (month: string) => monthWords(`${month}-01`);

function monthBeside(month: string, by: number) {
  const [year = 0, index = 1] = month.split("-").map(Number);
  return new Date(Date.UTC(year, index - 1 + by, 1)).toISOString().slice(0, 7);
}

type Cell = {
  key: string;
  date: string;
  figure: number;
  words: string;
  week: boolean;
  entry?: MonthGridEntry;
  off: boolean;
  today: boolean;
};

const isLinked = ({ entry }: Cell) => entry?.href !== undefined || entry?.render !== undefined;

const isBareArrow = ({ altKey, ctrlKey, key, metaKey, shiftKey }: React.KeyboardEvent) =>
  key.startsWith("Arrow") && !altKey && !ctrlKey && !metaKey && !shiftKey;

function monthRows(month: string, days: MonthGridEntry[], weeks: MonthGridEntry[] | undefined, today?: string) {
  const start = mondayOf(dayNumber(`${month}-01`));
  const dayEntries = new Map(days.map((entry) => [entry.date, entry]));
  const weekEntries = new Map(weeks?.map((entry) => [mondayOf(dayNumber(entry.date)), entry]));
  return Array.from({ length: WEEKS }, (_, row) => {
    const monday = start + row * 7;
    const daysOfWeek = WEEKDAYS.map((_, column): Cell => {
      const date = plainDate(monday + column);
      return {
        key: date,
        date,
        figure: Number(date.slice(8)),
        words: dateWords(date, PLAIN),
        week: false,
        entry: dayEntries.get(date),
        off: !date.startsWith(month),
        today: date === today,
      };
    });
    if (weeks === undefined) return daysOfWeek;
    const date = plainDate(monday);
    const week: Cell = {
      key: `week-${date}`,
      date,
      figure: weekNumber(monday),
      words: `week of ${clockWords(date)}`,
      week: true,
      entry: weekEntries.get(monday),
      off: false,
      today: false,
    };
    return [week, ...daysOfWeek];
  });
}

// Left and right walk every link in reading order, and up and down keep the column, past any line with nothing in it.
function linkFrom(rows: Cell[][], key: string, arrow: string) {
  if (arrow === "ArrowLeft" || arrow === "ArrowRight") {
    const links = rows.flat().filter(isLinked);
    return links[links.findIndex((cell) => cell.key === key) + (arrow === "ArrowLeft" ? -1 : 1)];
  }
  const line = rows.findIndex((cells) => cells.some((cell) => cell.key === key));
  const column = rows[line]?.findIndex((cell) => cell.key === key) ?? -1;
  const by = arrow === "ArrowUp" ? -1 : 1;
  for (let at = line + by; at >= 0 && at < rows.length; at += by) {
    const cell = rows[at]?.[column];
    if (cell && isLinked(cell)) return cell;
  }
  return undefined;
}

const INK = "text-disabled data-[ink=quiet]:text-muted-foreground data-[ink=on]:text-foreground";
// shadcn's tailwind.css narrows data-selected: to data-selected="true", and useRender sets it empty.
const MARK =
  "data-today:shadow-[inset_0_0_0_1px_var(--foreground)] data-[selected]:shadow-[inset_0_-2px_0_var(--foreground)] data-today:data-[selected]:shadow-[inset_0_0_0_1px_var(--foreground),inset_0_-2px_0_var(--foreground)]";
const CELL = cn(
  "relative grid h-[34px] w-full place-items-center pb-[5px] font-mono text-instrument leading-none transition-[background-color] duration-(--duration-instant) ease-(--ease-brand) [&:is(a,button)]:hover:bg-control-hover [&:is(a,button)]:active:bg-control-press focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:600px)]:h-11",
  INK,
  MARK,
);

// The dot is the day's content, in the figure's ink. A day with no link has only its aria label to say so. Today keeps
// aria-current for the date, so the words carry a selected day that is also today.
function MonthGridCell({ cell, stop, loading }: { cell: Cell; stop: boolean; loading: boolean }) {
  const { entry, figure, key, off, today, week, words } = cell;
  const linked = isLinked(cell);
  const said = entry?.label ? `${entry.label}: ${words}` : words;
  const content = entry !== undefined;
  return useRender({
    defaultTagName: "span",
    render: entry?.render ?? (entry?.href !== undefined ? <a /> : undefined),
    state: {
      slot: week ? "month-grid-week" : "month-grid-day",
      ink: today || (content && !off) ? "on" : content || !off ? "quiet" : undefined,
      today,
      selected: entry?.selected,
    },
    props: {
      href: entry?.href,
      role: content && !linked ? "img" : undefined,
      tabIndex: linked ? (stop ? 0 : -1) : undefined,
      "aria-label": content ? (today && entry.selected ? `${said}, selected` : said) : undefined,
      "aria-current": today ? "date" : entry?.selected ? "true" : undefined,
      "data-cell": linked ? key : undefined,
      className: CELL,
      children: (
        <>
          {figure}
          {content && <span aria-hidden="true" className="absolute bottom-[5px] left-1/2 -ml-0.5 size-1 bg-current" />}
          {loading && !content && <Skeleton className="absolute bottom-[5px] left-1/2 -ml-1.5 h-1 w-3" />}
        </>
      ),
    },
  });
}

// 32 px of head beside a reader's 28 px date line, so in a rail it lifts 2 px and the two read level.
const MONTH_HEAD =
  "flex h-8 items-center justify-between gap-2 in-data-[slot=reader-rail]:-mt-0.5 [@media(max-width:600px)]:h-11";
const HEAD = "h-7 p-0 text-center type-instrument font-normal text-muted-foreground";
// The rule draws over the column's edge, so it takes no width from the cells beside it and a week's fill leaves it whole.
const WEEK_COLUMN = "relative after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border";
// With the week column eight cells share a phone's panel, so the grid hangs 9 px into each side. That makes each 44 px
// wide at 390 px; a narrower phone gives up width, never the 44 px of height, and the cells never overlap.
const WEEKS_HANG =
  "[@media(max-width:600px)]:in-data-[slot=app-shell-panel]:-mx-[9px] [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:w-[calc(100%+18px)] [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:max-w-none";
const STEP =
  "data-disabled:cursor-default data-disabled:text-disabled data-disabled:hover:bg-transparent data-disabled:active:bg-transparent [@media(max-width:600px)]:size-11";

/**
 * The month as six weeks, monday first. `month` is a plain month, like `2026-11`, and `today` a plain date, from
 * `useMinute`'s `day`. Give it an `aria-label` that says what the month holds. `days` print a dot and link where they say,
 * and `weeks`, even an empty list, print the week column. `onMonthChange` prints the two steps, which `min` and `max`
 * bound, as plain months. `loading` says the days aren't read yet, so a month holding nothing reads as nothing only once
 * they are. Set it in the render that changes `month`, so focus waits for the days.
 */
function MonthGrid({
  className,
  days = [],
  loading = false,
  max,
  min,
  month,
  onMonthChange,
  today,
  weeks,
  ...props
}: React.ComponentProps<"section"> & {
  month: string;
  today?: string;
  days?: MonthGridEntry[];
  weeks?: MonthGridEntry[];
  loading?: boolean;
  min?: string;
  max?: string;
  onMonthChange?: (month: string) => void;
}) {
  const nameId = useId();
  const table = useRef<HTMLTableElement>(null);
  const backStep = useRef<HTMLButtonElement>(null);
  const onStep = useRef<HTMLButtonElement>(null);
  // Where the keys were when they ran off the edge, so the walk carries on from that date in the month that opens.
  const turning = useRef<{ to: string; from: string; back: boolean } | null>(null);
  const [focused, setFocused] = useState<string>();

  const rows = monthRows(month, days, weeks, today);
  const links = rows.flat().filter(isLinked);
  // One tab stop for the whole grid: where the keys left it, or else the open day, today, then the first link.
  const stop = (
    links.find((cell) => cell.key === focused) ??
    links.find((cell) => cell.entry?.selected) ??
    links.find((cell) => cell.today) ??
    links[0]
  )?.key;

  const earlier = monthBeside(month, -1);
  const later = monthBeside(month, 1);
  const canGoBack = min === undefined || earlier >= min;
  const canGoOn = max === undefined || later <= max;

  const focusCell = (key: string) => table.current?.querySelector<HTMLElement>(`[data-cell="${key}"]`)?.focus();

  // Every render, because a month's days can arrive after the month: until then focus waits on the step it was heading
  // for. If the reader has left the grid by the time the days land, focus stays with them.
  useEffect(() => {
    const turn = turning.current;
    if (turn?.to !== month) return;
    const page = table.current?.ownerDocument;
    const active = page?.activeElement;
    const lost = !active || active === page?.body;
    if (!lost && !table.current?.closest(`[data-slot="month-grid"]`)?.contains(active)) {
      turning.current = null;
      return;
    }
    const heading = (turn.back ? backStep : onStep).current;
    if (loading) {
      if (lost) heading?.focus();
      return;
    }
    turning.current = null;
    const closed = turn.back ? !canGoBack : !canGoOn;
    const next = turn.back
      ? (links.filter((cell) => cell.date < turn.from).at(-1) ?? (closed ? links[0] : undefined))
      : (links.find((cell) => cell.date > turn.from) ?? (closed ? links.at(-1) : undefined));
    if (next) focusCell(next.key);
    else heading?.focus();
  });

  function step(target: string) {
    turning.current = null;
    onMonthChange?.(target);
  }

  function turn(from: string, back: boolean) {
    if (!onMonthChange || !(back ? canGoBack : canGoOn)) return;
    const to = back ? earlier : later;
    turning.current = { to, from, back };
    onMonthChange(to);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTableElement>) {
    if (!isBareArrow(event)) return;
    const key = (event.target as Element).closest("[data-cell]")?.getAttribute("data-cell");
    if (!key) return;
    event.preventDefault();
    const next = linkFrom(rows, key, event.key);
    if (next) focusCell(next.key);
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      turn(links.find((cell) => cell.key === key)?.date ?? `${month}-01`, event.key === "ArrowLeft");
    }
  }

  // A step answers left and right as the links do, from the edge of its month, so a walk that lands on one keeps going and
  // a month with no links still turns by key. Up and down stay the page's.
  function onStepKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isBareArrow(event) || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") turn(`${month}-01`, true);
    else turn(plainDate(dayNumber(`${later}-01`) - 1), false);
  }

  return (
    <section data-mk="month-grid" data-slot="month-grid" className={cn("min-w-0", className)} {...props}>
      <div data-slot="month-grid-head" className={MONTH_HEAD}>
        <p id={nameId} aria-live="polite" className="min-w-0 type-ui font-medium text-foreground">
          {named(month)}
        </p>
        {onMonthChange && (
          <div className="flex shrink-0" onKeyDown={onStepKeyDown}>
            <Button
              ref={backStep}
              aria-label={`show ${named(earlier)}`}
              className={STEP}
              data-slot="month-grid-step"
              disabled={!canGoBack}
              focusableWhenDisabled
              onClick={() => step(earlier)}
              size="icon-sm"
              variant="ghost"
            >
              <Icon name="left" />
            </Button>
            <Button
              ref={onStep}
              aria-label={`show ${named(later)}`}
              className={STEP}
              data-slot="month-grid-step"
              disabled={!canGoOn}
              focusableWhenDisabled
              onClick={() => step(later)}
              size="icon-sm"
              variant="ghost"
            >
              <Icon name="arrow" />
            </Button>
          </div>
        )}
      </div>
      <table
        ref={table}
        data-slot="month-grid-table"
        aria-busy={loading || undefined}
        aria-labelledby={nameId}
        className={cn("mt-2 w-full table-fixed border-collapse", weeks && WEEKS_HANG)}
        onFocus={(event) =>
          setFocused((event.target as Element).closest("[data-cell]")?.getAttribute("data-cell") ?? undefined)
        }
        onKeyDown={onKeyDown}
        role={links.length > 0 ? "grid" : undefined}
      >
        <thead>
          <tr>
            {weeks && (
              <th aria-label="week" className={cn(HEAD, WEEK_COLUMN)} scope="col">
                wk
              </th>
            )}
            {WEEKDAYS.map(([short, name]) => (
              <th key={short} aria-label={name} className={HEAD} scope="col">
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells) => (
            <tr key={cells[0]?.key}>
              {cells.map((cell) =>
                cell.week ? (
                  <th key={cell.key} className={cn("p-0 font-normal", WEEK_COLUMN)} scope="row">
                    <MonthGridCell cell={cell} loading={false} stop={cell.key === stop} />
                  </th>
                ) : (
                  <td key={cell.key} className="p-0">
                    <MonthGridCell cell={cell} loading={loading} stop={cell.key === stop} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export { MonthGrid };
