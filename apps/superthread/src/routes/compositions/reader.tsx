import { createFileRoute } from "@tanstack/react-router";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import {
  ReaderAsWritten,
  ReaderBrief,
  ReaderClosingLine,
  ReaderMeeting,
  ReaderMeetingAfter,
  ReaderNamesOnly,
} from "@/examples/reader";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/reader")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "the-closing-line", title: "The closing line" },
      { id: "a-meeting-brief", title: "A meeting brief" },
      { id: "after-the-meeting", title: "After the meeting" },
      { id: "as-written", title: "As written" },
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
        title="Reader"
        lede="A page of reading: a lead line, the next action on paper, a margin rail, a closing line and a foot. A meeting brief's blocks are its parts."
      >
        <InstallLine items={["reader"]} />
      </PageHead>
      <Serves name="reader" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          The line says what the day comes to, and the paper under it holds the one next step. The rail opens 248 px of
          margin beside them when the reader has 640 px of its own, here for a <code>month-grid</code>, and the day line
          and the writing run the whole width under both. In a panel the paper hangs 24 px into the left margin, so its
          words keep the line&rsquo;s left edge. A written brief prints no now mark, because it can&rsquo;t keep a live
          time.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="A brief, light" width={960} height={964}>
              <ReaderBrief />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A brief, dark" width={960} height={964}>
              <ReaderBrief />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="the-closing-line" title="The closing line">
        <p className="st-ca-copy">
          A reading page ends on one closing line, in Erode italic at the lede step, in muted ink. It tells the reader
          the page is finished, so a page that scrolls doesn&rsquo;t leave them wondering what&rsquo;s under it.
        </p>
        <ModePair>
          <ReaderClosingLine />
        </ModePair>
      </Section>
      <Section id="a-meeting-brief" title="A meeting brief">
        <p className="st-ca-copy">
          The paper holds the meeting and the one thing to raise, and hangs 24 px into both margins, so its words keep
          the blocks&rsquo; left edge. Under it the blocks sit two to a row at 640 px of their own width. Names, notes
          and sightings share their columns, and a note wraps rather than cuts. A row with a link underlines only its
          words. A block with nothing to say prints <code>Not in the record</code> where its first row would sit.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="A meeting brief, light" width={960} height={706}>
              <ReaderMeeting />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A meeting brief, dark" width={960} height={706}>
              <ReaderMeeting />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="after-the-meeting" title="After the meeting">
        <p className="st-ca-copy">
          What was agreed takes the paper. The follow-ups take the owed rows, and what was written before the meeting
          stays on the page in muted ink, so nobody reads a plan as a result.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="After the meeting, light" width={960} height={554}>
              <ReaderMeetingAfter />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="After the meeting, dark" width={960} height={554}>
              <ReaderMeetingAfter />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="as-written" title="As written">
        <p className="st-ca-copy">
          <code>asWritten</code> turns a block&rsquo;s ink muted, and every part in it takes that ink. A brief that
          can&rsquo;t be read still prints the names on the invite, and a name alone takes its whole row.
        </p>
        <ModePair className="st-ca-wide-pair">
          <div className="grid gap-6">
            <ReaderAsWritten />
            <ReaderNamesOnly />
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-ca-copy">
          Below 640 px the rail folds into the source&rsquo;s order, after the closing line and before the foot, which
          stays last in the panel. The paper runs the panel&rsquo;s whole width. A person&rsquo;s row takes 12 px of
          padding above and below, and an owed row reaches 44 px with its date under its words.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="A brief on a phone, light" height={1218}>
              <ReaderBrief />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A brief on a phone, dark" height={1218}>
              <ReaderBrief />
            </GroundFrame>
          }
        />
        <ModePair
          light={
            <GroundFrame mode="light" title="A meeting brief on a phone, light" height={976}>
              <ReaderMeeting />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A meeting brief on a phone, dark" height={976}>
              <ReaderMeeting />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Reader</code>
          </dt>
          <dd>
            An article named by its line, and a size container. Write its parts in this order: lead, wide, body, rail,
            foot.
          </dd>
          <dt>
            <code>ReaderLead</code>
          </dt>
          <dd>The reading column&rsquo;s top: the head, the line and the next action.</dd>
          <dt>
            <code>ReaderHead</code>
          </dt>
          <dd>
            The date, with <code>written</code> at the end in mono.
          </dd>
          <dt>
            <code>ReaderLine</code>
          </dt>
          <dd>
            The page in one sentence, at the page step in the first ink. An <code>h2</code> by default; render an{" "}
            <code>h1</code> when it titles the page.
          </dd>
          <dt>
            <code>ReaderPaper</code>
          </dt>
          <dd>
            The page&rsquo;s one paper, 24 px into both margins of a panel and the panel&rsquo;s whole width on a phone.
            It holds a meeting&rsquo;s head.
          </dd>
          <dt>
            <code>ReaderNext</code>
          </dt>
          <dd>The next step on the page&rsquo;s one paper, with the one action in it. A long pair wraps.</dd>
          <dt>
            <code>ReaderNextText</code>
          </dt>
          <dd>
            The <code>label</code>, which names the block, over the step.
          </dd>
          <dt>
            <code>ReaderRail</code>
          </dt>
          <dd>The 248 px margin beside the lead. A reader with no rail reads the whole width.</dd>
          <dt>
            <code>ReaderWide</code>
          </dt>
          <dd>A row at the reader&rsquo;s whole width, such as a day line.</dd>
          <dt>
            <code>ReaderBody</code>
          </dt>
          <dd>The sections and the closing line.</dd>
          <dt>
            <code>ReaderSection</code>, <code>ReaderSectionTitle</code>
          </dt>
          <dd>A section named by its title, 48 px from the one before, and 32 px on a phone.</dd>
          <dt>
            <code>ReaderText</code>
          </dt>
          <dd>A paragraph at the read step on the reading measure.</dd>
          <dt>
            <code>ReaderEnd</code>
          </dt>
          <dd>The closing line.</dd>
          <dt>
            <code>ReaderFoot</code>
          </dt>
          <dd>
            The panel&rsquo;s foot, with back at the start and onward at the end, last in the panel. It comes with{" "}
            <code>app-shell</code>.
          </dd>
          <dt>
            <code>ReaderRaised</code>
          </dt>
          <dd>
            One sentence for the room under a <code>label</code>, at the lede step on the paper.
          </dd>
          <dt>
            <code>ReaderBlocks</code>
          </dt>
          <dd>A meeting brief&rsquo;s blocks, two to a row at 640 px of their own width.</dd>
          <dt>
            <code>ReaderBlock</code>, <code>ReaderBlockTitle</code>
          </dt>
          <dd>
            A block named by its title. <code>asWritten</code> turns its ink muted.
          </dd>
          <dt>
            <code>ReaderWho</code>, <code>ReaderPerson</code>
          </dt>
          <dd>
            People, with a <code>note</code> and where they were last <code>seen</code>, in columns the rows share.
          </dd>
          <dt>
            <code>ReaderOwed</code>, <code>ReaderOwedRow</code>
          </dt>
          <dd>
            What&rsquo;s owed and <code>when</code>. An <code>href</code> or a router link through <code>render</code>{" "}
            makes the row one link.
          </dd>
          <dt>
            <code>ReaderGap</code>
          </dt>
          <dd>What a block can&rsquo;t say, where its first row would sit.</dd>
        </dl>
      </Section>
    </>
  );
}
