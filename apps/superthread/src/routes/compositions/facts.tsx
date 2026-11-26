import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Facts, Fact, FactLabel, FactValue } from "@/components/superthread/blocks/facts";
import { Button } from "@/components/superthread/ui/button";
import { Serves, ViewportFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/facts")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "layouts", title: "Layouts" },
      { id: "values", title: "Values" },
      { id: "phone", title: "Phone" },
    ],
  },
  component: Page,
});

function RunFacts({
  layout = "list",
  columns = 2,
  attempts = 2,
}: {
  layout?: "list" | "grid";
  columns?: 2 | 3 | 4;
  attempts?: number;
}) {
  return (
    <Facts layout={layout} columns={columns} aria-label="Sample run details">
      <Fact>
        <FactLabel>Run</FactLabel>
        <FactValue kind="id">run-024</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Ship</FactLabel>
        <FactValue>Orbit</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Attempts</FactLabel>
        <FactValue kind="number">{attempts}</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Next check</FactLabel>
        <FactValue>Not scheduled</FactValue>
      </Fact>
    </Facts>
  );
}
function LiveFacts() {
  const [attempts, setAttempts] = useState(2);
  return (
    <div className="st-ca-stack">
      <RunFacts attempts={attempts} />
      <Button variant="outline" size="sm" onClick={() => setAttempts((n) => n + 1)}>
        Record attempt
      </Button>
      <p className="st-ca-note" role="status">
        {attempts} attempts recorded.
      </p>
    </div>
  );
}
function Values() {
  return (
    <Facts aria-label="Value types">
      <Fact>
        <FactLabel>Description</FactLabel>
        <FactValue>A first pass through the reading pages</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Completed</FactLabel>
        <FactValue kind="number">0</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Run ID</FactLabel>
        <FactValue kind="id">run-024-reading-pages-first-pass</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Duration</FactLabel>
        <FactValue>Not measured</FactValue>
      </Fact>
      <Fact>
        <FactLabel>Source</FactLabel>
        <FactValue>
          <a className="underline underline-offset-4" href="#example">
            Sample run
          </a>
        </FactValue>
      </Fact>
    </Facts>
  );
}
function Page() {
  return (
    <>
      <PageHead
        title="Facts"
        lede="Labelled values in shared columns or ruled cells. Prose stays in interface type; numbers and identifiers keep their mono face."
      >
        <InstallLine items={["facts"]} />
      </PageHead>
      <Serves name="facts" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Record another sample attempt. In the list, the labels share a column and the number aligns to the far edge.
        </p>
        <ModePair>
          <LiveFacts />
        </ModePair>
      </Section>
      <Section id="layouts" title="Layouts">
        <p className="st-ca-copy">
          <code>list</code> is the default. <code>grid</code> accepts two, three or four columns, with the label above
          each value.
        </p>
        <ModePair className="st-ca-wide-pair">
          <div className="st-ca-stack">
            {([2, 3, 4] as const).map((columns) => (
              <State className="st-ca-state" key={columns} name={`${columns} columns`} note="Grid">
                <RunFacts layout="grid" columns={columns} />
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="values" title="Values">
        <p className="st-ca-copy">
          Zero is a measured value. Missing data uses words, and a long ID wraps within its cell. Values can also hold a
          link.
        </p>
        <ModePair>
          <Values />
        </ModePair>
      </Section>
      <Section id="phone" title="Phone">
        <p className="st-ca-copy">
          At 600 px a grid becomes one cell per line. The list keeps its shared columns and wraps long values.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="Facts phone, light" height={750}>
              <div className="st-ca-inset st-ca-stack">
                <RunFacts layout="grid" columns={4} />
                <Values />
              </div>
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="Facts phone, dark" height={750}>
              <div className="st-ca-inset st-ca-stack">
                <RunFacts layout="grid" columns={4} />
                <Values />
              </div>
            </ViewportFrame>
          }
        />
      </Section>
    </>
  );
}
