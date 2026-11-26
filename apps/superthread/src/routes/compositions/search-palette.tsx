import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  SearchPalette,
  SearchPaletteContent,
  SearchPaletteTrigger,
} from "@/components/superthread/blocks/search-palette";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/superthread/ui/command";
import { Serves } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/search-palette")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "open", title: "Open" },
      { id: "states", title: "States" },
      { id: "shortcuts", title: "Shortcuts" },
    ],
  },
  component: Page,
});
const pages = ["Orbit board", "Quanta chapters", "Trisys drafts"];
function Results({ select }: { select: (value: string) => void }) {
  return (
    <CommandGroup heading="Pages">
      {pages.map((page, index) => (
        <CommandItem key={page} value={page} onSelect={select}>
          {page}
          <CommandShortcut>{index + 1}</CommandShortcut>
        </CommandItem>
      ))}
      <CommandItem disabled value="Artifacts archive">
        Artifacts archive<CommandShortcut>Unavailable</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  );
}
function Live({ mode }: { mode: "light" | "dark" }) {
  const [selected, setSelected] = useState("none yet");
  return (
    <div className="st-ca-stack">
      <SearchPalette hotkey={mode === "light" ? "k" : null}>
        <SearchPaletteTrigger placeholder="Search fleet pages" />
        <SearchPaletteContent
          className={mode}
          portalProps={{ className: mode }}
          title="Search fleet pages"
          description="Pick a sample fleet page"
          placeholder="Search fleet pages"
          onSelect={setSelected}
        >
          {(select) => <Results select={select} />}
        </SearchPaletteContent>
      </SearchPalette>
      <p className="st-ca-note" role="status">
        Selected: {selected}
      </p>
    </div>
  );
}
// The installed command parts print the open surface inline. There is no modal, focus trap or autofocus here.
function Open({ empty = false }: { empty?: boolean }) {
  const [selected, setSelected] = useState("none yet");
  const [query, setQuery] = useState(empty ? "No matching page" : "");
  const [active, setActive] = useState("");
  const interacted = useRef(false);
  return (
    <div className="st-ca-stack">
      <div className="relative isolate bg-popover text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)]">
        <Command
          label={empty ? "Empty palette specimen" : "Open palette specimen"}
          value={active}
          onValueChange={(value) => {
            if (interacted.current) setActive(value);
          }}
          onFocusCapture={() => {
            interacted.current = true;
          }}
        >
          <CommandInput
            aria-label={empty ? "Search with no matches" : "Search open specimen"}
            placeholder="Search fleet pages"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList label="Sample fleet pages" aria-live="polite">
            <CommandEmpty>Nothing by that name</CommandEmpty>
            <Results select={setSelected} />
          </CommandList>
        </Command>
      </div>
      <p role="status" className="st-ca-note">
        Selected: {selected}
      </p>
    </div>
  );
}
function TriggerStates() {
  return (
    <div className="st-ca-stack">
      {[
        { name: "Rest", note: "Input edge, button behavior" },
        { name: "Focus", note: "2 px control ring", demo: "focus-visible" },
        { name: "Disabled", note: "No action", disabled: true },
      ].map((state) => (
        <State className="st-ca-state" key={state.name} name={state.name} note={state.note}>
          <SearchPalette hotkey={null} open={false}>
            <SearchPaletteTrigger tabIndex={-1} disabled={state.disabled} data-demo={state.demo} />
          </SearchPalette>
        </State>
      ))}
    </div>
  );
}
function Page() {
  return (
    <>
      <PageHead
        title="Search palette"
        lede="One search over an app's pages and commands. A field-shaped button opens the command dialog; selecting a result closes it and hands the value to the app."
      >
        <InstallLine items={["search-palette"]} />
      </PageHead>
      <Serves name="search-palette" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Open either trigger, type a ship's name and choose with the arrow keys and Enter. Escape closes the dialog.
          The selected sample page appears below its trigger.
        </p>
        <ModePair light={<Live mode="light" />} dark={<Live mode="dark" />} />
      </Section>
      <Section id="open" title="Open">
        <p className="st-ca-copy">
          The open surface, kept in the page so it takes no focus on arrival. Filter the pages here too. The unavailable
          archive stays disabled.
        </p>
        <ModePair>
          <Open />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="states" title="States">
        <p className="st-ca-copy">
          The trigger is a control, so keyboard focus draws a ring outside it. A search with no match replaces the
          results with a quiet sentence.
        </p>
        <ModePair>
          <TriggerStates />
        </ModePair>
        <ModePair>
          <Open empty />
        </ModePair>
      </Section>
      <Section id="shortcuts" title="Shortcuts">
        <p className="st-ca-copy">
          Cmd K or Ctrl K toggles search, including from a text field. Slash opens it away from editable text. This page
          gives those keys to the light example so two specimens do not compete.
        </p>
        <dl className="st-ca-parts">
          <dt>
            <code>SearchPalette</code>
          </dt>
          <dd>
            Owns open state, or takes <code>open</code> and <code>onOpenChange</code> from the app. Set{" "}
            <code>hotkey</code> to another letter or <code>null</code> to disable both shortcuts.
          </dd>
          <dt>
            <code>SearchPaletteTrigger</code>
          </dt>
          <dd>Names the search. It prints no keycap.</dd>
          <dt>
            <code>SearchPaletteContent</code>
          </dt>
          <dd>
            Supplies the named input and live results. Pass its <code>select</code> callback to each{" "}
            <code>CommandItem</code> to close and handle the choice.
          </dd>
        </dl>
      </Section>
    </>
  );
}
