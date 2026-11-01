import { createFileRoute } from "@tanstack/react-router";
import { CheckboxExample, CheckboxStates } from "@/examples/checkbox";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/checkbox")({
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
        title="checkbox"
        lede="a square box with the input's edge. checked fills it with foreground; mixed means some, not all, and prints the ink at half."
      >
        <InstallLine items={["checkbox"]} />
      </PageHead>

      <Section id="example" title="example">
        <p className="st-a-copy">
          the box sits inside its label, so a click on the words checks it too. the box named &ldquo;every ship&rdquo;
          is the parent of the six under it: pick a few and it turns mixed, check it and it picks them all.
        </p>
        <ModePair className="st-a-stack">
          <CheckboxExample />
        </ModePair>
        <Caption detail="mixed" />
      </Section>

      <Section id="states" title="states">
        <p className="st-a-copy">
          a checkbox is a control, not a field, so keyboard focus draws the 2 px house ring 2 px outside the box, as a
          button&rsquo;s does.
        </p>
        <ModePair className="st-a-stack">
          <CheckboxStates />
        </ModePair>
      </Section>
    </>
  );
}
