import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { GroundFrame } from "@/examples/compositions-a";
import { TableBoard, TableFold, TableRuns } from "@/examples/table";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/table")({
  staticData: {
    sections: [
      { id: "rows", title: "Rows" },
      { id: "board", title: "Board rows" },
      { id: "fold", title: "Fold" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Table"
        lede="Rows come from the row spacing: 48&nbsp;px in a table, 56&nbsp;px on a board. IDs and numbers set in mono, so every figure holds its column."
      >
        <InstallLine items={["table"]} />
      </PageHead>

      <Section id="rows" title="Rows">
        <p className="st-b-copy">
          The row under the pointer prints a 4&nbsp;px strip at half inside its first cell, beside the words, never
          behind them. A selected row prints it solid on the control hover fill. Here Constellation prints as hovered
          and Quanta as selected.
        </p>
        <ModePair className="st-b-stack">
          <TableRuns />
        </ModePair>
        <Caption detail="rowedge" />
      </Section>

      <Section id="board" title="Board rows">
        <p className="st-b-copy">
          Set <code>rows=&quot;board&quot;</code> for 56&nbsp;px rows. A table wider than its column scrolls sideways
          inside its own box, with no fade at the cut edge, unless it folds. <code>receding</code> on a row prints it
          muted with no strike, for something still live and fading.
        </p>
        <ModePair className="st-b-stack">
          <TableBoard />
        </ModePair>
      </Section>

      <Section id="fold" title="Fold">
        <p className="st-b-copy">
          Set <code>fold</code> and the table reaches the panel&rsquo;s edges. Above 776&nbsp;px of its own width it is
          a table of fixed columns, and a long word ends in an ellipsis. Below that each row folds into two lines, with
          no sideways scroll. <code>fold</code> on a cell says where it lands: <code>lead</code>, <code>title</code>,{" "}
          <code>aside</code>, <code>meta</code> or <code>note</code>.
        </p>
        <ModePair
          className="st-b-stack"
          light={
            <GroundFrame mode="light" title="A folding table at full width, light" width={960} height={340}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A folding table at full width, dark" width={960} height={340}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <ModePair
          light={
            <GroundFrame mode="light" title="A folding table on a phone, light" height={330}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="A folding table on a phone, dark" height={330}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <p className="st-b-copy">
          A head leaves the screen when the row folds and stays with a screen reader. The table sets its own roles,
          since a display change strips a table&rsquo;s meaning in some browsers. <code>flag</code> on a cell lifts a
          fact that is still open to foreground, and <code>scope=&quot;row&quot;</code> makes a cell its row&rsquo;s
          head. A lead column is 72&nbsp;px; set <code>--fold-lead</code> on the table for shorter words.
        </p>
      </Section>
    </>
  );
}
