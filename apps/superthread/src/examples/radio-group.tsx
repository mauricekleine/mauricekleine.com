import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/superthread/ui/radio-group";
import { State } from "@/examples/input";

export function RadioGroupExample() {
  const [ship, setShip] = useState("orbit");
  return (
    <div className="st-e-stack">
      <RadioGroup aria-label="Default ship" value={ship} onValueChange={(value) => setShip(String(value))}>
        {(
          [
            ["orbit", "Orbit"],
            ["quanta", "Quanta"],
            ["trisys", "Trisys"],
          ] as const
        ).map(([value, name]) => (
          <label key={value} className="st-e-control">
            <RadioGroupItem value={value} />
            {name}
          </label>
        ))}
      </RadioGroup>
      <p className="st-e-hint" role="status">
        New runs open in {ship[0].toUpperCase()}
        {ship.slice(1)}. Use the arrow keys to choose.
      </p>
    </div>
  );
}
const states = [
  { name: "Rest", note: "18 px input box" },
  { name: "Hover", note: "Keeps its input edge", demo: "hover" },
  { name: "Chosen", note: "8 px foreground square", checked: true },
  { name: "Focus", note: "2 px ring, 2 px out", demo: "focus-visible" },
  { name: "Invalid", note: "Error edge", invalid: true },
  { name: "Disabled", note: "Faint stock", disabled: true },
  { name: "Disabled, chosen", note: "Square in disabled ink", checked: true, disabled: true },
];
export function RadioGroupStates() {
  return (
    <div className="st-e-states" inert>
      {states.map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <RadioGroup
            aria-label={`Ship, ${s.name.toLowerCase()}`}
            value={s.checked ? "orbit" : ""}
            disabled={s.disabled}
          >
            <RadioGroupItem
              value="orbit"
              aria-label={`Orbit, ${s.name.toLowerCase()}`}
              aria-invalid={s.invalid || undefined}
              data-demo={s.demo}
            />
          </RadioGroup>
        </State>
      ))}
    </div>
  );
}
