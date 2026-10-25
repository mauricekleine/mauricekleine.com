import { useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/superthread/ui/button-group";
import { State } from "@/examples/input";
export function ButtonGroupExample() {
  const [runs, setRuns] = useState(3);
  return (
    <div className="st-e-stack">
      <ButtonGroup aria-label="orbit queue">
        <ButtonGroupText>queued {runs}</ButtonGroupText>
        <Button variant="outline" onClick={() => setRuns(runs + 1)}>
          add run
        </Button>
        <Button variant="outline" disabled={runs === 0} onClick={() => setRuns(Math.max(0, runs - 1))}>
          start
        </Button>
      </ButtonGroup>
      <p className="st-e-hint" role="status">
        {runs} runs in the orbit queue
      </p>
    </div>
  );
}
export function ButtonGroupParts() {
  return (
    <div className="st-e-stack" inert>
      <State className="st-a-wide" name="text addon" note="40 px, secondary stock">
        <ButtonGroup aria-label="run addon">
          <ButtonGroupText>run 024</ButtonGroupText>
          <Button variant="outline">open</Button>
        </ButtonGroup>
      </State>
      <State className="st-a-wide" name="separator" note="input ink, stretched to the row">
        <ButtonGroup aria-label="separated actions">
          <Button variant="secondary">retry</Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">archive</Button>
        </ButtonGroup>
      </State>
      <State className="st-a-wide" name="nested groups" note="8 px between the groups">
        <ButtonGroup aria-label="run tools">
          <ButtonGroup aria-label="history">
            <Button variant="outline" size="sm">
              back
            </Button>
            <Button variant="outline" size="sm">
              next
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="run action">
            <Button size="sm">open</Button>
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
        <State className="st-a-wide" key={orientation} name={orientation} note="neighbours share a 1 px edge">
          <ButtonGroup orientation={orientation} aria-label={`${orientation} run actions`}>
            <Button variant="outline">retry</Button>
            <Button variant="outline">archive</Button>
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
        { name: "rest", note: "child buttons keep their edges" },
        { name: "hover", note: "child control hover fill", demo: "hover" },
        { name: "focus", note: "focused child rises above its neighbour", demo: "focus-visible" },
        { name: "pressed", note: "child control press fill", demo: "active" },
        { name: "disabled", note: "child disabled edge screen", disabled: true },
      ].map((s) => (
        <State className="st-a-wide" key={s.name} name={s.name} note={s.note}>
          <ButtonGroup aria-label={`actions, ${s.name}`}>
            <Button variant="outline" data-demo={s.demo} disabled={s.disabled}>
              retry
            </Button>
            <Button variant="outline" disabled={s.disabled}>
              open
            </Button>
          </ButtonGroup>
        </State>
      ))}
    </div>
  );
}
