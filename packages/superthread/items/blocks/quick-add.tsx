import { useEffect, useId, useRef, useState } from "react";
import { isPageKey } from "@/components/superthread/lib/hotkey";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { FieldError, FieldLabel } from "@/components/superthread/ui/field";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Input } from "@/components/superthread/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/superthread/ui/input-group";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/superthread/ui/sidebar";

type AddProps = {
  label: string;
  placeholder?: string;
  submitLabel?: string;
  onAdd: (value: string) => void | Promise<void>;
};

// One add at a time. A failed add keeps the draft; a successful add clears it and returns focus, and a draft typed while
// the add was in flight stays.
function useAdd(onAdd: AddProps["onAdd"], disabled: boolean | undefined) {
  const input = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = input.current?.value ?? value;
    const text = draft.trim();
    if (!text || pending.current || disabled) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await onAdd(text);
      setValue((current) => (current === draft ? "" : current));
      input.current?.focus();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "";
      setError(message.trim() || "could not add. try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return { input, value, setValue, busy, error, submit };
}

type QuickAddProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children"> &
  AddProps & {
    hideLabel?: boolean;
    inputProps?: Omit<
      React.ComponentProps<typeof InputGroupInput>,
      "value" | "defaultValue" | "onChange" | "ref" | "placeholder" | "children"
    >;
  };

// One named field and its submit control, an outline so it never spends the page's plum fill.
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
  const { input, value, setValue, busy, error, submit } = useAdd(onAdd, inputProps.disabled);

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
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            variant="outline"
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

type QuickAddNavProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children" | "popover" | "ref"> &
  AddProps & {
    triggerLabel?: string;
    hotkey?: string | null;
    inputProps?: Omit<
      React.ComponentProps<typeof Input>,
      "value" | "defaultValue" | "onChange" | "ref" | "placeholder" | "children"
    >;
  };

// The quiet add in a ship's nav: a muted word above the nav's foot that opens a one-line field over itself. Enter adds,
// clears and stays open for the next one; Escape or a click away closes and keeps the draft. A native popover carries it,
// so it clears the frame's scroll and stays in the frame's dark scope. Below 900 px it sits 12 px from each edge with a
// button, and on a phone the trigger is the glyph alone in a 44 px target. Its key opens it away from typing, through the
// helper search-palette shares.
function QuickAddNav({
  className,
  id: formId,
  label,
  placeholder,
  triggerLabel = "add",
  submitLabel = "add",
  hotkey = "n",
  onAdd,
  inputProps = {},
  onToggle,
  ...props
}: QuickAddNavProps) {
  const id = useId();
  const fieldId = formId ?? `${id}-field`;
  const inputId = inputProps.id ?? `${id}-input`;
  const errorId = `${id}-error`;
  const form = useRef<HTMLFormElement>(null);
  const disabled = inputProps.disabled;
  const { input, value, setValue, busy, error, submit } = useAdd(onAdd, disabled);

  useEffect(() => {
    if (hotkey === null || disabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPageKey(event, hotkey)) return;
      event.preventDefault();
      form.current?.togglePopover(true);
      input.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hotkey, disabled, input]);

  return (
    <SidebarMenuItem
      data-mk="quick-add"
      data-slot="quick-add-nav"
      className="mt-auto min-w-0 [@media(max-width:900px)]:mt-0 [@media(max-width:900px)]:ml-auto"
      style={{ "--quick-add-anchor": `--quick-add-${id.replace(/\W/g, "")}` } as React.CSSProperties}
    >
      <SidebarMenuButton
        type="button"
        popoverTarget={fieldId}
        aria-label={triggerLabel}
        disabled={disabled}
        className="text-muted-foreground [anchor-name:var(--quick-add-anchor)] hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:900px)]:h-8 [@media(max-width:900px)]:hit-area [@media(min-width:601px)_and_(max-width:900px)]:w-auto [@media(max-width:600px)]:w-11 [@media(max-width:600px)]:justify-center [@media(max-width:600px)]:px-0"
      >
        <Icon name="plus" />
        <span className="[@media(max-width:600px)]:hidden">{triggerLabel}</span>
      </SidebarMenuButton>
      <form
        {...props}
        ref={form}
        id={fieldId}
        popover="auto"
        data-slot="quick-add-nav-field"
        aria-label={props["aria-label"] ?? label}
        aria-busy={busy}
        className={cn(
          "fixed inset-auto bottom-[anchor(bottom)] left-[anchor(left)] m-0 w-[anchor-size(width)] flex-wrap overflow-visible border-0 bg-popover p-0 text-popover-foreground shadow-leaf [position-anchor:var(--quick-add-anchor)] open:flex [@media(max-width:900px)]:top-[anchor(top)] [@media(max-width:900px)]:right-3 [@media(max-width:900px)]:bottom-auto [@media(max-width:900px)]:left-3 [@media(max-width:900px)]:w-auto",
          className,
        )}
        onSubmit={submit}
        onToggle={(event) => {
          onToggle?.(event);
          if (event.newState === "open") input.current?.focus();
        }}
      >
        <FieldLabel htmlFor={inputId} className="sr-only">
          {label}
        </FieldLabel>
        <Input
          autoComplete="off"
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
          className={cn(
            "min-w-0 flex-1 [@media(min-width:901px)]:h-[34px] [@media(min-width:901px)]:px-2.5",
            inputProps.className,
          )}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={busy || !value.trim() || disabled}
          className="-ml-px hidden [@media(max-width:900px)]:inline-flex [@media(max-width:600px)]:h-11"
        >
          {submitLabel}
        </Button>
        {error && (
          <FieldError id={errorId} className="w-full px-2.5 py-2">
            {error}
          </FieldError>
        )}
      </form>
    </SidebarMenuItem>
  );
}

export { QuickAdd, QuickAddNav };
