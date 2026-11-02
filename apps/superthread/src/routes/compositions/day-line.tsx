import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import {
  DayLineEvening,
  DayLineExample,
  DayLineFailedRead,
  DayLineHeavy,
  DayLineKinds,
  DayLineLoading,
  DayLineNothingFixed,
  DayLineThroughTheDay,
  DayLineWithRows,
} from "@/examples/day-line";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/day-line")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "the-date", title: "the date" },
      { id: "through-the-day", title: "through the day" },
      { id: "kinds", title: "kinds of event" },
      { id: "heavy", title: "a heavy day" },
      { id: "scale", title: "the scale" },
      { id: "no-events", title: "no events" },
      { id: "phone", title: "on a phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="day line"
        lede="a day at true scale: the date, the names over their blocks, ticks and a now mark. it shows the shape of the day at a glance."
      >
        <InstallLine items={["day-line"]} />
      </PageHead>
      <Serves name="day-line" />
      <Section id="example" title="example">
        <p className="st-cb-copy">
          each block sits where its meeting sits on the clock. a block carries its whole meaning in its aria label, and
          the names above it are for the eye. the mark is now, and it moves with <code>useMinute</code>.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineExample />
        </ModePair>
      </Section>
      <Section id="the-date" title="the date">
        <p className="st-cb-copy">
          the date can open the same day as a plain list. it keeps its underline while the list is open, and on a phone
          it is the way in, because the blocks there are not targets.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineWithRows />
        </ModePair>
      </Section>
      <Section id="through-the-day" title="through the day">
        <p className="st-cb-copy">
          on a timeline solid means an event and nothing else, so nothing fills in behind the mark. a meeting that has
          ended dims and loses its word. a meeting that has started loses its word too, so the mark never crosses one.
          two blocks that touch keep a 1 px seam.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineThroughTheDay />
        </ModePair>
      </Section>
      <Section id="kinds" title="kinds of event">
        <p className="st-cb-copy">
          an outline is tentative, and its name says so. a dotted edge is a read that may be behind, and{" "}
          <code>asOf</code> says when it was last good. two meetings that overlap stack at half height, earlier on top,
          and share one name. the first ink marks the selected block. a plain date is an all-day event, which goes in
          the head and never on the strip.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineKinds />
        </ModePair>
      </Section>
      <Section id="heavy" title="a heavy day">
        <p className="st-cb-copy">
          when names can&rsquo;t sit side by side they stagger on two rows and drop their times. each name truncates
          before the next one in its row.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineHeavy />
        </ModePair>
      </Section>
      <Section id="scale" title="the scale">
        <p className="st-cb-copy">
          the scale runs 08:00 to 18:00 and widens to the whole hours that hold the first start and the last end. it
          never widens for now, so nothing moves as the day goes by. outside the scale the mark waits at the edge and
          still prints the real time.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineEvening />
        </ModePair>
      </Section>
      <Section id="no-events" title="no events">
        <p className="st-cb-copy">
          a day with no timed event prints its children where the names go: what the day holds, or why it can&rsquo;t
          say. a failed read never reads as an empty day. until the first read <code>loading</code> holds the
          strip&rsquo;s height with bars in the names&rsquo; band, and nothing solid on the track. a refresh keeps the
          blocks it has.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-day-line-stack">
            <DayLineNothingFixed />
            <DayLineFailedRead />
            <DayLineLoading />
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-cb-copy">
          on a narrow strip only the next name prints, on one line beside its time. late in the day it ends at its
          block&rsquo;s right edge. blocks are not targets on a phone, so they print the brief glyph, and the date takes
          44 px.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="day line phone, light" height={260}>
              <AppShellPanel>
                <DayLineKinds />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="day line phone, dark" height={260}>
              <AppShellPanel>
                <DayLineKinds />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>DayLine</code>
          </dt>
          <dd>the head and the strip, 16 px apart.</dd>
          <dt>
            <code>DayLineHead</code>
          </dt>
          <dd>the date, a note, the steps and the all-day line, in fixed places.</dd>
          <dt>
            <code>DayLineDate</code>
          </dt>
          <dd>
            the date, as words or a link. render an <code>h1</code> when it titles the page.
          </dd>
          <dt>
            <code>DayLineNote</code>
          </dt>
          <dd>a calendar&rsquo;s note beside the date, and under it on a phone.</dd>
          <dt>
            <code>DayLineAllDay</code>
          </dt>
          <dd>
            prints <code>all day:</code> before the words it holds.
          </dd>
          <dt>
            <code>DayLineSteps</code>
          </dt>
          <dd>
            the ways to the next day, usually <code>Onward</code> links.
          </dd>
          <dt>
            <code>DayLineStrip</code>
          </dt>
          <dd>
            names, track, ticks and now, from <code>day</code>, <code>events</code>, <code>now</code>,{" "}
            <code>timeZone</code>, <code>loading</code> and <code>asOf</code>. its children print when the day holds no
            timed event.
          </dd>
        </dl>
      </Section>
    </>
  );
}
