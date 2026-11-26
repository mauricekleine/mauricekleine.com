import { createFileRoute } from "@tanstack/react-router";
import { SwitchExample, SwitchSizes, SwitchStates } from "@/examples/switch";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/switch")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "sizes", title: "Sizes" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Switch"
        lede="A square track and a square thumb. On fills the track with foreground and moves the thumb to the end."
      >
        <InstallLine items={["switch"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Turn completion notices on or off. The words belong to the label, so clicking them changes the switch too.
        </p>
        <ModePair>
          <SwitchExample />
        </ModePair>
      </Section>
      <Section id="sizes" title="Sizes">
        <p className="st-e-copy">
          The default track is 32 by 18 px; small is 24 by 14 px. Both keep a larger pointer target around the track.
        </p>
        <ModePair className="st-e-wide">
          <SwitchSizes />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          Off keeps the input edge. On is solid, hover changes the fill, and keyboard focus draws the house ring outside
          the track. Disabled keeps the thumb in its current position.
        </p>
        <ModePair className="st-e-wide">
          <SwitchStates />
        </ModePair>
      </Section>
    </>
  );
}
