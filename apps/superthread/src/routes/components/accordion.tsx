import { createFileRoute } from "@tanstack/react-router";
import { AccordionExample, AccordionStates } from "@/examples/accordion";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/accordion")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "behavior", title: "behavior" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="accordion"
        lede="a set of disclosures between full-width rules. each row opens its own panel, turns one chevron and keeps keyboard focus inside the trigger."
      >
        <InstallLine items={["accordion"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          one answer opens at a time. use the arrow keys to move between questions, then enter or space to open one.
        </p>
        <ModePair className="st-gl-pair">
          <AccordionExample />
        </ModePair>
      </Section>
      <Section id="behavior" title="behavior">
        <p className="st-gl-copy">
          allow several panels to stay open together. each trigger still names and controls its own answer.
        </p>
        <ModePair className="st-gl-pair">
          <AccordionExample multiple />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          closed and open share the same ruled row. hover underlines the words, focus stays inside, and disabled removes
          the action.
        </p>
        <ModePair className="st-gl-pair">
          <AccordionStates />
        </ModePair>
      </Section>
    </>
  );
}
