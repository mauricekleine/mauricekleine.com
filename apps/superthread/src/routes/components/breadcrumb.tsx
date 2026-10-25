import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbExample, BreadcrumbStates, BreadcrumbVariants } from "@/examples/breadcrumb";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/breadcrumb")({
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
        title="breadcrumb"
        lede="a wrapping path from the wider view to the current page. muted links lead back; the current page keeps foreground ink and names its position."
      >
        <InstallLine items={["breadcrumb"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          follow the links back to the overview or the component list. the current page is the last part of the path.
        </p>
        <ModePair className="st-gl-pair">
          <BreadcrumbExample />
        </ModePair>
      </Section>
      <Section id="variants" title="variants">
        <p className="st-gl-copy">
          collapse a longer path with the more glyph, or pass a different separator. the omitted stretch links to the
          component list.
        </p>
        <ModePair className="st-gl-pair">
          <BreadcrumbVariants />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          links change ink on hover and show the house ring on keyboard focus. the current page is a label, with
          aria-current set to page.
        </p>
        <ModePair className="st-gl-pair">
          <BreadcrumbStates />
        </ModePair>
      </Section>
    </>
  );
}
