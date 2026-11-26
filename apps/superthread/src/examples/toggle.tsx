import { useState } from "react";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Toggle } from "@/components/superthread/ui/toggle";
import { State } from "@/examples/input";
export function ToggleExample() {
  const [pinned, setPinned] = useState(false);
  return (
    <div className="st-e-stack">
      <div className="st-e-row">
        <Toggle variant="outline" pressed={pinned} onPressedChange={setPinned}>
          Pin run 024
        </Toggle>
      </div>
      <p className="st-e-hint" role="status">
        {pinned ? "Run 024 stays at the top of Orbit" : "Run 024 follows the board order"}
      </p>
    </div>
  );
}
export function ToggleVariants() {
  return (
    <div className="st-e-states" inert>
      {(["default", "outline"] as const).map((variant) => (
        <State
          key={variant}
          name={variant}
          note={variant === "outline" ? "Input edge at rest" : "No visible rest edge"}
        >
          <div className="st-e-row">
            <Toggle variant={variant}>Pin</Toggle>
            <Toggle variant={variant} pressed>
              Pin
            </Toggle>
          </div>
        </State>
      ))}
    </div>
  );
}
export function ToggleSizes() {
  return (
    <div className="st-e-states" inert>
      {(["sm", "default", "lg"] as const).map((size, i) => (
        <State key={size} name={size} note={`${[32, 40, 48][i]} px high`}>
          <div className="st-e-row">
            <Toggle variant="outline" size={size}>
              Pin
            </Toggle>
          </div>
        </State>
      ))}
      <State name="icon" note="A square of one glyph, 32, 40 or 48 px; the edge says pressed">
        <div className="st-e-row">
          {(["icon-sm", "icon", "icon-lg"] as const).map((size) => (
            <Toggle key={size} variant="outline" size={size} pressed={size === "icon"} aria-label="Pin">
              <Icon name="plus" />
            </Toggle>
          ))}
        </div>
      </State>
    </div>
  );
}
export function ToggleStates() {
  return (
    <div className="st-e-states" inert>
      {[
        { name: "Rest", note: "Quiet outline" },
        { name: "Hover", note: "Control hover fill", demo: "hover" },
        { name: "Focus", note: "2 px ring, 2 px out", demo: "focus-visible" },
        { name: "Pressed", note: "Foreground edge, tick", pressed: true },
        { name: "Invalid", note: "Error edge", invalid: true },
        { name: "Disabled", note: "Faint stock, dim label", disabled: true },
        { name: "Disabled, pressed", note: "Pressed box stays visible", disabled: true, pressed: true },
      ].map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <div className="st-e-row">
            <Toggle
              variant="outline"
              pressed={s.pressed ?? false}
              data-demo={s.demo}
              aria-invalid={s.invalid || undefined}
              disabled={s.disabled}
            >
              Pin
            </Toggle>
          </div>
        </State>
      ))}
    </div>
  );
}
