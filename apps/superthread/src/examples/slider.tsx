import { useId, useState, type ComponentProps } from "react";
import { Slider } from "@/components/superthread/ui/slider";
import { State } from "@/examples/input";

// Printed thumb states use the item's own variants; aria-labelledby reaches each range input through Base UI.
function NamedSlider({
  label,
  demo,
  dragging,
  ...props
}: ComponentProps<typeof Slider> & { label: string; demo?: string; dragging?: boolean }) {
  const id = useId();
  return (
    <div className="st-e-stack">
      <span className="st-e-label" id={id}>
        {label}
      </span>
      <Slider
        {...props}
        aria-labelledby={id}
        ref={(node) => {
          node?.querySelectorAll('[data-slot="slider-thumb"]').forEach((thumb) => {
            if (demo) thumb.setAttribute("data-demo", demo);
            if (dragging) thumb.setAttribute("data-dragging", "");
          });
        }}
      />
    </div>
  );
}
export function SliderExample() {
  const [value, setValue] = useState<number | readonly number[]>(4);
  return (
    <div className="st-e-stack">
      <NamedSlider label="orbit workers" min={1} max={12} value={value} onValueChange={setValue} />
      <p className="st-e-hint" role="status">
        {value} workers. use the arrow keys to adjust.
      </p>
    </div>
  );
}
export function SliderVariants() {
  return (
    <div className="st-e-stack">
      <State name="single" note="one value, one thumb">
        <NamedSlider label="quanta reading minutes" min={0} max={60} defaultValue={20} />
      </State>
      <State name="range" note="two bounds, two thumbs">
        <NamedSlider label="run duration range, minutes" defaultValue={[20, 70]} />
      </State>
      <State name="vertical" note="same track and thumb dimensions">
        <div className="st-e-vertical">
          <NamedSlider label="worker capacity" orientation="vertical" defaultValue={60} />
        </div>
      </State>
    </div>
  );
}
export function SliderStates() {
  return (
    <div className="st-e-states" inert>
      {[
        { name: "rest", note: "8 px track, 16 px thumb" },
        { name: "hover", note: "control hover thumb", demo: "hover" },
        { name: "focus", note: "outside house ring", demo: "focus-visible" },
        { name: "dragging", note: "control hover thumb", dragging: true },
        { name: "minimum", note: "thumb stays inside", value: 0 },
        { name: "maximum", note: "flat foreground range", value: 100 },
        { name: "disabled", note: "disabled edge and range", disabled: true },
      ].map((s) => (
        <State key={s.name} name={s.name} note={s.note}>
          <NamedSlider
            label={`capacity, ${s.name}`}
            value={s.value ?? 40}
            disabled={s.disabled}
            demo={s.demo}
            dragging={s.dragging}
          />
        </State>
      ))}
    </div>
  );
}
