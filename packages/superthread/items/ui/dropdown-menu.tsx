import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "@/components/superthread/lib/utils";

import { Icon } from "@/components/superthread/ui/glyphs";

// The root keeps Base UI's menu state and keyboard behaviour.
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" data-mk="dropdown-menu" {...props} />;
}

// A portal for callers composing their own menu layer.
function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

// The trigger is a control with the house ring outside it.
function DropdownMenuTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      data-mk="dropdown-menu"
      className={cn("focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)", className)}
      {...props}
    />
  );
}

// A leaf list with its contact edge outside; only the inner list scrolls. portalProps carry the container and mode.
function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  children,
  portalProps,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    portalProps?: MenuPrimitive.Portal.Props;
  }) {
  return (
    <MenuPrimitive.Portal {...portalProps}>
      <MenuPrimitive.Positioner
        className="isolate z-50"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          data-mk="dropdown-menu"
          className={cn(
            "relative isolate z-50 w-(--anchor-width) min-w-36 origin-(--transform-origin) border border-border bg-popover p-1 text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)] transition-none duration-(--duration-instant) ease-(--ease-brand) data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className,
          )}
          {...props}
        >
          <div className="max-h-(--available-height) overflow-y-auto">{children}</div>
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

// A labelled group keeps the primitive's menu semantics.
function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

// Group names print at the meta step, aligned with the item words.
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2.5 pt-1.5 pb-1 type-meta text-muted-foreground data-inset:pl-8", className)}
      {...props}
    />
  );
}

// The pointer or keys fill a row; destructive stays in the key ink. Focus draws inside the row.
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex h-9 [@media(max-width:600px)]:h-11 cursor-default items-center gap-2.5 border border-transparent px-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-highlighted:bg-raised-hover data-inset:pl-8 data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

// A submenu keeps its own open state inside the parent menu.
function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

// An open submenu keeps the raised hover fill and points its chevron towards its list.
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "relative flex h-9 [@media(max-width:600px)]:h-11 cursor-default items-center gap-2.5 border border-transparent px-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-highlighted:bg-raised-hover data-inset:pl-8 data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 data-popup-open:bg-raised-hover data-open:bg-raised-hover",
        className,
      )}
      {...props}
    >
      {children}
      <Icon name="chevron" className="-rotate-90 ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

// A submenu takes the same leaf lift and contact edge as the parent list.
function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 6,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("w-auto", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

// A check occupies the left indicator column without moving the word.
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex h-9 [@media(max-width:600px)]:h-11 cursor-default items-center gap-2.5 border border-transparent px-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-highlighted:bg-raised-hover data-inset:pl-8 data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 pl-8",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute left-2.5 flex size-3 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <Icon name="check" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

// The group owns a single chosen value.
function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

// The chosen value prints a 6 px foreground square in the left column.
function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex h-9 [@media(max-width:600px)]:h-11 cursor-default items-center gap-2.5 border border-transparent px-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-highlighted:bg-raised-hover data-inset:pl-8 data-disabled:pointer-events-none data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 pl-8",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute left-2.5 flex size-3 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <span className="block size-1.5 bg-foreground" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

// A 1 px rule reaches both edges of the list padding.
function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

// Keys sit at the end of the row in Fragment Mono.
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto font-mono text-[11px] tracking-[0.14em] text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
