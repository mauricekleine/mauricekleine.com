import { createFileRoute } from "@tanstack/react-router";
import { InputGroupExample, InputGroupStates } from "@/examples/input-group";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/input-group")({
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
        title="input group"
        lede="an input with company inside its box: an icon, a prefix, a count or a button. the box is the field, so it draws the one focus frame."
      >
        <InstallLine items={["input-group"]} />
      </PageHead>

      <Section id="example" title="example">
        <p className="st-a-copy">
          addons sit inside the edge, before or after the text, or under it for a textarea. a button in the box is a
          control of its own: tab onto clear and it takes its own ring while the field drops back to 1 px. disabled
          screens the edge back and dims the addons with it.
        </p>
        <ModePair className="st-a-stack">
          <InputGroupExample />
        </ModePair>
        <Caption detail="disabled" />
      </Section>

      <Section id="states" title="states">
        <p className="st-a-copy">
          the same frame as a bare input, drawn by the box whenever its text has focus: 1 px at rest, 2 px inside on
          focus, in the error ink when the text is invalid.
        </p>
        <ModePair className="st-a-stack">
          <InputGroupStates />
        </ModePair>
      </Section>
    </>
  );
}
