import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/superthread/ui/radio-group";
import { State } from "@/examples/input";

export function RadioGroupExample() {
  const [ship, setShip] = useState("orbit");
  return (
    <div className="st-e-stack">
      <RadioGroup aria-label="default ship" value={ship} onValueChange={(value) => setShip(String(value))}>
        {["orbit", "quanta", "trisys"].map((name) => (
          <label key={name} className="st-e-control">
            <RadioGroupItem value={name} />
            {name}
          </label>
        ))}
      </RadioGroup>
      <p className="st-e-hint" role="status">
        new runs open in {ship}. use the arrow keys to choose.
      </p>
    </div>
  );
}
const states = [
  { name: "rest", note: "18 px input box" },
  { name: "hover", note: "keeps its input edge", demo: "hover" },
  { name: "chosen", note: "8 px house square", checked: true },
  { name: "focus", note: "2 px ring, 2 px out", demo: "focus-visible" },
  { name: "invalid", note: "error edge", invalid: true },
  { name: "disabled", note: "faint stock", disabled: true },
  { name: "disabled, chosen", note: "square in disabled ink", checked: true, disabled: true },
];
export function RadioGroupStates() {
  return (
    <div className="st-e-states" inert>
      {states.map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <RadioGroup aria-label={`ship, ${s.name}`} value={s.checked ? "orbit" : ""} disabled={s.disabled}>
            <RadioGroupItem
              value="orbit"
              aria-label={`orbit, ${s.name}`}
              aria-invalid={s.invalid || undefined}
              data-demo={s.demo}
            />
          </RadioGroup>
        </State>
      ))}
    </div>
  );
}
