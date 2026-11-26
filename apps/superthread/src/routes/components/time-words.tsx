import { createFileRoute } from "@tanstack/react-router";
import {
  BeforeWordsExample,
  ClockWordsExample,
  ScheduleWordsExample,
  SinceWordsExample,
  TimeWordsInARow,
  UntilWordsExample,
} from "@/examples/time-words";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/time-words")({
  staticData: {
    sections: [
      { id: "since", title: "Since" },
      { id: "before", title: "Before" },
      { id: "clock-and-date", title: "Clock and date" },
      { id: "until", title: "Until" },
      { id: "schedule", title: "Schedule" },
      { id: "in-a-row", title: "In a row" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="time-words"
        lede="Pure formatters for the time a ship prints: since Friday, before 11:00, 48 min until standup, every day at 07:00."
      >
        <InstallLine items={["time-words"]} />
      </PageHead>
      <Section id="since" title="Since">
        <p className="st-pass-prose">
          <code>sinceWords(from, now)</code> names the day something started. The examples on this page read the clock
          at 10:12 on Sunday 1 November in Amsterdam. The weekday holds for six days, then the date takes over, and the
          year joins it once it differs. A plain date like 2026-10-30 is the same day in every zone.
        </p>
        <ModePair>
          <SinceWordsExample />
        </ModePair>
      </Section>
      <Section id="before" title="Before">
        <p className="st-pass-prose">
          <code>beforeWords(at)</code> prints the 24-hour clock in the reader&rsquo;s zone, so the same 10:00 UTC reads
          differently in Amsterdam. A server rendering for someone else passes <code>timeZone</code>. A plain date has
          no clock face, so it prints the date.
        </p>
        <ModePair>
          <BeforeWordsExample />
        </ModePair>
      </Section>
      <Section id="clock-and-date" title="Clock and date">
        <p className="st-pass-prose">
          <code>clockWords(at)</code> prints a time on its own, for a row or a timeline. <code>dateWords(moment)</code>{" "}
          names the day it falls on in the reader&rsquo;s zone, and <code>monthWords(moment)</code> its month. A plain
          date has no clock face, so the clock prints the date.
        </p>
        <ModePair>
          <ClockWordsExample />
        </ModePair>
      </Section>
      <Section id="until" title="Until">
        <p className="st-pass-prose">
          <code>untilWords(at, what, now)</code> counts down to something named. A part minute rounds up, so the words
          match the difference between the two clock faces, and the thing reads as now once its moment arrives. A plain
          date counts days in the reader&rsquo;s zone, and reads as now once its day starts.
        </p>
        <ModePair>
          <UntilWordsExample />
        </ModePair>
      </Section>
      <Section id="schedule" title="Schedule">
        <p className="st-pass-prose">
          <code>scheduleWords(schedule)</code> says what repeats. An app turns its own schedule format into a{" "}
          <code>Schedule</code> first, so no cron or rule string reaches the words. A schedule set in another zone says
          so, and a list with no days reads as never.
        </p>
        <ModePair>
          <ScheduleWordsExample />
        </ModePair>
      </Section>
      <Section id="in-a-row" title="In a row">
        <p className="st-pass-prose">The words sit in a row&rsquo;s meta line.</p>
        <ModePair>
          <TimeWordsInARow />
        </ModePair>
      </Section>
    </>
  );
}
