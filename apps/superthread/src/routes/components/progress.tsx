import { createFileRoute } from "@tanstack/react-router";
import { ProgressEdges, ProgressExample } from "@/examples/progress";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/progress")({
  staticData: {
    sections: [
      { id: "in-use", title: "In use" },
      { id: "edge", title: "The edge" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Progress"
        lede="A 12&nbsp;px track with a 1&nbsp;px edge and an 8&nbsp;px fill in foreground. The fill's leading 24&nbsp;px fade out through a screen."
      >
        <InstallLine items={["progress"]} />
      </PageHead>

      <Section id="in-use" title="In use">
        <p className="st-b-copy">
          Press the button to install the next item. The fill travels in 240&nbsp;ms on the brand ease, and with reduced
          motion it steps.
        </p>
        <ModePair className="st-b-stack">
          <ProgressExample />
        </ModePair>
      </Section>

      <Section id="edge" title="The edge">
        <p className="st-b-copy">
          The progress edge is one of the places Superthread prints a screen. A finished bar has no edge left, so it
          prints solid.
        </p>
        <ModePair className="st-b-stack">
          <ProgressEdges />
        </ModePair>
        <Caption detail="ramp" />
      </Section>
    </>
  );
}
