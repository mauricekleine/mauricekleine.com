import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Section as BlockSection,
  SectionAction,
  SectionCount,
  SectionHeader,
  SectionTitle,
} from "@/components/superthread/blocks/section-header";
import { ListRowKind, PlainRow, PlainRows, PlainRowTitle } from "@/components/superthread/blocks/list-rows";
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
      { id: "example", title: "Example" },
      { id: "states", title: "States" },
      { id: "quiet", title: "A quiet head" },
      { id: "parts", title: "Parts" },
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
          <SectionTitle>Recent runs</SectionTitle>
          <SectionCount>{all ? 4 : 2}</SectionCount>
          <SectionAction render={<button type="button" />} onClick={() => setAll(!all)}>
            {all ? "Show fewer" : "All runs"}
          </SectionAction>
        </SectionHeader>
        <ul className="st-ca-rows">
          {(all
            ? ["run-024 · Orbit", "run-023 · Quanta", "run-022 · Trisys", "run-021 · Artifacts"]
            : ["run-024 · Orbit", "run-023 · Quanta"]
          ).map((run) => (
            <li key={run}>{run}</li>
          ))}
        </ul>
      </BlockSection>
      <BlockSection>
        <SectionHeader>
          <SectionTitle>Drafts</SectionTitle>
          <SectionCount>{drafts}</SectionCount>
        </SectionHeader>
        <p className="st-ca-copy">{drafts === 0 ? "No drafts yet." : `${drafts} drafts ready for a first pass.`}</p>
        <Button variant="outline" size="sm" onClick={() => setDrafts((n) => n + 1)}>
          Add draft
        </Button>
      </BlockSection>
    </div>
  );
}

function QuietExample() {
  return (
    <div className="st-ca-stack">
      {[
        { quiet: "subtitle", name: "Subtitle", title: "This week", note: "The subtitle step, in foreground" },
        { quiet: "instrument", name: "Instrument", title: "Then", note: "Muted instrument" },
      ].map((head) => (
        <State className="st-ca-state" key={head.quiet} name={head.name} note={head.note}>
          <BlockSection>
            <SectionHeader quiet={head.quiet as "subtitle" | "instrument"}>
              <SectionTitle>{head.title}</SectionTitle>
              <SectionCount>2</SectionCount>
            </SectionHeader>
            <PlainRows variant="nested" aria-label={head.title}>
              <PlainRow>
                <PlainRowTitle href="#quiet" tabIndex={-1}>
                  run-024
                </PlainRowTitle>
                <ListRowKind>Orbit</ListRowKind>
              </PlainRow>
              <PlainRow>
                <PlainRowTitle href="#quiet" tabIndex={-1}>
                  run-023
                </PlainRowTitle>
                <ListRowKind>Quanta</ListRowKind>
              </PlainRow>
            </PlainRows>
          </BlockSection>
        </State>
      ))}
    </div>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Section header"
        lede="A named section with its title, a live count and a way to the rest. A full rule separates the head from the content, or a quiet head prints no rule."
      >
        <InstallLine items={["section-header"]} />
      </PageHead>
      <Serves name="section-header" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Show all runs to change the count, or add a draft below. The next section leaves 48 px above its head.
        </p>
        <ModePair>
          <Example />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-ca-copy">
          The way onward is quiet at rest, underlined on hover and ringed on keyboard focus. A section can also omit its
          action or count.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            {[
              { name: "Rest", demo: undefined, note: "Quiet link" },
              { name: "Hover", demo: "hover", note: "Foreground and underline" },
              { name: "Focus", demo: "focus-visible", note: "2 px house ring" },
            ].map((state) => (
              <State className="st-ca-state" key={state.name} name={state.name} note={state.note}>
                <BlockSection>
                  <SectionHeader>
                    <SectionTitle>Runs</SectionTitle>
                    <SectionCount>4</SectionCount>
                    <SectionAction href="#example" data-demo={state.demo} tabIndex={-1}>
                      All runs
                    </SectionAction>
                  </SectionHeader>
                </BlockSection>
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="quiet" title="A quiet head">
        <p className="st-ca-copy">
          A list of plain rows has no rules, so its head has none: <code>quiet</code> drops the rule and sits 4 px over
          the content. Use <code>subtitle</code> for a section the page is made of and <code>instrument</code> for a
          muted line over a short list.
        </p>
        <ModePair>
          <QuietExample />
        </ModePair>
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Section</code>
          </dt>
          <dd>
            Ties its accessible name to <code>SectionTitle</code>. Pass <code>titleId</code> for a stable deep link.
          </dd>
          <dt>
            <code>SectionHeader</code>
          </dt>
          <dd>
            Aligns the title, count and action on their baseline, with wrapping when they need it. <code>quiet</code> is{" "}
            <code>subtitle</code> or <code>instrument</code>.
          </dd>
          <dt>
            <code>SectionCount</code>
          </dt>
          <dd>
            Announces a changed count. <code>SectionAction</code> defaults to “More” and accepts the app's router link.
          </dd>
        </dl>
      </Section>
    </>
  );
}
