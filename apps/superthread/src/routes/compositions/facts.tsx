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
      { id: "example", title: "example" },
      { id: "layouts", title: "layouts" },
      { id: "values", title: "values" },
      { id: "phone", title: "phone" },
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
    <Facts layout={layout} columns={columns} aria-label="sample run details">
      <Fact>
        <FactLabel>run</FactLabel>
        <FactValue kind="id">run-024</FactValue>
      </Fact>
      <Fact>
        <FactLabel>ship</FactLabel>
        <FactValue>orbit</FactValue>
      </Fact>
      <Fact>
        <FactLabel>attempts</FactLabel>
        <FactValue kind="number">{attempts}</FactValue>
      </Fact>
      <Fact>
        <FactLabel>next check</FactLabel>
        <FactValue>not scheduled</FactValue>
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
        record attempt
      </Button>
      <p className="st-ca-note" role="status">
        {attempts} attempts recorded.
      </p>
    </div>
  );
}
function Values() {
  return (
    <Facts aria-label="value types">
      <Fact>
        <FactLabel>description</FactLabel>
        <FactValue>a first pass through the reading pages</FactValue>
      </Fact>
      <Fact>
        <FactLabel>completed</FactLabel>
        <FactValue kind="number">0</FactValue>
      </Fact>
      <Fact>
        <FactLabel>run id</FactLabel>
        <FactValue kind="id">run-024-reading-pages-first-pass</FactValue>
      </Fact>
      <Fact>
        <FactLabel>duration</FactLabel>
        <FactValue>not measured</FactValue>
      </Fact>
      <Fact>
        <FactLabel>source</FactLabel>
        <FactValue>
          <a className="underline underline-offset-4" href="#example">
            sample run
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
        title="facts"
        lede="labelled values in shared columns or ruled cells. prose stays in interface type; numbers and identifiers keep their mono face."
      >
        <InstallLine items={["facts"]} />
      </PageHead>
      <Serves name="facts" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          record another sample attempt. in the list, the labels share a column and the number aligns to the far edge.
        </p>
        <ModePair>
          <LiveFacts />
        </ModePair>
      </Section>
      <Section id="layouts" title="layouts">
        <p className="st-ca-copy">
          <code>list</code> is the default. <code>grid</code> accepts two, three or four columns, with the label above
          each value.
        </p>
        <ModePair className="st-ca-wide-pair">
          <div className="st-ca-stack">
            {([2, 3, 4] as const).map((columns) => (
              <State className="st-ca-state" key={columns} name={`${columns} columns`} note="grid">
                <RunFacts layout="grid" columns={columns} />
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="values" title="values">
        <p className="st-ca-copy">
          zero is a measured value. missing data uses words, and a long id wraps within its cell. values can also hold a
          link.
        </p>
        <ModePair>
          <Values />
        </ModePair>
      </Section>
      <Section id="phone" title="phone">
        <p className="st-ca-copy">
          at 600 px a grid becomes one cell per line. the list keeps its shared columns and wraps long values.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="facts phone, light" height={750}>
              <div className="st-ca-inset st-ca-stack">
                <RunFacts layout="grid" columns={4} />
                <Values />
              </div>
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="facts phone, dark" height={750}>
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
