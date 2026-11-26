import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { GroundFrame } from "@/examples/compositions-a";
import { SourceLineExample, SourceLineLong, SourceLinePlain } from "@/examples/source-line";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/source-line")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "plain", title: "A source with no address" },
      { id: "wrap", title: "Long lines" },
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
        title="Source line"
        lede="What a page was written from: a wrapping row of sources at the instrument step, and what closes the line at its far side."
      >
        <InstallLine items={["source-line"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-pass-prose">
          A citation has to read as something you can open, so a source prints as a link does in running text: in
          foreground, underlined at rest. <code>end</code> holds the far side in mono, for a time that holds its place.
        </p>
        <ModePair className="st-cb-stack">
          <SourceLineExample />
        </ModePair>
      </Section>
      <Section id="plain" title="A source with no address">
        <p className="st-pass-prose">
          A source with no <code>href</code> stays a plain name in the line&rsquo;s ink, so it never reads as a dead
          link. <code>label</code> changes the line&rsquo;s first word.
        </p>
        <ModePair>
          <SourceLinePlain />
        </ModePair>
      </Section>
      <Section id="wrap" title="Long lines">
        <p className="st-pass-prose">
          The label and the sources wrap as one row, and a long source wraps inside it. <code>end</code> takes whatever
          line it lands on, at the far side.
        </p>
        <ModePair className="st-cb-stack">
          <SourceLineLong />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-pass-prose">
          Each link is its own 44 px box and the lines close up, so no two reaches overlap. <code>end</code> joins the
          row&rsquo;s words in the interface&rsquo;s face.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="A source line on a phone, light" height={148}>
              <AppShellPanel>
                <SourceLineExample />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A source line on a phone, dark" height={148}>
              <AppShellPanel>
                <SourceLineExample />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>SourceLine</code>
          </dt>
          <dd>
            The list of sources after its <code>label</code>, which defaults to <code>sources</code>, with{" "}
            <code>end</code> at the far side.
          </dd>
          <dt>
            <code>SourceLineItem</code>
          </dt>
          <dd>
            One source. <code>href</code> or a router link through <code>render</code> makes it a link, and without one
            it prints as a plain name.
          </dd>
        </dl>
      </Section>
    </>
  );
}
