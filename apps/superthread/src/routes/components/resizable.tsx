import { createFileRoute } from "@tanstack/react-router";
import { ResizableExample, ResizableStates } from "@/examples/resizable";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/resizable")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "orientation", title: "Orientation" },
      { id: "handles", title: "Handles" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Resizable"
        lede="Panels that share a movable 1 px rule. Its 8 px hit area works with the pointer, and a focused handle moves with the arrow keys."
      >
        <InstallLine items={["resizable"]} />
      </PageHead>
      <Section id="example" title="Example">
        <p className="st-gl-copy">
          Drag the grip to divide the run list and its log. Tab to the separator and use left or right to resize with
          the keyboard.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableExample />
        </ModePair>
      </Section>
      <Section id="orientation" title="Orientation">
        <p className="st-gl-copy">
          Vertical groups stack the same panels and turn the grip. The separator now responds to up and down.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableExample orientation="vertical" />
        </ModePair>
      </Section>
      <Section id="handles" title="Handles">
        <p className="st-gl-copy">
          A plain rule works without the grip. Its keyboard ring straddles the rule at zero offset.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableExample withHandle={false} />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-gl-copy">
          Hover and drag turn the rule foreground. A gripped separator draws its focus edge inside the small grip;
          disabled fixes the split.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableStates />
        </ModePair>
      </Section>
    </>
  );
}
