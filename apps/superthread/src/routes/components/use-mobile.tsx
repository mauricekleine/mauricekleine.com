import { createFileRoute } from "@tanstack/react-router";
import { UseMobileExample } from "@/examples/use-mobile";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/use-mobile")({
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
        title="use-mobile"
        lede="A hook that returns true while the window is narrower than 768 px. The sidebar reads it to turn into a sheet on a phone."
      >
        <InstallLine items={["use-mobile"]} />
      </PageHead>
      <Section id="example" title="Example">
        <ModePair>
          <UseMobileExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="Upstream">
        <p className="st-pass-prose">
          Base-nova&rsquo;s hook, unchanged. The 768 px breakpoint is upstream&rsquo;s; this site&rsquo;s own layout
          changes at 900 and 600 px, in CSS. The hook returns false until the page hydrates, so markup rendered ahead of
          time always takes the desktop branch.
        </p>
      </Section>
    </>
  );
}
