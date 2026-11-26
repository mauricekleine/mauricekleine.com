import { createFileRoute } from "@tanstack/react-router";
import { TextareaCode, TextareaExample, TextareaStates } from "@/examples/textarea";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/textarea")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "code", title: "Code" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Textarea"
        lede="A few lines of text in the input's box. It starts at three lines and grows with its words, and focus draws the same 2 px frame inside it."
      >
        <InstallLine items={["textarea"]} />
      </PageHead>

      <Section id="example" title="Example">
        <p className="st-a-copy">
          No resize handle: the box sizes itself to what you write. The second summary runs past 120 characters, so its
          edge stays in the error ink until you cut it.
        </p>
        <ModePair className="st-a-stack">
          <TextareaExample />
        </ModePair>
      </Section>

      <Section id="code" title="Code">
        <p className="st-a-copy">
          Set <code>kind=&quot;code&quot;</code> for JSON and keys: mono at the instrument step, five lines tall. A long
          line wraps anywhere, so nothing scrolls sideways, and spellcheck and autocorrect stay off, so a key stays what
          you pasted.
        </p>
        <ModePair className="st-a-stack">
          <TextareaCode />
        </ModePair>
      </Section>

      <Section id="states" title="States">
        <p className="st-a-copy">
          The input&rsquo;s states, line for line: 1 px at rest, 2 px inside while the text has focus, the caret in the
          same ink, and the error ink when the text is invalid. A disabled box keeps a flat fill and screens its edge
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
