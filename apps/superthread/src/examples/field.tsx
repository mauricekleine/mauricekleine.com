import { useId, useState } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/superthread/ui/field";
import { Input } from "@/components/superthread/ui/input";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Switch } from "@/components/superthread/ui/switch";
import { Button } from "@/components/superthread/ui/button";
import { State } from "@/examples/input";
export function FieldExample() {
  const id = useId();
  const [name, setName] = useState("run-024");
  const [saved, setSaved] = useState(false);
  const invalid = !/^[a-z0-9-]+$/.test(name);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) setSaved(true);
      }}
      className="st-e-stack"
    >
      <FieldSet>
        <FieldLegend>orbit run</FieldLegend>
        <FieldGroup>
          <Field data-invalid={invalid || undefined} aria-labelledby={`${id}-label`}>
            <FieldLabel id={`${id}-label`} htmlFor={id}>
              run name
            </FieldLabel>
            <Input
              id={id}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-help ${id}-error` : `${id}-help`}
            />
            <FieldDescription id={`${id}-help`}>lowercase letters, digits and dashes</FieldDescription>
            {invalid && <FieldError id={`${id}-error`}>use a name such as run-024.</FieldError>}
          </Field>
          <FieldSeparator>notifications</FieldSeparator>
          <Field orientation="horizontal" aria-label="completion notice">
            <FieldContent>
              <FieldLabel htmlFor={`${id}-notify`}>notify on completion</FieldLabel>
              <FieldDescription id={`${id}-notify-help`}>send a notice when this run ends</FieldDescription>
            </FieldContent>
            <Switch id={`${id}-notify`} aria-describedby={`${id}-notify-help`} defaultChecked />
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="st-e-row">
        <Button type="submit" disabled={invalid}>
          save run
        </Button>
      </div>
      <p role="status" className="st-e-hint">
        {saved ? `saved ${name}` : "edit the run, then save"}
      </p>
    </form>
  );
}
function Orientation({ orientation }: { orientation: "vertical" | "horizontal" | "responsive" }) {
  const id = useId();
  return (
    <FieldGroup>
      <Field orientation={orientation} aria-labelledby={`${id}-label`}>
        <FieldLabel className="st-e-fixed-label" htmlFor={id} id={`${id}-label`}>
          run name
        </FieldLabel>
        <Input id={id} defaultValue="run-024" />
      </Field>
    </FieldGroup>
  );
}
export function FieldOrientations() {
  return (
    <div className="st-e-stack">
      {(["vertical", "horizontal", "responsive"] as const).map((orientation) => (
        <div className="st-e-stack" key={orientation}>
          <p className="st-e-hint">{orientation}</p>
          <Orientation orientation={orientation} />
        </div>
      ))}
      <div className="st-e-narrow">
        <p className="st-e-hint">responsive, narrow frame</p>
        <Orientation orientation="responsive" />
      </div>
    </div>
  );
}
export function FieldParts() {
  const id = useId();
  return (
    <FieldSet>
      <FieldLegend variant="label">run options</FieldLegend>
      <FieldDescription>the label legend uses interface type; the example above uses the mono legend.</FieldDescription>
      <FieldGroup>
        <FieldLabel>
          <Field orientation="horizontal" aria-label="retain the run log">
            <Checkbox defaultChecked aria-describedby={`${id}-keep`} />
            <FieldContent>
              <FieldTitle>keep the run log</FieldTitle>
              <FieldDescription id={`${id}-keep`}>retain output after completion</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldLabel>
          <Field orientation="horizontal" aria-label="include drafts">
            <Checkbox />
            <FieldContent>
              <FieldTitle>include drafts</FieldTitle>
              <FieldDescription>show unpublished quanta chapters</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldSeparator />
        <Field aria-label="run validation" data-invalid="true">
          <FieldTitle>check the run</FieldTitle>
          <FieldError
            errors={[{ message: "choose a ship." }, { message: "enter a run name." }, { message: "choose a ship." }]}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
export function FieldStates() {
  const prefix = useId();
  return (
    <div className="st-e-states">
      {[
        { name: "rest", note: "label, box and description" },
        { name: "hover", note: "input edge stays quiet", demo: "hover" },
        { name: "focus", note: "box owns the inside edge", demo: "focus" },
        { name: "invalid", note: "error label and bang square", invalid: true },
        { name: "invalid, focus", note: "error edge stays inside", invalid: true, demo: "focus" },
        { name: "disabled", note: "disabled label and control", disabled: true },
      ].map((s, i) => (
        <State key={s.name} name={s.name} note={s.note}>
          <Field
            data-invalid={s.invalid || undefined}
            data-disabled={s.disabled || undefined}
            aria-label={`run name, ${s.name}`}
          >
            <FieldLabel htmlFor={`${prefix}-${i}`}>run name</FieldLabel>
            <Input
              id={`${prefix}-${i}`}
              value={s.invalid ? "" : "run-024"}
              readOnly
              disabled={s.disabled}
              aria-invalid={s.invalid || undefined}
              aria-describedby={`${prefix}-${i}-note`}
              tabIndex={-1}
              data-demo={s.demo}
            />
            {s.invalid ? (
              <FieldError id={`${prefix}-${i}-note`}>enter a run name.</FieldError>
            ) : (
              <FieldDescription id={`${prefix}-${i}-note`}>shown on the board</FieldDescription>
            )}
          </Field>
        </State>
      ))}
    </div>
  );
}
