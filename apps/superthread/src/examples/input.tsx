import { useId, useState, type ReactNode } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { FieldErrorGlyph } from "@/components/superthread/ui/glyphs";
import { Input } from "@/components/superthread/ui/input";

// The field pages' shared parts (input, input group, textarea, select, checkbox), then the input's own examples.
// A field is set as the world sets it: the label 8 px above the box, a hint or an error 8 px below it, both tied to
// the control by id. A printed state is a real item in that state, with its note under it.

export type Mode = "light" | "dark";

// the hint or error under a field, for the control's aria-describedby
export const noteId = (id: string) => `${id}-note`;

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  // the control's id; the label points at it
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="st-a-field">
      <label htmlFor={id} className="st-a-label">
        {label}
      </label>
      {children}
      {error ? <FieldError id={noteId(id)}>{error}</FieldError> : hint && <Hint id={noteId(id)}>{hint}</Hint>}
    </div>
  );
}

export function Hint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="st-a-hint">
      {children}
    </p>
  );
}

// An input error: the item's field-error glyph, the bang knocked out of its square in the failed glyph ink, then
// what is wrong and how to fix it.
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="st-a-error">
      <FieldErrorGlyph />
      <span>{children}</span>
    </p>
  );
}

// A printed typing state: the field as it draws focus, plus the caret the browser draws after the text. A copy of
// the text in no ink sits over the control on the control's own metrics and ends in a 1 px bar in --fx, so the bar
// lands where the real caret would. "line" copies an input's centred line, "area" a textarea's top-aligned lines,
// and a prefix copies an input group's text addon. While the field holds real focus the copy steps aside for the
// real caret, and it follows what is typed, so the printed caret is right again when focus leaves.
export function Typing({
  kind,
  text,
  prefix,
  children,
}: {
  kind: "line" | "area";
  text: string;
  prefix?: string;
  children: ReactNode;
}) {
  const [typed, setTyped] = useState(text);
  return (
    <div
      className="st-a-typing"
      onInput={(event) => setTyped((event.target as HTMLInputElement | HTMLTextAreaElement).value)}
    >
      {children}
      <span
        className={cn("st-a-ghost text-ui", kind === "area" ? "st-a-ghost-area leading-5" : "st-a-ghost-line")}
        aria-hidden="true"
      >
        <span>
          {prefix && <span className="st-a-ghost-prefix">{prefix}</span>}
          {typed}
          <span className="st-a-caret" />
        </span>
      </span>
    </div>
  );
}

// A printed state: the item as it draws that state, then two lines of note, the state and what it draws.
export function State({
  name,
  note,
  children,
  className,
}: {
  name: string;
  note: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("st-a-state", className)}>
      {children}
      <p className="st-a-note">
        {name}
        <br />
        {note}
      </p>
    </div>
  );
}

export function States({ children }: { children: ReactNode }) {
  return <div className="st-a-states">{children}</div>;
}

// --- input -----------------------------------------------------------------------------------------------------

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// A slug checked as you type: the edge, its focus and its caret take the error ink while aria-invalid holds.
function Slug({ initial }: { initial: string }) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const invalid = !slugPattern.test(value);
  return (
    <Field
      id={id}
      label="slug"
      hint="lowercase letters, digits and dashes"
      error={invalid ? "a slug takes lowercase letters, digits and dashes. try one-photon." : undefined}
    >
      <Input
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-describedby={noteId(id)}
      />
    </Field>
  );
}

export function InputExample() {
  const title = useId();
  return (
    <div className="st-a-grid">
      <Field id={title} label="chapter title" hint="shown in the running head">
        <Input id={title} defaultValue="one photon at a time" aria-describedby={noteId(title)} />
      </Field>
      <Slug initial="one-photon" />
      <Slug initial="One Photon!" />
    </div>
  );
}

// A row of printed states: the house ink's three, then the error ink's three, then disabled.
export type PrintedState = {
  name: string;
  // the accessible name's state, when it differs from the name
  label?: string;
  note: string;
  value: string;
  demo?: boolean;
  typing?: boolean;
  invalid?: boolean;
  disabled?: boolean;
};

export function printedStates(values: { valid: string; typed: string; invalid: string; typedInvalid: string }) {
  const states: PrintedState[] = [
    { name: "rest", note: "1 px input edge", value: values.valid },
    { name: "focus", note: "2 px house edge, inside", value: values.valid, demo: true },
    { name: "typing", note: "same edge, caret in its ink", value: values.typed, demo: true, typing: true },
    { name: "invalid", note: "1 px error edge", value: values.invalid, invalid: true },
    {
      name: "invalid, focus",
      label: "focus, invalid",
      note: "2 px error edge, inside",
      value: values.invalid,
      demo: true,
      invalid: true,
    },
    {
      name: "invalid, typing",
      label: "typing, invalid",
      note: "same edge, caret in its ink",
      value: values.typedInvalid,
      demo: true,
      typing: true,
      invalid: true,
    },
    { name: "disabled", note: "flat fill, screened edge", value: values.valid, disabled: true },
  ];
  return states;
}

const inputStates = printedStates({
  valid: "one-photon",
  typed: "one-pho",
  invalid: "One Photon!",
  typedInvalid: "One Phot",
});

// The states, printed through data-demo, which the site's variants read as the real state; a typing state adds the
// printed caret, and disabled is the real disabled field. Printed states stay out of the tab order; click one and it
// takes real focus, which draws the same single frame. An invalid state carries aria-invalid, which draws the error
// ink, and its label ends in "invalid", so a screen reader hears it too.
export function InputStates() {
  return (
    <States>
      {inputStates.map((state) => {
        const input = (
          <Input
            defaultValue={state.value}
            tabIndex={-1}
            aria-label={`slug, ${state.label ?? state.name}`}
            spellCheck={false}
            aria-invalid={state.invalid || undefined}
            disabled={state.disabled}
            data-demo={state.demo ? "focus" : undefined}
          />
        );
        return (
          <State key={state.name} name={state.name} note={state.note}>
            {state.typing ? (
              <Typing kind="line" text={state.value}>
                {input}
              </Typing>
            ) : (
              input
            )}
          </State>
        );
      })}
    </States>
  );
}
