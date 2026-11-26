import { createFileRoute } from "@tanstack/react-router";
import { RailLive, RailStates, RailWithNav } from "@/examples/fleet-rail";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/fleet-rail")({
  staticData: {
    sections: [
      { id: "modes", title: "In both modes" },
      { id: "nav", title: "With a ship's nav" },
      { id: "props", title: "Props" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Fleet rail"
        lede="The fleet in one column on the deep ground: every ship's mark at 32 px, the ship you are in edged, with a plum corner mark. Point at a cell, or tab to it, to read its name."
      >
        <InstallLine items={["fleet-rail"]} />
      </PageHead>

      <Section id="modes" title="In both modes">
        <p className="st-c-copy">
          The ground keeps the page&rsquo;s mode, and the rail on it prints in the dark palette in both. A cell under
          the pointer or keyboard focus inverts, swaps to its light mark and shows the ship&rsquo;s name in a tab joined
          to it. With reduced motion the tab shows without the slide.
        </p>
        <p className="st-c-copy">
          A ship with no link prints at half and takes no hover. The last cell is the mode toggle: one choice, shared by
          every ship. Above 900 px the rail and the ship&rsquo;s nav stay put while the panel scrolls; at 900 px and
          below the rail turns into a bar across the top, and the name drops under the cell.
        </p>
        <ModePair className="st-c-stack">
          <div className="st-c-rails">
            <figure className="st-c-figure">
              <figcaption className="type-meta">Rest · try it</figcaption>
              <RailLive />
            </figure>
            <figure className="st-c-figure st-c-column-only">
              <figcaption className="type-meta">Hover Quanta · focus Artifacts · Trisys unlinked</figcaption>
              <RailStates hover="quanta" focus="artifacts" />
            </figure>
            <figure className="st-c-figure st-c-bar-only">
              <figcaption className="type-meta">Hover Quanta · Trisys unlinked</figcaption>
              <RailStates hover="quanta" />
            </figure>
            <figure className="st-c-figure st-c-bar-only">
              <figcaption className="type-meta">Focus Artifacts · Trisys unlinked</figcaption>
              <RailStates focus="artifacts" />
            </figure>
          </div>
        </ModePair>
      </Section>

      <Section id="nav" title="With a ship's nav">
        <p className="st-c-copy">
          Pass the ship&rsquo;s nav as <code>sidebar</code> and it prints beside the rail on the same ground, 150 px
          wide. It renders inside the sidebar item&rsquo;s <code>Sidebar</code>, so the sidebar&rsquo;s parts go
          straight in. On the bar, the nav sits under it.
        </p>
        <ModePair className="st-c-stack">
          <RailWithNav />
        </ModePair>
      </Section>

      <Section id="props" title="Props">
        <dl className="st-c-parts">
          <dt>
            <code>current</code>
          </dt>
          <dd>The ID of the ship this surface is. Its cell takes the edge and the plum corner mark.</dd>
          <dt>
            <code>hrefs</code>
          </dt>
          <dd>
            Where each cell goes, by ship ID, and <code>home</code> for the Superthread mark at the top. A ship left out
            links to its fleet URL, and home to superthread.mauricekleine.com; pass <code>&quot;/&quot;</code> for your
            own ship. <code>null</code>, or a ship with no URL, is a disabled cell.
          </dd>
          <dt>
            <code>markBase</code>
          </dt>
          <dd>
            The folder that holds <code>&lt;id&gt;/&lt;id&gt;.svg</code> and <code>&lt;id&gt;/&lt;id&gt;-dark.svg</code>{" "}
            for every ship. It defaults to the marks on superthread.mauricekleine.com; this site serves its own and
            passes <code>&quot;/marks&quot;</code>.
          </dd>
          <dt>
            <code>label</code>
          </dt>
          <dd>
            The rail&rsquo;s accessible name, <code>fleet</code> by default.
          </dd>
          <dt>
            <code>skipLink</code>
          </dt>
          <dd>
            The first stop on the page, <code>skip to content</code> to <code>#main</code>, shown on focus. Pass{" "}
            <code>false</code> for a rail embedded in a page that owns its own.
          </dd>
          <dt>
            <code>sidebar</code>
          </dt>
          <dd>The ship&rsquo;s own nav, printed beside the rail.</dd>
          <dt>
            <code>children</code>
          </dt>
          <dd>The page beside the rail and its nav, on the same ground.</dd>
        </dl>
      </Section>
    </>
  );
}
