import type { CSSProperties, ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  calendarDate,
  clockWords,
  isCalendarDate,
  type Moment,
  type TimeOptions,
} from "@/components/superthread/lib/time-words";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Skeleton } from "@/components/superthread/ui/skeleton";

// A day at true scale: the date and its ways on, the names over the blocks, ticks and a now mark. On a timeline solid
// means an event and nothing else, so nothing marks the time gone by. A block carries its whole meaning in its aria
// label, and the names above it are decoration for the eye.

/** One thing on the calendar. A plain-date start or end is an all-day event, which prints in DayLineAllDay, not here. */
export type DayLineEvent = {
  id: string;
  title: string;
  start: Moment;
  end: Moment;
  tentative?: boolean;
  /** Read from a source that isn't answering, so the time may have moved. */
  stale?: boolean;
  selected?: boolean;
  /** A brief is ready. A block with room prints the word, and a narrow one or a phone the glyph. */
  brief?: boolean;
  /** What else the block should say to a screen reader: `the brief failed`. */
  note?: string;
  href?: string;
  render?: useRender.ComponentProps<"a">["render"];
};

const MINUTES_IN_DAY = 24 * 60;
const SCALE_START = 8 * 60;
const SCALE_END = 18 * 60;
const DAY_MS = 86_400_000;

// What a name takes up across a 784 px strip, in percent. An estimate, so the server and the browser agree without
// measuring: a miss truncates a name, and never moves one.
const TITLE_CHAR = 0.83;
const TIME_CHAR = 1;
const NAME_GAP = 1.5;
// What a name keeps against a long name sliding back behind it: about 14 characters.
const NAME_FLOOR = 12;

const percent = (value: number) => Math.round(value * 100) / 100;
const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;

// Where a moment falls on the timeline. The wall clock places a block on the strip, but it runs back in the hour a clock
// repeats, so only this says which of two moments came first.
const instant = (moment: Moment) => new Date(moment).getTime();

// Wall-clock minutes from the start of the day, past 1440 or below 0 for a moment on another day.
function minutesInto(day: string, at: Moment, options: TimeOptions) {
  const [hours = 0, minutes = 0] = clockWords(at, options).split(":").map(Number);
  return (dayNumber(calendarDate(at, options)) - dayNumber(day)) * MINUTES_IN_DAY + hours * 60 + minutes;
}

type Placed = {
  event: DayLineEvent;
  start: number;
  end: number;
  startsAt: number;
  endsAt: number;
  lane: number;
  lanes: number;
  group: Placed[];
  past: boolean;
  started: boolean;
  seam?: "left" | "top";
};

type Name = {
  id: string;
  title: string;
  time: string;
  tentative: boolean;
  at: number;
  right: number;
  event?: DayLineEvent;
  past: boolean;
  next: boolean;
};

// Blocks that overlap share the track's height in lanes, earlier on top. Blocks that only touch stay whole.
function sortIntoLanes(group: Placed[]) {
  const laneEnds: number[] = [];
  for (const item of group) {
    const free = laneEnds.findIndex((end) => end <= item.start);
    item.lane = free < 0 ? laneEnds.length : free;
    laneEnds[item.lane] = item.end;
    item.group = group;
    item.seam = item.lane > 0 ? "top" : undefined;
  }
  for (const item of group) item.lanes = laneEnds.length;
}

