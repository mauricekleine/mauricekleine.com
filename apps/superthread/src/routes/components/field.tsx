import { createFileRoute } from "@tanstack/react-router";
import { FieldExample, FieldOrientations, FieldParts, FieldsOnPhone, FieldStates } from "@/examples/field";
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
      { id: "phone", title: "phone" },
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
          the label legend uses interface type. choice cards edge the checked field in foreground. a plain separator
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
      <Section id="phone" title="phone">
        <p className="st-e-copy">
          at 600 px and below every control that takes text sets 16 px, so ios safari never zooms the page in on focus.
          a textarea sets 16 on 24 and still opens three lines tall. labels and descriptions keep their steps. these
          frames have a 390 px viewport.
        </p>
        <ModePair light={<FieldsOnPhone mode="light" />} dark={<FieldsOnPhone mode="dark" />} />
      </Section>
    </>
  );
}
