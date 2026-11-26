import { useId, useState } from "react";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/superthread/ui/native-select";
import { State } from "@/examples/input";
function Options() {
  return (
    <>
      <NativeSelectOption value="">Choose a ship</NativeSelectOption>
      <NativeSelectOptGroup label="Working">
        <NativeSelectOption value="orbit">Orbit</NativeSelectOption>
        <NativeSelectOption value="constellation">Constellation</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Reading">
        <NativeSelectOption value="quanta">Quanta</NativeSelectOption>
        <NativeSelectOption value="trisys" disabled>
          Trisys, unavailable
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </>
  );
}
const shipName = (value: string) => (value ? `${value[0].toUpperCase()}${value.slice(1)}` : "");
export function NativeSelectExample() {
  const id = useId();
  const [ship, setShip] = useState("orbit");
  return (
    <div className="st-e-stack">
      <label className="st-e-label" htmlFor={id}>
        Default ship
      </label>
      <NativeSelect id={id} value={ship} onChange={(event) => setShip(event.target.value)}>
        <Options />
      </NativeSelect>
      <p role="status" className="st-e-hint">
        {ship ? `New runs open in ${shipName(ship)}` : "Choose a ship before starting a run"}
      </p>
    </div>
  );
}
export function NativeSelectSizes() {
  return (
    <div className="st-e-states">
      {(["sm", "default"] as const).map((size) => (
        <State key={size} name={size} note={size === "sm" ? "32 px high" : "40 px high"}>
          <NativeSelect
            size={size}
            defaultValue="orbit"
            aria-label={`${size === "sm" ? "Small" : "Default"} ship`}
            tabIndex={-1}
          >
            <Options />
          </NativeSelect>
        </State>
      ))}
    </div>
  );
}
export function NativeSelectQuiet() {
  const [scope, setScope] = useState("everything");
  return (
    <div className="st-e-stack">
      <NativeSelect
        variant="quiet"
        aria-label="Scope"
        className="ml-auto"
        value={scope}
        onChange={(event) => setScope(event.target.value)}
      >
        <NativeSelectOption value="everything">Everything</NativeSelectOption>
        <NativeSelectOption value="quanta">Quanta</NativeSelectOption>
        <NativeSelectOption value="trisys">Trisys</NativeSelectOption>
      </NativeSelect>
      <p role="status" className="st-e-hint">
        {scope === "everything" ? "Showing every ship" : `Showing ${shipName(scope)}`}
      </p>
    </div>
  );
}
export function NativeSelectQuietStates() {
  return (
    <div className="st-e-states">
      {[
        { name: "Rest", note: "Muted word and chevron" },
        { name: "Hover", note: "Foreground word", demo: "hover" },
        { name: "Focus", note: "2 px inside edge", demo: "focus-visible" },
        { name: "Disabled", note: "Disabled word and chevron", disabled: true },
      ].map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <NativeSelect
            variant="quiet"
            defaultValue="orbit"
            aria-label={`Scope, ${s.name.toLowerCase()}`}
            disabled={s.disabled}
            data-demo={s.demo}
            tabIndex={-1}
          >
            <Options />
          </NativeSelect>
        </State>
      ))}
    </div>
  );
}
export function NativeSelectStates() {
  return (
    <div className="st-e-states">
      {[
        { name: "Rest", note: "1 px input edge" },
        { name: "Hover", note: "Keeps the input edge", demo: "hover" },
        { name: "Focus", note: "2 px house edge, inside", demo: "focus" },
        { name: "Empty", note: "Native placeholder option", empty: true },
        { name: "Invalid", note: "Error edge", invalid: true, empty: true },
        { name: "Invalid, focus", note: "2 px error edge, inside", invalid: true, empty: true, demo: "focus" },
        { name: "Disabled", note: "Faint fill, disabled words", disabled: true },
      ].map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <NativeSelect
            value={s.empty ? "" : "orbit"}
            onChange={() => {}}
            aria-label={`Ship, ${s.name.toLowerCase()}`}
            aria-invalid={s.invalid || undefined}
            disabled={s.disabled}
            data-demo={s.demo}
            tabIndex={-1}
          >
            <Options />
          </NativeSelect>
        </State>
      ))}
    </div>
  );
}
