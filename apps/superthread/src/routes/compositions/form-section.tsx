import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import {
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionDescription,
  FormSectionFields,
  FormSectionFooter,
  FormSectionStatus,
} from "@/components/superthread/blocks/form-section";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/superthread/ui/field";
import { Input } from "@/components/superthread/ui/input";
import { Button } from "@/components/superthread/ui/button";
import { catalog } from "@/components/superthread/catalog";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "form-section")!
  .serves!.map((app) => (app === "www" ? "the public site" : app[0]!.toUpperCase() + app.slice(1)))
  .join(", ");
export const Route = createFileRoute("/compositions/form-section")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "Save states" },
    ],
  },
  component: Page,
});

function SettingsForm({
  initialStatus = "Unsaved changes",
  invalid = false,
}: {
  initialStatus?: string;
  invalid?: boolean;
}) {
  const id = useId();
  const [saved, setSaved] = useState("chapter-");
  const [prefix, setPrefix] = useState("chapter-");
  const [status, setStatus] = useState(initialStatus);
  const [attempted, setAttempted] = useState(invalid);
  const error = attempted && !prefix.trim();
  return (
    <FormSection
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (!prefix.trim()) {
          setStatus("Enter a prefix before saving");
          return;
        }
        setSaved(prefix);
        setStatus("Saved");
      }}
      onReset={(event) => {
        event.preventDefault();
        setPrefix(saved);
        setAttempted(false);
        setStatus("Changes discarded");
      }}
    >
      <FormSectionHeader>
        <FormSectionTitle>Chapter names</FormSectionTitle>
        <FormSectionDescription>New chapters use this prefix. Existing names stay as they are.</FormSectionDescription>
      </FormSectionHeader>
      <FormSectionFields>
        <Field data-invalid={error || undefined}>
          <FieldLabel htmlFor={id}>Name prefix</FieldLabel>
          <Input
            id={id}
            required
            value={prefix}
            aria-invalid={error || undefined}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
            onChange={(event) => {
              setPrefix(event.target.value);
              setStatus("Unsaved changes");
            }}
          />
          <FieldDescription id={`${id}-hint`}>For example, chapter- followed by a number.</FieldDescription>
          {error && <FieldError id={`${id}-error`}>Enter a name prefix, such as chapter-.</FieldError>}
        </Field>
      </FormSectionFields>
      <FormSectionFooter>
        <FormSectionStatus>{status}</FormSectionStatus>
        <Button type="reset" variant="outline">
          Discard
        </Button>
        <Button type="submit">Save</Button>
      </FormSectionFooter>
    </FormSection>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Form section"
        lede="A form named by its heading, with fields below and a ruled save row. The app owns the draft, validation and save status."
      >
        <InstallLine items={["form-section"]} />
      </PageHead>
      <p className="st-cb-serves">Serves {serves}.</p>

      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Edit the prefix, then save or discard. Clear the field and save to see its error; the draft stays in place
          until it is valid.
        </p>
        <ModePair className="st-cb-stack">
          <SettingsForm />
        </ModePair>
      </Section>
      <Section id="states" title="Save states">
        <p className="st-cb-copy">
          The status sits beside the actions and is read out when it changes. Save keeps the new value, and Discard
          returns to the last saved value.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-flow">
            <State name="Unsaved" note="The form starts with a draft">
              <FormSection aria-label="Unsaved chapter settings">
                <FormSectionHeader>
                  <FormSectionTitle>Chapter settings</FormSectionTitle>
                </FormSectionHeader>
                <FormSectionFooter>
                  <FormSectionStatus>Unsaved changes</FormSectionStatus>
                  <Button disabled variant="outline">
                    Discard
                  </Button>
                  <Button disabled>Save</Button>
                </FormSectionFooter>
              </FormSection>
            </State>
            <State name="Saved" note="The app confirms the write">
              <FormSection aria-label="Saved chapter settings">
                <FormSectionHeader>
                  <FormSectionTitle>Chapter settings</FormSectionTitle>
                </FormSectionHeader>
                <FormSectionFooter>
                  <FormSectionStatus>Saved</FormSectionStatus>
                  <Button disabled variant="outline">
                    Discard
                  </Button>
                  <Button disabled>Save</Button>
                </FormSectionFooter>
              </FormSection>
            </State>
          </div>
        </ModePair>
      </Section>
    </>
  );
}
