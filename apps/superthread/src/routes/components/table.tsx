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
      { id: "rows", title: "rows" },
      { id: "board", title: "board rows" },
      { id: "fold", title: "fold" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="table"
        lede="rows come from the row spacing: 48&nbsp;px in a table, 56&nbsp;px on a board. ids and numbers set in mono, so every figure holds its column."
      >
        <InstallLine items={["table"]} />
      </PageHead>

      <Section id="rows" title="rows">
        <p className="st-b-copy">
          the row under the pointer prints a 4&nbsp;px strip at half inside its first cell, beside the words, never
          behind them. a selected row prints it solid on the control hover fill. here constellation prints as hovered
          and quanta as selected.
        </p>
        <ModePair className="st-b-stack">
          <TableRuns />
        </ModePair>
        <Caption detail="rowedge" />
      </Section>

      <Section id="board" title="board rows">
        <p className="st-b-copy">
          set <code>rows=&quot;board&quot;</code> for 56&nbsp;px rows. a table wider than its column scrolls sideways
          inside its own box, with no fade at the cut edge, unless it folds. <code>receding</code> on a row prints it
          muted with no strike, for something still live and fading.
        </p>
        <ModePair className="st-b-stack">
          <TableBoard />
        </ModePair>
      </Section>

      <Section id="fold" title="fold">
        <p className="st-b-copy">
          set <code>fold</code> and the table reaches the panel&rsquo;s edges. above 776&nbsp;px of its own width it is
          a table of fixed columns, and a long word ends in an ellipsis. below that each row folds into two lines, with
          no sideways scroll. <code>fold</code> on a cell says where it lands: <code>lead</code>, <code>title</code>,{" "}
          <code>aside</code>, <code>meta</code> or <code>note</code>.
        </p>
        <ModePair
          className="st-b-stack"
          light={
            <GroundFrame mode="light" title="a folding table at full width, light" width={960} height={340}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a folding table at full width, dark" width={960} height={340}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <ModePair
          light={
            <GroundFrame mode="light" title="a folding table on a phone, light" height={330}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a folding table on a phone, dark" height={330}>
              <AppShellPanel>
                <TableFold />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <p className="st-b-copy">
          a head leaves the screen when the row folds and stays with a screen reader. the table sets its own roles,
          since a display change strips a table&rsquo;s meaning in some browsers. <code>flag</code> on a cell lifts a
          fact that is still open to foreground, and <code>scope=&quot;row&quot;</code> makes a cell its row&rsquo;s
          head. a lead column is 72&nbsp;px; set <code>--fold-lead</code> on the table for shorter words.
        </p>
      </Section>
    </>
  );
}
