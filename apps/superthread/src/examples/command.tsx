import { useState, type ReactNode } from "react";
import * as Cmd from "@/components/superthread/ui/command";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/superthread/ui/input-group";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States, type Mode } from "@/examples/input";

function Commands({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <Cmd.Command defaultValue="unselected" label="fleet commands">
      <Cmd.CommandInput aria-label="search fleet commands" placeholder="search commands" />
      <Cmd.CommandList>
        <Cmd.CommandEmpty>no commands match. try another word.</Cmd.CommandEmpty>
        <Cmd.CommandGroup heading="orbit">
          <Cmd.CommandItem value="view runs" onSelect={onSelect}>
            <Icon name="search" />
            view runs <Cmd.CommandShortcut>g r</Cmd.CommandShortcut>
          </Cmd.CommandItem>
          <Cmd.CommandItem value="new run" onSelect={onSelect}>
            new run <Cmd.CommandShortcut>n</Cmd.CommandShortcut>
          </Cmd.CommandItem>
          <Cmd.CommandItem value="retry build" disabled>
            retry build
          </Cmd.CommandItem>
        </Cmd.CommandGroup>
        <Cmd.CommandSeparator />
        <Cmd.CommandGroup heading="quanta">
          <Cmd.CommandItem value="open drafts" onSelect={onSelect}>
            open drafts <Cmd.CommandShortcut>g d</Cmd.CommandShortcut>
          </Cmd.CommandItem>
        </Cmd.CommandGroup>
      </Cmd.CommandList>
    </Cmd.Command>
  );
}
export function CommandExample({ mode }: { mode: Mode }) {
  const [result, setResult] = useState("no command run yet");
  const [open, setOpen] = useState(false);
  const select = (value: string) => {
    setResult(`${value} selected`);
    setOpen(false);
  };
  return (
    <div className="st-gl-stack">
      <div className="st-gl-command">
        <Commands onSelect={select} />
      </div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        open command palette
      </Button>
      <Cmd.CommandDialog open={open} onOpenChange={setOpen} portalProps={{ className: mode }} showCloseButton>
        <Commands onSelect={select} />
      </Cmd.CommandDialog>
      <p className="st-gl-note" role="status">
        {result}
      </p>
    </div>
  );
}
// cmdk scrolls the selected row into view on mount, even inside an inert container. A print uses the item's
// exact classes without mounting that behavior. Only the live example creates a command surface.
function PrintedCommandRow({
  children,
  selected = false,
  disabled = false,
}: {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      data-selected={selected}
      data-disabled={disabled}
      className="relative flex h-9 items-center gap-2.5 border border-transparent px-2.5 text-ui select-none data-[disabled=true]:text-disabled data-[selected=true]:bg-raised-hover [&_svg]:shrink-0"
    >
      {children}
    </div>
  );
}
function PrintedCommands({ empty = false }: { empty?: boolean }) {
  return (
    <div className="flex size-full flex-col bg-popover text-popover-foreground">
      <div className="p-1 pb-0">
        <InputGroup className="h-10">
          <InputGroupInput
            aria-label="search commands print"
            value={empty ? "lunar" : ""}
            placeholder="search commands"
            readOnly
          />
          <InputGroupAddon>
            <Icon name="search" className="size-3" />
          </InputGroupAddon>
        </InputGroup>
      </div>
      {empty ? (
        <p data-slot="command-empty" className="py-6 text-center type-instrument text-muted-foreground">
          no commands match. try another word.
        </p>
      ) : (
        <div className="p-1">
          <div className="px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground">orbit</div>
          <PrintedCommandRow selected>
            <Icon name="search" />
            view runs<Cmd.CommandShortcut>g r</Cmd.CommandShortcut>
          </PrintedCommandRow>
          <PrintedCommandRow>
            new run<Cmd.CommandShortcut>n</Cmd.CommandShortcut>
          </PrintedCommandRow>
          <PrintedCommandRow disabled>retry build</PrintedCommandRow>
          <div className="-mx-1 h-px bg-border" />
          <div className="px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground">quanta</div>
          <PrintedCommandRow>
            open drafts<Cmd.CommandShortcut>g d</Cmd.CommandShortcut>
          </PrintedCommandRow>
        </div>
      )}
    </div>
  );
}
export function CommandOpen() {
  return (
    <div
      inert
      aria-hidden="true"
      className="st-gl-sheet relative isolate border border-border bg-popover text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)]"
    >
      <PrintedCommands />
    </div>
  );
}
export function CommandStates() {
  return (
    <div className="st-gl-stack">
      <States>
        {["rest", "highlighted", "disabled"].map((state) => (
          <State
            key={state}
            name={state}
            note={
              state === "highlighted"
                ? "keys position, hover fill"
                : state === "disabled"
                  ? "skipped by the arrow keys"
                  : "flat command row"
            }
          >
            <div inert aria-hidden="true">
              <div className="bg-popover p-1 text-popover-foreground">
                <PrintedCommandRow selected={state === "highlighted"} disabled={state === "disabled"}>
                  view runs
                </PrintedCommandRow>
              </div>
            </div>
          </State>
        ))}
      </States>
      <State className="st-gl-full" name="empty" note="search keeps its value; the list explains the miss">
        <div inert className="st-gl-command">
          <PrintedCommands empty />
        </div>
      </State>
      <States>
        {["focus", "disabled"].map((state) => (
          <State
            key={state}
            name={`search, ${state}`}
            note={state === "focus" ? "field box owns the inside edge" : "disabled input ink"}
          >
            <div inert>
              <InputGroup className="h-10" data-demo={state === "focus" ? "focus" : undefined}>
                <InputGroupInput
                  aria-label={`search commands, ${state}`}
                  placeholder="search commands"
                  disabled={state === "disabled"}
                />
                <InputGroupAddon>
                  <Icon name="search" />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </State>
        ))}
      </States>
    </div>
  );
}
