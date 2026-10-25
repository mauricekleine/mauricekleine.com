import { useId, useRef, useState } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { FieldError, FieldLabel } from "@/components/superthread/ui/field";
import { Icon } from "@/components/superthread/ui/glyphs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/superthread/ui/input-group";

type QuickAddProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children"> & {
  label: string;
  placeholder?: string;
  submitLabel?: string;
  hideLabel?: boolean;
  onAdd: (value: string) => void | Promise<void>;
  inputProps?: Omit<
    React.ComponentProps<typeof InputGroupInput>,
    "value" | "defaultValue" | "onChange" | "ref" | "placeholder" | "children"
  >;
};

// One named field and its submit control. A failed add keeps the draft; a successful add clears it and returns focus.
function QuickAdd({
  className,
  label,
  placeholder,
  submitLabel = "add",
  hideLabel = false,
  onAdd,
  inputProps = {},
  ...props
}: QuickAddProps) {
  const id = useId();
  const inputId = inputProps.id ?? `${id}-input`;
  const errorId = `${id}-error`;
  const input = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = input.current?.value ?? value;
    const text = draft.trim();
    if (!text || pending.current || inputProps.disabled) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await onAdd(text);
      // Keep any newer draft typed while the previous add was in flight.
      setValue((current) => (current === draft ? "" : current));
      input.current?.focus();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "";
      setError(message.trim() ? message.toLowerCase().replaceAll("—", ", ") : "could not add. try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      {...props}
      data-mk="quick-add"
      data-slot="quick-add"
      aria-label={props["aria-label"] ?? label}
      aria-busy={busy}
      className={cn("grid min-w-0 gap-2", className)}
      onSubmit={submit}
    >
      <FieldLabel htmlFor={inputId} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </FieldLabel>
      <InputGroup aria-label={label}>
        <InputGroupInput
          {...inputProps}
          ref={input}
          id={inputId}
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error ? true : inputProps["aria-invalid"]}
          aria-describedby={
            [inputProps["aria-describedby"], error ? errorId : undefined].filter(Boolean).join(" ") || undefined
          }
        />
        <InputGroupAddon align="inline-end" aria-label="submit">
          <InputGroupButton
            type="submit"
            variant="default"
            size="sm"
            disabled={busy || !value.trim() || inputProps.disabled}
          >
            <Icon name="plus" />
            {submitLabel}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </form>
  );
}

export { QuickAdd };
