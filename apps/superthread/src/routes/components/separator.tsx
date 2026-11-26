import { createFileRoute } from "@tanstack/react-router";
import { SeparatorExample } from "@/examples/separator";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/separator")({
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
      <PageHead title="Separator" lede="A 1 px line between groups, across or down.">
        <InstallLine items={["separator"]} />
      </PageHead>
      <Section id="example" title="Example">
        <ModePair>
          <SeparatorExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="Upstream">
        <p className="st-pass-prose">
          Base-nova&rsquo;s separator on Base UI, with only its imports changed. It draws in <code>--border</code>, the
          quiet edge. The page&rsquo;s own rules, the ones that run across the whole column, print in the stronger{" "}
          <code>--rule</code>.
        </p>
      </Section>
    </>
  );
}
