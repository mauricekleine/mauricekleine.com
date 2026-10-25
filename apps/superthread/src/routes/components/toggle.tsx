import { createFileRoute } from "@tanstack/react-router";
import { ToggleExample, ToggleVariants, ToggleSizes, ToggleStates } from "@/examples/toggle";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/toggle")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "variants", title: "variants" },
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
        title="toggle"
        lede="a button that remembers whether it is pressed. the current state is boxed in the house ink on the accent fill."
      >
        <InstallLine items={["toggle"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          pin an orbit run to keep it at the top. click, enter or space changes the pressed state.
        </p>
        <ModePair>
          <ToggleExample />
        </ModePair>
      </Section>
      <Section id="variants" title="variants">
        <p className="st-e-copy">
          default rests without a visible edge. outline keeps the input edge. each pair shows rest beside pressed.
        </p>
        <ModePair>
          <ToggleVariants />
        </ModePair>
      </Section>
      <Section id="sizes" title="sizes">
        <p className="st-e-copy">small, default and large match the button heights: 32, 40 and 48 px.</p>
        <ModePair className="st-e-wide">
          <ToggleSizes />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          hover changes the fill, focus draws an outside ring, and pressed holds its box. invalid uses the error edge;
          disabled dims the label.
        </p>
        <ModePair className="st-e-wide">
          <ToggleStates />
        </ModePair>
      </Section>
    </>
  );
}
