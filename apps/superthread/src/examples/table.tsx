import { fleet } from "@/components/superthread/lib/fleet";
import { Badge } from "@/components/superthread/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/superthread/ui/table";

type ShipId = (typeof fleet)[number]["id"];
type State = "done" | "running" | "waiting" | "failed" | "queued";

// A ship's 16 px mark beside its name: the key tile on light stock, the paper tile on dark; CSS shows the one that
// matches the mode around it. The name carries the meaning, so the marks are decorative.
export function ShipName({ id }: { id: ShipId }) {
  const ship = fleet.find((entry) => entry.id === id);
  if (!ship) return null;
  return (
    <span className="st-b-ship">
      <img className="st-b-mark-light" src={`/marks/${id}/${ship.mark.light}`} width={16} height={16} alt="" />
      <img className="st-b-mark-dark" src={`/marks/${id}/${ship.mark.dark}`} width={16} height={16} alt="" />
      {ship.name}
    </span>
  );
}

const runs: readonly { ship: ShipId; runs: number; median: string; last: State }[] = [
  { ship: "orbit", runs: 70, median: "4m 12s", last: "running" },
  { ship: "constellation", runs: 31, median: "1m 48s", last: "done" },
  { ship: "quanta", runs: 15, median: "6m 05s", last: "waiting" },
  { ship: "artifacts", runs: 13, median: "2m 30s", last: "failed" },
];

// The world's runs table: constellation prints as the row under the pointer, quanta as the selected row. The last
// run column stands off the figures by the world's gap, which tightens at 900 px and below (st-b-lr).
export function TableRuns() {
  return (
    <Table>
      <TableCaption className="text-left">runs this week</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ship</TableHead>
          <TableHead kind="number">runs</TableHead>
          <TableHead kind="number">median</TableHead>
          <TableHead className="st-b-lr">last run</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((row) => (
          <TableRow
            key={row.ship}
            data-demo={row.ship === "constellation" ? "hover" : undefined}
            data-state={row.ship === "quanta" ? "selected" : undefined}
          >
            <TableCell>
              <ShipName id={row.ship} />
            </TableCell>
            <TableCell kind="number">{row.runs}</TableCell>
            <TableCell kind="number">{row.median}</TableCell>
            <TableCell className="st-b-lr">
              <Badge variant={row.last} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const tasks: readonly { id: string; task: string; ship: ShipId; state: State }[] = [
  { id: "t-2041", task: "rotate the build cache", ship: "orbit", state: "running" },
  { id: "t-2038", task: "pin the font headers", ship: "trisys", state: "waiting" },
  { id: "t-2035", task: "draw the figure plates", ship: "quanta", state: "done" },
  { id: "t-2033", task: "move the rail to the bar", ship: "constellation", state: "queued" },
];

export function TableBoard() {
  return (
    <Table rows="board">
      <TableCaption className="text-left">tasks on the board</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead kind="id">id</TableHead>
          <TableHead>task</TableHead>
          <TableHead>ship</TableHead>
          <TableHead>state</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((row) => (
          <TableRow key={row.id}>
            <TableCell kind="id">{row.id}</TableCell>
            <TableCell>{row.task}</TableCell>
            <TableCell>
              <ShipName id={row.ship} />
            </TableCell>
            <TableCell>
              <Badge variant={row.state} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
