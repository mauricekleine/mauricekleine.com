import { createFileRoute } from "@tanstack/react-router";
import { CardExample } from "@/examples/card";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/card")({
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
        title="Card"
        lede="A box that holds one thing: its title, a line of detail, the body and what to do next."
      >
        <InstallLine items={["card"]} />
      </PageHead>
      <Section id="example" title="Example">
        <ModePair>
          <CardExample />
        </ModePair>
      </Section>
      <Section id="upstream" title="Upstream">
        <p className="st-pass-prose">
          Card is a pass item: base-nova&rsquo;s card with its imports pointed at Superthread and its classes as
          upstream wrote them, with one added: it names its fill as <code>--surface</code>, so a field separator&rsquo;s
          words on it print no box. The tokens set the look. The radius is zero, so the corners are square. The edge is{" "}
          <code>--foreground</code> at 10 percent, and the fill is <code>--card</code>, which matches the stock in light
          and sits a step above it in dark.
        </p>
      </Section>
    </>
  );
}
