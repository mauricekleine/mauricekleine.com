import { useState } from "react";
import {
  DayLine,
  DayLineAllDay,
  DayLineDate,
  type DayLineEvent,
  DayLineHead,
  DayLineNote,
  DayLineSteps,
  DayLineStrip,
} from "@/components/superthread/blocks/day-line";
import {
  ListRow,
  ListRowKind,
  ListRows,
  ListRowTime,
  ListRowTitle,
  ListRowWhen,
} from "@/components/superthread/blocks/list-rows";
import { Button } from "@/components/superthread/ui/button";
import { Onward } from "@/components/superthread/ui/onward";

// A fixed day, clock and zone, so the page prints the same strip whenever it's built and wherever it's read.
const day = "2026-11-03";
const timeZone = "Europe/Amsterdam";
const clock = (time: string) => `${day}T${time}:00+01:00`;

function meeting(id: string, title: string, start: string, end: string, more?: Partial<DayLineEvent>): DayLineEvent {
  return { id, title, start: clock(start), end: clock(end), ...more };
}

const tuesday = [
  meeting("standup", "team standup", "09:30", "10:00", { href: "#through-the-day" }),
  meeting("renewal", "renewal call", "11:00", "11:45", { href: "#through-the-day", brief: true }),
  meeting("sam", "1:1 with sam", "14:00", "14:30", { href: "#through-the-day" }),
  meeting("kickoff", "project kickoff", "16:30", "17:30", { href: "#through-the-day", brief: true }),
];

function Head() {
  return (
    <DayLineHead>
      <DayLineDate href="#the-date">tue 3 nov</DayLineDate>
      <DayLineSteps>
        <Onward href="#the-date">wed 4 nov</Onward>
      </DayLineSteps>
    </DayLineHead>
  );
}

export function DayLineExample() {
  return (
    <DayLine>
      <Head />
      <DayLineStrip
        aria-label="tuesday's meetings"
        day={day}
        events={tuesday}
        now={clock("08:42")}
        timeZone={timeZone}
      />
    </DayLine>
  );
}

// The date opens the plain list of the same meetings, and its underline stays while the list is open.
export function DayLineWithRows() {
  const [open, setOpen] = useState(false);
  return (
    <DayLine>
      <DayLineHead>
        <DayLineDate render={<button type="button" />} aria-expanded={open} onClick={() => setOpen(!open)}>
          tue 3 nov
        </DayLineDate>
        <DayLineSteps>
          <Onward href="#the-date">wed 4 nov</Onward>
        </DayLineSteps>
      </DayLineHead>
      <DayLineStrip
        aria-label="tuesday's meetings"
        day={day}
        events={tuesday}
        now={clock("08:42")}
        timeZone={timeZone}
      />
      {open && (
        <ListRows aria-label="tuesday's meetings, as a list">
          {tuesday.map((event) => (
            <ListRow key={event.id} variant="day">
              <ListRowTime dateTime={String(event.start)}>{String(event.start).slice(11, 16)}</ListRowTime>
              <ListRowTitle>{event.title}</ListRowTitle>
              {event.brief && (
                <ListRowKind href="#the-date" aria-label={`brief for ${event.title}`}>
                  brief
                </ListRowKind>
              )}
              <ListRowWhen>
                <Button size="sm" variant="outline" aria-label={`join ${event.title}`}>
                  join
                </Button>
              </ListRowWhen>
            </ListRow>
          ))}
        </ListRows>
      )}
    </DayLine>
  );
}

// Late morning: one meeting spent, one running, and two that touch, with the seam on the later one.
export function DayLineThroughTheDay() {
  return (
    <DayLineStrip
      aria-label="the day at 11:12"
      day={day}
      events={[
        meeting("standup", "team standup", "09:30", "10:00", { href: "#through-the-day", brief: true }),
        meeting("renewal", "renewal call", "11:00", "11:45", { href: "#through-the-day", brief: true }),
        meeting("sam", "1:1 with sam", "14:00", "14:30", { href: "#through-the-day" }),
        meeting("review", "design review", "14:30", "15:30", { href: "#through-the-day", brief: true }),
      ]}
      now={clock("11:12")}
      timeZone={timeZone}
    />
  );
}

