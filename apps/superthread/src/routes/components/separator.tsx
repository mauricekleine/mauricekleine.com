import { createFileRoute } from "@tanstack/react-router";
import { SeparatorExample } from "@/examples/separator";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/separator")({
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
      <PageHead title="separator" lede="a 1 px line between groups, across or down.">
        <InstallLine items={["separator"]} />
      </PageHead>
      <Section id="example" title="example">
        <ModePair>
          <SeparatorExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="upstream">
        <p className="st-pass-prose">
          base-nova&rsquo;s separator on base ui, with only its imports changed. it draws in <code>--border</code>, the
          quiet edge. the page&rsquo;s own rules, the ones that run across the whole column, print in the stronger{" "}
          <code>--rule</code>.
        </p>
      </Section>
    </>
  );
}
