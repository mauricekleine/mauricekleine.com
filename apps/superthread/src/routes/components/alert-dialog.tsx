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
      { id: "example", title: "example" },
      { id: "open", title: "open" },
      { id: "actions", title: "actions" },
      { id: "sizes", title: "sizes" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="alert dialog"
        lede="a confirmation sheet for an action that needs a decision. the title names the action, the explanation names what goes, and cancel gives a clear way back."
      >
        <InstallLine items={["alert-dialog"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          delete the synthetic run or cancel to keep it. focus opens on cancel, the action closes the sheet, and the
          result shows below the trigger.
        </p>
        <ModePair
          className="st-gl-pair"
          light={<AlertDialogExample mode="light" />}
          dark={<AlertDialogExample mode="dark" />}
        />
      </Section>
      <Section id="open" title="open">
        <p className="st-gl-copy">
          the confirmation printed over its plain scrim. this specimen stays on the page without taking focus or locking
          scroll.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogOpen scrim />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="actions" title="actions">
        <p className="st-gl-copy">
          the default action prints in the house ink on paper and as the outline on a dark sheet. an action that leaves
          the app takes key.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogActions />
        </ModePair>
      </Section>
      <Section id="sizes" title="sizes">
        <p className="st-gl-copy">
          the default sheet stops at 440 px; small stops at 320 px. both keep the same media, title and right-aligned
          actions.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogSizes />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          the action keeps the button states, with key ink for destructive work and house ink for keyboard focus.
        </p>
        <ModePair className="st-gl-pair">
          <AlertDialogStates />
        </ModePair>
      </Section>
    </>
  );
}
