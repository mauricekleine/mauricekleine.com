import { useId } from "react";
import * as Combo from "@/components/superthread/ui/combobox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/superthread/ui/input-group";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States, type Mode } from "@/examples/input";
const ships = ["orbit", "quanta", "trisys", "constellation", "artifacts", "soliton"];

function Options({ mode, anchor }: { mode: Mode; anchor?: ReturnType<typeof Combo.useComboboxAnchor> }) {
  return (
    <Combo.ComboboxContent portalProps={{ className: mode }} anchor={anchor}>
      <Combo.ComboboxEmpty>no ships match. try another name.</Combo.ComboboxEmpty>
      <Combo.ComboboxList>
        {(ship: string) => (
          <Combo.ComboboxItem key={ship} value={ship}>
            {ship}
          </Combo.ComboboxItem>
        )}
      </Combo.ComboboxList>
    </Combo.ComboboxContent>
  );
}
export function ComboboxExample({ mode }: { mode: Mode }) {
  const id = useId();
  return (
    <div className="st-gl-field">
      <label className="st-a-label" htmlFor={id}>
        ship
      </label>
      <Combo.Combobox items={ships} defaultValue="trisys">
        <Combo.ComboboxInput id={id} showClear placeholder="find a ship" />
        <Options mode={mode} />
      </Combo.Combobox>
      <p className="st-gl-note">type to narrow the list, then choose with the arrow keys and enter.</p>
    </div>
  );
}
export function ComboboxMultiple({ mode }: { mode: Mode }) {
  const anchor = Combo.useComboboxAnchor();
  const id = useId();
  return (
    <div className="st-gl-field">
      <label htmlFor={id} className="st-a-label">
        ships to watch
      </label>
      <Combo.Combobox multiple items={ships} defaultValue={["orbit", "quanta"]}>
        <Combo.ComboboxChips ref={anchor}>
          <Combo.ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <Combo.ComboboxChip key={value}>{value}</Combo.ComboboxChip>
                ))}
                <Combo.ComboboxChipsInput id={id} placeholder="add ship" />
              </>
            )}
          </Combo.ComboboxValue>
        </Combo.ComboboxChips>
        <Options mode={mode} anchor={anchor} />
      </Combo.Combobox>
      <p className="st-gl-note">remove a chip with its close control, or add another ship.</p>
    </div>
  );
}
export function ComboboxOpen({ empty = false }: { empty?: boolean }) {
  return (
    <div className="st-gl-stack" inert aria-hidden="true">
      <InputGroup>
        <InputGroupInput aria-label="ship print" value={empty ? "lunar" : ""} placeholder="find a ship" readOnly />
        <InputGroupAddon align="inline-end">
          <Icon name="chevron" />
        </InputGroupAddon>
      </InputGroup>
      <div className="st-gl-print relative isolate border border-border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)]">
        {empty ? (
          <p className="py-6 text-center type-instrument text-muted-foreground">no ships match. try another name.</p>
        ) : (
          <div className="p-1">
            {ships.map((ship) => (
              <div
                key={ship}
                aria-selected={ship === "trisys"}
                data-highlighted={ship === "quanta" ? "" : undefined}
                className="relative flex h-9 w-full items-center gap-2.5 border border-transparent pr-8 pl-2.5 text-ui data-highlighted:not-aria-selected:bg-raised-hover aria-selected:border-primary aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                {ship}
                {ship === "trisys" && (
                  <span className="absolute right-2.5">
                    <Icon name="check" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export function ComboboxStates() {
  return (
    <States>
      {["rest", "focus", "invalid", "invalid, focus", "disabled"].map((state) => (
        <State
          key={state}
          name={state}
          note={
            state.includes("focus")
              ? "2 px inside field edge"
              : state === "invalid"
                ? "error edge and focus ink"
                : state === "disabled"
                  ? "faint fill, disabled ink"
                  : "input-group field box"
          }
        >
          <div inert>
            <InputGroup data-demo={state.includes("focus") ? "focus" : undefined}>
              <InputGroupInput
                aria-label={`ship, ${state}`}
                placeholder="find a ship"
                aria-invalid={state.includes("invalid") || undefined}
                disabled={state === "disabled"}
              />
              <InputGroupAddon align="inline-end">
                <Icon name="chevron" />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </State>
      ))}
    </States>
  );
}
