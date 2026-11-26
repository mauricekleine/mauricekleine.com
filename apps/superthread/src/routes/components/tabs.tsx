import { createFileRoute } from "@tanstack/react-router";
import { TabsExample, TabsLine, TabsStates } from "@/examples/tabs";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/tabs")({
  staticData: {
    sections: [
      { id: "in-use", title: "In use" },
      { id: "states", title: "States" },
      { id: "line", title: "On the page's rule" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Tabs"
        lede="Tabs sit on a rule. The current tab is solid: its word and a 2&nbsp;px bar, both in foreground."
      >
        <InstallLine items={["tabs"]} />
      </PageHead>

      <Section id="in-use" title="In use">
        <p className="st-b-copy">Click a tab, or move between them with the arrow keys.</p>
        <ModePair className="st-b-stack">
          <TabsExample />
        </ModePair>
      </Section>

      <Section id="states" title="States">
        <p className="st-b-copy">
          Under the pointer, a tab that is not current previews the bar at half. Focus is the 2&nbsp;px house ring,
          2&nbsp;px out, as on a button.
        </p>
        <ModePair className="st-b-stack">
          <TabsStates />
        </ModePair>
        <Caption detail="tabhover" />
      </Section>

      <Section id="line" title="On the page's rule">
        <p className="st-b-copy">
          The line list draws no rule of its own, for tabs that sit on a rule the page already draws. Set{" "}
          <code>variant=&quot;line&quot;</code> on the list.
        </p>
        <ModePair className="st-b-stack">
          <TabsLine />
        </ModePair>
      </Section>
    </>
  );
}
