// The minute hook, on a fake clock: what a caller reads, when it turns over, and how many timers a page holds.
import { afterEach, beforeEach, describe, expect, jest, setSystemTime, test } from "bun:test";
import { act } from "react";
import { useMinute } from "@/components/superthread/hooks/use-minute";
import { client, server } from "./rendered.tsx";

const amsterdam = "Europe/Amsterdam";

function Clock({ timeZone, zone = "reader" }: { timeZone?: string; zone?: string }) {
  const minute = useMinute({ timeZone });
  return <output data-zone={zone}>{minute ? `${minute.now.toISOString()} ${minute.day}` : "no clock"}</output>;
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { configurable: true, value: hidden });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

const advance = (ms: number) => act(() => jest.advanceTimersByTime(ms));

// the page's pending timers, once React's own zero-delay work from an unmount has run
function timers() {
  advance(1);
  return jest.getTimerCount();
}

const read = (scope: ParentNode, zone = "reader") => scope.querySelector(`output[data-zone="${zone}"]`)?.textContent;

beforeEach(() => {
  jest.useFakeTimers();
  // 23:59:40 on 2 november in amsterdam
  setSystemTime(new Date("2026-11-02T22:59:40Z"));
});

afterEach(() => {
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  jest.useRealTimers();
});

describe("useMinute", () => {
  test("a prerendered page has no clock", () => {
    expect(server(<Clock />).textContent).toBe("no clock");
  });

  test("reads the clock's whole minute and the day in the reader's zone", async () => {
    const { body, done } = await client(<Clock timeZone={amsterdam} />);
    expect(read(body)).toBe("2026-11-02T22:59:00.000Z 2026-11-02");
    await done();
  });

  test("turns over on the clock's next minute, so midnight is a tick and the day follows", async () => {
    const { body, done } = await client(<Clock timeZone={amsterdam} />);
    advance(19_000);
    expect(read(body)).toBe("2026-11-02T22:59:00.000Z 2026-11-02");
    advance(1_000);
    expect(read(body)).toBe("2026-11-02T23:00:00.000Z 2026-11-03");
    advance(60_000);
    expect(read(body)).toBe("2026-11-02T23:01:00.000Z 2026-11-03");
    await done();
  });

  test("every caller on a page shares one timer, and the last to leave stops it", async () => {
    const first = await client(<Clock timeZone={amsterdam} />);
    const second = await client(<Clock timeZone="UTC" zone="utc" />);
    expect(timers()).toBe(1);
    advance(20_000);
    expect(read(first.body)).toBe("2026-11-02T23:00:00.000Z 2026-11-03");
    expect(read(second.body, "utc")).toBe("2026-11-02T23:00:00.000Z 2026-11-02");
    expect(timers()).toBe(1);
    await first.done();
    expect(timers()).toBe(1);
    await second.done();
    expect(timers()).toBe(0);
  });

  test("a hidden page holds no timer and catches up the moment it shows", async () => {
    const { body, done } = await client(<Clock timeZone={amsterdam} />);
    setHidden(true);
    expect(timers()).toBe(0);
    setSystemTime(new Date("2026-11-03T07:15:10Z"));
    expect(read(body)).toBe("2026-11-02T22:59:00.000Z 2026-11-02");
    setHidden(false);
    expect(read(body)).toBe("2026-11-03T07:15:00.000Z 2026-11-03");
    expect(timers()).toBe(1);
    advance(50_000);
    expect(read(body)).toBe("2026-11-03T07:16:00.000Z 2026-11-03");
    await done();
  });
});
