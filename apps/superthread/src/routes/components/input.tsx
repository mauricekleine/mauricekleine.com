import { createFileRoute } from "@tanstack/react-router";
import { InputExample, InputStates } from "@/examples/input";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/input")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Input"
        lede="One line of text in a box with a 1 px edge. Focus thickens that edge to 2 px inside the box, so the text never moves."
      >
        <InstallLine items={["input"]} />
      </PageHead>

      <Section id="example" title="Example">
        <p className="st-a-copy">
          The label sits above the box and the hint below it. Mark a field <code>aria-invalid</code> and its edge, its
          focus and its caret take the error ink. The slugs check themselves as you type.
        </p>
        <ModePair className="st-a-stack">
          <InputExample />
        </ModePair>
      </Section>

      <Section id="states" title="States">
        <p className="st-a-copy">
          One frame in every state: 1 px at rest, and 2 px in the house ink while the text has focus, with the caret in
          the same ink. An invalid field swaps the house ink for the error ink. A disabled field skips the tab order,
          keeps a flat fill and screens its edge back.
        </p>
        <ModePair className="st-a-stack">
          <InputStates />
        </ModePair>
        <Caption detail="disabled" />
      </Section>
    </>
  );
}
