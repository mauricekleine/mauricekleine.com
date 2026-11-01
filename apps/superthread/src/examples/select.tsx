import { useId, useState } from "react";
import { fleet, type Ship, type ShipId } from "@/components/superthread/lib/fleet";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/superthread/ui/select";
import { FieldError, Hint, type Mode, noteId, State, States } from "@/examples/input";

const ships = new Map<string, Ship>(fleet.map((ship) => [ship.id, ship]));

// A ship's 16 px mark: the key tile on a light ground, the paper tile on a dark one.
export function ShipMark({ ship }: { ship: Ship }) {
  return (
    <span className="st-a-mark" aria-hidden="true">
      <img className="st-a-mark-light" src={`/marks/${ship.id}/${ship.mark.light}`} width={16} height={16} alt="" />
      <img className="st-a-mark-dark" src={`/marks/${ship.id}/${ship.mark.dark}`} width={16} height={16} alt="" />
    </span>
  );
}

// What the trigger shows: the chosen ship's mark and name, or the placeholder.
function shipValue(value: ShipId | null) {
  const ship = value ? ships.get(value) : undefined;
  if (!ship) return "pick a ship";
  return (
    <>
      <ShipMark ship={ship} />
      {ship.name}
    </>
  );
}

// The list. It opens under the trigger, not over it, as the world draws it. Base UI portals it to the body, outside
// the mode pair's pane, so the portal takes the pane's mode class and the list reads that pane's tokens.
function ShipList({ mode }: { mode: Mode }) {
  return (
    <SelectContent portalProps={{ className: mode }} alignItemWithTrigger={false}>
      <SelectGroup>
        {fleet.map((ship) => (
          <SelectItem key={ship.id} value={ship.id}>
            <ShipMark ship={ship} />
            {ship.name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  );
}

// A select with its label above and its hint or error below. The trigger is named by the label and the value, so a
// screen reader hears both.
function ShipField({
  mode,
  label,
  hint,
  initial = null,
  required = false,
}: {
  mode: Mode;
  label: string;
  hint?: string;
  initial?: ShipId | null;
  required?: boolean;
}) {
  const id = useId();
  const [ship, setShip] = useState<ShipId | null>(initial);
  const invalid = required && ship === null;
  return (
    <div className="st-a-field">
      <span id={`${id}-label`} className="st-a-label">
        {label}
      </span>
      <Select value={ship} onValueChange={(value) => setShip(value)}>
        <SelectTrigger
          className="w-full"
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={noteId(id)}
          aria-invalid={invalid || undefined}
        >
          <SelectValue id={`${id}-value`}>{shipValue}</SelectValue>
        </SelectTrigger>
        <ShipList mode={mode} />
      </Select>
      {invalid ? (
        <FieldError id={noteId(id)}>pick the ship this run belongs to.</FieldError>
      ) : (
        hint && <Hint id={noteId(id)}>{hint}</Hint>
      )}
    </div>
  );
}

// Two live selects: one with a ship picked, and one that is required and has none yet.
export function SelectExample({ mode }: { mode: Mode }) {
  return (
    <div className="st-a-grid">
      <ShipField mode={mode} label="ship" hint="the ship this run belongs to" initial="trisys" />
      <ShipField mode={mode} label="ship" required />
    </div>
  );
}

// The list printed open under a closed trigger, row for row as the item draws it: quanta under the pointer, trisys
// chosen. It is a picture, so it stays out of the accessibility tree; the trigger above it is a real select whose
// list opens at the item's default, the world's 6 px, where the print sits too.
export function SelectOpen({ mode }: { mode: Mode }) {
  const id = useId();
  return (
    <div className="st-a-open">
      <span id={`${id}-label`} className="st-a-label">
        ship
      </span>
      <Select<ShipId> defaultValue="trisys">
        <SelectTrigger className="w-full" aria-labelledby={`${id}-label ${id}-value`}>
          <SelectValue id={`${id}-value`}>{shipValue}</SelectValue>
        </SelectTrigger>
        <ShipList mode={mode} />
      </Select>
      <div
        aria-hidden="true"
        className="st-a-print relative isolate border border-border bg-popover p-1 text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)]"
      >
        {fleet.map((ship) => {
          const chosen = ship.id === "trisys";
          return (
            <div
              key={ship.id}
              className={cn(
                "relative flex h-9 w-full items-center gap-2.5 border border-transparent pr-8 pl-2.5 text-ui",
                ship.id === "quanta" && "bg-raised-hover",
                chosen && "bg-raised-hover",
              )}
            >
              <span className="flex flex-1 shrink-0 gap-2.5 whitespace-nowrap">
                <ShipMark ship={ship} />
                {ship.name}
              </span>
              {chosen && (
                <span className="absolute right-2.5 flex size-3 items-center justify-center">
                  <Icon name="check" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The trigger's states, printed through data-demo, then disabled, the real disabled select. A select's state label
// never says "invalid": the focus check adds that ending itself after the select's own, and reads it as the field's
// error ink.
type PrintedState = {
  name: string;
  label: string;
  note: string;
  value: ShipId | null;
  demo?: boolean;
  invalid?: boolean;
  disabled?: boolean;
};

const states: PrintedState[] = [
  { name: "rest", label: "ship, rest", note: "1 px input edge", value: "trisys" },
  { name: "focus", label: "ship, focus", note: "2 px house edge, inside", value: "trisys", demo: true },
  { name: "invalid", label: "ship, unpicked", note: "1 px error edge", value: null, invalid: true },
  {
    name: "invalid, focus",
    label: "ship, unpicked, focus",
    note: "2 px error edge, inside",
    value: null,
    demo: true,
    invalid: true,
  },
  { name: "disabled", label: "ship, disabled", note: "flat fill, full edge", value: "trisys", disabled: true },
];

export function SelectStates({ mode }: { mode: Mode }) {
  return (
    <States>
      {states.map((state) => (
        <State key={state.name} name={state.name} note={state.note}>
          <Select defaultValue={state.value} disabled={state.disabled}>
            <SelectTrigger
              className="w-full"
              tabIndex={-1}
              aria-label={state.label}
              aria-invalid={state.invalid || undefined}
              data-demo={state.demo ? "focus" : undefined}
            >
              <SelectValue>{shipValue}</SelectValue>
            </SelectTrigger>
            <ShipList mode={mode} />
          </Select>
        </State>
      ))}
    </States>
  );
}
