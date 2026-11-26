import { createFileRoute } from "@tanstack/react-router";
import { KbdExample, KbdParts, KbdContext } from "@/examples/kbd";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/kbd")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "parts", title: "Parts" },
      { id: "context", title: "Context" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Kbd"
        lede="A small keycap for a keyboard shortcut. Quiet stock and a thin edge hold 11 px mono words."
      >
        <InstallLine items={["kbd"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Edit a synthetic Orbit run name, then press Ctrl Enter in the form to save it. The Save button performs the
          same action.
        </p>
        <ModePair>
          <KbdExample />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <p className="st-e-copy">
          A keycap is 20 px high and at least 20 px wide. A group leaves 4 px between the individual keys. Keycaps
          describe a shortcut and do not take focus.
        </p>
        <ModePair>
          <KbdParts />
        </ModePair>
      </Section>
      <Section id="context" title="Context">
        <p className="st-e-copy">
          Inside a tooltip the keycaps invert with opaque role inks. The tooltip is held open here so both modes show
          the keycap on its actual surface.
        </p>
        <ModePair>
          <KbdContext />
        </ModePair>
      </Section>
    </>
  );
}
