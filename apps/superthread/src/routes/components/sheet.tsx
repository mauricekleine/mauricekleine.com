import { createFileRoute } from "@tanstack/react-router";
import { SheetExample, SheetPrinted } from "@/examples/sheet";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/sheet")({
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
        title="Sheet"
        lede="A panel that slides in from an edge of the window and keeps focus until it closes. On a phone, this site's menu is a sheet."
      >
        <InstallLine items={["sheet"]} />
      </PageHead>
      <Section id="modes" title="In both modes">
        <p className="st-pass-prose">
          Each frame below stands in for the window, with the sheet open on its right edge. It takes three quarters of
          the width, at most 384&nbsp;px from 640&nbsp;px up.
        </p>
        <ModePair className="st-pass-stacked">
          <SheetPrinted />
        </ModePair>
      </Section>
      <Section id="try" title="Try it">
        <ModePair light={<SheetExample mode="light" />} dark={<SheetExample mode="dark" />} />
      </Section>
      <Section id="upstream" title="Upstream">
        <p className="st-pass-prose">
          Base-nova&rsquo;s sheet, built on Base UI&rsquo;s dialog. Superthread changes its imports and draws the close
          button with the close glyph. A few classes change too. The sheet sits on the sheet lift over the scrim, with
          no blur, and names its fill as <code>--surface</code>, so a field separator&rsquo;s words on it print no box,
          as the dialog does. Its title takes the display face, and only its opacity and position animate.
        </p>
        <p className="st-pass-prose">
          The sheet renders at the end of the page, so it takes the page&rsquo;s mode. To give it another, pass the mode
          to its portal, as each pane under Try it does:{" "}
          <code>portalProps=&#123;&#123; className: &quot;dark&quot; &#125;&#125;</code>. A <code>container</code> there
          renders it somewhere else; the frames above hold their sheets that way.
        </p>
      </Section>
    </>
  );
}
