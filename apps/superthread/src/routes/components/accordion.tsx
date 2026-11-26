import { createFileRoute } from "@tanstack/react-router";
import { AccordionExample, AccordionStates } from "@/examples/accordion";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/accordion")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "behavior", title: "Behavior" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Accordion"
        lede="A set of disclosures between full-width rules. Each row opens its own panel, turns one chevron and keeps keyboard focus inside the trigger."
      >
        <InstallLine items={["accordion"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          One answer opens at a time. Use the arrow keys to move between questions, then Enter or Space to open one.
        </p>
        <ModePair className="st-gl-pair">
          <AccordionExample />
        </ModePair>
      </Section>
      <Section id="behavior" title="Behavior">
        <p className="st-gl-copy">
          Allow several panels to stay open together. Each trigger still names and controls its own answer.
        </p>
        <ModePair className="st-gl-pair">
          <AccordionExample multiple />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          Closed and open share the same ruled row. Hover underlines the words, focus stays inside, and disabled removes
          the action.
        </p>
        <ModePair className="st-gl-pair">
          <AccordionStates />
        </ModePair>
      </Section>
    </>
  );
}
