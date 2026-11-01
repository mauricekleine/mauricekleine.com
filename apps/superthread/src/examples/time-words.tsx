import { Fragment } from "react";
import { ListRow, ListRowMeta, ListRows, ListRowTitle } from "@/components/superthread/blocks/list-rows";
import {
  beforeWords,
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
        ["this morning", sinceWords("2026-11-01T08:00:00+01:00", now, reader)],
        ["saturday", sinceWords("2026-10-31T09:00:00+01:00", now, reader)],
        ["friday", sinceWords("2026-10-30", now, reader)],
        ["9 october", sinceWords("2026-10-09", now, reader)],
        ["last october", sinceWords("2025-10-26", now, reader)],
      ]}
    />
  );
}

export function BeforeWordsExample() {
  return (
    <Readout
      rows={[
        ["amsterdam", beforeWords("2026-11-01T10:00:00Z", reader)],
        ["utc", beforeWords("2026-11-01T10:00:00Z", { timeZone: "UTC" })],
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
      ]}
    />
  );
}

const schedules: [string, Schedule][] = [
  ["daily", { every: "day", at: "07:00" }],
  ["weekdays", { every: "weekday", at: "18:30" }],
  ["two days", { every: ["thursday", "monday"], at: "07:15" }],
  ["hourly", { every: "hour" }],
  ["new york", { every: "day", at: "07:00", timeZone: "America/New_York" }],
];

export function ScheduleWordsExample() {
  return <Readout rows={schedules.map(([name, schedule]) => [name, scheduleWords(schedule, reader)])} />;
}

// The words in the place they're written for: a row's meta line.
export function TimeWordsInARow() {
  return (
    <ListRows aria-label="open threads">
      <ListRow>
        <ListRowTitle href="#in-a-row">wait for the design review</ListRowTitle>
        <ListRowMeta>
          <span>{sinceWords("2026-10-30", now, reader)}</span>
          <span>{beforeWords("2026-11-02T10:00:00Z", reader)}</span>
        </ListRowMeta>
      </ListRow>
      <ListRow>
        <ListRowTitle href="#in-a-row">summarise the overnight runs</ListRowTitle>
        <ListRowMeta>
          <span>{scheduleWords({ every: "day", at: "07:00" }, reader)}</span>
          <span>{untilWords("2026-11-01T11:00:00+01:00", "standup", now)}</span>
        </ListRowMeta>
      </ListRow>
    </ListRows>
  );
}
