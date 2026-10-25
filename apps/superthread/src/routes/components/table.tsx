import { createFileRoute } from "@tanstack/react-router";
import { TableBoard, TableRuns } from "@/examples/table";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/table")({
  staticData: {
    sections: [
      { id: "rows", title: "rows" },
      { id: "board", title: "board rows" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="table"
        lede="rows come from the row spacing: 48&nbsp;px in a table, 56&nbsp;px on a board. ids and numbers set in mono, and every figure is tabular."
      >
        <InstallLine items={["table"]} />
      </PageHead>

      <Section id="rows" title="rows">
        <p className="st-b-copy">
          the row under the pointer prints a 4&nbsp;px strip at half inside its first cell, beside the words, never
          behind them. a selected row prints it solid on the accent ground. here constellation prints as hovered and
          quanta as selected.
        </p>
        <ModePair className="st-b-stack">
          <TableRuns />
        </ModePair>
        <Caption detail="rowedge" />
      </Section>

      <Section id="board" title="board rows">
        <p className="st-b-copy">
          set <code>rows=&quot;board&quot;</code> for 56&nbsp;px rows. a table wider than its column scrolls sideways
          inside its own box, with no fade at the cut edge.
        </p>
        <ModePair className="st-b-stack">
          <TableBoard />
        </ModePair>
      </Section>
    </>
  );
}
