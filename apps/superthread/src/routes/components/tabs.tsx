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
      { id: "in-use", title: "in use" },
      { id: "states", title: "states" },
      { id: "line", title: "on the page's rule" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="tabs"
        lede="tabs sit on a rule. the current tab is solid: its word in the foreground over a 2&nbsp;px bar of the house ink."
      >
        <InstallLine items={["tabs"]} />
      </PageHead>

      <Section id="in-use" title="in use">
        <p className="st-b-copy">click a tab, or move between them with the arrow keys.</p>
        <ModePair className="st-b-stack">
          <TabsExample />
        </ModePair>
      </Section>

      <Section id="states" title="states">
        <p className="st-b-copy">
          under the pointer, a tab that is not current previews the bar at half. focus is the 2&nbsp;px house ring,
          2&nbsp;px out, as on a button.
        </p>
        <ModePair className="st-b-stack">
          <TabsStates />
        </ModePair>
        <Caption detail="tabhover" />
      </Section>

      <Section id="line" title="on the page's rule">
        <p className="st-b-copy">
          the line list draws no rule of its own, for tabs that sit on a rule the page already draws. set{" "}
          <code>variant=&quot;line&quot;</code> on the list.
        </p>
        <ModePair className="st-b-stack">
          <TabsLine />
        </ModePair>
      </Section>
    </>
  );
}