function layOut(day: string, events: DayLineEvent[], now: Moment | null | undefined, options: TimeOptions) {
  // What has gone by reads from the moment itself, so a whole day reads as spent or unspent, a meeting that runs past
  // midnight stays underway and the repeated hour stays in order. The mark prints only on its own day, by the clock.
  const moment = now === null || now === undefined || isCalendarDate(now) ? null : now;
  const current = moment === null ? null : instant(moment);
  const clock = moment === null ? null : minutesInto(day, moment, options);
  const at = clock !== null && clock >= 0 && clock < MINUTES_IN_DAY ? clock : null;

  const placed = events
    .flatMap((event): Placed[] => {
      if (isCalendarDate(event.start) || isCalendarDate(event.end)) return [];
      const from = minutesInto(day, event.start, options);
      const until = minutesInto(day, event.end, options);
      if (from >= MINUTES_IN_DAY || (until <= 0 && from !== 0)) return [];
      const start = Math.max(from, 0);
      const end = Math.max(start, Math.min(until, MINUTES_IN_DAY));
      const startsAt = instant(event.start);
      const endsAt = instant(event.end);
      return [
        {
          event,
          start,
          end,
          startsAt,
          endsAt,
          lane: 0,
          lanes: 1,
          group: [],
          past: current !== null && endsAt <= current,
          started: current !== null && startsAt <= current && current < endsAt,
        },
      ];
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  let group: Placed[] = [];
  let groupEnd = -1;
  for (const item of placed) {
    if (item.start >= groupEnd) {
      sortIntoLanes(group);
      group = [];
    }
    group.push(item);
    groupEnd = Math.max(groupEnd, item.end);
  }
  sortIntoLanes(group);

  placed.forEach((item, index) => {
    const before = placed[index - 1];
    if (before && item.lanes === 1 && before.lanes === 1 && before.end === item.start) item.seam = "left";
  });

  // The scale holds the working day and widens to whole hours for the first start and the last end. It never widens for
  // now, so nothing moves as the day goes by.
  const from = Math.min(SCALE_START, Math.floor(Math.min(...placed.map((item) => item.start)) / 60) * 60);
  const to = Math.max(SCALE_END, Math.ceil(Math.max(...placed.map((item) => item.end)) / 60) * 60);
  const position = (minutes: number) => percent(((minutes - from) / (to - from)) * 100);

  const upcoming = placed.filter((item) => current === null || item.startsAt > current);
  const nextItem =
    placed.find((item) => item.event.selected) ??
    placed.find((item) => item.started) ??
    upcoming.sort((a, b) => a.startsAt - b.startsAt)[0];

  const names = placed.flatMap((item): Name[] => {
    if (item.group[0] !== item) return [];
    const single = item.lanes === 1;
    return [
      {
        id: item.event.id,
        title: item.group.map((member) => member.event.title).join(", "),
        time: item.group.map((member) => clockWords(member.event.start, options)).join(", "),
        tentative: single && item.event.tentative === true,
        at: position(item.start),
        right: position(Math.max(...item.group.map((member) => member.end))),
        event: single ? item.event : undefined,
        past: item.group.every((member) => member.past),
        next: nextItem !== undefined && item.group.includes(nextItem),
      },
    ];
  });

  return { at, from, to, placed, names, position };
}

const TENTATIVE = " · tentative";
const nameWidth = ({ title, time, tentative }: Name) =>
  Math.max(title.length * TITLE_CHAR, (time.length + (tentative ? TENTATIVE.length : 0)) * TIME_CHAR);
const namePosition = (name: Name) => Math.min(name.at, 100 - nameWidth(name));

// Two names that wouldn't fit side by side move the band to two staggered rows, and each name truncates at the next one
// in its row. Only the last name in a row can slide, since the rest stop at the next. It stops short of the name before
// it, which keeps its words up to the floor, and truncates in what's left, so a crowded strip never loses a name to it.
// A name alone in its row has the whole strip to slide in.
function fitNames(names: Name[]) {
  const crowded = names.some((name, index) => {
    const next = names[index + 1];
    return next !== undefined && namePosition(name) + nameWidth(name) + NAME_GAP > namePosition(next);
  });
  const step = crowded ? 2 : 1;
  const startOf = (index: number) => {
    const name = names[index]!;
    const before = names[index - step];
    if (names[index + step] !== undefined || before === undefined) return name.at;
    const clear = before.at + Math.min(nameWidth(before) + NAME_GAP, NAME_FLOOR);
    return Math.min(name.at, Math.max(namePosition(name), clear));
  };
  const fitted = names.map((name, index) => {
    const next = names[index + step] && startOf(index + step);
    const alone = next === undefined && names[index - step] === undefined;
    const room =
      next !== undefined
        ? `calc(${percent(next - name.at)}% - 8px)`
        : alone
          ? "100%"
          : `${percent(100 - startOf(index))}%`;
    return { name, room, low: crowded && index % 2 === 1 };
  });
  return { crowded, fitted };
}

function blockWords({ event, past, started, group, startsAt, endsAt }: Placed, options: TimeOptions) {
  const until = clockWords(event.end, options);
  const overlaps = group.filter((other) => other.event !== event && other.startsAt < endsAt && startsAt < other.endsAt);
  return [
    event.title,
    started ? `happening now, until ${until}` : `${clockWords(event.start, options)} to ${until}`,
    event.tentative && "tentative",
    overlaps.length > 0 && `overlaps ${overlaps.map((other) => other.event.title).join(", ")}`,
    past && "over",
    event.selected ? (event.brief ? "brief open" : "selected") : event.brief && "brief ready",
    event.note ?? (event.stale && "may be behind"),
  ]
    .filter(Boolean)
    .join(", ");
}

// A block is the one solid thing on the strip. Its ink lives in --ink, so a form and a state set one value each and a
// link's hover raises it. The seam on a block that touches the one before is a clear edge, so it shows any surface.
const BLOCK =
  "group/block @container/block relative block size-full min-w-0.5 overflow-hidden border-0 border-transparent bg-(--ink) bg-clip-padding text-background transition-[background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) [--ink:var(--muted-foreground)] data-[ink=past]:[--ink:var(--disabled)] data-[ink=selected]:[--ink:var(--first)] data-[seam=left]:border-l data-[seam=top]:border-t data-[form=outline]:border data-[form=outline]:border-(--ink) data-[form=outline]:bg-transparent data-[form=outline]:text-foreground data-[form=dotted]:border data-[form=dotted]:border-dotted data-[form=dotted]:border-(--ink) data-[form=dotted]:bg-transparent data-[form=dotted]:text-(--ink) [&:is(a)]:data-[ink=rest]:hover:[--ink:var(--foreground)] [&:is(a)]:data-[ink=past]:hover:[--ink:var(--muted-foreground)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:600px)]:pointer-events-none";

// A brief prints on a block still to come or underway, with the track to itself: a meeting that has started is when its
// brief is read. The block's own width picks the word or the glyph, and a phone always takes the glyph. Either sits on
// the block's own face above the now mark, so the mark passes behind it and never through it. An outline or a dotted
// block has no face of its own, so there the brief takes the fill of the surface it sits on.
function DayLineBlock({ item, options }: { item: Placed; options: TimeOptions }) {
  const { event, past, lanes, seam } = item;
  const linked = event.render !== undefined || event.href !== undefined;
  const marked = event.brief && !past && lanes === 1;
  return useRender({
    defaultTagName: "span",
    render: event.render ?? (event.href !== undefined ? <a /> : undefined),
    state: {
      slot: "day-line-block",
      ink: event.selected ? "selected" : past ? "past" : "rest",
      form: event.tentative ? "outline" : event.stale ? "dotted" : "solid",
      seam,
    },
    props: {
      href: event.href,
      role: linked ? undefined : "img",
      "aria-label": blockWords(item, options),
      "aria-current": event.selected ? "true" : undefined,
      className: BLOCK,
      children: marked ? (
        <span aria-hidden="true" className="flex h-full items-center justify-center type-instrument">
          <span
            data-slot="day-line-brief"
            className="relative z-1 flex items-center bg-(--ink) px-1 transition-[background-color] duration-(--duration-instant) ease-(--ease-brand) group-data-[form=dotted]/block:bg-(--surface,var(--background)) group-data-[form=outline]/block:bg-(--surface,var(--background))"
          >
            <span className="hidden [@media(min-width:601px)]:@min-[36px]/block:inline">brief</span>
            <Icon
              name="brief"
              className="hidden @min-[14px]/block:block [@media(min-width:601px)]:@min-[36px]/block:hidden"
            />
          </span>
        </span>
      ) : undefined,
    },
  });
}

// A name's link is a second way to the same place for the pointer, so it stays out of the tab order, under aria-hidden.
// On a crowded strip the clock goes and tentative stays, on the title's line, because a bare outline can't say it alone.
// The two share that line's room, so neither loses all of it.
function DayLineName({ name }: { name: Name }) {
  const { event, title, time, tentative, past } = name;
  const linked = event?.render !== undefined || event?.href !== undefined;
  return useRender({
    defaultTagName: "span",
    render: event?.render ?? (event?.href !== undefined ? <a /> : undefined),
    state: { slot: "day-line-name", past },
    props: {
      href: event?.href,
      tabIndex: linked ? -1 : undefined,
      className:
        "pointer-events-auto grid max-w-(--room) min-w-0 overflow-hidden whitespace-nowrap text-foreground data-past:text-muted-foreground @max-[560px]/day-line:flex @max-[560px]/day-line:max-w-full @max-[560px]/day-line:gap-2 @min-[561px]/day-line:group-data-crowded/names:flex [@media(max-width:600px)]:pointer-events-none",
      children: (
        <>
          <span className="min-w-0 truncate decoration-1 underline-offset-4 [a:hover>&]:underline">{title}</span>
          <span className="shrink-0 font-mono text-muted-foreground @min-[561px]/day-line:group-data-crowded/names:shrink @min-[561px]/day-line:group-data-crowded/names:truncate">
            <span className="@min-[561px]/day-line:group-data-crowded/names:hidden">
              {time}
              {tentative && " · "}
            </span>
            {tentative && <span className="@min-[561px]/day-line:group-data-crowded/names:ml-2">tentative</span>}
          </span>
        </>
      ),
    },
  });
}

// Each name sits past a spacer as wide as its block's left edge. The spacer gives way first, so a name near the end of
// the day slides back rather than leaving the strip. On a narrow strip one name prints, in one line: the selected
// meeting's, or else the next one's. Past the middle of the day it ends at its block's right edge.
function Names({ names }: { names: Name[] }) {
  const { crowded, fitted } = fitNames(names);
  return (
    <div aria-hidden="true" data-crowded={crowded || undefined} className="group/names absolute inset-0">
      {fitted.map(({ name, room, low }) => (
        <div
          key={name.id}
          data-low={low || undefined}
          data-next={name.next || undefined}
          className="pointer-events-none absolute inset-x-0 top-0 flex before:block before:[flex:0_100000_var(--at)] before:content-[''] data-low:top-5 @max-[560px]/day-line:hidden @max-[560px]/day-line:pr-(--tail) @max-[560px]/day-line:data-low:top-0 @max-[560px]/day-line:data-next:flex"
          style={
            {
              "--at": `${name.at}%`,
              "--room": room,
              "--tail": `${name.right > 50 ? percent(100 - name.right) : 0}%`,
            } as CSSProperties
          }
        >
          <DayLineName name={name} />
        </div>
      ))}
    </div>
  );
}

/**
 * The strip: names, track, ticks and the now mark. `day` is a plain date, like `2026-11-03`, and `timeZone` the zone it
 * reads in. Give it an `aria-label` that names the day. Without `now`, nothing reads as gone by and no mark prints, and
 * the mark prints only on its own day: a day gone by reads as spent, and a day to come as unspent.
 * `children` print in the names' place when the day holds no timed event, such as `nothing fixed today`. A read that
 * failed leaves them out and says why in DayLineFoot, so a failed read never reads as an empty day. A read that may be
 * behind prints its blocks dotted, and DayLineFoot says why and when it was last good. `loading` holds the shape until
 * the first read. `asOf` prints when a stale read was last good beside the now time, on the side away from it, for a
 * strip with no DayLineFoot under it; a day line with a foot says it there, so the time prints once.
 */
function DayLineStrip({
  asOf,
  children,
  className,
  day,
  events,
  loading = false,
  now,
  style,
  timeZone,
  ...props
}: React.ComponentProps<"section"> & {
  day: string;
  events: DayLineEvent[];
  now?: Moment | null;
  timeZone?: string;
  loading?: boolean;
  asOf?: ReactNode;
}) {
  const options = { timeZone };
  const { at, from, to, placed, names, position } = layOut(day, events, now, options);
  const empty = placed.length === 0;
  const waiting = empty && loading;
  const nowAt = at === null ? null : position(Math.min(Math.max(at, from), to));
  const hours = Array.from({ length: (to - from) / 60 + 1 }, (_, hour) => hour * 60 + from);
  return (
    <section
      data-mk="day-line"
      data-slot="day-line-strip"
      aria-busy={waiting || undefined}
      className={cn("@container/day-line min-w-0", className)}
      style={nowAt === null ? style : ({ ...style, "--now": `${nowAt}%` } as CSSProperties)}
      {...props}
    >
      <div data-slot="day-line-band" className="relative h-10 type-instrument @max-[560px]/day-line:h-5">
        {waiting ? (
          <div role="status" aria-label="loading" className="flex gap-6 overflow-hidden">
            <Skeleton className="w-24 shrink-0" />
            <Skeleton className="w-32 shrink-0" />
            <Skeleton className="w-20 shrink-0" />
          </div>
        ) : empty ? (
          <div data-slot="day-line-message" className="flex items-baseline gap-2 text-foreground">
            {children}
          </div>
        ) : (
          <Names names={names} />
        )}
      </div>
      <div
        data-slot="day-line-track"
        className="relative isolate mt-1 h-[29px] border-b border-rule @max-[560px]/day-line:h-[25px]"
      >
        <ol className="absolute inset-0 list-none">
          {placed.map((item) => (
            <li
              key={item.event.id}
              className="absolute"
              style={{
                left: `${position(item.start)}%`,
                width: `${percent(position(item.end) - position(item.start))}%`,
                top: `${percent((item.lane / item.lanes) * 100)}%`,
                height: `${percent(100 / item.lanes)}%`,
              }}
            >
              <DayLineBlock item={item} options={options} />
            </li>
          ))}
        </ol>
        <div aria-hidden="true">
          {hours.map((hour) => (
            <span
              key={hour}
              data-slot="day-line-tick"
              className="absolute top-full mt-px h-1 w-px bg-rule"
              style={{ left: `calc((100% - 1px) * ${percent((hour - from) / (to - from))})` }}
            />
          ))}
          {nowAt !== null && (
            <span
              data-slot="day-line-now-mark"
              className="pointer-events-none absolute top-0 -bottom-[5px] -ml-px w-0.5 bg-first outline-1 outline-(--surface,var(--background))"
              style={{ left: "clamp(1px, var(--now), calc(100% - 1px))" }}
            />
          )}
        </div>
      </div>
      <div data-slot="day-line-clock" className="relative h-5 type-instrument leading-[15px]">
        {nowAt !== null && now !== null && now !== undefined && (
          <p
            data-slot="day-line-now"
            className="absolute top-[5px] -translate-x-1/2 font-mono whitespace-nowrap text-first"
            style={{ left: "clamp(2.5ch, var(--now), calc(100% - 2.5ch))" }}
          >
            <span className="sr-only">now </span>
            <time dateTime={new Date(now).toISOString()}>{clockWords(now, options)}</time>
          </p>
        )}
        {asOf !== undefined && (
          <p
            data-slot="day-line-as-of"
            className="absolute top-[5px] truncate text-muted-foreground"
            style={
              nowAt !== null && nowAt > 50
                ? { left: 0, maxWidth: "calc(var(--now) - 32px)" }
                : { right: 0, maxWidth: nowAt === null ? "100%" : "calc(100% - var(--now) - 32px)" }
            }
          >
            {asOf}
          </p>
        )}
      </div>
    </section>
  );
}

// The date, a calendar note, the ways to the next day and the all-day line. The date and the note share a baseline on a
// wide screen. The all-day line hangs below the date, in the gap before the strip, so it never moves the strip, and on a
// phone the note joins it there. The note keeps its whole width there and the all-day words truncate first.
function DayLineHead({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-mk="day-line"
      data-slot="day-line-head"
      className={cn(
        "grid h-6 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[24px_0] items-baseline gap-x-4 [grid-template-areas:'date_note_steps'_'all_all_all'] [@media(max-width:600px)]:grid-cols-[0_minmax(0,1fr)_auto] [@media(max-width:600px)]:gap-x-0 [@media(max-width:600px)]:[grid-template-areas:'date_date_steps'_'all_note_note'] [@media(max-width:600px)]:has-data-[slot=day-line-all-day]:grid-cols-[minmax(0,1fr)_auto_auto]",
        className,
      )}
      {...props}
    />
  );
}

// Plain words, a link once it leads somewhere, or a button once it opens the day in place. Either way on a phone it takes
// its 44 px through a hit area, because there the date is the way into the day. aria-expanded holds the underline while
// what it opened stays open. Render an h1 when the date is the page's title.
function DayLineDate({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "day-line-date" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "relative justify-self-start type-subtitle whitespace-nowrap text-foreground [grid-area:date] decoration-1 underline-offset-4 aria-expanded:underline [&:is(a,button)]:hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:600px)]:[&:is(a,button)]:hit-area",
          className,
        ),
      },
      props,
    ),
  });
}

