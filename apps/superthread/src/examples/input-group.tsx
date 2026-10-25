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
import { Field, noteId, printedStates, State, States, Typing } from "@/examples/input";

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

// A note with its count under the text, inside the same box: the box still draws the one focus frame. The count is
// a quantity, so it sets in mono with tabular figures, as the world sets its counts.
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
          <InputGroupText className="font-mono text-instrument tabular-nums">
            {value.length} of {limit}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

export function InputGroupExample() {
  const search = useId();
  const item = useId();
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
// focus; a typing state adds the printed caret, and disabled is the real disabled text. An invalid state carries
// aria-invalid, which draws the error ink, and its label ends in "invalid", so a screen reader hears it too.
const prefix = "@mk/";

const states = printedStates({
  valid: "input-group",
  typed: "input-gr",
  invalid: "Input Group",
  typedInvalid: "Input Gr",
});

export function InputGroupStates() {
  return (
    <States>
      {states.map((state) => {
        const group = (
          <InputGroup data-demo={state.demo ? "focus" : undefined}>
            <InputGroupAddon>
              <InputGroupText>{prefix}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              defaultValue={state.value}
              tabIndex={-1}
              spellCheck={false}
              aria-label={`registry item, ${state.label ?? state.name}`}
              aria-invalid={state.invalid || undefined}
              disabled={state.disabled}
            />
          </InputGroup>
        );
        return (
          <State key={state.name} name={state.name} note={state.note}>
            {state.typing ? (
              <Typing kind="line" text={state.value} prefix={prefix}>
                {group}
              </Typing>
            ) : (
              group
            )}
          </State>
        );
      })}
    </States>
  );
}
