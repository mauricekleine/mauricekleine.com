import { createFileRoute } from "@tanstack/react-router";
import { ProgressEdges, ProgressExample } from "@/examples/progress";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/progress")({
  staticData: {
    sections: [
      { id: "in-use", title: "in use" },
      { id: "edge", title: "the edge" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="progress"
        lede="a 12&nbsp;px track with a 1&nbsp;px edge and an 8&nbsp;px fill in the house ink. the fill's leading 24&nbsp;px fade out through a screen."
      >
        <InstallLine items={["progress"]} />
      </PageHead>

      <Section id="in-use" title="in use">
        <p className="st-b-copy">
          press the button to install the next item. the fill travels in 240&nbsp;ms on the brand ease, and with reduced
          motion it steps.
        </p>
        <ModePair className="st-b-stack">
          <ProgressExample />
        </ModePair>
      </Section>

      <Section id="edge" title="the edge">
        <p className="st-b-copy">
          the progress edge is one of the five places superthread prints a screen. a finished bar has no edge left, so
          it prints solid.
        </p>
        <ModePair className="st-b-stack">
          <ProgressEdges />
        </ModePair>
        <p className="st-caption">
          <span className="type-meta">progress edge</span>
          <span>the fill&apos;s leading 24&nbsp;px, screened from solid to the stock</span>
        </p>
      </Section>
    </>
  );
}