// One of each: an unconfirmed time, two that overlap, a read that may be behind, and the block whose brief is open.
export function DayLineKinds() {
  return (
    <DayLine>
      <DayLineHead>
        <DayLineDate href="#kinds">tue 3 nov</DayLineDate>
        <DayLineNote>personal calendar isn&rsquo;t answering</DayLineNote>
        <DayLineAllDay>anna out of office</DayLineAllDay>
        <DayLineSteps>
          <Onward href="#kinds">wed 4 nov</Onward>
        </DayLineSteps>
      </DayLineHead>
      <DayLineStrip
        aria-label="a day of every kind"
        asOf="as of 08:10"
        day={day}
        events={[
          { id: "anna", title: "anna out of office", start: day, end: day },
          meeting("hold", "supplier hold", "09:30", "10:30", { href: "#kinds", tentative: true }),
          meeting("renewal", "renewal call", "12:00", "12:45", { href: "#kinds", brief: true, selected: true }),
          meeting("sam", "1:1 with sam", "14:00", "14:45", { href: "#kinds" }),
          meeting("scope", "scope check", "14:30", "15:15", { href: "#kinds" }),
          meeting("dentist", "dentist", "16:30", "17:15", { note: "personal calendar may be behind", stale: true }),
        ]}
        now={clock("08:42")}
        timeZone={timeZone}
      />
    </DayLine>
  );
}

// Too many names for one row, so they stagger and lose their times.
export function DayLineHeavy() {
  return (
    <DayLineStrip
      aria-label="a full tuesday"
      day={day}
      events={[
        meeting("standup", "team standup", "09:00", "09:30", { href: "#heavy" }),
        meeting("review", "design review", "09:30", "10:30", { href: "#heavy", brief: true }),
        meeting("renewal", "renewal call", "10:45", "11:30", { href: "#heavy", brief: true }),
        meeting("sam", "1:1 with sam", "11:30", "12:00", { href: "#heavy" }),
        meeting("lunch", "lunch with the team", "12:00", "13:00"),
        meeting("planning", "quarter planning", "13:00", "14:00", { href: "#heavy", brief: true }),
        meeting("hiring", "hiring sync", "14:15", "14:45", { href: "#heavy", tentative: true }),
        meeting("support", "support review", "15:00", "15:30", { href: "#heavy" }),
        meeting("kickoff", "project kickoff", "15:30", "16:30", { href: "#heavy", brief: true }),
        meeting("wrap", "weekly wrap", "17:00", "17:30", { href: "#heavy" }),
      ]}
      now={clock("10:05")}
      timeZone={timeZone}
    />
  );
}

// An evening meeting widens the scale to the hour it ends in.
export function DayLineEvening() {
  return (
    <DayLineStrip
      aria-label="a tuesday with an evening"
      day={day}
      events={[
        meeting("standup", "team standup", "09:30", "10:00", { href: "#scale" }),
        meeting("dinner", "dinner with the board", "19:00", "21:30", { href: "#scale" }),
      ]}
      now={clock("08:42")}
      timeZone={timeZone}
    />
  );
}

export function DayLineNothingFixed() {
  return (
    <DayLineStrip
      aria-label="saturday"
      day="2026-11-07"
      events={[]}
      now="2026-11-07T10:20:00+01:00"
      timeZone={timeZone}
    >
      nothing fixed today
    </DayLineStrip>
  );
}

export function DayLineFailedRead() {
  return (
    <DayLineStrip aria-label="today" day={day} events={[]} now={clock("08:42")} timeZone={timeZone}>
      calendar isn&rsquo;t answering
      <Button size="xs" variant="ghost">
        try again
      </Button>
    </DayLineStrip>
  );
}

export function DayLineLoading() {
  return <DayLineStrip aria-label="wednesday" day="2026-11-04" events={[]} loading timeZone={timeZone} />;
}
