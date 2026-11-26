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
      { id: "example", title: "Example" },
      { id: "states", title: "States" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Input group"
        lede="An input with company inside its box: an icon, a prefix, a count or a button. The box is the field, so it draws the one focus frame."
      >
        <InstallLine items={["input-group"]} />
      </PageHead>

      <Section id="example" title="Example">
        <p className="st-a-copy">
          Addons sit inside the edge, before or after the text, or under it for a textarea. A button in the box is a
          control of its own: tab onto Clear and it takes its own ring while the field drops back to 1 px.
        </p>
        <ModePair className="st-a-stack">
          <InputGroupExample />
        </ModePair>
      </Section>

      <Section id="states" title="States">
        <p className="st-a-copy">
          The same frame as a bare input, drawn by the box whenever its text has focus: 1 px at rest, 2 px inside on
          focus, in the error ink when the text is invalid. Disabled screens the edge back and dims the addons with it.
        </p>
        <ModePair className="st-a-stack">
          <InputGroupStates />
        </ModePair>
        <Caption detail="disabled" />
      </Section>
    </>
  );
}
