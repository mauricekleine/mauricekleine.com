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
      { id: "example", title: "example" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="input"
        lede="one line of text in a box with a 1 px edge. focus thickens that edge to 2 px inside the box, so the text never moves."
      >
        <InstallLine items={["input"]} />
      </PageHead>

      <Section id="example" title="example">
        <p className="st-a-copy">
          the label sits above the box and the hint below it. mark a field <code>aria-invalid</code> and its edge, its
          focus and its caret take the error ink. the slugs check themselves as you type. a disabled field skips the tab
          order, keeps a flat fill and screens its edge back.
        </p>
        <ModePair className="st-a-stack">
          <InputExample />
        </ModePair>
        <Caption detail="disabled" />
      </Section>

      <Section id="states" title="states">
        <p className="st-a-copy">
          one frame in every state: 1 px at rest, and 2 px in the house ink while the text has focus, with the caret in
          the same ink. an invalid field swaps the house ink for the error ink.
        </p>
        <ModePair className="st-a-stack">
          <InputStates />
        </ModePair>
      </Section>
    </>
  );
}
