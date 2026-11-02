import { useMemo, useSyncExternalStore } from "react";
import { calendarDate, type TimeOptions } from "@/components/superthread/lib/time-words";

const MINUTE_MS = 60_000;

// One timer for the whole page, set to the clock's next whole minute, so every caller turns over together and midnight
// is an ordinary tick. A hidden page holds no timer and catches up the moment it shows again.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function arm() {
  clearTimeout(timer);
  if (document.hidden || listeners.size === 0) return;
  timer = setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS));
}

function tick() {
  for (const listener of listeners) listener();
  arm();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) document.addEventListener("visibilitychange", tick);
  listeners.add(listener);
  arm();
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    document.removeEventListener("visibilitychange", tick);
    arm();
  };
}

const currentMinute = () => Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
const noClock = () => null;

/**
 * The clock's current minute and the calendar date it falls on in the reader's zone. Null until the page hydrates,
 * because a prerendered page has no clock. Rereads keyed on `day` are the midnight rollover.
 */
export function useMinute(options?: TimeOptions) {
  const minute = useSyncExternalStore(subscribe, currentMinute, noClock);
  const timeZone = options?.timeZone;
  return useMemo(() => {
    if (minute === null) return null;
    const now = new Date(minute);
    return { now, day: calendarDate(now, { timeZone }) };
  }, [minute, timeZone]);
}
