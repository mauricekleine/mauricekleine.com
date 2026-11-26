import { useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/superthread/ui/button-group";
import { State } from "@/examples/input";
export function ButtonGroupExample() {
  const [runs, setRuns] = useState(3);
  return (
    <div className="st-e-stack">
      <ButtonGroup aria-label="Orbit queue">
        <ButtonGroupText>Queued {runs}</ButtonGroupText>
        <Button variant="outline" onClick={() => setRuns(runs + 1)}>
          Add run
        </Button>
        <Button variant="outline" disabled={runs === 0} onClick={() => setRuns(Math.max(0, runs - 1))}>
          Start
        </Button>
      </ButtonGroup>
      <p className="st-e-hint" role="status">
        {runs} runs in the Orbit queue
      </p>
    </div>
  );
}
export function ButtonGroupParts() {
  return (
    <div className="st-e-stack" inert>
      <State className="st-a-wide" name="Text addon" note="40 px, secondary stock">
        <ButtonGroup aria-label="Run addon">
          <ButtonGroupText>Run 024</ButtonGroupText>
          <Button variant="outline">Open</Button>
        </ButtonGroup>
      </State>
      <State className="st-a-wide" name="Separator" note="Input ink, stretched to the row">
        <ButtonGroup aria-label="Separated actions">
          <Button variant="secondary">Retry</Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">Archive</Button>
        </ButtonGroup>
      </State>
      <State className="st-a-wide" name="Nested groups" note="8 px between the groups">
        <ButtonGroup aria-label="Run tools">
          <ButtonGroup aria-label="History">
            <Button variant="outline" size="sm">
              Back
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Run action">
            <Button size="sm">Open</Button>
          </ButtonGroup>
        </ButtonGroup>
      </State>
    </div>
  );
}
export function ButtonGroupLayout() {
  return (
    <div className="st-e-stack" inert>
      {(["horizontal", "vertical"] as const).map((orientation) => (
        <State className="st-a-wide" key={orientation} name={orientation} note="Neighbours share a 1 px edge">
          <ButtonGroup
            orientation={orientation}
            aria-label={`${orientation === "horizontal" ? "Horizontal" : "Vertical"} run actions`}
          >
            <Button variant="outline">Retry</Button>
            <Button variant="outline">Archive</Button>
          </ButtonGroup>
        </State>
      ))}
    </div>
  );
}
export function ButtonGroupStates() {
  return (
    <div className="st-e-stack" inert>
      {[
        { name: "Rest", note: "Child buttons keep their edges" },
        { name: "Hover", note: "Child control hover fill", demo: "hover" },
        { name: "Focus", note: "Focused child rises above its neighbour", demo: "focus-visible" },
        { name: "Pressed", note: "Child control press fill", demo: "active" },
        { name: "Disabled", note: "Child disabled edge screen", disabled: true },
      ].map((s) => (
        <State className="st-a-wide" key={s.name} name={s.name} note={s.note}>
          <ButtonGroup aria-label={`Actions, ${s.name.toLowerCase()}`}>
            <Button variant="outline" data-demo={s.demo} disabled={s.disabled}>
              Retry
            </Button>
            <Button variant="outline" disabled={s.disabled}>
              Open
            </Button>
          </ButtonGroup>
        </State>
      ))}
    </div>
  );
}
