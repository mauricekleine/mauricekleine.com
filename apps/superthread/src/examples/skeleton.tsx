import type { CSSProperties } from "react";
import { Skeleton } from "@/components/superthread/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { CropMarks } from "@/site/CropMarks";
import { Plate, plate } from "@/site/Plate";

// The world's loading rows: a 16 px square where the mark lands, a name, and two figures at the right.
const names = [160, 120, 192] as const;

export function SkeletonRows() {
  return (
    <ul className="st-b-skel" aria-label="runs this week, loading" aria-busy="true">
      {names.map((width) => (
        <li key={width}>
          <Skeleton className="h-4 w-4" />
          <Skeleton style={{ width }} />
          <Skeleton className="ml-auto w-12" />
          <Skeleton className="ml-6 w-18" />
        </li>
      ))}
    </ul>
  );
}

// The runs table while it loads: each bar is as wide as the words it stands in for (a mark and a ship's name, two
// digits, a median, a status badge), so the loading table takes the same columns as the loaded one.
const shipNames = [28, 80, 44] as const;

export function SkeletonTable() {
  return (
    <Table aria-label="runs this week, loading" aria-busy="true">
      <TableHeader>
        <TableRow>
          <TableHead>ship</TableHead>
          <TableHead kind="number">runs</TableHead>
          <TableHead kind="number">median</TableHead>
          <TableHead className="st-b-lr">last run</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shipNames.map((width) => (
          <TableRow key={width}>
            <TableCell>
              <div className="st-b-ship">
                <Skeleton className="h-4 w-4" />
                <Skeleton style={{ width }} />
              </div>
            </TableCell>
            <TableCell kind="number">
              <Skeleton className="ml-auto w-4" />
            </TableCell>
            <TableCell kind="number">
              <Skeleton className="ml-auto w-12" />
            </TableCell>
            <TableCell className="st-b-lr">
              <Skeleton className="w-18" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// The empty place: the empty wedge at its own pixel size inside crop marks, and one line on what lands there. The
// field takes the plate's width (the phone plate's at 600 px and below), so the marks sit on the plate's corners.
const wide = plate("empty");
const narrow = plate("empty-phone");

export function EmptyRuns() {
  const style = {
    "--empty-w": `${wide?.w ?? 608}px`,
    "--empty-phone-w": `${narrow?.w ?? 326}px`,
  } as CSSProperties;
  return (
    <div className="st-b-empty" style={style}>
      <Plate name="empty" phone="empty-phone" width={608} height={120} />
      <p>
        <b>no runs yet</b> the first run lands here when an agent picks up a task.
      </p>
      <CropMarks />
    </div>
  );
}
