import { createFileRoute } from "@tanstack/react-router";
import { SliderExample, SliderVariants, SliderStates } from "@/examples/slider";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/slider")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "variants", title: "variants" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="slider"
        lede="a flat foreground range inside an 8 px ruled track. square thumbs set one value or the two ends of a range."
      >
        <InstallLine items={["slider"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          set how many workers an orbit run can use. drag the thumb or use the arrow keys; home and end reach the
          limits.
        </p>
        <ModePair>
          <SliderExample />
        </ModePair>
      </Section>
      <Section id="variants" title="variants">
        <p className="st-e-copy">
          one value gives one thumb. an array gives one per bound, and a vertical track keeps the same dimensions.
        </p>
        <ModePair>
          <SliderVariants />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          the 16 px thumb takes the control hover fill on hover and while dragging. keyboard focus draws the house ring
          outside it. at either limit, the thumb stays inside the track.
        </p>
        <ModePair className="st-e-wide">
          <SliderStates />
        </ModePair>
      </Section>
    </>
  );
}
