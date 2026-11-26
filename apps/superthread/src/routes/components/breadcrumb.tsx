import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbExample, BreadcrumbStates, BreadcrumbVariants } from "@/examples/breadcrumb";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/breadcrumb")({
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
        title="Breadcrumb"
        lede="A wrapping path from the wider view to the current page. Muted links lead back; the current page keeps foreground ink and names its position."
      >
        <InstallLine items={["breadcrumb"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Follow the links back to the overview or the component list. The current page is the last part of the path.
        </p>
        <ModePair className="st-gl-pair">
          <BreadcrumbExample />
        </ModePair>
      </Section>
      <Section id="variants" title="Variants">
        <p className="st-gl-copy">
          Collapse a longer path with the more glyph, or pass a different separator. The omitted stretch links to the
          component list.
        </p>
        <ModePair className="st-gl-pair">
          <BreadcrumbVariants />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          Links change ink on hover and show the house ring on keyboard focus. The current page is a label, with
          aria-current set to page.
        </p>
        <ModePair className="st-gl-pair">
          <BreadcrumbStates />
        </ModePair>
      </Section>
    </>
  );
}
