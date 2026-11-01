import { createFileRoute } from "@tanstack/react-router";
import { SwitchExample, SwitchSizes, SwitchStates } from "@/examples/switch";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/switch")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "sizes", title: "sizes" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="switch"
        lede="a square track and a square thumb. on fills the track with foreground and moves the thumb to the end."
      >
        <InstallLine items={["switch"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          turn completion notices on or off. the words belong to the label, so clicking them changes the switch too.
        </p>
        <ModePair>
          <SwitchExample />
        </ModePair>
      </Section>
      <Section id="sizes" title="sizes">
        <p className="st-e-copy">
          the default track is 32 by 18 px; small is 24 by 14 px. both keep a larger pointer target around the track.
        </p>
        <ModePair className="st-e-wide">
          <SwitchSizes />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          off keeps the input edge. on is solid, hover changes the fill, and keyboard focus draws the house ring outside
          the track. disabled keeps the thumb in its current position.
        </p>
        <ModePair className="st-e-wide">
          <SwitchStates />
        </ModePair>
      </Section>
    </>
  );
}
