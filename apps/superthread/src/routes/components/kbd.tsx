import { createFileRoute } from "@tanstack/react-router";
import { KbdExample, KbdParts, KbdContext } from "@/examples/kbd";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/kbd")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "parts", title: "parts" },
      { id: "context", title: "context" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="kbd"
        lede="a small keycap for a keyboard shortcut. quiet stock and a thin edge hold 11 px mono words."
      >
        <InstallLine items={["kbd"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          edit a synthetic orbit run name, then press ctrl enter in the form to save it. the save button performs the
          same action.
        </p>
        <ModePair>
          <KbdExample />
        </ModePair>
      </Section>
      <Section id="parts" title="parts">
        <p className="st-e-copy">
          a keycap is 20 px high and at least 20 px wide. a group leaves 4 px between the individual keys. keycaps
          describe a shortcut and do not take focus.
        </p>
        <ModePair>
          <KbdParts />
        </ModePair>
      </Section>
      <Section id="context" title="context">
        <p className="st-e-copy">
          inside a tooltip the keycaps invert with opaque role inks. the tooltip is held open here so both modes show
          the keycap on its actual surface.
        </p>
        <ModePair>
          <KbdContext />
        </ModePair>
      </Section>
    </>
  );
}
