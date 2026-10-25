import { useState, type ComponentProps } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/superthread/ui/toggle-group";
import { State } from "@/examples/input";
function Views({ demo, invalid, ...props }: ComponentProps<typeof ToggleGroup> & { demo?: string; invalid?: boolean }) {
  return (
    <ToggleGroup aria-label="orbit view" defaultValue={["day"]} {...props}>
      {["day", "week"].map((value) => (
        <ToggleGroupItem
          key={value}
          value={value}
          data-demo={value === "week" ? demo : undefined}
          aria-invalid={(value === "week" && invalid) || undefined}
        >
          {value}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
export function ToggleGroupExample() {
  const [view, setView] = useState<string[]>(["day"]);
  return (
    <div className="st-e-stack">
      <Views variant="outline" value={view} onValueChange={setView} />
      <p className="st-e-hint" role="status">
        {view[0] ? `orbit shows the ${view[0]}` : "choose a view"}. arrow keys move between items.
      </p>
      <ToggleGroup multiple variant="outline" aria-label="ships shown on the board" defaultValue={["orbit"]} size="sm">
        <ToggleGroupItem value="orbit">orbit</ToggleGroupItem>
        <ToggleGroupItem value="quanta">quanta</ToggleGroupItem>
      </ToggleGroup>
      <p className="st-e-hint">ship filters allow more than one selection.</p>
    </div>
  );
}
export function ToggleGroupVariants() {
  return (
    <div className="st-e-states" inert>
      {(["default", "outline"] as const).map((variant) => (
        <State key={variant} name={variant} note="shared edge, boxed selection">
          <Views variant={variant} />
        </State>
      ))}
    </div>
  );
}
export function ToggleGroupSizes() {
  return (
    <div className="st-e-stack" inert>
      {(["sm", "default", "lg"] as const).map((size, i) => (
        <State key={size} name={size} note={`${[32, 40, 48][i]} px high`}>
          <Views size={size} variant="outline" />
        </State>
      ))}
    </div>
  );
}
export function ToggleGroupLayout() {
  return (
    <div className="st-e-stack" inert>
      <State name="joined" note="spacing 0, shared 1 px edge">
        <Views variant="outline" />
      </State>
      <State name="separate" note="spacing 3, 12 px between items">
        <Views variant="outline" spacing={3} demo="focus-visible" />
      </State>
      <State name="vertical" note="shared horizontal edges">
        <Views variant="outline" orientation="vertical" />
      </State>
    </div>
  );
}
export function ToggleGroupStates() {
  return (
    <div className="st-e-stack" inert>
      {[
        { name: "rest and pressed", note: "current edge rises above its neighbour" },
        { name: "hover", note: "control hover fill", demo: "hover" },
        { name: "focus, joined", note: "house ring inside the item", demo: "focus-visible" },
        { name: "invalid", note: "error edge on the unselected item", invalid: true },
        { name: "disabled", note: "dim labels, faint stock", disabled: true },
      ].map((s) => (
        <State className="st-a-wide" key={s.name} name={s.name} note={s.note}>
          <Views variant="outline" demo={s.demo} invalid={s.invalid} disabled={s.disabled} />
        </State>
      ))}
    </div>
  );
}
