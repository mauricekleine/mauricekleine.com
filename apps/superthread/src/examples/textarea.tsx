import { useId, useState } from "react";
import { Textarea } from "@/components/superthread/ui/textarea";
import { Field, noteId, State, States } from "@/examples/input";

const most = 120;

// A summary checked as you type: past 120 characters its edge, focus and caret take the error ink, and the error
// says how much to cut.
function Summary({ initial }: { initial: string }) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const over = value.length - most;
  return (
    <Field
      id={id}
      label="summary"
      hint={`shown in the chapter list, ${most} characters at most`}
      error={over > 0 ? `a summary takes ${most} characters at most. cut ${over}.` : undefined}
    >
      <Textarea
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={over > 0 || undefined}
        aria-describedby={noteId(id)}
      />
    </Field>
  );
}

// The disabled field sits between live ones, never last: the focus check's Tab attempt on it lands on the next
// field, which keeps it in view.
export function TextareaExample() {
  const abstract = useId();
  return (
    <div className="st-a-grid">
      <Summary initial="why a single photon still draws the bands, and what that says about light." />
      <Field id={abstract} label="abstract" hint="locked while the chapter is in review">
        <Textarea
          id={abstract}
          defaultValue="light arrives one photon at a time, and the bands still form."
          disabled
          aria-describedby={noteId(abstract)}
        />
      </Field>
      <Summary initial="why a single photon still draws the bands, what that says about light, and why the bands are gone the moment you look for the slit it took." />
    </div>
  );
}

// The states, printed through data-demo, which the site's variants read as the real state. An invalid state's
// label ends in "invalid": the focus check reads that ending as the field's error ink.
const states = [
  { name: "rest", note: "1 px input edge", value: "one photon, then the bands." },
  { name: "focus", note: "2 px house edge, inside", value: "one photon, then the bands.", demo: true },
  { name: "typing", note: "same edge, caret in its ink", value: "one photon, then", demo: true },
  { name: "invalid", note: "1 px error edge", value: "one photon, then the bands, and then", invalid: true },
  {
    name: "invalid, focus",
    label: "focus, invalid",
    note: "2 px error edge, inside",
    value: "one photon, then the bands, and then",
    demo: true,
    invalid: true,
  },
];

export function TextareaStates() {
  return (
    <States>
      {states.map((state) => (
        <State key={state.name} name={state.name} note={state.note}>
          <Textarea
            defaultValue={state.value}
            tabIndex={-1}
            aria-label={`summary, ${state.label ?? state.name}`}
            aria-invalid={state.invalid || undefined}
            data-demo={state.demo ? "focus" : undefined}
          />
        </State>
      ))}
    </States>
  );
}
