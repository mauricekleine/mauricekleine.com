import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "@/components/superthread/lib/utils";

import { Icon } from "@/components/superthread/ui/glyphs";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("scroll-my-1 p-1", className)} {...props} />;
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value data-slot="select-value" className={cn("flex flex-1 text-left", className)} {...props} />
  );
}

// The trigger is a field whose box is the control: on focus, by Tab or by click, its 1 px edge becomes 2 px inside
// the box in --fx (the house ink, or the error ink when invalid), so the global ring leaves it alone. Disabled, it
// keeps the flat disabled look: the select's one detail is its list's contact edge.
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-mk="select"
      data-size={size}
      className={cn(
        "flex w-fit cursor-pointer items-center justify-between gap-2.5 border border-input bg-background px-3 text-ui whitespace-nowrap text-foreground select-none [--fx:var(--primary)] focus:border-(--fx) focus:outline-2 focus:-outline-offset-2 focus:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled data-placeholder:text-muted-foreground data-[size=default]:h-10 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<Icon name="chevron" className="pointer-events-none" />} />
    </SelectPrimitive.Trigger>
  );
}

// The list is a raised layer: shadow-leaf, and in light its contact shadow prints as a screen (texture-contact),
// which sits outside the box, so the list scrolls inside the popup and the popup never clips. Opened under the
// trigger, it sits 6 px below it, as the world prints it. portalProps go to the portal: a container to render into,
// or a class such as the mode a layer should take. The popup's duration times its enter and exit keyframes, and it
// transitions nothing.
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  portalProps,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"> & {
    portalProps?: SelectPrimitive.Portal.Props;
  }) {
  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-mk="select"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-50 w-(--anchor-width) min-w-36 origin-(--transform-origin) border border-border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)] transition-none duration-(--duration-instant) ease-(--ease-brand) data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List data-slot="select-list" className="max-h-(--available-height) overflow-y-auto">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground", className)}
      {...props}
    />
  );
}

// An option: the one under the pointer or the keys takes the raised hover fill, and the chosen one keeps its check
// over the same fill. Keyboard focus draws the 2 px ring inside the option. The chosen state reads aria-selected:
// shadcn's tailwind.css narrows data-selected: to data-selected="true", and Base UI sets it empty.
function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-9 w-full cursor-default items-center gap-2.5 border border-transparent pr-8 pl-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--primary) data-highlighted:bg-raised-hover aria-selected:bg-raised-hover data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2.5",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2.5 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute right-2.5 flex size-3 items-center justify-center" />}
      >
        <Icon name="check" className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1", className)}
      {...props}
    >
      <Icon name="chevron" className="rotate-180" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn("bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1", className)}
      {...props}
    >
      <Icon name="chevron" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
