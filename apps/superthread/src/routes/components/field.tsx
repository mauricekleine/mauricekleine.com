import { createFileRoute } from "@tanstack/react-router";
import {
  FieldExample,
  FieldOnLayers,
  FieldOrientations,
  FieldParts,
  FieldsOnPhone,
  FieldStates,
} from "@/examples/field";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/field")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "orientations", title: "Orientations" },
      { id: "parts", title: "Parts" },
      { id: "layers", title: "On a layer" },
      { id: "states", title: "States" },
      { id: "phone", title: "Phone" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Field"
        lede="A label, control and supporting words kept together. Fieldsets group related choices, and errors lead with a bang square."
      >
        <InstallLine items={["field"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Edit the run name to see validation change with it. The description names the accepted format; the switch
          keeps its own label and description.
        </p>
        <ModePair className="st-e-wide">
          <FieldExample />
        </ModePair>
      </Section>
      <Section id="orientations" title="Orientations">
        <p className="st-e-copy">
          Vertical stacks label and control; horizontal keeps them in one row. Responsive follows the field group width,
          stacking below its medium container size. The narrow frame shows that change.
        </p>
        <ModePair className="st-e-wide">
          <FieldOrientations />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <p className="st-e-copy">
          The label legend uses interface type. Choice cards edge the checked field in foreground. A plain separator
          divides the parts, and an error list removes duplicate messages.
        </p>
        <ModePair className="st-e-wide">
          <FieldParts />
        </ModePair>
      </Section>
      <Section id="layers" title="On a layer">
        <p className="st-e-copy">
          A separator&rsquo;s words take the fill beneath them, so in a dialog or a sheet they sit on the layer&rsquo;s
          own fill, with no box. Each frame stands in for the window.
        </p>
        <ModePair className="st-e-wide">
          <FieldOnLayers />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          The label follows invalid and disabled states while the control owns its edge. Each error carries its glyph
          and names the next step.
        </p>
        <ModePair className="st-e-wide">
          <FieldStates />
        </ModePair>
      </Section>
      <Section id="phone" title="Phone">
        <p className="st-e-copy">
          At 600 px and below every control that takes text sets 16 px, so iOS Safari never zooms the page in on focus.
          A textarea sets 16 on 24 and still opens three lines tall. Labels and descriptions keep their steps. These
          frames have a 390 px viewport.
        </p>
        <ModePair light={<FieldsOnPhone mode="light" />} dark={<FieldsOnPhone mode="dark" />} />
      </Section>
    </>
  );
}
