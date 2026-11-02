import { createFileRoute } from "@tanstack/react-router";
import { SourceMarkFrames, SourceMarksExample } from "@/examples/source-mark";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/source-mark")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "frames", title: "its two frames" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="source mark"
        lede="the frame a third-party mark prints in: 96 px, one ink, and a second frame on hover."
      >
        <InstallLine items={["source-mark"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-pass-prose">
          a mark is a notched 16-cell tile with its drawing knocked out, so the surface shows through and one ink prints
          the whole mark, never the owner&rsquo;s colours and never a spot. on a phone it drops to 80 px, which keeps
          the cells on whole pixels. the drawings here are fictional: a ship keeps its own.
        </p>
        <ModePair>
          <SourceMarksExample />
        </ModePair>
      </Section>
      <Section id="frames" title="its two frames">
        <p className="st-pass-prose">
          the second frame cuts in, with no transition, while the pointer or the focus is on the mark or in its tile.{" "}
          <code>held</code> keeps it up, for a moment that settles on it.
        </p>
        <ModePair>
          <SourceMarkFrames />
        </ModePair>
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>SourceMark</code>
          </dt>
          <dd>
            the frame. <code>d</code> and <code>hover</code> are the drawing&rsquo;s two frames as path data, each made
            of whole cells that never overlap and stay inside the tile. <code>held</code> keeps the second frame up. the
            words beside it carry its meaning, so it&rsquo;s hidden from readers unless it takes an{" "}
            <code>aria-label</code>.
          </dd>
          <dt>a tile</dt>
          <dd>
            set it in <code>ItemCardMedia</code> on a tile in{" "}
            <a href="/compositions/item-cards#tiles">
              <code>item-cards</code>
            </a>
            , and the whole tile drives its second frame.
          </dd>
        </dl>
      </Section>
    </>
  );
}
