import { useId, useState } from "react";
import { Textarea } from "@/components/superthread/ui/textarea";
import { Field, noteId, printedStates, State, States, Typing } from "@/examples/input";

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

export function TextareaExample() {
  return (
    <div className="st-a-grid">
      <Summary initial="why a single photon still draws the bands, and what that says about light." />
      <Summary initial="why a single photon still draws the bands, what that says about light, and why the bands are gone the moment you look for the slit it took." />
    </div>
  );
}

// The states, printed through data-demo, which the site's variants read as the real state; a typing state adds the
// printed caret, and disabled is the real disabled box. An invalid state carries aria-invalid, which draws the error
// ink, and its label ends in "invalid", so a screen reader hears it too.
const states = printedStates({
  valid: "one photon, then the bands.",
  typed: "one photon, then",
  invalid: "one photon, then the bands, and then",
  typedInvalid: "one photon, then the bands, and",
});

export function TextareaStates() {
  return (
    <States>
      {states.map((state) => {
        const textarea = (
          <Textarea
            defaultValue={state.value}
            tabIndex={-1}
            aria-label={`summary, ${state.label ?? state.name}`}
            aria-invalid={state.invalid || undefined}
            disabled={state.disabled}
            data-demo={state.demo ? "focus" : undefined}
          />
        );
        return (
          <State key={state.name} name={state.name} note={state.note}>
            {state.typing ? (
              <Typing kind="area" text={state.value}>
                {textarea}
              </Typing>
            ) : (
              textarea
            )}
          </State>
        );
      })}
    </States>
  );
}
