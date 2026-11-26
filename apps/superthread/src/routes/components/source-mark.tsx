import { createFileRoute } from "@tanstack/react-router";
import { SourceMarkFrames, SourceMarksExample } from "@/examples/source-mark";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/source-mark")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "frames", title: "Its two frames" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Source mark"
        lede="The frame a third-party mark prints in: 96 px, one ink, and a second frame on hover."
      >
        <InstallLine items={["source-mark"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-pass-prose">
          A mark is a notched 16-cell tile with its drawing knocked out, so the surface shows through and one ink prints
          the whole mark, never the owner&rsquo;s colours and never a spot. On a phone it drops to 80 px, which keeps
          the cells on whole pixels. The drawings here are fictional: a ship keeps its own.
        </p>
        <ModePair>
          <SourceMarksExample />
        </ModePair>
      </Section>
      <Section id="frames" title="Its two frames">
        <p className="st-pass-prose">
          The second frame cuts in, with no transition, while the pointer or the focus is on the mark or in a linked
          tile. <code>held</code> keeps it up, for a moment that settles on it.
        </p>
        <ModePair>
          <SourceMarkFrames />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>SourceMark</code>
          </dt>
          <dd>
            The frame. <code>d</code> and <code>hover</code> are the drawing&rsquo;s two frames as path data, each made
            of whole cells that never overlap and stay inside the tile. <code>held</code> keeps the second frame up. The
            words beside it carry its meaning, so it&rsquo;s hidden from readers unless it takes an{" "}
            <code>aria-label</code>.
          </dd>
          <dt>A tile</dt>
          <dd>
            Set it in <code>ItemCardMedia</code> on a tile in{" "}
            <a href="/compositions/item-cards#tiles">
              <code>item-cards</code>
            </a>
            , and a tile whose title links drives its second frame from anywhere in it.
          </dd>
        </dl>
      </Section>
    </>
  );
}
