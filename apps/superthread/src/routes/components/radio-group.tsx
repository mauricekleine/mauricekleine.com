import { createFileRoute } from "@tanstack/react-router";
import { RadioGroupExample, RadioGroupStates } from "@/examples/radio-group";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/radio-group")({
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
        title="Radio group"
        lede="One choice from a named set. An 18 px square holds an 8 px foreground square when chosen."
      >
        <InstallLine items={["radio-group"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Pick the ship that new runs open in. Tab enters the group; the arrow keys move the choice and Space selects
          it.
        </p>
        <ModePair>
          <RadioGroupExample />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          Each choice keeps the input edge at rest and on hover. Chosen changes the edge and adds the square; keyboard
          focus draws outside it. Invalid uses the error edge.
        </p>
        <ModePair className="st-e-wide">
          <RadioGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
