import { createFileRoute } from "@tanstack/react-router";
import { TooltipExample, TooltipPrinted } from "@/examples/tooltip";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/tooltip")({
  staticData: {
    sections: [
      { id: "modes", title: "In both modes" },
      { id: "try", title: "Try it" },
      { id: "upstream", title: "Upstream" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Tooltip"
        lede="A short label over a control, shown on hover and keyboard focus. Give each icon button one, with the same words in its aria-label."
      >
        <InstallLine items={["tooltip"]} />
      </PageHead>
      <Section id="modes" title="In both modes">
        <p className="st-pass-prose">
          Each pane prints the tooltip open over the search button: the pane&rsquo;s ink as its ground, 4&nbsp;px above
          the control it names.
        </p>
        <ModePair>
          <TooltipPrinted />
        </ModePair>
      </Section>
      <Section id="try" title="Try it">
        <ModePair light={<TooltipExample mode="light" />} dark={<TooltipExample mode="dark" />} />
      </Section>
      <Section id="upstream" title="Upstream">
        <p className="st-pass-prose">
          Base-nova&rsquo;s tooltip on Base UI. Superthread changes its imports and squares the arrow, which upstream
          rounds by 2&nbsp;px. <code>TooltipProvider</code> opens a group&rsquo;s tooltips with no delay, and the
          collapsed sidebar uses the tooltip to name its buttons. Like the sheet, it renders at the end of the page and
          takes the page&rsquo;s mode; pass another to its portal with{" "}
          <code>portalProps=&#123;&#123; className: &quot;dark&quot; &#125;&#125;</code>.
        </p>
      </Section>
    </>
  );
}
