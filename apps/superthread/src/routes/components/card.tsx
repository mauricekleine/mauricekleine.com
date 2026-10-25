import { createFileRoute } from "@tanstack/react-router";
import { CardExample } from "@/examples/card";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/card")({
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
        title="card"
        lede="a box that holds one thing: its title, a line of detail, the body and what to do next."
      >
        <InstallLine items={["card"]} />
      </PageHead>
      <Section id="example" title="example">
        <ModePair>
          <CardExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="upstream">
        <p className="st-pass-prose">
          card is a pass item: base-nova&rsquo;s card with its imports pointed at superthread and every class left as
          upstream wrote it. the tokens set the look. the radius is zero, so the corners are square. the edge is{" "}
          <code>--foreground</code> at 10 percent, and the fill is <code>--card</code>, which matches the stock in light
          and sits a step above it in dark.
        </p>
      </Section>
    </>
  );
}
