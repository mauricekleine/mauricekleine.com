import { createFileRoute } from "@tanstack/react-router";
import { SheetExample, SheetPrinted } from "@/examples/sheet";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/sheet")({
  staticData: {
    sections: [
      { id: "modes", title: "in both modes" },
      { id: "try", title: "try it" },
      { id: "upstream", title: "upstream" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="sheet"
        lede="a panel that slides in from an edge of the window and keeps focus until it closes. on a phone, this site's menu is a sheet."
      >
        <InstallLine items={["sheet"]} />
      </PageHead>
      <Section id="modes" title="in both modes">
        <p className="st-pass-prose">
          each frame below stands in for the window, with the sheet open on its right edge. it takes three quarters of
          the width, at most 384&nbsp;px from 640&nbsp;px up.
        </p>
        <ModePair className="st-pass-stacked">
          <SheetPrinted />
        </ModePair>
      </Section>
      <Section id="try" title="try it">
        <ModePair light={<SheetExample mode="light" />} dark={<SheetExample mode="dark" />} />
      </Section>
      <Section id="upstream" title="upstream">
        <p className="st-pass-prose">
          base-nova&rsquo;s sheet, built on base ui&rsquo;s dialog. superthread changes its imports and draws the close
          button with the close glyph, labelled in lowercase. a few classes change too. the sheet sits on the sheet lift
          over the scrim, with no blur, as the dialog does. its title takes the display face, and only its opacity and
          position animate.
        </p>
        <p className="st-pass-prose">
          the sheet renders at the end of the page, so it takes the page&rsquo;s mode. to give it another, pass the mode
          to its portal, as each pane under try it does:{" "}
          <code>portalProps=&#123;&#123; className: &quot;dark&quot; &#125;&#125;</code>. a <code>container</code> there
          renders it somewhere else; the frames above hold their sheets that way.
        </p>
      </Section>
    </>
  );
}