// A calendar's own note, such as `times in new york`. A fault goes in DayLineFoot. On a phone the note drops under the
// date, out of the date's target.
function DayLineNote({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="day-line-note"
      className={cn(
        "min-w-0 truncate type-instrument text-muted-foreground [grid-area:note] [@media(max-width:600px)]:pointer-events-none [@media(max-width:600px)]:h-[15px] [@media(max-width:600px)]:leading-[15px]",
        className,
      )}
      {...props}
    />
  );
}

// What fills the day and has no time. It prints `all day: ` before the words it holds.
function DayLineAllDay({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="day-line-all-day"
      className={cn(
        "h-[15px] min-w-0 truncate type-instrument leading-[15px] text-muted-foreground [grid-area:all] [@media(max-width:600px)]:pointer-events-none [@media(max-width:600px)]:pr-2",
        className,
      )}
      {...props}
    >
      all day: {children}
    </p>
  );
}

// The ways to the day before and after, usually `Onward` links.
function DayLineSteps({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="day-line-steps"
      className={cn("flex items-baseline gap-6 [grid-area:steps]", className)}
      {...props}
    />
  );
}

// The one home for why the day can't be trusted and when it was last good, with the one way to fix it: `outlook isn't
// answering · as of 08:10` and `try again`, whichever calendar failed and whether or not the strip has blocks. Render
// it always: it holds its 24 px while it's empty, so a fault comes and goes without moving a thing, and a screen reader
// hears its words arrive. The words truncate first, so the action keeps its whole word.
function DayLineFoot({
  action,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** The one action, a DayLineAction: `try again`. */
  action?: ReactNode;
}) {
  return (
    <div
      data-mk="day-line"
      data-slot="day-line-foot"
      className={cn("flex h-6 min-w-0 items-center justify-end gap-2 type-instrument text-muted-foreground", className)}
      {...props}
    >
      <p role="status" className="min-w-0 truncate">
        {children}
      </p>
      {action}
    </div>
  );
}

// The foot's one action: a foreground word that underlines on hover, as a link in chrome does, beside the muted words.
// On a phone it takes 44 px through its hit area.
function DayLineAction(props: Omit<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return <Button data-slot="day-line-action" variant="link" size="xs" {...props} />;
}

// The head and the strip, 16 px apart, and the foot right under the strip.
function DayLine({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-mk="day-line"
      data-slot="day-line"
      className={cn("grid min-w-0 gap-4 [&>[data-slot=day-line-strip]+[data-slot=day-line-foot]]:-mt-4", className)}
      {...props}
    />
  );
}

export {
  DayLine,
  DayLineAction,
  DayLineAllDay,
  DayLineDate,
  DayLineFoot,
  DayLineHead,
  DayLineNote,
  DayLineSteps,
  DayLineStrip,
};
