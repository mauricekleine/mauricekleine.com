import { createFileRoute } from "@tanstack/react-router";
import { FieldExample, FieldOrientations, FieldParts, FieldStates } from "@/examples/field";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/field")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "orientations", title: "orientations" },
      { id: "parts", title: "parts" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="field"
        lede="a label, control and supporting words kept together. fieldsets group related choices, and errors lead with a bang square."
      >
        <InstallLine items={["field"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          edit the run name to see validation change with it. the description names the accepted format; the switch
          keeps its own label and description.
        </p>
        <ModePair className="st-e-wide">
          <FieldExample />
        </ModePair>
      </Section>
      <Section id="orientations" title="orientations">
        <p className="st-e-copy">
          vertical stacks label and control; horizontal keeps them in one row. responsive follows the field group width,
          stacking below its medium container size. the narrow frame shows that change.
        </p>
        <ModePair className="st-e-wide">
          <FieldOrientations />
        </ModePair>
      </Section>
      <Section id="parts" title="parts">
        <p className="st-e-copy">
          the label legend uses interface type. choice cards box the checked field in the house ink. a plain separator
          divides the parts, and an error list removes duplicate messages.
        </p>
        <ModePair className="st-e-wide">
          <FieldParts />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          the label follows invalid and disabled states while the control owns its edge. each error carries its glyph
          and names the next step.
        </p>
        <ModePair className="st-e-wide">
          <FieldStates />
        </ModePair>
      </Section>
    </>
  );
}
