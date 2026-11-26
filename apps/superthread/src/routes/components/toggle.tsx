import { createFileRoute } from "@tanstack/react-router";
import { ToggleExample, ToggleVariants, ToggleSizes, ToggleStates } from "@/examples/toggle";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/toggle")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "variants", title: "Variants" },
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
        title="Toggle"
        lede="A button that remembers whether it is pressed. Pressed prints a foreground edge and a tick, and the words stay put."
      >
        <InstallLine items={["toggle"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Pin an Orbit run to keep it at the top. Click, Enter or Space changes the pressed state.
        </p>
        <ModePair>
          <ToggleExample />
        </ModePair>
      </Section>
      <Section id="variants" title="Variants">
        <p className="st-e-copy">
          Default rests without a visible edge. Outline keeps the input edge. Each pair shows rest beside pressed.
        </p>
        <ModePair>
          <ToggleVariants />
        </ModePair>
      </Section>
      <Section id="sizes" title="Sizes">
        <p className="st-e-copy">Small, default and large match the button heights: 32, 40 and 48 px.</p>
        <ModePair className="st-e-wide">
          <ToggleSizes />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          Hover changes the fill, focus draws an outside ring, and pressed holds its box. Invalid uses the error edge;
          disabled dims the label.
        </p>
        <ModePair className="st-e-wide">
          <ToggleStates />
        </ModePair>
      </Section>
    </>
  );
}
