import { Fragment } from "react";
import { ListRow, ListRowMeta, ListRows, ListRowTitle } from "@/components/superthread/blocks/list-rows";
import {
  beforeWords,
  clockWords,
  dateWords,
  monthWords,
  type Schedule,
  scheduleWords,
  sinceWords,
  untilWords,
} from "@/components/superthread/lib/time-words";

// A fixed clock and zone, so the page prints the same words whenever it's built and wherever it's read. This one is a
// sunday morning in amsterdam.
const now = "2026-11-01T10:12:30+01:00";
const reader = { timeZone: "Europe/Amsterdam" };

function Readout({ rows }: { rows: [moment: string, words: string][] }) {
  return (
    <dl className="st-pass-readout">
      {rows.map(([moment, words]) => (
        <Fragment key={moment}>
          <dt>{moment}</dt>
          <dd>{words}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export function SinceWordsExample() {
  return (
    <Readout
      rows={[
        ["This morning", sinceWords("2026-11-01T08:00:00+01:00", now, reader)],
        ["Saturday", sinceWords("2026-10-31T09:00:00+01:00", now, reader)],
        ["Friday", sinceWords("2026-10-30", now, reader)],
        ["9 October", sinceWords("2026-10-09", now, reader)],
        ["Last October", sinceWords("2025-10-26", now, reader)],
      ]}
    />
  );
}

export function BeforeWordsExample() {
  return (
    <Readout
      rows={[
        ["Amsterdam", beforeWords("2026-11-01T10:00:00Z", reader)],
        ["UTC", beforeWords("2026-11-01T10:00:00Z", { timeZone: "UTC" })],
        ["A plain date", beforeWords("2026-11-02", reader)],
      ]}
    />
  );
}

export function ClockWordsExample() {
  return (
    <Readout
      rows={[
        ["Clock, a moment", clockWords("2026-11-03T08:30:00Z", reader)],
        ["Clock, a plain date", clockWords("2026-11-02", reader)],
        ["Date, a moment", dateWords("2026-11-03T08:30:00Z", reader)],
        ["Date, a plain date", dateWords("2026-11-02", reader)],
        ["Month, a moment", monthWords("2026-11-03T08:30:00Z", reader)],
      ]}
    />
  );
}

export function UntilWordsExample() {
  return (
    <Readout
      rows={[
        ["11:00", untilWords("2026-11-01T11:00:00+01:00", "standup", now)],
        ["11:32", untilWords("2026-11-01T11:32:00+01:00", "standup", now)],
        ["12:12", untilWords("2026-11-01T12:12:00+01:00", "standup", now)],
        ["10:00", untilWords("2026-11-01T10:00:00+01:00", "standup", now)],
        ["Wednesday", untilWords("2026-11-04", "the deadline", now, reader)],
        ["Today", untilWords("2026-11-01", "the deadline", now, reader)],
      ]}
    />
  );
}

const schedules: [string, Schedule][] = [
  ["Daily", { every: "day", at: "07:00" }],
  ["Weekdays", { every: "weekday", at: "18:30" }],
  ["Two days", { every: ["thursday", "monday"], at: "07:15" }],
  ["Hourly", { every: "hour" }],
  ["New York", { every: "day", at: "07:00", timeZone: "America/New_York" }],
  ["No days", { every: [], at: "07:00" }],
];

export function ScheduleWordsExample() {
  return <Readout rows={schedules.map(([name, schedule]) => [name, scheduleWords(schedule, reader)])} />;
}

// The words in the place they're written for: a row's meta line.
export function TimeWordsInARow() {
  return (
    <ListRows aria-label="Open threads">
      <ListRow>
        <ListRowTitle href="#in-a-row">Wait for the design review</ListRowTitle>
        <ListRowMeta>
          <span>{sinceWords("2026-10-30", now, reader)}</span>
          <span>{beforeWords("2026-11-02T10:00:00Z", reader)}</span>
        </ListRowMeta>
      </ListRow>
      <ListRow>
        <ListRowTitle href="#in-a-row">Summarise the overnight runs</ListRowTitle>
        <ListRowMeta>
          <span>{scheduleWords({ every: "day", at: "07:00" }, reader)}</span>
          <span>{untilWords("2026-11-01T11:00:00+01:00", "standup", now)}</span>
        </ListRowMeta>
      </ListRow>
    </ListRows>
  );
}
