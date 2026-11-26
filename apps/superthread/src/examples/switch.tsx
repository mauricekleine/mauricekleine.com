import { useState } from "react";
import { Switch } from "@/components/superthread/ui/switch";
import { State } from "@/examples/input";

export function SwitchExample() {
  const [notify, setNotify] = useState(true);
  return (
    <div className="st-e-stack">
      <label className="st-e-control">
        <Switch checked={notify} onCheckedChange={setNotify} />
        Notify when an Orbit run finishes
      </label>
      <p className="st-e-hint" role="status">
        {notify ? "Completion notices are on" : "Completion notices are off"}
      </p>
      <label className="st-e-control">
        <Switch size="sm" />
        Include queued runs
      </label>
    </div>
  );
}
export function SwitchSizes() {
  return (
    <div className="st-e-states">
      {(["sm", "default"] as const).map((size) => (
        <State key={size} name={size} note={size === "sm" ? "24 × 14 px" : "32 × 18 px"}>
          <Switch
            size={size}
            checked
            readOnly
            aria-label={`${size === "sm" ? "Small" : "Default"} switch`}
            tabIndex={-1}
          />
        </State>
      ))}
    </div>
  );
}
const states = [
  { name: "Off", note: "Input edge and square" },
  { name: "Hover, off", note: "Control hover fill", demo: "hover" },
  { name: "On", note: "Solid foreground", checked: true },
  { name: "Hover, on", note: "Foreground hover", checked: true, demo: "hover" },
  { name: "Focus", note: "2 px ring, 2 px out", demo: "focus-visible" },
  { name: "Invalid", note: "Error edge", invalid: true },
  { name: "Disabled, off", note: "Faint stock, dim square", disabled: true },
  { name: "Disabled, on", note: "Square stays at the end", checked: true, disabled: true },
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
            aria-label={`Notices, ${s.name.toLowerCase()}`}
            aria-invalid={s.invalid || undefined}
            disabled={s.disabled}
            data-demo={s.demo}
          />
        </State>
      ))}
    </div>
  );
}
