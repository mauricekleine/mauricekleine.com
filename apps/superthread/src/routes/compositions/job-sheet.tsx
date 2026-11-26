import { createFileRoute } from "@tanstack/react-router";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import { JobSheetAnswers, JobSheetExample, JobSheetStates, JobSheetTitles } from "@/examples/job-sheet";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/job-sheet")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "Through the day" },
      { id: "wrong", title: "When it's wrong" },
      { id: "titles", title: "Long titles" },
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
        title="Job sheet"
        lede="The one job on the page's paper: how long you have, what to do, why, and the step that starts it."
      >
        <InstallLine items={["job-sheet"]} />
      </PageHead>
      <Serves name="job-sheet" />
      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Every part sits in a held slot, so a state that drops one moves nothing, and a click never shifts a target.
          Paper reaches past the panel by its own padding, so the words share the panel&rsquo;s left edge. The frames
          here use a 1100 px viewport, where the panel is at its full width.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Job sheet, light" width={1100} height={640}>
              <JobSheetExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Job sheet, dark" width={1100} height={640}>
              <JobSheetExample />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="states" title="Through the day">
        <p className="st-cb-copy">
          Near a meeting the quiet line says what moved. The line is a slow read, so its slot holds whether it answers
          or not. In the meeting the cue turns into a fact, the primary prints as an outline, and the sheet keeps its
          height with the why gone.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Job sheet states, light" width={1100} height={1290}>
              <JobSheetStates />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Job sheet states, dark" width={1100} height={1290}>
              <JobSheetStates />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="wrong" title="When it's wrong">
        <p className="st-cb-copy">
          The why&rsquo;s slot holds <code>InlineAnswers</code>, so <code>wrong?</code> swaps the line for plain answers
          and the actions stay where they were. <code>wrong day</code> asks which day in the same slot. On a phone the
          answers take the quiet line&rsquo;s room while they&rsquo;re open. When there&rsquo;s nothing left to do, the
          sheet gives way to <a href="/compositions/states#clear">Clear</a>.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Job sheet answers, light" width={1100} height={1290}>
              <JobSheetAnswers />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Job sheet answers, dark" width={1100} height={1290}>
              <JobSheetAnswers />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="titles" title="Long titles">
        <p className="st-cb-copy">
          The title prints through <code>FitTitle</code> in the slot&rsquo;s held height: a longer one steps down, and
          only one that can&rsquo;t fit at 26/29 cuts, at a word. The slot never grows, so the actions stay put.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Job sheet long titles, light" width={1100} height={1290}>
              <JobSheetTitles />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Job sheet long titles, dark" width={1100} height={1290}>
              <JobSheetTitles />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-cb-copy">
          The title takes six lines of long and the why takes two. The primary takes what the row leaves, with its words
          on two lines when the step needs them, and a toggle keeps its words on one line beside it. On a sheet under
          360 px, the toggle takes two lines in a column of its own and the primary keeps the rest.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Job sheet phone, light" height={1160}>
              <JobSheetTitles />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Job sheet phone, dark" height={1160}>
              <JobSheetTitles />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>JobSheet</code>
          </dt>
          <dd>
            The paper and its held rows. Name it with <code>aria-labelledby</code> and the title&rsquo;s <code>id</code>
            . It takes its own space above, so print it right after what stands over it.
          </dd>
          <dt>
            <code>JobSheetCue</code>
          </dt>
          <dd>The gap in plain words, or a fact in the job&rsquo;s place. One line.</dd>
          <dt>
            <code>JobSheetTitle</code>
          </dt>
          <dd>
            The job, through <code>FitTitle</code>. Pass <code>href</code> or <code>link</code> to the page that prints
            it whole.
          </dd>
          <dt>
            <code>JobSheetWhy</code>
          </dt>
          <dd>
            Why this job, in one short sentence: one line at a full panel, two below it. It holds{" "}
            <code>InlineAnswers</code> when the job can be wrong.
          </dd>
          <dt>
            <code>JobSheetChanged</code>
          </dt>
          <dd>One quiet line for what moved. Render it from the start, empty until the words arrive.</dd>
          <dt>
            <code>JobSheetActions</code>
          </dt>
          <dd>The row of actions at the foot.</dd>
          <dt>
            <code>JobSheetPrimary</code>
          </dt>
          <dd>
            The page&rsquo;s one primary, at 48 px. <code>reserve</code> takes its longest word, so it holds its width
            when the word changes.
          </dd>
          <dt>
            <code>JobSheetToggle</code>
          </dt>
          <dd>
            A way of holding the whole page, such as <code>Only what can&rsquo;t slip</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
