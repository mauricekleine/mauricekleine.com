import { useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";

const ITEMS = 8;

// A live bar: each press installs one more item, so the fill travels at the brand ease (and steps under reduced
// motion). After the last item it starts over.
export function ProgressExample() {
  const [done, setDone] = useState(5);
  const finished = done === ITEMS;
  return (
    <div className="st-b-progress">
      <Progress value={Math.floor((done / ITEMS) * 100)}>
        <ProgressLabel>
          {finished ? `${ITEMS} of ${ITEMS} items installed` : `installing ${done} of ${ITEMS} items`}
        </ProgressLabel>
        <ProgressValue />
      </Progress>
      <Button size="sm" variant="outline" onClick={() => setDone(finished ? 0 : done + 1)}>
        {finished ? "start over" : "install the next item"}
      </Button>
    </div>
  );
}

const bars = [
  { value: 12, label: "just started" },
  { value: 62, label: "past half" },
  { value: 100, label: "finished, no edge" },
] as const;

export function ProgressEdges() {
  return (
    <div className="st-b-stack-list">
      {bars.map(({ value, label }) => (
        <Progress key={value} value={value}>
          <ProgressLabel>{label}</ProgressLabel>
          <ProgressValue />
        </Progress>
      ))}
    </div>
  );
}
