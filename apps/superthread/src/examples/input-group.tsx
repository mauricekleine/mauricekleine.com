import { useId, useRef, useState } from "react";
import { Icon } from "@/components/superthread/ui/glyphs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/superthread/ui/input-group";
import { Field, noteId, State, States } from "@/examples/input";

// A filter with a clear button inside its box. The button is a control of its own: Tab onto it and it draws its own
// 2 px ring inside itself while the box goes back to 1 px. Clearing hands focus back to the text.
function FilterRuns() {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("failed");
  return (
    <Field
      id={id}
      label="filter runs"
      hint="clear is a control in the field: it takes its own ring, and the field stays at 1 px"
    >
      <InputGroup>
        <InputGroupAddon>
          <Icon name="search" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          ref={input}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          aria-describedby={noteId(id)}
        />
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="clear the filter"
              onClick={() => {
                setValue("");
                input.current?.focus();
              }}
            >
              <Icon name="close" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </Field>
  );
}

const limit = 280;

// A note with its count under the text, inside the same box: the box still draws the one focus frame.
function ReleaseNote() {
  const id = useId();
  const [value, setValue] = useState("fixed the running head on narrow pages.");
  return (
    <Field id={id} label="release note" hint="shown on the changelog page">
      <InputGroup>
        <InputGroupTextarea
          id={id}
          value={value}
          maxLength={limit}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby={noteId(id)}
        />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-instrument tabular-nums">
            {value.length} of {limit}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

export function InputGroupExample() {
  const search = useId();
  const namespace = useId();
  const item = useId();
  // the disabled field sits between live ones, never last: the focus check's Tab attempt on it lands on the next
  // field, which keeps it in view
  return (
    <div className="st-a-grid">
      <Field id={search} label="search">
        <InputGroup>
          <InputGroupAddon>
            <Icon name="search" />
          </InputGroupAddon>
          <InputGroupInput id={search} placeholder="search the fleet" enterKeyHint="search" />
        </InputGroup>
      </Field>
      <FilterRuns />
      <Field id={namespace} label="namespace" hint="fixed by the registry">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id={namespace} defaultValue="mk" disabled aria-describedby={noteId(namespace)} />
        </InputGroup>
      </Field>
      <Field id={item} label="registry item" hint="the name after the namespace">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@mk/</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id={item} defaultValue="input-group" spellCheck={false} aria-describedby={noteId(item)} />
        </InputGroup>
      </Field>
      <ReleaseNote />
    </div>
  );
}

// The states on the registry item field, printed through data-demo on the box, which reads it as its text holding
// focus. An invalid state's label ends in "invalid": the focus check reads that ending as the field's error ink.
const states = [
  { name: "rest", note: "1 px input edge", value: "input-group" },
  { name: "focus", note: "2 px house edge, inside", value: "input-group", demo: true },
  { name: "typing", note: "same edge, caret in its ink", value: "input-gr", demo: true },
  { name: "invalid", note: "1 px error edge", value: "Input Group", invalid: true },
  {
    name: "invalid, focus",
    label: "focus, invalid",
    note: "2 px error edge, inside",
    value: "Input Group",
    demo: true,
    invalid: true,
  },
];

export function InputGroupStates() {
  return (
    <States>
      {states.map((state) => (
        <State key={state.name} name={state.name} note={state.note}>
          <InputGroup data-demo={state.demo ? "focus" : undefined}>
            <InputGroupAddon>
              <InputGroupText>@mk/</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              defaultValue={state.value}
              tabIndex={-1}
              spellCheck={false}
              aria-label={`registry item, ${state.label ?? state.name}`}
              aria-invalid={state.invalid || undefined}
            />
          </InputGroup>
        </State>
      ))}
    </States>
  );
}
