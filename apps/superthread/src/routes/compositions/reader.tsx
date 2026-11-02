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
      { id: "example", title: "example" },
      { id: "the-closing-line", title: "the closing line" },
      { id: "a-meeting-brief", title: "a meeting brief" },
      { id: "after-the-meeting", title: "after the meeting" },
      { id: "as-written", title: "as written" },
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
        title="reader"
        lede="a page of reading: a lead line, the next action on paper, a margin rail, a closing line and a foot. a meeting brief's blocks are its parts."
      >
        <InstallLine items={["reader"]} />
      </PageHead>
      <Serves name="reader" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          the line says what the day comes to, and the paper under it holds the one next step. the rail opens 248 px of
          margin beside them when the reader has 640 px of its own, here for a <code>month-grid</code>, and the day line
          and the writing run the whole width under both. in a panel the paper hangs 24 px into the left margin, so its
          words keep the line&rsquo;s left edge. a written brief prints no now mark, because it can&rsquo;t keep a live
          time.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="a brief, light" width={960} height={964}>
              <ReaderBrief />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a brief, dark" width={960} height={964}>
              <ReaderBrief />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="the-closing-line" title="the closing line">
        <p className="st-ca-copy">
          a reading page ends on one closing line, in erode italic at the lede step, in muted ink. it tells the reader
          the page is finished, so a page that scrolls doesn&rsquo;t leave them wondering what&rsquo;s under it.
        </p>
        <ModePair>
          <ReaderClosingLine />
        </ModePair>
      </Section>
      <Section id="a-meeting-brief" title="a meeting brief">
        <p className="st-ca-copy">
          the paper holds the meeting and the one thing to raise, and hangs 24 px into both margins, so its words keep
          the blocks&rsquo; left edge. under it the blocks sit two to a row at 640 px of their own width. names, notes
          and sightings share their columns, and a note wraps rather than cuts. a row with a link underlines only its
          words. a block with nothing to say prints <code>not in the record</code> where its first row would sit.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="a meeting brief, light" width={960} height={706}>
              <ReaderMeeting />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a meeting brief, dark" width={960} height={706}>
              <ReaderMeeting />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="after-the-meeting" title="after the meeting">
        <p className="st-ca-copy">
          what was agreed takes the paper. the follow-ups take the owed rows, and what was written before the meeting
          stays on the page in muted ink, so nobody reads a plan as a result.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="after the meeting, light" width={960} height={554}>
              <ReaderMeetingAfter />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="after the meeting, dark" width={960} height={554}>
              <ReaderMeetingAfter />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="as-written" title="as written">
        <p className="st-ca-copy">
          <code>asWritten</code> turns a block&rsquo;s ink muted, and every part in it takes that ink. a brief that
          can&rsquo;t be read still prints the names on the invite, and a name alone takes its whole row.
        </p>
        <ModePair className="st-ca-wide-pair">
          <div className="grid gap-6">
            <ReaderAsWritten />
            <ReaderNamesOnly />
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-ca-copy">
          below 640 px the rail folds into the source&rsquo;s order, after the closing line and before the foot, which
          stays last in the panel. the paper runs the panel&rsquo;s whole width. a person&rsquo;s row takes 12 px of
          padding above and below, and an owed row reaches 44 px with its date under its words.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="a brief on a phone, light" height={1218}>
              <ReaderBrief />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a brief on a phone, dark" height={1218}>
              <ReaderBrief />
            </GroundFrame>
          }
        />
        <ModePair
          light={
            <GroundFrame mode="light" title="a meeting brief on a phone, light" height={976}>
              <ReaderMeeting />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a meeting brief on a phone, dark" height={976}>
              <ReaderMeeting />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Reader</code>
          </dt>
          <dd>
            an article named by its line, and a size container. write its parts in this order: lead, wide, body, rail,
            foot.
          </dd>
          <dt>
            <code>ReaderLead</code>
          </dt>
          <dd>the reading column&rsquo;s top: the head, the line and the next action.</dd>
          <dt>
            <code>ReaderHead</code>
          </dt>
          <dd>
            the date, with <code>written</code> at the end in mono.
          </dd>
          <dt>
            <code>ReaderLine</code>
          </dt>
          <dd>
            the page in one sentence, at the page step in the first ink. an <code>h2</code> by default; render an{" "}
            <code>h1</code> when it titles the page.
          </dd>
          <dt>
            <code>ReaderPaper</code>
          </dt>
          <dd>
            the page&rsquo;s one paper, 24 px into both margins of a panel and the panel&rsquo;s whole width on a phone.
            it holds a meeting&rsquo;s head.
          </dd>
          <dt>
            <code>ReaderNext</code>
          </dt>
          <dd>the next step on the page&rsquo;s one paper, with the one action in it. a long pair wraps.</dd>
          <dt>
            <code>ReaderNextText</code>
          </dt>
          <dd>
            the <code>label</code>, which names the block, over the step.
          </dd>
          <dt>
            <code>ReaderRail</code>
          </dt>
          <dd>the 248 px margin beside the lead. a reader with no rail reads the whole width.</dd>
          <dt>
            <code>ReaderWide</code>
          </dt>
          <dd>a row at the reader&rsquo;s whole width, such as a day line.</dd>
          <dt>
            <code>ReaderBody</code>
          </dt>
          <dd>the sections and the closing line.</dd>
          <dt>
            <code>ReaderSection</code>, <code>ReaderSectionTitle</code>
          </dt>
          <dd>a section named by its title, 48 px from the one before, and 32 px on a phone.</dd>
          <dt>
            <code>ReaderText</code>
          </dt>
          <dd>a paragraph at the read step on the reading measure.</dd>
          <dt>
            <code>ReaderEnd</code>
          </dt>
          <dd>the closing line.</dd>
          <dt>
            <code>ReaderFoot</code>
          </dt>
          <dd>
            the panel&rsquo;s foot, with back at the start and onward at the end, last in the panel. it comes with{" "}
            <code>app-shell</code>.
          </dd>
          <dt>
            <code>ReaderRaised</code>
          </dt>
          <dd>
            one sentence for the room under a <code>label</code>, at the lede step on the paper.
          </dd>
          <dt>
            <code>ReaderBlocks</code>
          </dt>
          <dd>a meeting brief&rsquo;s blocks, two to a row at 640 px of their own width.</dd>
          <dt>
            <code>ReaderBlock</code>, <code>ReaderBlockTitle</code>
          </dt>
          <dd>
            a block named by its title. <code>asWritten</code> turns its ink muted.
          </dd>
          <dt>
            <code>ReaderWho</code>, <code>ReaderPerson</code>
          </dt>
          <dd>
            people, with a <code>note</code> and where they were last <code>seen</code>, in columns the rows share.
          </dd>
          <dt>
            <code>ReaderOwed</code>, <code>ReaderOwedRow</code>
          </dt>
          <dd>
            what&rsquo;s owed and <code>when</code>. an <code>href</code> or a router link through <code>render</code>{" "}
            makes the row one link.
          </dd>
          <dt>
            <code>ReaderGap</code>
          </dt>
          <dd>what a block can&rsquo;t say, where its first row would sit.</dd>
        </dl>
      </Section>
    </>
  );
}
