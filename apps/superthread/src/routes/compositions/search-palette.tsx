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
      { id: "example", title: "example" },
      { id: "open", title: "open" },
      { id: "states", title: "states" },
      { id: "shortcuts", title: "shortcuts" },
    ],
  },
  component: Page,
});
const pages = ["orbit board", "quanta chapters", "trisys drafts"];
function Results({ select }: { select: (value: string) => void }) {
  return (
    <CommandGroup heading="pages">
      {pages.map((page, index) => (
        <CommandItem key={page} value={page} onSelect={select}>
          {page}
          <CommandShortcut>{index + 1}</CommandShortcut>
        </CommandItem>
      ))}
      <CommandItem disabled value="artifacts archive">
        artifacts archive<CommandShortcut>unavailable</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  );
}
function Live({ mode }: { mode: "light" | "dark" }) {
  const [selected, setSelected] = useState("none yet");
  return (
    <div className="st-ca-stack">
      <SearchPalette hotkey={mode === "light" ? "k" : null}>
        <SearchPaletteTrigger placeholder="search fleet pages" />
        <SearchPaletteContent
          className={mode}
          title="search fleet pages"
          description="pick a sample fleet page"
          placeholder="search fleet pages"
          onSelect={setSelected}
        >
          {(select) => <Results select={select} />}
        </SearchPaletteContent>
      </SearchPalette>
      <p className="st-ca-note" role="status">
        selected: {selected}
      </p>
    </div>
  );
}
// The installed command parts print the open surface inline. There is no modal, focus trap or autofocus here.
function Open({ empty = false }: { empty?: boolean }) {
  const [selected, setSelected] = useState("none yet");
  const [query, setQuery] = useState(empty ? "no matching page" : "");
  const [active, setActive] = useState("");
  const interacted = useRef(false);
  return (
    <div className="st-ca-stack">
      <div className="relative isolate bg-popover text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)]">
        <Command
          label={empty ? "empty palette specimen" : "open palette specimen"}
          value={active}
          onValueChange={(value) => {
            if (interacted.current) setActive(value);
          }}
          onFocusCapture={() => {
            interacted.current = true;
          }}
        >
          <CommandInput
            aria-label={empty ? "search with no matches" : "search open specimen"}
            placeholder="search fleet pages"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList label="sample fleet pages" aria-live="polite">
            <CommandEmpty>nothing by that name</CommandEmpty>
            <Results select={setSelected} />
          </CommandList>
        </Command>
      </div>
      <p role="status" className="st-ca-note">
        selected: {selected}
      </p>
    </div>
  );
}
function TriggerStates() {
  return (
    <div className="st-ca-stack">
      {[
        { name: "rest", note: "input edge, button behavior" },
        { name: "focus", note: "2 px control ring", demo: "focus-visible" },
        { name: "disabled", note: "no action", disabled: true },
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
        title="search palette"
        lede="one search over an app's pages and commands. a field-shaped button opens the command dialog; selecting a result closes it and hands the value to the app."
      >
        <InstallLine items={["search-palette"]} />
      </PageHead>
      <Serves name="search-palette" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          open either trigger, type a ship's name and choose with the arrow keys and enter. escape closes the dialog.
          the selected sample page appears below its trigger.
        </p>
        <ModePair light={<Live mode="light" />} dark={<Live mode="dark" />} />
      </Section>
      <Section id="open" title="open">
        <p className="st-ca-copy">
          the open surface, kept in the page so it takes no focus on arrival. filter the pages here too. the unavailable
          archive stays disabled.
        </p>
        <ModePair>
          <Open />
        </ModePair>
        <Caption detail="contact" />
      </Section>
      <Section id="states" title="states">
        <p className="st-ca-copy">
          the trigger is a control, so keyboard focus draws a ring outside it. a search with no match replaces the
          results with a quiet sentence.
        </p>
        <ModePair>
          <TriggerStates />
        </ModePair>
        <ModePair>
          <Open empty />
        </ModePair>
      </Section>
      <Section id="shortcuts" title="shortcuts">
        <p className="st-ca-copy">
          cmd k or ctrl k toggles search, including from a text field. slash opens it away from editable text. this page
          gives those keys to the light example so two specimens do not compete.
        </p>
        <dl className="st-ca-parts">
          <dt>
            <code>SearchPalette</code>
          </dt>
          <dd>
            owns open state, or takes <code>open</code> and <code>onOpenChange</code> from the app. set{" "}
            <code>hotkey</code> to another letter or <code>null</code> to disable both shortcuts.
          </dd>
          <dt>
            <code>SearchPaletteTrigger</code>
          </dt>
          <dd>names the search and shows the shortcut when enabled.</dd>
          <dt>
            <code>SearchPaletteContent</code>
          </dt>
          <dd>
            supplies the named input and live results. pass its <code>select</code> callback to each{" "}
            <code>CommandItem</code> to close and handle the choice.
          </dd>
        </dl>
      </Section>
    </>
  );
}
