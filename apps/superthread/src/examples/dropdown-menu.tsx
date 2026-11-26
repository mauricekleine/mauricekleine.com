import { useState, type ReactNode } from "react";
import * as Menu from "@/components/superthread/ui/dropdown-menu";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States, type Mode } from "@/examples/input";

export function DropdownMenuExample({ mode }: { mode: Mode }) {
  const [notify, setNotify] = useState(true);
  const [ship, setShip] = useState("Orbit");
  const [result, setResult] = useState("Run or-412 is ready");
  return (
    <div className="st-gl-stack">
      <Menu.DropdownMenu>
        <Menu.DropdownMenuTrigger render={<Button variant="outline" />}>
          Run actions <Icon name="chevron" />
        </Menu.DropdownMenuTrigger>
        <Menu.DropdownMenuContent className="min-w-56" portalProps={{ className: mode }}>
          <Menu.DropdownMenuGroup>
            <Menu.DropdownMenuLabel inset>or-412</Menu.DropdownMenuLabel>
            <Menu.DropdownMenuItem inset onClick={() => setResult("Showing the log for or-412")}>
              View log <Menu.DropdownMenuShortcut>⌘O</Menu.DropdownMenuShortcut>
            </Menu.DropdownMenuItem>
            <Menu.DropdownMenuItem inset disabled>
              Retry run
            </Menu.DropdownMenuItem>
          </Menu.DropdownMenuGroup>
          <Menu.DropdownMenuSeparator />
          <Menu.DropdownMenuCheckboxItem checked={notify} onCheckedChange={setNotify}>
            Notify on finish
          </Menu.DropdownMenuCheckboxItem>
          <Menu.DropdownMenuSub>
            <Menu.DropdownMenuSubTrigger inset>Move to ship</Menu.DropdownMenuSubTrigger>
            <Menu.DropdownMenuSubContent portalProps={{ className: mode }}>
              <Menu.DropdownMenuRadioGroup value={ship} onValueChange={setShip}>
                {["Orbit", "Quanta", "Trisys"].map((value) => (
                  <Menu.DropdownMenuRadioItem key={value} value={value}>
                    {value}
                  </Menu.DropdownMenuRadioItem>
                ))}
              </Menu.DropdownMenuRadioGroup>
            </Menu.DropdownMenuSubContent>
          </Menu.DropdownMenuSub>
          <Menu.DropdownMenuSeparator />
          <Menu.DropdownMenuItem variant="destructive" onClick={() => setResult("or-412 removed from this example")}>
            <Icon name="trash" />
            Delete run
          </Menu.DropdownMenuItem>
        </Menu.DropdownMenuContent>
      </Menu.DropdownMenu>
      <p className="st-gl-note" role="status">
        {result}. {ship}, notifications {notify ? "on" : "off"}.
      </p>
    </div>
  );
}

// Printed rows copy the item's classes, as select's open print does. No menu is opened or focused on mount.
function Row({
  children,
  highlighted = false,
  focus = false,
  disabled = false,
  inset = false,
}: {
  children: ReactNode;
  highlighted?: boolean;
  focus?: boolean;
  disabled?: boolean;
  inset?: boolean;
}) {
  return (
    <div
      data-highlighted={highlighted ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-inset={inset || undefined}
      data-demo={focus ? "focus-visible" : undefined}
      className="relative flex h-9 items-center gap-2.5 border border-transparent px-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-highlighted:bg-raised-hover data-inset:pl-8 data-disabled:text-disabled"
    >
      {children}
    </div>
  );
}

export function DropdownMenuOpen() {
  return (
    <div className="st-gl-stack" inert aria-hidden="true">
      <div className="st-gl-leaf relative isolate border border-border bg-popover p-1 text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)]">
        <div className="px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground">or-412</div>
        <Row inset highlighted>
          View log <Menu.DropdownMenuShortcut>⌘O</Menu.DropdownMenuShortcut>
        </Row>
        <Row inset disabled>
          Retry run
        </Row>
        <div className="-mx-1 my-1 h-px bg-border" />
        <Row inset>
          <span className="absolute left-2.5">
            <Icon name="check" />
          </span>
          Notify on finish
        </Row>
        <Row inset>
          Move to ship <Icon name="chevron" className="-rotate-90 ml-auto" />
        </Row>
        <div className="-mx-1 my-1 h-px bg-border" />
        <Row>
          <Icon name="trash" />
          Delete run
        </Row>
      </div>
      <div className="st-gl-leaf relative isolate border border-border bg-popover p-1 text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)]">
        <div className="px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground">Move to ship</div>
        <Row inset>
          <span className="absolute left-2.5 flex size-3 items-center justify-center">
            <span className="size-1.5 bg-foreground" />
          </span>
          Orbit
        </Row>
        <Row inset>Quanta</Row>
        <Row inset>Trisys</Row>
      </div>
    </div>
  );
}

export function DropdownMenuVariants() {
  return (
    <States>
      {["default", "inset", "destructive"].map((variant) => (
        <State
          key={variant}
          name={variant}
          note={
            variant === "destructive"
              ? "Trash glyph, key ink"
              : variant === "inset"
                ? "Room for an indicator"
                : "36 px action row"
          }
        >
          <div inert aria-hidden="true" className="bg-popover text-popover-foreground">
            <Row inset={variant === "inset"}>
              {variant === "destructive" && <Icon name="trash" />}
              {variant === "destructive" ? "Delete run" : "View log"}
            </Row>
          </div>
        </State>
      ))}
    </States>
  );
}

export function DropdownMenuStates() {
  return (
    <div className="st-gl-stack">
      <States>
        {(
          [
            ["rest", "Rest"],
            ["hover", "Hover"],
            ["focus-visible", "Focus"],
            ["active", "Pressed"],
            ["disabled", "Disabled"],
          ] as const
        ).map(([state, name]) => (
          <State
            key={state}
            name={name}
            note={
              state === "disabled"
                ? "Disabled trigger"
                : state === "focus-visible"
                  ? "Outside control ring"
                  : "Outline trigger"
            }
          >
            <Menu.DropdownMenu>
              <Menu.DropdownMenuTrigger
                render={<Button variant="outline" />}
                tabIndex={-1}
                disabled={state === "disabled"}
                data-demo={state}
              >
                Run actions
              </Menu.DropdownMenuTrigger>
            </Menu.DropdownMenu>
          </State>
        ))}
      </States>
      <States>
        {(
          [
            ["rest", "Row, rest", "Flat popover fill"],
            ["highlighted", "Row, highlighted", "Raised hover fill"],
            ["focus", "Row, focus", "Inside control ring"],
            ["disabled", "Row, disabled", "Disabled word ink"],
          ] as const
        ).map(([state, name, note]) => (
          <State key={state} name={name} note={note}>
            <div inert aria-hidden="true" className="bg-popover text-popover-foreground">
              <Row highlighted={state === "highlighted"} focus={state === "focus"} disabled={state === "disabled"}>
                View log
              </Row>
            </div>
          </State>
        ))}
      </States>
    </div>
  );
}
