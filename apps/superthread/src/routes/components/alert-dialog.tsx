import { createFileRoute } from "@tanstack/react-router";
import {
  AlertDialogActions,
  AlertDialogExample,
  AlertDialogOpen,
  AlertDialogSizes,
  AlertDialogStates,
} from "@/examples/alert-dialog";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/alert-dialog")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
      { id: "actions", title: "Actions" },
      { id: "sizes", title: "Sizes" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Alert dialog"
        lede="A confirmation sheet for an action that needs a decision. The title names the action, the explanation names what goes, and Cancel gives a clear way back."
      >
        <InstallLine items={["alert-dialog"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Delete the synthetic run or cancel to keep it. Focus opens on Cancel, the action closes the sheet, and the
          result shows below the trigger.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<AlertDialogExample mode="light" />}
          dark={<AlertDialogExample mode="dark" />}
        />
      </Section>
      <Section id="open" title="Open">
        <p className="st-gl-copy">
          The confirmation printed over its plain scrim. This specimen stays on the page without taking focus or locking
          scroll.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogOpen scrim />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="actions" title="Actions">
        <p className="st-gl-copy">
          The default action prints in the house ink on paper and as the outline on a dark sheet. An action that leaves
          the app takes key.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogActions />
        </ModePair>
      </Section>
      <Section id="sizes" title="Sizes">
        <p className="st-gl-copy">
          The default sheet stops at 440 px; small stops at 320 px. Both keep the same media, title and right-aligned
          actions.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogSizes />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          The action keeps the button states: key ink for destructive work on paper, the outline off paper, and the ring
          for keyboard focus.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogStates />
        </ModePair>
      </Section>
    </>
  );
}
