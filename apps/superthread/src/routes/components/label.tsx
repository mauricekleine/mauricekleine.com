import { createFileRoute } from "@tanstack/react-router";
import { LabelExample } from "@/examples/label";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/label")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "upstream", title: "Upstream" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Label"
        lede="The name of a field. Clicking it focuses the field, and a label wrapped around a checkbox toggles it."
      >
        <InstallLine items={["label"]} />
      </PageHead>
      <Section id="example" title="Example">
        <ModePair>
          <LabelExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="Upstream">
        <p className="st-pass-prose">
          Base-nova&rsquo;s label, with only its imports changed. It sets the name at 14 px in Supreme 500. After a
          disabled control marked <code>peer</code>, or inside a group with <code>data-disabled=&quot;true&quot;</code>,
          it fades to half.
        </p>
      </Section>
    </>
  );
}
