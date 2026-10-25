import { Skeleton } from "@/components/superthread/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";

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

// A table keeps its header and its rules while its rows load.
export function SkeletonTable() {
  return (
    <Table aria-label="runs this week, loading" aria-busy="true">
      <TableHeader>
        <TableRow>
          <TableHead>ship</TableHead>
          <TableHead kind="number">runs</TableHead>
          <TableHead kind="number">median</TableHead>
          <TableHead>last run</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {names.map((width) => (
          <TableRow key={width}>
            <TableCell>
              <Skeleton style={{ width: width - 40 }} />
            </TableCell>
            <TableCell kind="number">
              <Skeleton className="ml-auto w-6" />
            </TableCell>
            <TableCell kind="number">
              <Skeleton className="ml-auto w-12" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-18" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
