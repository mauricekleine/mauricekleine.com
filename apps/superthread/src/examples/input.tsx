import { useId, useState, type ReactNode } from "react";
import { cn } from "@/components/superthread/lib/utils";
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

// An input error: the bang in its glyph square, in the failed glyph ink, then what is wrong and how to fix it.
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="st-a-error">
      <BangGlyph />
      <span>{children}</span>
    </p>
  );
}

// The world's input error glyph: the 14 px glyph square, corners notched, the bang knocked out. The registry's
// glyphs carry the bang only as a bare stroke, so the square is drawn here.
function BangGlyph() {
  return (
    <svg
      viewBox="0 0 14 14"
      width={14}
      height={14}
      shapeRendering="crispEdges"
      fill="currentColor"
      className="text-error-glyph"
      aria-hidden="true"
    >
      <path d="M1 0h12v1h-12zM0 1h14v1h-14zM0 2h6v1h-6zM8 2h6v1h-6zM0 3h6v1h-6zM8 3h6v1h-6zM0 4h6v1h-6zM8 4h6v1h-6zM0 5h6v1h-6zM8 5h6v1h-6zM0 6h6v1h-6zM8 6h6v1h-6zM0 7h6v1h-6zM8 7h6v1h-6zM0 8h6v1h-6zM8 8h6v1h-6zM0 9h14v1h-14zM0 10h6v1h-6zM8 10h6v1h-6zM0 11h6v1h-6zM8 11h6v1h-6zM0 12h14v1h-14zM1 13h12v1h-12z" />
    </svg>
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

// A disabled field sits between live ones, never last: the focus check's Tab attempt on it lands on the next field,
// which keeps it in view.
export function InputExample() {
  const title = useId();
  const chapter = useId();
  return (
    <div className="st-a-grid">
      <Field id={title} label="chapter title" hint="shown in the running head">
        <Input id={title} defaultValue="one photon at a time" aria-describedby={noteId(title)} />
      </Field>
      <Field id={chapter} label="chapter number" hint="set by the chapter's place in the book">
        <Input id={chapter} defaultValue="7" disabled aria-describedby={noteId(chapter)} />
      </Field>
      <Slug initial="one-photon" />
      <Slug initial="One Photon!" />
    </div>
  );
}

// The states, printed through data-demo, which the site's variants read as the real state. Printed states stay out
// of the tab order; click one and it takes real focus, which draws the same single frame. An invalid state's label
// ends in "invalid": the focus check reads that ending as the field's error ink.
export function InputStates() {
  return (
    <States>
      <State name="rest" note="1 px input edge">
        <Input defaultValue="one-photon" tabIndex={-1} aria-label="slug, rest" spellCheck={false} />
      </State>
      <State name="focus" note="2 px house edge, inside">
        <Input defaultValue="one-photon" tabIndex={-1} aria-label="slug, focus" spellCheck={false} data-demo="focus" />
      </State>
      <State name="typing" note="same edge, caret in its ink">
        <Input defaultValue="one-pho" tabIndex={-1} aria-label="slug, typing" spellCheck={false} data-demo="focus" />
      </State>
      <State name="invalid" note="1 px error edge">
        <Input defaultValue="One Photon!" tabIndex={-1} aria-label="slug, invalid" spellCheck={false} aria-invalid />
      </State>
      <State name="invalid, focus" note="2 px error edge, inside">
        <Input
          defaultValue="One Photon!"
          tabIndex={-1}
          aria-label="slug, focus, invalid"
          spellCheck={false}
          aria-invalid
          data-demo="focus"
        />
      </State>
    </States>
  );
}
