import { useId, useState } from "react";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/superthread/ui/native-select";
import { State } from "@/examples/input";
function Options() {
  return (
    <>
      <NativeSelectOption value="">choose a ship</NativeSelectOption>
      <NativeSelectOptGroup label="working">
        <NativeSelectOption value="orbit">orbit</NativeSelectOption>
        <NativeSelectOption value="constellation">constellation</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="reading">
        <NativeSelectOption value="quanta">quanta</NativeSelectOption>
        <NativeSelectOption value="trisys" disabled>
          trisys, unavailable
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </>
  );
}
export function NativeSelectExample() {
  const id = useId();
  const [ship, setShip] = useState("orbit");
  return (
    <div className="st-e-stack">
      <label className="st-e-label" htmlFor={id}>
        default ship
      </label>
      <NativeSelect id={id} value={ship} onChange={(event) => setShip(event.target.value)}>
        <Options />
      </NativeSelect>
      <p role="status" className="st-e-hint">
        {ship ? `new runs open in ${ship}` : "choose a ship before starting a run"}
      </p>
    </div>
  );
}
export function NativeSelectSizes() {
  return (
    <div className="st-e-states">
      {(["sm", "default"] as const).map((size) => (
        <State key={size} name={size} note={size === "sm" ? "32 px high" : "40 px high"}>
          <NativeSelect size={size} defaultValue="orbit" aria-label={`${size} ship`} tabIndex={-1}>
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
        { name: "rest", note: "1 px input edge" },
        { name: "hover", note: "keeps the input edge", demo: "hover" },
        { name: "focus", note: "2 px house edge, inside", demo: "focus" },
        { name: "empty", note: "native placeholder option", empty: true },
        { name: "invalid", note: "error edge", invalid: true, empty: true },
        { name: "invalid, focus", note: "2 px error edge, inside", invalid: true, empty: true, demo: "focus" },
        { name: "disabled", note: "faint fill, disabled words", disabled: true },
      ].map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <NativeSelect
            value={s.empty ? "" : "orbit"}
            onChange={() => {}}
            aria-label={`ship, ${s.name}`}
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
