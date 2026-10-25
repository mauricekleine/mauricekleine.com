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
      { id: "example", title: "example" },
      { id: "variants", title: "variants" },
      { id: "sizes", title: "sizes" },
      { id: "layout", title: "layout" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});
function Page() {
  return (
    <>
      <PageHead
        title="toggle group"
        lede="toggles that share a choice and, by default, a 1 px edge. the pressed item keeps all four house edges visible."
      >
        <InstallLine items={["toggle-group"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-e-copy">
          choose one time view, or combine ship filters. arrow keys move between items; space changes the focused item.
        </p>
        <ModePair>
          <ToggleGroupExample />
        </ModePair>
      </Section>
      <Section id="variants" title="variants">
        <p className="st-e-copy">
          default and outline keep the standalone toggle looks. the group supplies the same variant to each item.
        </p>
        <ModePair>
          <ToggleGroupVariants />
        </ModePair>
      </Section>
      <Section id="sizes" title="sizes">
        <p className="st-e-copy">the group supplies the small, default or large height to all its items.</p>
        <ModePair className="st-e-wide">
          <ToggleGroupSizes />
        </ModePair>
      </Section>
      <Section id="layout" title="layout">
        <p className="st-e-copy">
          spacing 0 joins the edges and puts focus inside. positive spacing separates the items and restores the outside
          ring. vertical groups join along their horizontal edges.
        </p>
        <ModePair>
          <ToggleGroupLayout />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-e-copy">
          the selected edge rises above its neighbour. hover fills the other item, joined focus draws inside it, and
          disabled dims the labels.
        </p>
        <ModePair className="st-e-wide">
          <ToggleGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
