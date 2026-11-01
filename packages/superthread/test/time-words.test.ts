import { describe, expect, test } from "bun:test";
import {
  beforeWords,
  type Schedule,
  scheduleWords,
  sinceWords,
  untilWords,
} from "@/components/superthread/lib/time-words";

const amsterdam = { timeZone: "Europe/Amsterdam" };
// a sunday
const now = "2026-11-01T10:12:30+01:00";

describe("sinceWords", () => {
  test.each([
    ["this morning", "2026-11-01T08:00:00+01:00", "today"],
    ["later today", "2026-11-01T18:00:00+01:00", "today"],
    ["a day ahead", "2026-11-02T09:00:00+01:00", "today"],
    ["yesterday", "2026-10-31T23:59:00+01:00", "since yesterday"],
    ["two days back", "2026-10-30T09:00:00+01:00", "since friday"],
    ["six days back", "2026-10-26T09:00:00+01:00", "since monday"],
    ["a week back", "2026-10-25T09:00:00+01:00", "since 25 oct"],
    ["early in the month", "2026-10-09T09:00:00+02:00", "since 9 oct"],
    ["last year", "2025-10-26T09:00:00+01:00", "since 26 oct 2025"],
  ])("%s", (_, from, words) => expect(sinceWords(from, now, amsterdam)).toBe(words));

  test("reads the day in the reader's zone, not the server's", () => {
    const late = "2026-10-31T23:30:00Z";
    expect(sinceWords(late, now, amsterdam)).toBe("today");
    expect(sinceWords(late, now, { timeZone: "UTC" })).toBe("since yesterday");
  });

  test("a calendar date is the same day in every zone", () => {
    for (const timeZone of ["Pacific/Auckland", "America/Los_Angeles"])
      expect(sinceWords("2026-10-30", "2026-11-01", { timeZone })).toBe("since friday");
  });

  test("counts days across a clock change", () => {
    // the clocks went back on 25 october, so this span is 169 hours
    expect(sinceWords("2026-10-24T12:00:00+02:00", "2026-10-31T12:00:00+01:00", amsterdam)).toBe("since 24 oct");
    expect(sinceWords("2026-10-25T12:00:00+01:00", "2026-10-31T12:00:00+01:00", amsterdam)).toBe("since sunday");
  });

  test("takes a Date", () => {
    expect(sinceWords(new Date("2026-10-30T09:00:00Z"), new Date(now), amsterdam)).toBe("since friday");
  });
});

describe("beforeWords", () => {
  test("prints the 24-hour clock in the reader's zone", () => {
    expect(beforeWords("2026-11-01T10:00:00Z", amsterdam)).toBe("before 11:00");
    expect(beforeWords("2026-11-01T10:00:00Z", { timeZone: "UTC" })).toBe("before 10:00");
    expect(beforeWords("2026-11-01T15:30:00Z", amsterdam)).toBe("before 16:30");
  });

  test("midnight is 00:00", () => {
    expect(beforeWords("2026-11-01T23:00:00Z", amsterdam)).toBe("before 00:00");
  });

  test("a calendar date has no clock face, so it names the date in every zone", () => {
    expect(beforeWords("2026-11-02", amsterdam)).toBe("before 2 nov");
    expect(beforeWords("2026-11-02", { timeZone: "America/New_York" })).toBe("before 2 nov");
  });
});

describe("untilWords", () => {
  const at = "2026-11-01T11:00:00+01:00";

  test("rounds a part minute up, so the words match the clock", () => {
    expect(untilWords(at, "standup", now)).toBe("48 min until standup");
  });

  test.each([
    ["2026-11-01T10:59:00+01:00", "1 min until 1:1 with sam"],
    ["2026-11-01T10:00:00+01:00", "1 h until 1:1 with sam"],
    ["2026-11-01T09:40:00+01:00", "1 h 20 until 1:1 with sam"],
    ["2026-11-01T08:00:00+01:00", "3 h until 1:1 with sam"],
  ])("from %s", (from, words) => expect(untilWords(at, "1:1 with sam", from)).toBe(words));

  test("names the thing once the moment arrives or has passed", () => {
    expect(untilWords(at, "standup", at)).toBe("standup now");
    expect(untilWords(at, "standup", "2026-11-01T11:20:00+01:00")).toBe("standup now");
  });

  test.each([
    ["tomorrow", "2026-11-02", "1 day until the deadline"],
    ["this week", "2026-11-04", "3 days until the deadline"],
    ["today", "2026-11-01", "the deadline now"],
    ["last week", "2026-10-25", "the deadline now"],
  ])("a calendar date counts days: %s", (_, date, words) =>
    expect(untilWords(date, "the deadline", now, amsterdam)).toBe(words),
  );

  test("a calendar date counts from the day it is in the reader's zone", () => {
    const late = "2026-11-01T23:30:00Z";
    expect(untilWords("2026-11-02", "the deadline", late, amsterdam)).toBe("the deadline now");
    expect(untilWords("2026-11-02", "the deadline", late, { timeZone: "UTC" })).toBe("1 day until the deadline");
  });
});

describe("scheduleWords", () => {
  test.each<[Schedule, string]>([
    [{ every: "day", at: "07:00" }, "every day at 07:00"],
    [{ every: "weekday", at: "18:30" }, "every weekday at 18:30"],
    [{ every: "monday", at: "07:15" }, "every monday at 07:15"],
    [{ every: ["thursday", "monday"], at: "07:00" }, "every monday and thursday at 07:00"],
    [{ every: ["friday", "monday", "wednesday"], at: "07:00" }, "every monday, wednesday and friday at 07:00"],
    [{ every: ["friday"], at: "07:00" }, "every friday at 07:00"],
    [{ every: ["monday", "tuesday", "wednesday", "thursday", "friday"], at: "09:00" }, "every weekday at 09:00"],
    [
      { every: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], at: "09:00" },
      "every day at 09:00",
    ],
    [
      { every: ["tuesday", "wednesday", "thursday", "friday", "saturday"], at: "09:00" },
      "every tuesday, wednesday, thursday, friday and saturday at 09:00",
    ],
    [{ every: "hour" }, "every hour"],
    [{ every: [], at: "07:00" }, "never"],
  ])("%j", (schedule, words) => expect(scheduleWords(schedule, amsterdam)).toBe(words));

  test("names the zone only when it differs from the reader's", () => {
    const schedule: Schedule = { every: "day", at: "07:00", timeZone: "Europe/Amsterdam" };
    expect(scheduleWords(schedule, amsterdam)).toBe("every day at 07:00");
    expect(scheduleWords(schedule, { timeZone: "America/New_York" })).toBe("every day at 07:00, amsterdam time");
    expect(scheduleWords({ ...schedule, timeZone: "America/New_York" }, amsterdam)).toBe(
      "every day at 07:00, new york time",
    );
  });
});
