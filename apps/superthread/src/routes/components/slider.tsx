import { createFileRoute } from "@tanstack/react-router";
import { SliderExample, SliderVariants, SliderStates } from "@/examples/slider";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/slider")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "variants", title: "Variants" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Slider"
        lede="A flat foreground range inside an 8 px ruled track. Square thumbs set one value or the two ends of a range."
      >
        <InstallLine items={["slider"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Set how many workers an Orbit run can use. Drag the thumb or use the arrow keys; Home and End reach the
          limits.
        </p>
        <ModePair>
          <SliderExample />
        </ModePair>
      </Section>
      <Section id="variants" title="Variants">
        <p className="st-e-copy">
          One value gives one thumb. An array gives one per bound, and a vertical track keeps the same dimensions.
        </p>
        <ModePair>
          <SliderVariants />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          The 16 px thumb takes the control hover fill on hover and while dragging. Keyboard focus draws the house ring
          outside it. At either limit, the thumb stays inside the track.
        </p>
        <ModePair className="st-e-wide">
          <SliderStates />
        </ModePair>
      </Section>
    </>
  );
}
