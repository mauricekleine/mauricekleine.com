import { createFileRoute } from "@tanstack/react-router";
import { ButtonGroupExample, ButtonGroupParts, ButtonGroupLayout, ButtonGroupStates } from "@/examples/button-group";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/button-group")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "parts", title: "parts" },
      { id: "orientation", title: "orientation" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="button group"
        lede="related actions on shared 1 px edges. the children keep their own button states and keyboard focus."
      >
        <InstallLine items={["button-group"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          add an orbit run to the queue, then start it. the text addon follows the count; start becomes unavailable when
          the queue is empty.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupExample />
        </ModePair>
      </Section>
      <Section id="parts" title="parts">
        <p className="st-e-copy">
          a text addon prints at the default button height. a separator stretches along the row, and nested groups keep
          a gap between their action sets.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupParts />
        </ModePair>
      </Section>
      <Section id="orientation" title="orientation">
        <p className="st-e-copy">
          horizontal joins vertical edges. vertical joins horizontal edges. each child remains a separate action in the
          tab order.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupLayout />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          each child draws its own hover, press and disabled state. the focused child rises above its neighbour so its
          outside ring stays visible.
        </p>
        <ModePair className="st-e-wide">
          <ButtonGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
