import { createFileRoute } from "@tanstack/react-router";
import {
  BeforeWordsExample,
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
      { id: "since", title: "since" },
      { id: "before", title: "before" },
      { id: "until", title: "until" },
      { id: "schedule", title: "schedule" },
      { id: "in-a-row", title: "in a row" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="time-words"
        lede="pure formatters for the time a ship prints: since friday, before 11:00, 48 min until standup, every day at 07:00."
      >
        <InstallLine items={["time-words"]} />
      </PageHead>
      <Section id="since" title="since">
        <p className="st-pass-prose">
          <code>sinceWords(from, now)</code> names the day something started. the examples on this page read the clock
          at 10:12 on sunday 1 november in amsterdam. the weekday holds for six days, then the date takes over, and the
          year joins it once it differs. a plain date like 2026-10-30 is the same day in every zone.
        </p>
        <ModePair>
          <SinceWordsExample />
        </ModePair>
      </Section>
      <Section id="before" title="before">
        <p className="st-pass-prose">
          <code>beforeWords(at)</code> prints the 24-hour clock in the reader&rsquo;s zone, so the same 10:00 utc reads
          differently in amsterdam. a server rendering for someone else passes <code>timeZone</code>.
        </p>
        <ModePair>
          <BeforeWordsExample />
        </ModePair>
      </Section>
      <Section id="until" title="until">
        <p className="st-pass-prose">
          <code>untilWords(at, what, now)</code> counts down to something named. a part minute rounds up, so the words
          match the difference between the two clock faces, and the thing reads as now once its moment arrives.
        </p>
        <ModePair>
          <UntilWordsExample />
        </ModePair>
      </Section>
      <Section id="schedule" title="schedule">
        <p className="st-pass-prose">
          <code>scheduleWords(schedule)</code> says what repeats. an app turns its own schedule format into a{" "}
          <code>Schedule</code> first, so no cron or rule string reaches the words. a schedule set in another zone says
          so.
        </p>
        <ModePair>
          <ScheduleWordsExample />
        </ModePair>
      </Section>
      <Section id="in-a-row" title="in a row">
        <p className="st-pass-prose">the words sit in a row&rsquo;s meta line.</p>
        <ModePair>
          <TimeWordsInARow />
        </ModePair>
      </Section>
    </>
  );
}
