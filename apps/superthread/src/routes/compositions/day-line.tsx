import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import {
  DayLineEvening,
  DayLineExample,
  DayLineFailedRead,
  DayLineFault,
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
      { id: "example", title: "Example" },
      { id: "the-date", title: "The date" },
      { id: "through-the-day", title: "Through the day" },
      { id: "kinds", title: "Kinds of event" },
      { id: "heavy", title: "A heavy day" },
      { id: "scale", title: "The scale" },
      { id: "no-events", title: "No events" },
      { id: "faults", title: "When a read fails" },
      { id: "phone", title: "On a phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Day line"
        lede="A day at true scale: the date, the names over their blocks, ticks and a now mark. It shows the shape of the day at a glance."
      >
        <InstallLine items={["day-line"]} />
      </PageHead>
      <Serves name="day-line" />
      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Each block sits where its meeting sits on the clock. A block carries its whole meaning in its ARIA label, and
          the names above it are for the eye. The mark is now, and it moves with <code>useMinute</code>.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineExample />
        </ModePair>
      </Section>
      <Section id="the-date" title="The date">
        <p className="st-cb-copy">
          The date can open the same day as a plain list. It keeps its underline while the list is open, and on a phone
          it is the way in, because the blocks there are not targets.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineWithRows />
        </ModePair>
      </Section>
      <Section id="through-the-day" title="Through the day">
        <p className="st-cb-copy">
          On a timeline solid means an event and nothing else, so nothing fills in behind the mark. A meeting that has
          ended dims and loses its word. A meeting underway keeps its brief, since that&rsquo;s when it&rsquo;s read,
          and the word sits on the block&rsquo;s own face, so the mark passes behind it. A day gone by reads as spent
          all through, with no mark. Two blocks that touch keep a 1 px seam.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineThroughTheDay />
        </ModePair>
      </Section>
      <Section id="kinds" title="Kinds of event">
        <p className="st-cb-copy">
          An outline is tentative, and its name says so. A dotted edge is a read that may be behind, and the foot says
          why and when it was last good. Two meetings that overlap stack at half height, earlier on top, and share one
          name. The first ink marks the selected block. A plain date is an all-day event, which goes in the head and
          never on the strip.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineKinds />
        </ModePair>
      </Section>
      <Section id="heavy" title="A heavy day">
        <p className="st-cb-copy">
          When names can&rsquo;t sit side by side they stagger on two rows and drop their times, and a tentative name
          keeps its word on the title&rsquo;s line. Each name truncates before the next one in its row, and a long name
          at the end of the day stops short of the one before it.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineHeavy />
        </ModePair>
      </Section>
      <Section id="scale" title="The scale">
        <p className="st-cb-copy">
          The scale runs 08:00 to 18:00 and widens to the whole hours that hold the first start and the last end. It
          never widens for now, so nothing moves as the day goes by. Outside the scale the mark waits at the edge and
          still prints the real time.
        </p>
        <ModePair className="st-cb-stack">
          <DayLineEvening />
        </ModePair>
      </Section>
      <Section id="no-events" title="No events">
        <p className="st-cb-copy">
          A day with no timed event prints its children where the names go: what the day holds. Until the first read{" "}
          <code>loading</code> holds the strip&rsquo;s height with bars in the names&rsquo; band, and nothing solid on
          the track. A refresh keeps the blocks it has.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-day-line-stack">
            <DayLineNothingFixed />
            <DayLineLoading />
          </div>
        </ModePair>
      </Section>
      <Section id="faults" title="When a read fails">
        <p className="st-cb-copy">
          A fault has one home: the foot under the strip, with why the day can&rsquo;t be trusted, when it was last good
          and one quiet action. It holds its 24 px while it&rsquo;s empty, so a fault from any calendar comes and goes
          and nothing moves. With nothing drawn, the band stays empty, so a failed read never reads as an empty day.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-day-line-stack">
            <DayLineFault />
            <DayLineFailedRead />
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-cb-copy">
          On a narrow strip one name prints, on one line beside its time: the selected meeting&rsquo;s, or else the next
          one&rsquo;s. Past the middle of the day it ends at its block&rsquo;s right edge. Blocks are not targets on a
          phone, so they print the brief glyph, and the date takes 44 px.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Day line phone, light" height={184}>
              <AppShellPanel>
                <DayLineKinds />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Day line phone, dark" height={184}>
              <AppShellPanel>
                <DayLineKinds />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>DayLine</code>
          </dt>
          <dd>The head and the strip, 16 px apart, and the foot right under the strip.</dd>
          <dt>
            <code>DayLineHead</code>
          </dt>
          <dd>The date, a note, the steps and the all-day line, in fixed places.</dd>
          <dt>
            <code>DayLineDate</code>
          </dt>
          <dd>
            The date, as words, a link, or a button that opens the day in place. Render an <code>h1</code> when it
            titles the page.
          </dd>
          <dt>
            <code>DayLineNote</code>
          </dt>
          <dd>A calendar&rsquo;s note beside the date. On a phone it drops under the date at its whole width.</dd>
          <dt>
            <code>DayLineAllDay</code>
          </dt>
          <dd>
            Prints <code>all day:</code> before the words it holds.
          </dd>
          <dt>
            <code>DayLineSteps</code>
          </dt>
          <dd>
            The ways to the next day, usually <code>Onward</code> links.
          </dd>
          <dt>
            <code>DayLineStrip</code>
          </dt>
          <dd>
            Names, track, ticks and now, from <code>day</code>, <code>events</code>, <code>now</code>,{" "}
            <code>timeZone</code> and <code>loading</code>. Its children print when the day holds no timed event.
          </dd>
          <dt>
            <code>DayLineFoot</code>
          </dt>
          <dd>
            The line under the strip for a fault&rsquo;s words and when the read was last good, with its one{" "}
            <code>action</code>. It holds its height while it&rsquo;s empty.
          </dd>
          <dt>
            <code>DayLineAction</code>
          </dt>
          <dd>
            The foot&rsquo;s one action, such as <code>Try again</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
