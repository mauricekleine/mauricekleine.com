// Time in the fleet's words: "since friday", "before 11:00", "48 min until standup", "every day at 07:00". Every
// function is pure. Each moment comes in as an argument, so nothing here reads a clock, and the words never judge how
// long something took.
//
// A moment is a Date or a date string. A plain "2026-10-30" is a calendar date, the same day in every zone. timeZone
// names the reader's zone and defaults to the machine's, so a server rendering for a reader in another zone passes it.

export type Moment = Date | string;
export type Weekday = (typeof WEEK)[number];
export type TimeOptions = { timeZone?: string };

// What repeats, in plain terms. An app turns its own schedule format into this, so no format reaches the words.
export type Schedule = { timeZone?: string } & (
  { every: "hour" } | { every: "day" | "weekday" | Weekday | readonly Weekday[]; at: string }
);

const WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const DAY_MS = 86_400_000;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const readerZone = (options?: TimeOptions) => options?.timeZone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;

// The calendar day a moment falls on in the zone, as whole days since the epoch.
function dayOf(moment: Moment, timeZone: string) {
  const date = typeof moment === "string" ? CALENDAR_DATE.exec(moment) : null;
  if (date) return Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3])) / DAY_MS;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date(moment))
    .reduce<Record<string, number>>((all, { type, value }) => ({ ...all, [type]: Number(value) }), {});
  return Date.UTC(parts.year!, parts.month! - 1, parts.day!) / DAY_MS;
}

/** "today", "since yesterday", "since friday" within a week, then "since 9 oct", with the year once it differs. */
export function sinceWords(from: Moment, now: Moment, options?: TimeOptions) {
  const timeZone = readerZone(options);
  const start = dayOf(from, timeZone);
  const today = dayOf(now, timeZone);
  const days = today - start;
  if (days <= 0) return "today";
  if (days === 1) return "since yesterday";
  const date = new Date(start * DAY_MS);
  // getUTCDay counts from sunday, WEEK from monday
  if (days < 7) return `since ${WEEK[(date.getUTCDay() + 6) % 7]}`;
  const sameYear = date.getUTCFullYear() === new Date(today * DAY_MS).getUTCFullYear();
  return `since ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}${sameYear ? "" : ` ${date.getUTCFullYear()}`}`;
}

/** "before 11:00", on the 24-hour clock. */
export function beforeWords(at: Moment, options?: TimeOptions) {
  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: readerZone(options),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `before ${clock.format(new Date(at))}`;
}

/**
 * "48 min until standup", "1 h 20 until standup", "2 h until standup", and "standup now" once the moment arrives. A
 * part minute rounds up, so the words match the difference between the two clock faces.
 */
export function untilWords(at: Moment, what: string, now: Moment) {
  const minutes = Math.ceil((new Date(at).getTime() - new Date(now).getTime()) / 60_000);
  if (minutes <= 0) return `${what} now`;
  if (minutes < 60) return `${minutes} min until ${what}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h${rest ? ` ${rest}` : ""} until ${what}`;
}

const dayWords = (every: Exclude<Schedule["every"], "hour">) => {
  if (typeof every === "string") return every;
  const days = WEEK.filter((day) => every.includes(day));
  return days.length > 1 ? `${days.slice(0, -1).join(", ")} and ${days.at(-1)}` : days.join("");
};

const zoneWords = (timeZone: string) => timeZone.split("/").at(-1)!.replaceAll("_", " ").toLowerCase();

/**
 * "every day at 07:00", "every monday and thursday at 07:15", "every hour". A schedule set in another zone than the
 * reader's says so: "every day at 07:00, amsterdam time".
 */
export function scheduleWords(schedule: Schedule, options?: TimeOptions) {
  const when = schedule.every === "hour" ? "every hour" : `every ${dayWords(schedule.every)} at ${schedule.at}`;
  const elsewhere = schedule.timeZone && schedule.timeZone !== readerZone(options);
  return elsewhere ? `${when}, ${zoneWords(schedule.timeZone!)} time` : when;
}
