import { createFileRoute } from "@tanstack/react-router";
import { ViewportFrame } from "@/examples/compositions-a";
import { PaperExample, PaperInPanel } from "@/examples/paper";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/paper")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "edge", title: "its edge" },
      { id: "phone", title: "on a phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="paper"
        lede="the one white block on a page, for the thing the page is there for. it stays white in every theme."
      >
        <InstallLine items={["paper"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-pass-prose">
          everything inside paper reads the light roles. so on a dark page the default button fills with plum here and
          prints as an outline everywhere around it, and the focus ring takes plum&rsquo;s deep value. a page prints one
          paper, and it never reverses.
        </p>
        <ModePair>
          <PaperExample />
        </ModePair>
      </Section>
      <Section id="edge" title="its edge">
        <p className="st-pass-prose">
          on a dark panel the white is its edge, so paper prints flat. a light panel is white too, so paper takes the
          slip lift: the soft rake to the right and below, and the contact edge as a 50 percent screen, 3 px right and 2
          px below.
        </p>
        <ModePair>
          <PaperInPanel />
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-pass-prose">
          the padding drops from 24 px to 16 px at 600 px, level with the working panel&rsquo;s own. both frames use a
          390 px viewport.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="paper phone, light" height={380}>
              <PaperInPanel />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="paper phone, dark" height={380}>
              <PaperInPanel />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Paper</code>
          </dt>
          <dd>
            the block itself. <code>render</code> gives it the element the page needs, such as a named{" "}
            <code>section</code>.
          </dd>
          <dt>a layer on paper</dt>
          <dd>
            a select or a menu opened from paper takes the document&rsquo;s mode, as every raised layer does. pass{" "}
            <code>portalProps</code> with the paper as its container to hold it light.
          </dd>
        </dl>
      </Section>
    </>
  );
}
