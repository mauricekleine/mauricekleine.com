import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DataTable, SortableHead, TableEmpty, type SortDirection } from "@/components/superthread/blocks/data-table";
import { TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/superthread/ui/table";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Badge } from "@/components/superthread/ui/badge";
import { Caption } from "@/site/Caption";
import { catalog } from "@/components/superthread/catalog";
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
          order changes. wider tables scroll inside their own box.
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
