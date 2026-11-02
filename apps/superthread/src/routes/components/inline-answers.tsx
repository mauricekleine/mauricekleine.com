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
      { id: "example", title: "example" },
      { id: "open", title: "open" },
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
        title="inline answers"
        lede="a suggestion that takes correction where it stands. one word swaps the line for plain answers, and nothing else on the page moves."
      >
        <InstallLine items={["inline-answers"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-pass-prose">
          press <code>wrong?</code>. the answers take the line&rsquo;s place, and <code>wrong?</code> stays as the
          lead-in that closes them. choosing an answer closes them too, and focus goes back to <code>wrong?</code>, as
          it does on escape.
        </p>
        <ModePair>
          <InlineAnswersExample />
        </ModePair>
      </Section>
      <Section id="open" title="open">
        <p className="st-pass-prose">
          an answer that needs one more word asks for it there: <code>wrong day</code> stays as its lead-in, and its own
          answers follow the arrow. the second click of a double click counts for nothing, because the answers can land
          under the pointer.
        </p>
        <ModePair>
          <InlineAnswersOpen />
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-pass-prose">
          each answer is a 44 px box, and a second row sits a whole target below the first, so no two hit areas overlap.
          the row keeps to the line&rsquo;s first row, and the job&rsquo;s actions stay where they were.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="inline answers on a phone, light" height={1480}>
              <JobSheetAnswers />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="inline answers on a phone, dark" height={1480}>
              <JobSheetAnswers />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>InlineAnswers</code>
          </dt>
          <dd>
            holds the open state. its slot belongs to the parent, which holds the height. key it to the suggestion, so a
            new one starts closed. <code>open</code>, <code>defaultOpen</code> and <code>onOpenChange</code> are there
            for a ship that drives it.
          </dd>
          <dt>
            <code>InlineAnswersLine</code>
          </dt>
          <dd>the line the answers replace.</dd>
          <dt>
            <code>InlineAnswersTrigger</code>
          </dt>
          <dd>
            the word that opens and closes them, <code>wrong?</code> until you pass another.
          </dd>
          <dt>
            <code>InlineAnswersList</code>
          </dt>
          <dd>the answers, as a group named by the trigger.</dd>
          <dt>
            <code>InlineAnswer</code>
          </dt>
          <dd>
            one plain answer, a button. choosing it closes the answers unless <code>onClick</code> prevents default.
          </dd>
          <dt>
            <code>InlineAnswersAsk</code>
          </dt>
          <dd>
            an answer that asks one more question. <code>question</code> is its word, and its children are the
            question&rsquo;s own <code>InlineAnswer</code>s.
          </dd>
        </dl>
      </Section>
    </>
  );
}
