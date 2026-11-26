import { useId, useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { NativeSelect, NativeSelectOption } from "@/components/superthread/ui/native-select";
import { Textarea } from "@/components/superthread/ui/textarea";
import { GroundFrame } from "@/examples/compositions-a";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/superthread/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/superthread/ui/sheet";
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
        <FieldLegend>Orbit run</FieldLegend>
        <FieldGroup>
          <Field data-invalid={invalid || undefined} aria-labelledby={`${id}-label`}>
            <FieldLabel id={`${id}-label`} htmlFor={id}>
              Run name
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
            <FieldDescription id={`${id}-help`}>Lowercase letters, digits and dashes</FieldDescription>
            {invalid && <FieldError id={`${id}-error`}>Use a name such as run-024.</FieldError>}
          </Field>
          <FieldSeparator>Notifications</FieldSeparator>
          <Field orientation="horizontal" aria-label="Completion notice">
            <FieldContent>
              <FieldLabel htmlFor={`${id}-notify`}>Notify on completion</FieldLabel>
              <FieldDescription id={`${id}-notify-help`}>Send a notice when this run ends</FieldDescription>
            </FieldContent>
            <Switch id={`${id}-notify`} aria-describedby={`${id}-notify-help`} defaultChecked />
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="st-e-row">
        <Button type="submit" disabled={invalid}>
          Save run
        </Button>
      </div>
      <p role="status" className="st-e-hint">
        {saved ? `Saved ${name}` : "Edit the run, then save"}
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
          Run name
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
      <FieldLegend variant="label">Run options</FieldLegend>
      <FieldDescription>The label legend uses interface type; the example above uses the mono legend.</FieldDescription>
      <FieldGroup>
        <FieldLabel>
          <Field orientation="horizontal" aria-label="Retain the run log">
            <Checkbox defaultChecked aria-describedby={`${id}-keep`} />
            <FieldContent>
              <FieldTitle>Keep the run log</FieldTitle>
              <FieldDescription id={`${id}-keep`}>Retain output after completion</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldLabel>
          <Field orientation="horizontal" aria-label="Include drafts">
            <Checkbox />
            <FieldContent>
              <FieldTitle>Include drafts</FieldTitle>
              <FieldDescription>Show unpublished Quanta chapters</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldSeparator />
        <Field aria-label="Run validation" data-invalid="true">
          <FieldTitle>Check the run</FieldTitle>
          <FieldError
            errors={[{ message: "Choose a ship." }, { message: "Enter a run name." }, { message: "Choose a ship." }]}
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
        { name: "Rest", note: "Label, box and description" },
        { name: "Hover", note: "Input edge stays quiet", demo: "hover" },
        { name: "Focus", note: "Box owns the inside edge", demo: "focus" },
        { name: "Invalid", note: "Error label and bang square", invalid: true },
        { name: "Invalid, focus", note: "Error edge stays inside", invalid: true, demo: "focus" },
        { name: "Disabled", note: "Disabled label and control", disabled: true },
      ].map((s, i) => (
        <State key={s.name} name={s.name} note={s.note}>
          <Field
            data-invalid={s.invalid || undefined}
            data-disabled={s.disabled || undefined}
            aria-label={`Run name, ${s.name.toLowerCase()}`}
          >
            <FieldLabel htmlFor={`${prefix}-${i}`}>Run name</FieldLabel>
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
              <FieldError id={`${prefix}-${i}-note`}>Enter a run name.</FieldError>
            ) : (
              <FieldDescription id={`${prefix}-${i}-note`}>Shown on the board</FieldDescription>
            )}
          </Field>
        </State>
      ))}
    </div>
  );
}

// A form on each raised layer, printed open inside a frame that plays the window, as the dialog and sheet pages print
// theirs: the frame is a containing block for fixed boxes, the layer's portalProps hand its portal the frame, and the
// frame comes from state, so the portal waits for it. Inert: nothing in the print takes focus or the pointer.
function LayerFrame({ children }: { children: (frame: HTMLDivElement | null) => React.ReactNode }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="st-e-screen" inert>
      {children(frame)}
    </div>
  );
}

export function FieldOnLayers() {
  const id = useId();
  return (
    <div className="st-e-layers">
      <LayerFrame>
        {(frame) => (
          <Dialog open modal={false}>
            <DialogContent portalProps={{ container: frame }} initialFocus={false} finalFocus={false}>
              <DialogHeader>
                <DialogTitle>Share the draft</DialogTitle>
                <DialogDescription>Chapter 9, What a measurement does</DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${id}-invite`}>Invite by email</FieldLabel>
                  <Input id={`${id}-invite`} placeholder="reader@example.com" />
                </Field>
                <FieldSeparator>Or</FieldSeparator>
                <Button variant="outline">Copy the link</Button>
              </FieldGroup>
            </DialogContent>
          </Dialog>
        )}
      </LayerFrame>
      <LayerFrame>
        {(frame) => (
          <Sheet open modal={false}>
            <SheetContent portalProps={{ container: frame }} initialFocus={false} finalFocus={false}>
              <SheetHeader>
                <SheetTitle>run-024</SheetTitle>
                <SheetDescription>What the next run starts with</SheetDescription>
              </SheetHeader>
              <FieldGroup className="st-e-sheet-fields">
                <Field>
                  <FieldLabel htmlFor={`${id}-prefix`}>Branch prefix</FieldLabel>
                  <Input id={`${id}-prefix`} defaultValue="agent/" />
                </Field>
                <FieldSeparator>Notifications</FieldSeparator>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor={`${id}-notify`}>Notify on completion</FieldLabel>
                  <Switch id={`${id}-notify`} defaultChecked />
                </Field>
              </FieldGroup>
            </SheetContent>
          </Sheet>
        )}
      </LayerFrame>
    </div>
  );
}

// A run's settings on a phone's ground, where every control that takes text sets 16 px.
function RunSettings() {
  const id = useId();
  return (
    <AppShellPanel>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Run name</FieldLabel>
          <Input id={`${id}-name`} defaultValue="run-024" aria-describedby={`${id}-name-help`} />
          <FieldDescription id={`${id}-name-help`}>Shown on the board</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-when`}>Starts</FieldLabel>
          <NativeSelect id={`${id}-when`} defaultValue="mail" className="w-full">
            <NativeSelectOption value="mail">When mail arrives</NativeSelectOption>
            <NativeSelectOption value="morning">Every day at 07:00</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-notes`}>Notes for the agent</FieldLabel>
          <Textarea id={`${id}-notes`} defaultValue="Keep the summary under 120 characters." />
        </Field>
      </FieldGroup>
    </AppShellPanel>
  );
}

export function FieldsOnPhone({ mode }: { mode: "light" | "dark" }) {
  return (
    <GroundFrame mode={mode} title={`Run settings on a phone, ${mode}`} height={400}>
      <RunSettings />
    </GroundFrame>
  );
}
