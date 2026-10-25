import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Section as BlockSection,
  SectionAction,
  SectionCount,
  SectionHeader,
  SectionTitle,
} from "@/components/superthread/blocks/section-header";
import { Button } from "@/components/superthread/ui/button";
import { Serves } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/section-header")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "states" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Example() {
  const [all, setAll] = useState(false);
  const [drafts, setDrafts] = useState(0);
  return (
    <div>
      <BlockSection>
        <SectionHeader>
          <SectionTitle>recent runs</SectionTitle>
          <SectionCount>{all ? 4 : 2}</SectionCount>
          <SectionAction render={<button type="button" />} onClick={() => setAll(!all)}>
            {all ? "show fewer" : "all runs"}
          </SectionAction>
        </SectionHeader>
        <ul className="st-ca-rows">
          {(all
            ? ["run-024 · orbit", "run-023 · quanta", "run-022 · trisys", "run-021 · artifacts"]
            : ["run-024 · orbit", "run-023 · quanta"]
          ).map((run) => (
            <li key={run}>{run}</li>
          ))}
        </ul>
      </BlockSection>
      <BlockSection>
        <SectionHeader>
          <SectionTitle>drafts</SectionTitle>
          <SectionCount>{drafts}</SectionCount>
        </SectionHeader>
        <p className="st-ca-copy">{drafts === 0 ? "no drafts yet." : `${drafts} drafts ready for a first pass.`}</p>
        <Button variant="outline" size="sm" onClick={() => setDrafts((n) => n + 1)}>
          add draft
        </Button>
      </BlockSection>
    </div>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="section header"
        lede="a named section with its title, a live count and a way to the rest. a full rule separates the head from the content."
      >
        <InstallLine items={["section-header"]} />
      </PageHead>
      <Serves name="section-header" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          show all runs to change the count, or add a draft below. the next section leaves 48 px above its head.
        </p>
        <ModePair>
          <Example />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-ca-copy">
          the way onward is quiet at rest, underlined on hover and ringed on keyboard focus. a section can also omit its
          action or count.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            {[
              { name: "rest", demo: undefined, note: "quiet link" },
              { name: "hover", demo: "hover", note: "foreground and underline" },
              { name: "focus", demo: "focus-visible", note: "2 px house ring" },
            ].map((state) => (
              <State className="st-ca-state" key={state.name} name={state.name} note={state.note}>
                <BlockSection>
                  <SectionHeader>
                    <SectionTitle>runs</SectionTitle>
                    <SectionCount>4</SectionCount>
                    <SectionAction href="#example" data-demo={state.demo} tabIndex={-1}>
                      all runs
                    </SectionAction>
                  </SectionHeader>
                </BlockSection>
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Section</code>
          </dt>
          <dd>
            ties its accessible name to <code>SectionTitle</code>. pass <code>titleId</code> for a stable deep link.
          </dd>
          <dt>
            <code>SectionHeader</code>
          </dt>
          <dd>aligns the title, count and action on their baseline, with wrapping when they need it.</dd>
          <dt>
            <code>SectionCount</code>
          </dt>
          <dd>
            announces a changed count. <code>SectionAction</code> defaults to “more” and accepts the app's router link.
          </dd>
        </dl>
      </Section>
    </>
  );
}
