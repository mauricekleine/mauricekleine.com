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
import { Section as BlockSection, SectionHeader, SectionTitle } from "@/components/superthread/blocks/section-header";
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
  .serves!.map((app) => (app === "www" ? "the public site" : app[0]!.toUpperCase() + app.slice(1)))
  .join(", ");
export const Route = createFileRoute("/compositions/data-table")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "Sort and row states" },
      { id: "titles", title: "Titles" },
      { id: "fold", title: "Fold" },
      { id: "detail", title: "Detail" },
      { id: "sub-entries", title: "Sub-entries" },
      { id: "results", title: "Results" },
      { id: "under-a-head", title: "Under a head" },
      { id: "empty", title: "Empty results" },
    ],
  },
  component: Page,
});

const runs = [
  { id: "qt-014", ship: "Quanta", chapters: 6 },
  { id: "tr-008", ship: "Trisys", chapters: 3 },
  { id: "ar-021", ship: "Artifacts", chapters: 9 },
];
function RunsTable() {
  const [sort, setSort] = useState<SortDirection>("descending");
  const [selected, setSelected] = useState<string[]>(["qt-014"]);
  const ordered = [...runs].sort((a, b) => (sort === "ascending" ? a.chapters - b.chapters : b.chapters - a.chapters));
  return (
    <DataTable label="Draft collections">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Pick</TableHead>
          <TableHead scope="col" kind="id">
            ID
          </TableHead>
          <TableHead scope="col">Ship</TableHead>
          <SortableHead kind="number" sort={sort} onSort={setSort}>
            Chapters
          </SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((run) => (
          <TableRow key={run.id} aria-selected={selected.includes(run.id)}>
            <TableCell>
              <Checkbox
                aria-label={`Select ${run.id}`}
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
    <DataTable label="Printed row states" rows="board">
      <TableHeader>
        <TableRow>
          <SortableHead sort={sort} onSort={setSort}>
            Row
          </SortableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Rest</TableCell>
          <TableCell>
            <Badge variant="queued" />
          </TableCell>
        </TableRow>
        <TableRow data-demo="hover">
          <TableCell>Hover</TableCell>
          <TableCell>Half edge</TableCell>
        </TableRow>
        <TableRow aria-selected="true">
          <TableCell>Selected</TableCell>
          <TableCell>Solid edge</TableCell>
        </TableRow>
      </TableBody>
    </DataTable>
  );
}

function SortState({ initial }: { initial: SortDirection }) {
  const [sort, setSort] = useState<SortDirection>(initial);
  return (
    <DataTable label={`${initial === "ascending" ? "Ascending" : "Descending"} sort specimen`}>
      <TableHeader>
        <TableRow>
          <SortableHead kind="number" sort={sort} onSort={setSort}>
            Chapters
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
    <DataTable label="Drafts by title">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Draft</TableHead>
          <TableHead scope="col" kind="id">
            ID
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <TableTitle href="#titles">The reading layout</TableTitle>
          </TableCell>
          <TableCell kind="id">qt-014</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <TableTitle>Notes with no page yet</TableTitle>
          </TableCell>
          <TableCell kind="id">tr-008</TableCell>
        </TableRow>
        <TableRow receding>
          <TableCell>
            <TableTitle href="#titles">The old chapter plan</TableTitle>
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
    name: "The morning digest",
    when: "Every day at 07:00",
    source: "Mail",
    last: "Ran at 07:00",
  },
  {
    next: "09:30",
    name: "Sort what came in",
    when: "When mail arrives",
    source: "Needs a key",
    last: "Ran Monday",
    flag: true,
  },
  {
    next: "Friday",
    name: "A schedule with a long name that runs past its column",
    when: "Every Friday at 17:00",
    source: "Calendar",
    last: "Ran last Friday",
  },
  {
    next: "Paused",
    name: "The old reading list",
    when: "Every Sunday at 10:00",
    source: "Notes",
    last: "Ran in October",
    receding: true,
  },
];

function SchedulesTable() {
  const [sort, setSort] = useState<SortDirection>("ascending");
  const ordered = sort === "ascending" ? schedules : [...schedules].reverse();
  return (
    <DataTable label="Schedules" fold>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            Next
          </TableHead>
          <SortableHead sort={sort} onSort={setSort}>
            Schedule
          </SortableHead>
          <TableHead scope="col" className="w-[168px]">
            Runs
          </TableHead>
          <TableHead scope="col" className="w-[188px]">
            Source
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
    title: "Sent the morning digest",
    meta: "The morning digest",
    took: "2m",
    detail: "12 items, 3 of them new. Nothing needed a decision.",
  },
  {
    time: "08:02",
    title: "Sorted what came in",
    meta: "Sort what came in",
    took: "40s",
    detail: "4 threads filed, 1 left for you to read.",
  },
  {
    time: "07:30",
    title: "Refreshed the reading list",
    meta: "The old reading list",
    took: "1m",
    detail: "Nothing changed since Sunday.",
  },
];

// A log of what ran today. The results still waiting on someone are flagged, so the failure the retry closed at 08:06
// reads as quietly as the retry.
const results = [
  { time: "09:12", title: "Wrote the morning brief", result: "Done" },
  { time: "08:40", title: "Sorted what came in", result: "Needs you", open: true },
  { time: "08:06", title: "Refreshed the calendar", result: "Done" },
  { time: "08:05", title: "Refreshed the calendar", result: "Failed" },
  { time: "07:30", title: "Refreshed the reading list", result: "Skipped" },
  { time: "07:00", title: "Checked the invoices", result: "Paused", open: true },
];

function ResultsTable() {
  return (
    <DataTable label="What ran today and how each ended" fold className="[--fold-lead:60px]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            Time
          </TableHead>
          <TableHead scope="col">Event</TableHead>
          <TableHead scope="col" className="w-[188px]">
            Result
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

// A day's log under each day's head, as an activity page prints it: each fold hangs from its ruled head's rule, and
// the last day's quiet head has no rule, so its fold keeps its own.
const days: { day: string; label: string; entries: typeof results; quiet?: "subtitle" }[] = [
  { day: "Today", label: "today", entries: results.slice(0, 3) },
  { day: "Yesterday", label: "yesterday", entries: results.slice(3, 5) },
  { day: "Monday", label: "Monday", entries: results.slice(5), quiet: "subtitle" },
];

function DaysTable() {
  return (
    <div>
      {days.map(({ day, label, entries, quiet }) => (
        <BlockSection key={day}>
          <SectionHeader quiet={quiet}>
            <SectionTitle>{day}</SectionTitle>
          </SectionHeader>
          <DataTable label={`What ran ${label}`} fold className="[--fold-lead:60px]">
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.time}>
                  <TableCell fold="lead" kind="id" className="@min-[776px]/fold:w-[116px]">
                    {entry.time}
                  </TableCell>
                  <TableCell fold="title" scope="row">
                    <TableTitle>{entry.title}</TableTitle>
                  </TableCell>
                  <TableCell fold="aside" flag={entry.open} className="@min-[776px]/fold:w-[188px]">
                    {entry.result}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </BlockSection>
      ))}
    </div>
  );
}

function EventsTable() {
  return (
    <DataTable label="What ran today" fold className="[--fold-lead:60px]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            Time
          </TableHead>
          <TableHead scope="col">Event</TableHead>
          <TableHead scope="col" className="w-[188px]">
            Schedule
          </TableHead>
          <TableHead scope="col" kind="number" className="w-[116px]">
            Took
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
    <DataTable label="What ran today, plain">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Event</TableHead>
          <TableHead scope="col" kind="number">
            Took
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
    title: "Drew the figure plates",
    took: "6m",
    steps: ["Plate 1 of 3", "Plate 2 of 3", "Plate 3 of 3"],
  },
  { time: "09:40", title: "Pinned the font headers", took: "1m", steps: ["Checked the headers"] },
];

function SubEntriesTable() {
  return (
    <DataTable label="Runs and their steps" fold className="[--fold-lead:60px]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[116px]">
            Time
          </TableHead>
          <TableHead scope="col">Run</TableHead>
          <TableHead scope="col" kind="number" className="w-[116px]">
            Took
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
        title="Data table"
        lede="A named table with sortable heads, selected rows and an empty result. The app supplies the data and accepts each sort change."
      >
        <InstallLine items={["data-table"]} />
      </PageHead>
      <p className="st-cb-serves">Serves {serves}.</p>

      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Sort the chapter count in either direction. Check a row to select it; the selection follows its ID when the
          order changes. A wider table scrolls inside its own box, or folds.
        </p>
        <ModePair className="st-cb-stack">
          <RunsTable />
        </ModePair>
      </Section>
      <Section id="states" title="Sort and row states">
        <p className="st-cb-copy">
          The first head starts unsorted. Its chevron appears under the pointer or keyboard focus; a click chooses
          ascending, then descending. These board rows use the 56 px measure.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-flow">
            <PrintedTable />
            <div className="st-cb-states">
              {(["ascending", "descending"] as const).map((direction) => (
                <State
                  key={direction}
                  name={direction === "ascending" ? "Ascending" : "Descending"}
                  note="Click the head to reverse the sort"
                >
                  <SortState initial={direction} />
                </State>
              ))}
            </div>
          </div>
        </ModePair>
        <Caption detail="rowedge" />
      </Section>
      <Section id="titles" title="Titles">
        <p className="st-cb-copy">
          <code>TableTitle</code> is a row&rsquo;s name: plain text until it gets an href or the app&rsquo;s router
          link, then a link that underlines on hover and reaches 44 px on a phone. A <code>receding</code> row is still
          live and fading, so it prints muted with no strike.
        </p>
        <ModePair className="st-cb-stack">
          <TitledTable />
        </ModePair>
      </Section>
      <Section id="fold" title="Fold">
        <p className="st-cb-copy">
          Set <code>fold</code> and the table reaches the panel&rsquo;s edges. Above 776&nbsp;px of its own width it is
          a table of fixed columns. Below that each row folds into two lines, with no sideways scroll. A{" "}
          <code>TableTitle</code> link covers its whole row, and a sortable head stays on screen as one line of sort
          buttons. <code>flag</code> lifts a fact that is still open to foreground.
        </p>
        <PanelPair title="A folding table" height={390} phoneHeight={460}>
          <SchedulesTable />
        </PanelPair>
      </Section>
      <Section id="detail" title="Detail">
        <p className="st-cb-copy">
          <code>TableDetail</code> holds the open state, controlled or its own. <code>TableDetailTrigger</code> is the
          row&rsquo;s name as a button: its area covers the row and its chevron turns over while the detail is open.{" "}
          <code>TableDetailRow</code> lines up with the title and takes the row&rsquo;s rule. It stays mounted while
          closed, so what you typed in it survives. The first row here starts open; open the others. A plain table takes
          the same rows.
        </p>
        <PanelPair title="Rows that open a detail" height={480} phoneHeight={420}>
          <EventsTable />
        </PanelPair>
        <ModePair className="st-cb-stack">
          <PlainDetailTable />
        </ModePair>
      </Section>
      <Section id="sub-entries" title="Sub-entries">
        <p className="st-cb-copy">
          <code>TableSubRow</code> hangs an entry off the row above, under its title, with a connector in the rule ink.
          The row keeps its rule for the last entry. <code>lead={"{false}"}</code> on a detail or a sub-entry drops the
          empty lead cell, for a table with no lead column.
        </p>
        <PanelPair title="Runs and their steps" height={440} phoneHeight={420}>
          <SubEntriesTable />
        </PanelPair>
      </Section>
      <Section id="results" title="Results">
        <p className="st-cb-copy">
          A log prints how each entry ended as a plain word, with no badge: <code>done</code>, <code>needs you</code>,{" "}
          <code>failed</code>, <code>skipped</code> or <code>paused</code>. Ink follows what is open: <code>flag</code>{" "}
          lifts a result that still waits on someone to foreground, and a closed one stays muted, so a failure a retry
          closed prints as quietly as done. A ship&rsquo;s word is its own.
        </p>
        <PanelPair title="A log of results" height={490} phoneHeight={470}>
          <ResultsTable />
        </PanelPair>
      </Section>
      <Section id="under-a-head" title="Under a head">
        <p className="st-cb-copy">
          A fold with no head row opens on its own rule. Straight under a section header it hangs from the
          header&rsquo;s rule instead, as list rows do, so the two never print 16&nbsp;px apart. Monday&rsquo;s quiet
          head prints no rule, so its fold keeps its own.
        </p>
        <PanelPair title="A day's log under its heads" height={640} phoneHeight={700}>
          <DaysTable />
        </PanelPair>
      </Section>
      <Section id="empty" title="Empty results">
        <p className="st-cb-copy">
          One real row spans every column. Its status announces the changed result without removing the table or its
          column names.
        </p>
        <ModePair className="st-cb-stack">
          <DataTable label="Waiting collections">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">Ship</TableHead>
                <TableHead scope="col">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty columns={3} title="No waiting collections">
                Every collection has moved on. Change the filter to see more.
              </TableEmpty>
            </TableBody>
          </DataTable>
        </ModePair>
      </Section>
    </>
  );
}
