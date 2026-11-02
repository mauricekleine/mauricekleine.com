import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  DataTable,
  SortableHead,
  TableDetail,
  TableDetailRow,
  TableDetailTrigger,
  TableEmpty,
  TableSubRow,
  TableTitle,
  type SortDirection,
} from "@/components/superthread/blocks/data-table";
import { TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/superthread/ui/table";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Badge } from "@/components/superthread/ui/badge";
import { Caption } from "@/site/Caption";
import { catalog } from "@/components/superthread/catalog";
import { GroundFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "data-table")!
  .serves!.map((app) => (app === "www" ? "the public site" : app))
  .join(", ");
export const Route = createFileRoute("/compositions/data-table")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "sort and row states" },
      { id: "titles", title: "titles" },
      { id: "fold", title: "fold" },
      { id: "detail", title: "detail" },
      { id: "sub-entries", title: "sub-entries" },
      { id: "results", title: "results" },
      { id: "empty", title: "empty results" },
    ],
  },
  component: Page,
});

const runs = [
  { id: "qt-014", ship: "quanta", chapters: 6 },
  { id: "tr-008", ship: "trisys", chapters: 3 },
  { id: "ar-021", ship: "artifacts", chapters: 9 },
];
function RunsTable() {
  const [sort, setSort] = useState<SortDirection>("descending");
  const [selected, setSelected] = useState<string[]>(["qt-014"]);
  const ordered = [...runs].sort((a, b) => (sort === "ascending" ? a.chapters - b.chapters : b.chapters - a.chapters));
  return (
    <DataTable label="draft collections">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">pick</TableHead>
          <TableHead scope="col" kind="id">
            id
          </TableHead>
          <TableHead scope="col">ship</TableHead>
          <SortableHead kind="number" sort={sort} onSort={setSort}>
            chapters
          </SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((run) => (
          <TableRow key={run.id} aria-selected={selected.includes(run.id)}>
            <TableCell>
              <Checkbox
                aria-label={`select ${run.id}`}
                checked={selected.includes(run.id)}
                onCheckedChange={(checked) =>
                  setSelected((current) => (checked ? [...current, run.id] : current.filter((id) => id !== run.id)))
                }
              />
            </TableCell>
            <TableCell kind="id">{run.id}</TableCell>
            <TableCell>{run.ship}</TableCell>
            <TableCell kind="number">{run.chapters}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}
function PrintedTable() {
  const [sort, setSort] = useState<SortDirection | null>(null);
  return (
    <DataTable label="printed row states" rows="board">
      <TableHeader>
        <TableRow>
          <SortableHead sort={sort} onSort={setSort}>
            row
          </SortableHead>
          <TableHead scope="col">status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>rest</TableCell>
          <TableCell>
            <Badge variant="queued" />
          </TableCell>
        </TableRow>
        <TableRow data-demo="hover">
          <TableCell>hover</TableCell>
          <TableCell>half edge</TableCell>
        </TableRow>
        <TableRow aria-selected="true">
          <TableCell>selected</TableCell>
          <TableCell>solid edge</TableCell>
        </TableRow>
      </TableBody>
    </DataTable>
  );
}

function SortState({ initial }: { initial: SortDirection }) {
  const [sort, setSort] = useState<SortDirection>(initial);
  return (
    <DataTable label={`${initial} sort specimen`}>
      <TableHeader>
        <TableRow>
          <SortableHead kind="number" sort={sort} onSort={setSort}>
            chapters
          </SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell kind="number">{sort === "ascending" ? "3" : "9"}</TableCell>
        </TableRow>
      </TableBody>
    </DataTable>
  );
}

function TitledTable() {
  return (
    <DataTable label="drafts by title">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">draft</TableHead>
          <TableHead scope="col" kind="id">
            id
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <TableTitle href="#titles">the reading layout</TableTitle>
          </TableCell>
          <TableCell kind="id">qt-014</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <TableTitle>notes with no page yet</TableTitle>
          </TableCell>
          <TableCell kind="id">tr-008</TableCell>
        </TableRow>
        <TableRow receding>
          <TableCell>
            <TableTitle href="#titles">the old chapter plan</TableTitle>
          </TableCell>
          <TableCell kind="id">ar-021</TableCell>
        </TableRow>
      </TableBody>
    </DataTable>
  );
}

const schedules = [
  {
    next: "07:00",
    name: "the morning digest",
    when: "every day at 07:00",
    source: "mail",
    last: "ran at 07:00",
  },
  {
    next: "09:30",
    name: "sort what came in",
    when: "when mail arrives",
    source: "needs a key",
    last: "ran monday",
    flag: true,
  },
  {
    next: "friday",
    name: "a schedule with a long name that runs past its column",
    when: "every friday at 17:00",
    source: "calendar",
    last: "ran last friday",
  },
  {
    next: "paused",
    name: "the old reading list",
    when: "every sunday at 10:00",
    source: "notes",
    last: "ran in october",
    receding: true,
  },
];

function SchedulesTable() {
  const [sort, setSort] = useState<SortDirection>("ascending");
  const ordered = sort === "ascending" ? schedules : [...schedules].reverse();
  return (
    <DataTable label="schedules" fold>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            next
          </TableHead>
          <SortableHead sort={sort} onSort={setSort}>
            schedule
          </SortableHead>
          <TableHead scope="col" className="w-[168px]">
            runs
          </TableHead>
          <TableHead scope="col" className="w-[188px]">
            source
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((schedule) => (
          <TableRow key={schedule.name} receding={schedule.receding}>
            <TableCell fold="lead" kind="id">
              {schedule.next}
            </TableCell>
            <TableCell fold="title" scope="row">
              <TableTitle href="#fold">{schedule.name}</TableTitle>
            </TableCell>
            <TableCell fold="meta">{schedule.when}</TableCell>
            <TableCell fold="aside" flag={schedule.flag}>
              {schedule.source}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}

const events = [
  {
    time: "09:14",
    title: "sent the morning digest",
    meta: "the morning digest",
    took: "2m",
    detail: "12 items, 3 of them new. nothing needed a decision.",
  },
  {
    time: "08:02",
    title: "sorted what came in",
    meta: "sort what came in",
    took: "40s",
    detail: "4 threads filed, 1 left for you to read.",
  },
  {
    time: "07:30",
    title: "refreshed the reading list",
    meta: "the old reading list",
    took: "1m",
    detail: "nothing changed since sunday.",
  },
];

// A log of what ran today. The results still waiting on someone are flagged, so the failure the retry closed at 08:06
// reads as quietly as the retry.
const results = [
  { time: "09:12", title: "wrote the morning brief", result: "done" },
  { time: "08:40", title: "sorted what came in", result: "needs you", open: true },
  { time: "08:06", title: "refreshed the calendar", result: "done" },
  { time: "08:05", title: "refreshed the calendar", result: "failed" },
  { time: "07:30", title: "refreshed the reading list", result: "skipped" },
  { time: "07:00", title: "checked the invoices", result: "paused", open: true },
];

function ResultsTable() {
  return (
    <DataTable label="what ran today and how each ended" fold className="[--fold-lead:60px]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            time
          </TableHead>
          <TableHead scope="col">event</TableHead>
          <TableHead scope="col" className="w-[188px]">
            result
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((entry) => (
          <TableRow key={entry.time}>
            <TableCell fold="lead" kind="id">
              {entry.time}
            </TableCell>
            <TableCell fold="title" scope="row">
              <TableTitle>{entry.title}</TableTitle>
            </TableCell>
            <TableCell fold="aside" flag={entry.open}>
              {entry.result}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}

function EventsTable() {
  return (
    <DataTable label="what ran today" fold className="[--fold-lead:60px]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            time
          </TableHead>
          <TableHead scope="col">event</TableHead>
          <TableHead scope="col" className="w-[188px]">
            schedule
          </TableHead>
          <TableHead scope="col" kind="number" className="w-[116px]">
            took
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event, index) => (
          <TableDetail key={event.time} defaultOpen={index === 0}>
            <TableRow>
              <TableCell fold="lead" kind="id">
                {event.time}
              </TableCell>
              <TableCell fold="title" scope="row">
                <TableDetailTrigger>{event.title}</TableDetailTrigger>
              </TableCell>
              <TableCell fold="meta">{event.meta}</TableCell>
              <TableCell fold="aside" kind="number">
                {event.took}
              </TableCell>
            </TableRow>
            <TableDetailRow columns={4}>{event.detail}</TableDetailRow>
          </TableDetail>
        ))}
      </TableBody>
    </DataTable>
  );
}

// A plain table takes the same rows: no lead column, so the detail starts at the first cell.
function PlainDetailTable() {
  return (
    <DataTable label="what ran today, plain">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">event</TableHead>
          <TableHead scope="col" kind="number">
            took
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.slice(0, 2).map((event) => (
          <TableDetail key={event.time} defaultOpen={event.time === "09:14"}>
            <TableRow>
              <TableCell>
                <TableDetailTrigger>{event.title}</TableDetailTrigger>
              </TableCell>
              <TableCell kind="number">{event.took}</TableCell>
            </TableRow>
            <TableDetailRow columns={2} lead={false}>
              {event.detail}
            </TableDetailRow>
          </TableDetail>
        ))}
      </TableBody>
    </DataTable>
  );
}

const batches = [
  {
    time: "10:02",
    title: "drew the figure plates",
    took: "6m",
    steps: ["plate 1 of 3", "plate 2 of 3", "plate 3 of 3"],
  },
  { time: "09:40", title: "pinned the font headers", took: "1m", steps: ["checked the headers"] },
];

function SubEntriesTable() {
  return (
    <DataTable label="runs and their steps" fold className="[--fold-lead:60px]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            time
          </TableHead>
          <TableHead scope="col">run</TableHead>
          <TableHead scope="col" kind="number" className="w-[116px]">
            took
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.flatMap((batch) => [
          <TableRow key={batch.title}>
            <TableCell fold="lead" kind="id">
              {batch.time}
            </TableCell>
            <TableCell fold="title" scope="row">
              <TableTitle>{batch.title}</TableTitle>
            </TableCell>
            <TableCell fold="aside" kind="number">
              {batch.took}
            </TableCell>
          </TableRow>,
          ...batch.steps.map((step) => (
            <TableSubRow key={`${batch.title} ${step}`} columns={3}>
              {step}
            </TableSubRow>
          )),
        ])}
      </TableBody>
    </DataTable>
  );
}

function PanelPair({
  title,
  height,
  phoneHeight,
  children,
}: {
  title: string;
  height: number;
  phoneHeight: number;
  children: ReactNode;
}) {
  return (
    <>
      <ModePair
        className="st-cb-stack"
        light={
          <GroundFrame mode="light" title={`${title} at full width, light`} width={960} height={height}>
            <AppShellPanel>{children}</AppShellPanel>
          </GroundFrame>
        }
        dark={
          <GroundFrame mode="dark" title={`${title} at full width, dark`} width={960} height={height}>
            <AppShellPanel>{children}</AppShellPanel>
          </GroundFrame>
        }
      />
      <ModePair
        light={
          <GroundFrame mode="light" title={`${title} on a phone, light`} height={phoneHeight}>
            <AppShellPanel>{children}</AppShellPanel>
          </GroundFrame>
        }
        dark={
          <GroundFrame mode="dark" title={`${title} on a phone, dark`} height={phoneHeight}>
            <AppShellPanel>{children}</AppShellPanel>
          </GroundFrame>
        }
      />
    </>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="data table"
        lede="a named table with sortable heads, selected rows and an empty result. the app supplies the data and accepts each sort change."
      >
        <InstallLine items={["data-table"]} />
      </PageHead>
      <p className="st-cb-serves">serves {serves}.</p>

      <Section id="example" title="example">
        <p className="st-cb-copy">
          sort the chapter count in either direction. check a row to select it; the selection follows its id when the
          order changes. a wider table scrolls inside its own box, or folds.
        </p>
        <ModePair className="st-cb-stack">
          <RunsTable />
        </ModePair>
      </Section>
      <Section id="states" title="sort and row states">
        <p className="st-cb-copy">
          the first head starts unsorted. its chevron appears under the pointer or keyboard focus; a click chooses
          ascending, then descending. these board rows use the 56 px measure.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-flow">
            <PrintedTable />
            <div className="st-cb-states">
              {(["ascending", "descending"] as const).map((direction) => (
                <State key={direction} name={direction} note="click the head to reverse the sort">
                  <SortState initial={direction} />
                </State>
              ))}
            </div>
          </div>
        </ModePair>
        <Caption detail="rowedge" />
      </Section>
      <Section id="titles" title="titles">
        <p className="st-cb-copy">
          <code>TableTitle</code> is a row&rsquo;s name: plain text until it gets an href or the app&rsquo;s router
          link, then a link that underlines on hover and reaches 44 px on a phone. a <code>receding</code> row is still
          live and fading, so it prints muted with no strike.
        </p>
        <ModePair className="st-cb-stack">
          <TitledTable />
        </ModePair>
      </Section>
      <Section id="fold" title="fold">
        <p className="st-cb-copy">
          set <code>fold</code> and the table reaches the panel&rsquo;s edges. above 776&nbsp;px of its own width it is
          a table of fixed columns. below that each row folds into two lines, with no sideways scroll. a{" "}
          <code>TableTitle</code> link covers its whole row, and a sortable head stays on screen as one line of sort
          buttons. <code>flag</code> lifts a fact that is still open to foreground.
        </p>
        <PanelPair title="a folding table" height={390} phoneHeight={460}>
          <SchedulesTable />
        </PanelPair>
      </Section>
      <Section id="detail" title="detail">
        <p className="st-cb-copy">
          <code>TableDetail</code> holds the open state, controlled or its own. <code>TableDetailTrigger</code> is the
          row&rsquo;s name as a button: its area covers the row and its chevron turns over while the detail is open.{" "}
          <code>TableDetailRow</code> lines up with the title and takes the row&rsquo;s rule. it stays mounted while
          closed, so what you typed in it survives. the first row here starts open; open the others. a plain table takes
          the same rows.
        </p>
        <PanelPair title="rows that open a detail" height={480} phoneHeight={420}>
          <EventsTable />
        </PanelPair>
        <ModePair className="st-cb-stack">
          <PlainDetailTable />
        </ModePair>
      </Section>
      <Section id="sub-entries" title="sub-entries">
        <p className="st-cb-copy">
          <code>TableSubRow</code> hangs an entry off the row above, under its title, with a connector in the rule ink.
          the row keeps its rule for the last entry. <code>lead={"{false}"}</code> on a detail or a sub-entry drops the
          empty lead cell, for a table with no lead column.
        </p>
        <PanelPair title="runs and their steps" height={440} phoneHeight={420}>
          <SubEntriesTable />
        </PanelPair>
      </Section>
      <Section id="results" title="results">
        <p className="st-cb-copy">
          a log prints how each entry ended as a plain word, with no badge: <code>done</code>, <code>needs you</code>,{" "}
          <code>failed</code>, <code>skipped</code> or <code>paused</code>. ink follows what is open: <code>flag</code>{" "}
          lifts a result that still waits on someone to foreground, and a closed one stays muted, so a failure a retry
          closed prints as quietly as done. a ship&rsquo;s word is its own.
        </p>
        <PanelPair title="a log of results" height={490} phoneHeight={470}>
          <ResultsTable />
        </PanelPair>
      </Section>
      <Section id="empty" title="empty results">
        <p className="st-cb-copy">
          one real row spans every column. its status announces the changed result without removing the table or its
          column names.
        </p>
        <ModePair className="st-cb-stack">
          <DataTable label="waiting collections">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">id</TableHead>
                <TableHead scope="col">ship</TableHead>
                <TableHead scope="col">status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty columns={3} title="no waiting collections">
                every collection has moved on. change the filter to see more.
              </TableEmpty>
            </TableBody>
          </DataTable>
        </ModePair>
      </Section>
    </>
  );
}
