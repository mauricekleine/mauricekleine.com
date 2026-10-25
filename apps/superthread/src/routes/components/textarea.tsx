import { createFileRoute } from "@tanstack/react-router";
import { TextareaExample, TextareaStates } from "@/examples/textarea";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/textarea")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "states" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="textarea"
        lede="a few lines of text in the input's box. it starts at three lines and grows with its words, and focus draws the same 2 px frame inside it."
      >
        <InstallLine items={["textarea"]} />
      </PageHead>

      <Section id="example" title="example">
        <p className="st-a-copy">
          no resize handle: the box sizes itself to what you write. the second summary runs past 120 characters, so its
          edge stays in the error ink until you cut it.
        </p>
        <ModePair className="st-a-stack">
          <TextareaExample />
        </ModePair>
      </Section>

      <Section id="states" title="states">
        <p className="st-a-copy">
          the input&rsquo;s states, line for line: 1 px at rest, 2 px inside while the text has focus, the caret in the
          same ink, and the error ink when the text is invalid. a disabled box keeps a flat fill and screens its edge
          back.
        </p>
        <ModePair className="st-a-stack">
          <TextareaStates />
        </ModePair>
        <Caption detail="disabled" />
      </Section>
    </>
  );
}
