import { createFileRoute } from "@tanstack/react-router";
import { LabelExample } from "@/examples/label";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/label")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "upstream", title: "upstream" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="label"
        lede="the name of a field. clicking it focuses the field, and a label wrapped around a checkbox toggles it."
      >
        <InstallLine items={["label"]} />
      </PageHead>
      <Section id="example" title="example">
        <ModePair>
          <LabelExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="upstream">
        <p className="st-pass-prose">
          base-nova&rsquo;s label, with only its imports changed. it sets the name at 14 px in supreme 500. after a
          disabled control marked <code>peer</code>, or inside a group with <code>data-disabled=&quot;true&quot;</code>,
          it fades to half.
        </p>
      </Section>
    </>
  );
}
