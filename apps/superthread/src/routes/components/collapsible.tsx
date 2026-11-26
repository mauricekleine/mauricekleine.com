import { createFileRoute } from "@tanstack/react-router";
import { CollapsibleExample, CollapsibleStates } from "@/examples/collapsible";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/collapsible")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Collapsible"
        lede="One disclosure with a trigger and a panel. This pass-through item keeps the upstream behavior, turns a chevron at the trigger's end while open, and lets the caller choose the trigger and layout."
      >
        <InstallLine items={["collapsible"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Open the run logs with the outline button. Enter and Space work from the keyboard, and closing hides the panel
          from the tab order.
        </p>
        <ModePair className="st-gl-pair">
          <CollapsibleExample />
        </ModePair>
      </Section>
      <Section id="open" title="Open">
        <p className="st-gl-copy">
          Start with the panel expanded. The chevron at the trigger's end points up while it is open, and the same
          trigger closes it again; the content remains in the normal page flow.
        </p>
        <ModePair className="st-gl-pair">
          <CollapsibleExample open />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          The caller supplies an outline button here, so hover, pressed and focus come from that button. The root owns
          open and disabled.
        </p>
        <ModePair className="st-gl-pair">
          <CollapsibleStates />
        </ModePair>
      </Section>
    </>
  );
}
