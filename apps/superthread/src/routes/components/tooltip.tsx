import { createFileRoute } from "@tanstack/react-router";
import { TooltipExample } from "@/examples/tooltip";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/tooltip")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "upstream", title: "upstream" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="tooltip"
        lede="a short label over a control, shown on hover and keyboard focus. give each icon button one, with the same words in its aria-label."
      >
        <InstallLine items={["tooltip"]} />
      </PageHead>
      <Section id="example" title="example">
        <ModePair light={<TooltipExample mode="light" />} dark={<TooltipExample mode="dark" />} />
      </Section>
      <Section id="upstream" title="upstream">
        <p className="st-pass-prose">
          base-nova&rsquo;s tooltip on base ui, with only its imports changed. <code>TooltipProvider</code> opens a
          group&rsquo;s tooltips with no delay, and the collapsed sidebar uses the tooltip to name its buttons. like the
          sheet, it renders at the end of the page and takes the page&rsquo;s mode unless you pass one in{" "}
          <code>className</code>.
        </p>
      </Section>
    </>
  );
}
