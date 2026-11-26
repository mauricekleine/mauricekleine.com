import { createFileRoute } from "@tanstack/react-router";
import { GroundFrame } from "@/examples/compositions-a";
import { InlineAnswersExample, InlineAnswersOpen } from "@/examples/inline-answers";
import { JobSheetAnswers } from "@/examples/job-sheet";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/inline-answers")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
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
        title="Inline answers"
        lede="A suggestion that takes correction where it stands. One word swaps the line for plain answers, and nothing else on the page moves."
      >
        <InstallLine items={["inline-answers"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-pass-prose">
          Press <code>wrong?</code>. The answers take the line&rsquo;s place, and <code>wrong?</code> stays as the
          lead-in that closes them. Choosing an answer closes them too, and focus goes back to <code>wrong?</code>, as
          it does on Escape.
        </p>
        <ModePair>
          <InlineAnswersExample />
        </ModePair>
      </Section>
      <Section id="open" title="Open">
        <p className="st-pass-prose">
          An answer that needs one more word asks for it there: <code>wrong day</code> stays as its lead-in, and its own
          answers follow the arrow. The second click of a double click counts for nothing, because the answers can land
          under the pointer.
        </p>
        <ModePair>
          <InlineAnswersOpen />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-pass-prose">
          Each answer is a 44 px box, and a second row sits a whole target below the first, so no two hit areas overlap.
          The row keeps to the line&rsquo;s first row, and the job&rsquo;s actions stay where they were.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Inline answers on a phone, light" height={1480}>
              <JobSheetAnswers />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Inline answers on a phone, dark" height={1480}>
              <JobSheetAnswers />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>InlineAnswers</code>
          </dt>
          <dd>
            Holds the open state. Its slot belongs to the parent, which holds the height. Key it to the suggestion, so a
            new one starts closed. <code>open</code>, <code>defaultOpen</code> and <code>onOpenChange</code> are there
            for a ship that drives it.
          </dd>
          <dt>
            <code>InlineAnswersLine</code>
          </dt>
          <dd>The line the answers replace.</dd>
          <dt>
            <code>InlineAnswersTrigger</code>
          </dt>
          <dd>
            The word that opens and closes them, <code>wrong?</code> until you pass another.
          </dd>
          <dt>
            <code>InlineAnswersList</code>
          </dt>
          <dd>The answers, as a group named by the trigger.</dd>
          <dt>
            <code>InlineAnswer</code>
          </dt>
          <dd>
            One plain answer, a button. Choosing it closes the answers unless <code>onClick</code> prevents default.
          </dd>
          <dt>
            <code>InlineAnswersAsk</code>
          </dt>
          <dd>
            An answer that asks one more question. <code>question</code> is its word, and its children are the
            question&rsquo;s own <code>InlineAnswer</code>s.
          </dd>
        </dl>
      </Section>
    </>
  );
}
