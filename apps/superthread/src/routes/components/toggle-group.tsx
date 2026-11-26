import { createFileRoute } from "@tanstack/react-router";
import {
  ToggleGroupExample,
  ToggleGroupVariants,
  ToggleGroupSizes,
  ToggleGroupLayout,
  ToggleGroupStates,
} from "@/examples/toggle-group";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
export const Route = createFileRoute("/components/toggle-group")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "variants", title: "Variants" },
      { id: "sizes", title: "Sizes" },
      { id: "layout", title: "Layout" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="Toggle group"
        lede="Toggles that share a choice and, by default, a 1 px edge. The pressed item keeps all four foreground edges visible."
      >
        <InstallLine items={["toggle-group"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-e-copy">
          Choose one time view, or combine ship filters. Arrow keys move between items; Space changes the focused item.
        </p>
        <ModePair>
          <ToggleGroupExample />
        </ModePair>
      </Section>
      <Section id="variants" title="Variants">
        <p className="st-e-copy">
          Default and outline keep the standalone toggle looks. The group supplies the same variant to each item.
        </p>
        <ModePair>
          <ToggleGroupVariants />
        </ModePair>
      </Section>
      <Section id="sizes" title="Sizes">
        <p className="st-e-copy">The group supplies the small, default or large height to all its items.</p>
        <ModePair className="st-e-wide">
          <ToggleGroupSizes />
        </ModePair>
      </Section>
      <Section id="layout" title="Layout">
        <p className="st-e-copy">
          Spacing 0 joins the edges and puts focus inside. Positive spacing separates the items and restores the outside
          ring. Vertical groups join along their horizontal edges.
        </p>
        <ModePair>
          <ToggleGroupLayout />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-e-copy">
          The selected edge rises above its neighbour. Hover fills the other item, joined focus draws inside it, and
          disabled dims the labels.
        </p>
        <ModePair className="st-e-wide">
          <ToggleGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
