import { createFileRoute } from "@tanstack/react-router";
import { CollapsibleExample, CollapsibleStates } from "@/examples/collapsible";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/collapsible")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "open", title: "open" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="collapsible"
        lede="one disclosure with a trigger and a panel. this pass-through item keeps the upstream behavior and lets the caller choose the trigger and layout."
      >
        <InstallLine items={["collapsible"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          open the run logs with the outline button. enter and space work from the keyboard, and closing hides the panel
          from the tab order.
        </p>
        <ModePair className="st-gl-pair">
          <CollapsibleExample />
        </ModePair>
      </Section>
      <Section id="open" title="open">
        <p className="st-gl-copy">
          start with the panel expanded. the same trigger closes it again; the content remains in the normal page flow.
        </p>
        <ModePair className="st-gl-pair">
          <CollapsibleExample open />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          the caller supplies an outline button here, so hover, pressed and focus come from that button. the root owns
          open and disabled.
        </p>
        <ModePair className="st-gl-pair">
          <CollapsibleStates />
        </ModePair>
      </Section>
    </>
  );
}
