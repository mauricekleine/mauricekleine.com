import { createFileRoute } from "@tanstack/react-router";
import { ResizableExample, ResizableStates } from "@/examples/resizable";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/resizable")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "orientation", title: "orientation" },
      { id: "handles", title: "handles" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="resizable"
        lede="panels that share a movable 1 px rule. its 8 px hit area works with the pointer, and a focused handle moves with the arrow keys."
      >
        <InstallLine items={["resizable"]} />
      </PageHead>
      <Section id="example" title="example">
        <p className="st-gl-copy">
          drag the grip to divide the run list and its log. tab to the separator and use left or right to resize with
          the keyboard.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableExample />
        </ModePair>
      </Section>
      <Section id="orientation" title="orientation">
        <p className="st-gl-copy">
          vertical groups stack the same panels and turn the grip. the separator now responds to up and down.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableExample orientation="vertical" />
        </ModePair>
      </Section>
      <Section id="handles" title="handles">
        <p className="st-gl-copy">
          a plain rule works without the grip. its keyboard ring straddles the rule at zero offset.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableExample withHandle={false} />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-gl-copy">
          hover and drag turn the rule foreground. a gripped separator draws its focus edge inside the small grip;
          disabled fixes the split.
        </p>
        <ModePair className="st-gl-pair">
          <ResizableStates />
        </ModePair>
      </Section>
    </>
  );
}
