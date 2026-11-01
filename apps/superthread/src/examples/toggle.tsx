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
          pin run 024
        </Toggle>
      </div>
      <p className="st-e-hint" role="status">
        {pinned ? "run 024 stays at the top of orbit" : "run 024 follows the board order"}
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
          note={variant === "outline" ? "input edge at rest" : "no visible rest edge"}
        >
          <div className="st-e-row">
            <Toggle variant={variant}>pin</Toggle>
            <Toggle variant={variant} pressed>
              pin
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
              pin
            </Toggle>
          </div>
        </State>
      ))}
      <State name="icon" note="a square of one glyph, 32, 40 or 48 px; the edge says pressed">
        <div className="st-e-row">
          {(["icon-sm", "icon", "icon-lg"] as const).map((size) => (
            <Toggle key={size} variant="outline" size={size} pressed={size === "icon"} aria-label="pin">
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
        { name: "rest", note: "quiet outline" },
        { name: "hover", note: "control hover fill", demo: "hover" },
        { name: "focus", note: "2 px ring, 2 px out", demo: "focus-visible" },
        { name: "pressed", note: "foreground edge, tick", pressed: true },
        { name: "invalid", note: "error edge", invalid: true },
        { name: "disabled", note: "faint stock, dim label", disabled: true },
        { name: "disabled, pressed", note: "pressed box stays visible", disabled: true, pressed: true },
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
              pin
            </Toggle>
          </div>
        </State>
      ))}
    </div>
  );
}
