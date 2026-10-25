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
  .serves!.map((app) => (app === "www" ? "the public site" : app))
  .join(", ");
export const Route = createFileRoute("/compositions/form-section")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "save states" },
    ],
  },
  component: Page,
});

function SettingsForm({
  initialStatus = "unsaved changes",
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
          setStatus("enter a prefix before saving");
          return;
        }
        setSaved(prefix);
        setStatus("saved");
      }}
      onReset={(event) => {
        event.preventDefault();
        setPrefix(saved);
        setAttempted(false);
        setStatus("changes discarded");
      }}
    >
      <FormSectionHeader>
        <FormSectionTitle>chapter names</FormSectionTitle>
        <FormSectionDescription>new chapters use this prefix. existing names stay as they are.</FormSectionDescription>
      </FormSectionHeader>
      <FormSectionFields>
        <Field data-invalid={error || undefined}>
          <FieldLabel htmlFor={id}>name prefix</FieldLabel>
          <Input
            id={id}
            required
            value={prefix}
            aria-invalid={error || undefined}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
            onChange={(event) => {
              setPrefix(event.target.value);
              setStatus("unsaved changes");
            }}
          />
          <FieldDescription id={`${id}-hint`}>for example, chapter- followed by a number.</FieldDescription>
          {error && <FieldError id={`${id}-error`}>enter a name prefix, such as chapter-.</FieldError>}
        </Field>
      </FormSectionFields>
      <FormSectionFooter>
        <FormSectionStatus>{status}</FormSectionStatus>
        <Button type="reset" variant="outline">
          discard
        </Button>
        <Button type="submit">save</Button>
      </FormSectionFooter>
    </FormSection>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="form section"
        lede="a form named by its heading, with fields below and a ruled save row. the app owns the draft, validation and save status."
      >
        <InstallLine items={["form-section"]} />
      </PageHead>
      <p className="st-cb-serves">serves {serves}.</p>

      <Section id="example" title="example">
        <p className="st-cb-copy">
          edit the prefix, then save or discard. clear the field and save to see its error; the draft stays in place
          until it is valid.
        </p>
        <ModePair className="st-cb-stack">
          <SettingsForm />
        </ModePair>
      </Section>
      <Section id="states" title="save states">
        <p className="st-cb-copy">
          the status sits beside the actions and is read out when it changes. save keeps the new value, and discard
          returns to the last saved value.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-flow">
            <State name="unsaved" note="the form starts with a draft">
              <FormSection aria-label="unsaved chapter settings">
                <FormSectionHeader>
                  <FormSectionTitle>chapter settings</FormSectionTitle>
                </FormSectionHeader>
                <FormSectionFooter>
                  <FormSectionStatus>unsaved changes</FormSectionStatus>
                  <Button disabled variant="outline">
                    discard
                  </Button>
                  <Button disabled>save</Button>
                </FormSectionFooter>
              </FormSection>
            </State>
            <State name="saved" note="the app confirms the write">
              <FormSection aria-label="saved chapter settings">
                <FormSectionHeader>
                  <FormSectionTitle>chapter settings</FormSectionTitle>
                </FormSectionHeader>
                <FormSectionFooter>
                  <FormSectionStatus>saved</FormSectionStatus>
                  <Button disabled variant="outline">
                    discard
                  </Button>
                  <Button disabled>save</Button>
                </FormSectionFooter>
              </FormSection>
            </State>
          </div>
        </ModePair>
      </Section>
    </>
  );
}
