import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { cn } from "@/components/superthread/lib/utils";

import { Button } from "@/components/superthread/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/superthread/ui/input-group";
import { Icon } from "@/components/superthread/ui/glyphs";

// The root keeps Base UI's single and multiple selection API.
const Combobox = ComboboxPrimitive.Root;

// The selected value keeps Base UI's formatter and multiple-value API.
function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

// The trigger is an input-group control with its own inside ring.
function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      aria-label="show options"
      className={cn(
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)",
        className,
      )}
      {...props}
    >
      {children}
      <Icon name="chevron" className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

// Clear is a ghost control beside the text control, with a lowercase name.
function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label="clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <Icon name="close" className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

// One field box holds the text control and its independently focused buttons.
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <div data-mk="combobox">
      <InputGroup className={cn("w-auto", className)}>
        <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
        <InputGroupAddon align="inline-end">
          {showTrigger && (
            <InputGroupButton
              data-slot="input-group-button"
              size="icon-xs"
              variant="ghost"
              render={<ComboboxTrigger />}
              disabled={disabled}
              className="group-has-data-[slot=combobox-clear]/input-group:hidden"
            />
          )}
          {showClear && <ComboboxClear disabled={disabled} />}
        </InputGroupAddon>
        {children}
      </InputGroup>
    </div>
  );
}

// The popup takes the select's leaf lift; its list scrolls without clipping the contact edge.
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  portalProps,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "anchor"> & {
    portalProps?: ComboboxPrimitive.Portal.Props;
  }) {
  return (
    <ComboboxPrimitive.Portal {...portalProps}>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-mk="combobox"
          data-chips={!!anchor}
          className={cn(
            "group/combobox-content relative isolate z-50 max-w-(--available-width) w-(--anchor-width) min-w-36 origin-(--transform-origin) border border-border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)] transition-none duration-(--duration-instant) ease-(--ease-brand) data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

// Only this inner list scrolls, leaving the popup's contact screen exposed.
function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

// Highlight previews a row; the chosen value keeps its check over the same fill, on aria-selected.
function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex h-9 w-full cursor-default items-center gap-2.5 border border-transparent pr-8 pl-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-highlighted:bg-raised-hover aria-selected:bg-raised-hover data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute right-2.5 flex size-3 items-center justify-center" />}
      >
        <Icon name="check" className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

// A group keeps its accessible label and collection semantics.
function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />;
}

// Group names use the meta step and the list's item inset.
function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground", className)}
      {...props}
    />
  );
}

// The collection keeps Base UI's item renderer and filtering API.
function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

// An empty result leaves a quiet, centred instrument line.
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-6 text-center type-instrument text-muted-foreground group-data-empty/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

// A quiet rule separates groups without adding a surface.
function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

// The chips box is a field: only focus on its text control thickens the box inside.
function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      data-mk="combobox"
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1 border border-input bg-background px-2.5 py-1 text-ui [--fx:var(--primary)] has-[input:focus]:border-(--fx) has-[input:focus]:outline-2 has-[input:focus]:-outline-offset-2 has-[input:focus]:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] has-[[aria-invalid=true]]:border-error has-[[aria-invalid=true]]:[--fx:var(--error)] has-[input:disabled]:bg-faint has-[input:disabled]:text-disabled has-data-[slot=combobox-chip]:px-1",
        className,
      )}
      {...props}
    />
  );
}

// A 24 px square chip keeps its word beside a 16 px ghost remove control.
function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-6 w-fit items-center justify-center gap-1 border border-border bg-secondary px-1.5 type-instrument whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:text-disabled has-data-[slot=combobox-chip-remove]:pr-1",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          aria-label="remove"
          className="size-4 p-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) [&_svg]:size-3"
          data-slot="combobox-chip-remove"
        >
          <Icon name="close" className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

// The inner text control carries no frame; the chips box owns its focus edge.
function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn(
        "min-w-16 flex-1 self-stretch border-0 bg-transparent text-ui outline-0 caret-(--fx) placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

// An anchor lets a multiple-value popup align with the whole chips box.
function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
