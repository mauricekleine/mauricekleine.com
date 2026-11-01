import { createFileRoute } from "@tanstack/react-router";
import { RadioGroupExample, RadioGroupStates } from "@/examples/radio-group";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/radio-group")({
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
        title="radio group"
        lede="one choice from a named set. an 18 px square holds an 8 px foreground square when chosen."
      >
        <InstallLine items={["radio-group"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          pick the ship that new runs open in. tab enters the group; the arrow keys move the choice and space selects
          it.
        </p>
        <ModePair>
          <RadioGroupExample />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          each choice keeps the input edge at rest and on hover. chosen changes the edge and adds the square; keyboard
          focus draws outside it. invalid uses the error edge.
        </p>
        <ModePair className="st-e-wide">
          <RadioGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
