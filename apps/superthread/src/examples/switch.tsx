import { useState } from "react";
import { Switch } from "@/components/superthread/ui/switch";
import { State } from "@/examples/input";

export function SwitchExample() {
  const [notify, setNotify] = useState(true);
  return (
    <div className="st-e-stack">
      <label className="st-e-control">
        <Switch checked={notify} onCheckedChange={setNotify} />
        notify when an orbit run finishes
      </label>
      <p className="st-e-hint" role="status">
        {notify ? "completion notices are on" : "completion notices are off"}
      </p>
      <label className="st-e-control">
        <Switch size="sm" />
        include queued runs
      </label>
    </div>
  );
}
export function SwitchSizes() {
  return (
    <div className="st-e-states">
      {(["sm", "default"] as const).map((size) => (
        <State key={size} name={size} note={size === "sm" ? "24 × 14 px" : "32 × 18 px"}>
          <Switch size={size} checked readOnly aria-label={`${size} switch`} tabIndex={-1} />
        </State>
      ))}
    </div>
  );
}
const states = [
  { name: "off", note: "input edge and square" },
  { name: "hover, off", note: "control hover fill", demo: "hover" },
  { name: "on", note: "solid house ink", checked: true },
  { name: "hover, on", note: "house hover ink", checked: true, demo: "hover" },
  { name: "focus", note: "2 px ring, 2 px out", demo: "focus-visible" },
  { name: "invalid", note: "error edge", invalid: true },
  { name: "disabled, off", note: "faint stock, dim square", disabled: true },
  { name: "disabled, on", note: "square stays at the end", checked: true, disabled: true },
];
export function SwitchStates() {
  return (
    <div className="st-e-states">
      {states.map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <Switch
            checked={s.checked ?? false}
            readOnly
            tabIndex={-1}
            aria-label={`notices, ${s.name}`}
            aria-invalid={s.invalid || undefined}
            disabled={s.disabled}
            data-demo={s.demo}
          />
        </State>
      ))}
    </div>
  );
}
