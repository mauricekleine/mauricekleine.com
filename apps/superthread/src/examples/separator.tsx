import { Fragment } from "react";
import { Separator } from "@/components/superthread/ui/separator";

const runs = [
  { ship: "orbit", runs: 70, median: "4m 12s" },
  { ship: "constellation", runs: 31, median: "1m 48s" },
  { ship: "quanta", runs: 15, median: "6m 05s" },
];

// Runs this week: a horizontal separator between the rows, and vertical ones between the facts inside a row.
export function SeparatorExample() {
  return (
    <div className="st-pass-runs">
      <p className="type-meta">runs this week</p>
      {runs.map((run) => (
        <Fragment key={run.ship}>
          <Separator />
          <div className="st-pass-run">
            <b>{run.ship}</b>
            <Separator orientation="vertical" />
            <span>{run.runs} runs</span>
            <Separator orientation="vertical" />
            <span>median {run.median}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
