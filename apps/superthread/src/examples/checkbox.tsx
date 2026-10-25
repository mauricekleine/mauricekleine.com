import { useState } from "react";
import { fleet, type ShipId } from "@/components/superthread/lib/fleet";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { State } from "@/examples/input";
import { ShipMark } from "@/examples/select";

// "every ship" is the parent of the six below it: all checked, it is checked; some, it is mixed; none, it is empty.
// Checking it picks every ship, and clearing it picks none.
function EveryShip() {
  const [picked, setPicked] = useState<ShipId[]>(["orbit", "quanta", "trisys"]);
  const all = picked.length === fleet.length;
  const some = picked.length > 0 && !all;
  return (
    <>
      <label className="st-a-check">
        <Checkbox
          checked={all}
          indeterminate={some}
          onCheckedChange={(checked) => setPicked(checked ? fleet.map((ship) => ship.id) : [])}
        />
        <span>
          every ship{" "}
          <span className="st-a-count">
            · {picked.length} of {fleet.length}
          </span>
        </span>
      </label>
      <div className="st-a-children">
        {fleet.map((ship) => (
          <label key={ship.id} className="st-a-check">
            <Checkbox
              checked={picked.includes(ship.id)}
              onCheckedChange={(checked) =>
                setPicked((current) => (checked ? [...current, ship.id] : current.filter((id) => id !== ship.id)))
              }
            />
            <ShipMark ship={ship} />
            {ship.name}
          </label>
        ))}
      </div>
    </>
  );
}

export function CheckboxExample() {
  return (
    <div className="st-a-checks">
      <label className="st-a-check">
        <Checkbox defaultChecked />
        notify me when a run fails
      </label>
      <EveryShip />
      <label className="st-a-check">
        <Checkbox />
        include drafts
      </label>
      <label className="st-a-check">
        <Checkbox defaultChecked disabled />
        keep the run log
      </label>
    </div>
  );
}

// The states, printed: each box is held in its state and read-only, out of the tab order. Focus is printed through
// data-demo, which the site's variants read as keyboard focus.
const states = [
  { name: "empty", note: "1 px input edge" },
  { name: "checked", note: "house ink, tick", checked: true },
  { name: "mixed", note: "ink at 50 percent", indeterminate: true },
  { name: "focus", note: "2 px ring, 2 px out", demo: true },
  { name: "invalid", note: "1 px error edge", invalid: true },
  { name: "disabled", note: "flat fill", disabled: true },
  { name: "disabled, checked", note: "flat, tick dimmed", checked: true, disabled: true },
];

export function CheckboxStates() {
  return (
    <div className="st-a-states st-a-checkstates">
      {states.map((state) => (
        <State key={state.name} name={state.name} note={state.note}>
          <Checkbox
            checked={state.checked ?? false}
            indeterminate={state.indeterminate}
            disabled={state.disabled}
            readOnly
            tabIndex={-1}
            aria-label={`notify, ${state.name}`}
            aria-invalid={state.invalid || undefined}
            data-demo={state.demo ? "focus-visible" : undefined}
          />
        </State>
      ))}
    </div>
  );
}
