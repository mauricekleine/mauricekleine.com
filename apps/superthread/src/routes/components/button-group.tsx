import { createFileRoute } from "@tanstack/react-router";
import { ButtonGroupExample, ButtonGroupParts, ButtonGroupLayout, ButtonGroupStates } from "@/examples/button-group";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/button-group")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "parts", title: "Parts" },
      { id: "orientation", title: "Orientation" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Button group"
        lede="Related actions on shared 1 px edges. The children keep their own button states and keyboard focus."
      >
        <InstallLine items={["button-group"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Add an Orbit run to the queue, then start it. The text addon follows the count; start becomes unavailable when
          the queue is empty.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupExample />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <p className="st-e-copy">
          A text addon prints at the default button height. A separator stretches along the row, and nested groups keep
          a gap between their action sets.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupParts />
        </ModePair>
      </Section>
      <Section id="orientation" title="Orientation">
        <p className="st-e-copy">
          Horizontal joins vertical edges. Vertical joins horizontal edges. Each child remains a separate action in the
          tab order.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupLayout />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          Each child draws its own hover, press and disabled state. The focused child rises above its neighbour so its
          outside ring stays visible.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
