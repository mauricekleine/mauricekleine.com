import { createFileRoute } from "@tanstack/react-router";
import { RailLive, RailStates, RailWithNav } from "@/examples/fleet-rail";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/fleet-rail")({
  staticData: {
    sections: [
      { id: "modes", title: "in both modes" },
      { id: "nav", title: "with a ship's nav" },
      { id: "props", title: "props" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="fleet rail"
        lede="the fleet in one column on the deep ground: every ship's mark at 32 px, the ship you are in boxed in the house ink. point at a cell, or tab to it, to read its name."
      >
        <InstallLine items={["fleet-rail"]} />
      </PageHead>

      <Section id="modes" title="in both modes">
        <p className="st-c-copy">
          the ground keeps the page&rsquo;s mode, and the rail on it prints in the dark palette in both. a cell under
          the pointer or keyboard focus inverts, swaps to its light mark and shows the ship&rsquo;s name in a tab joined
          to it. with reduced motion the tab shows without the slide.
        </p>
        <p className="st-c-copy">
          a ship with no link prints at half and takes no hover. the last cell is the mode toggle: one choice, shared by
          every ship. above 900 px the rail and the ship&rsquo;s nav stay put while the panel scrolls; at 900 px and
          below the rail turns into a bar across the top, and the name drops under the cell.
        </p>
        <ModePair className="st-c-stack">
          <div className="st-c-rails">
            <figure className="st-c-figure">
              <figcaption className="type-meta">rest · try it</figcaption>
              <RailLive />
            </figure>
            <figure className="st-c-figure st-c-column-only">
              <figcaption className="type-meta">hover quanta · focus artifacts · trisys unlinked</figcaption>
              <RailStates hover="quanta" focus="artifacts" />
            </figure>
            <figure className="st-c-figure st-c-bar-only">
              <figcaption className="type-meta">hover quanta · trisys unlinked</figcaption>
              <RailStates hover="quanta" />
            </figure>
            <figure className="st-c-figure st-c-bar-only">
              <figcaption className="type-meta">focus artifacts · trisys unlinked</figcaption>
              <RailStates focus="artifacts" />
            </figure>
          </div>
        </ModePair>
      </Section>

      <Section id="nav" title="with a ship's nav">
        <p className="st-c-copy">
          pass the ship&rsquo;s nav as <code>sidebar</code> and it prints beside the rail on the same ground, 150 px
          wide. it renders inside the sidebar item&rsquo;s <code>Sidebar</code>, so the sidebar&rsquo;s parts go
          straight in. on the bar, the nav sits under it.
        </p>
        <ModePair>
          <RailWithNav />
        </ModePair>
      </Section>

      <Section id="props" title="props">
        <dl className="st-c-parts">
          <dt>
            <code>current</code>
          </dt>
          <dd>the id of the ship this surface is. its cell is boxed.</dd>
          <dt>
            <code>hrefs</code>
          </dt>
          <dd>
            where each cell goes, by ship id, and <code>home</code> for the superthread mark at the top. a ship left out
            links to its fleet url, and home to superthread.mauricekleine.com; pass <code>&quot;/&quot;</code> for your
            own ship. <code>null</code>, or a ship with no url, is a disabled cell.
          </dd>
          <dt>
            <code>markBase</code>
          </dt>
          <dd>
            the folder that holds <code>&lt;id&gt;/&lt;id&gt;.svg</code> and <code>&lt;id&gt;/&lt;id&gt;-dark.svg</code>{" "}
            for every ship. it defaults to the marks on superthread.mauricekleine.com; this site serves its own and
            passes <code>&quot;/marks&quot;</code>.
          </dd>
          <dt>
            <code>label</code>
          </dt>
          <dd>
            the rail&rsquo;s accessible name, <code>fleet</code> by default.
          </dd>
          <dt>
            <code>sidebar</code>
          </dt>
          <dd>the ship&rsquo;s own nav, printed beside the rail.</dd>
          <dt>
            <code>children</code>
          </dt>
          <dd>the page beside the rail and its nav, on the same ground.</dd>
        </dl>
      </Section>
    </>
  );
}
