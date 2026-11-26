import { createFileRoute } from "@tanstack/react-router";
import { GroundFrame } from "@/examples/compositions-a";
import { PaperExample, PaperInPanel } from "@/examples/paper";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/paper")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "edge", title: "Its edge" },
      { id: "phone", title: "On a phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Paper"
        lede="The one white block on a page, for the thing the page is there for. It stays white in every theme."
      >
        <InstallLine items={["paper"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-pass-prose">
          Everything inside paper reads the light roles. So on a dark page the default button fills with plum here and
          prints as an outline everywhere around it, and the focus ring takes plum&rsquo;s deep value. A page prints one
          paper, and it never reverses.
        </p>
        <ModePair>
          <PaperExample />
        </ModePair>
      </Section>
      <Section id="edge" title="Its edge">
        <p className="st-pass-prose">
          On a dark panel the white is its edge, so paper prints flat. A light panel is white too, so paper takes the
          slip lift: the soft rake to the right and below, and the contact edge as a 50 percent screen, 3 px right and 2
          px below.
        </p>
        <ModePair>
          <PaperInPanel />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-pass-prose">
          The padding drops from 24 px to 16 px at 600 px, level with the working panel&rsquo;s own. Both frames use a
          390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Paper phone, light" height={380}>
              <PaperInPanel />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Paper phone, dark" height={380}>
              <PaperInPanel />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Paper</code>
          </dt>
          <dd>
            The block itself. <code>render</code> gives it the element the page needs, such as a named{" "}
            <code>section</code>.
          </dd>
          <dt>A layer on paper</dt>
          <dd>
            A select or a menu opened from paper takes the document&rsquo;s mode, as every raised layer does. Pass{" "}
            <code>portalProps</code> with the paper as its container to hold it light.
          </dd>
        </dl>
      </Section>
    </>
  );
}
