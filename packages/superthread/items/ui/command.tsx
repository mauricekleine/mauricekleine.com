import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/components/superthread/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/superthread/ui/dialog";
import { InputGroup, InputGroupAddon } from "@/components/superthread/ui/input-group";
import { Icon } from "@/components/superthread/ui/glyphs";

// A flat command surface takes its lift from the page or the dialog that contains it.
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      label="commands"
      data-slot="command"
      data-mk="command"
      className={cn("flex size-full flex-col bg-popover text-popover-foreground", className)}
      {...props}
    />
  );
}

// The palette uses our dialog sheet; its accessible title and description live inside that sheet.
function CommandDialog({
  title = "command palette",
  description = "search for a command to run",
  children,
  className,
  showCloseButton = false,
  portalProps,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  portalProps?: React.ComponentProps<typeof DialogContent>["portalProps"];
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn("p-0", className)} portalProps={portalProps} showCloseButton={showCloseButton}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Search uses one input-group field box with the search glyph beside its text control. cmdk's input takes the
// input group's text-control classes itself: the shadcn CLI rewrites an asChild into a render prop on install, and
// cmdk has no render prop.
function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-10">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "h-full w-full min-w-0 flex-1 self-stretch border-0 bg-transparent px-3 text-ui outline-0 caret-(--fx) placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-disabled",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <Icon name="search" className="size-3 shrink-0 text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

// The list scrolls within 288 px, with room around its focused row.
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      label="suggestions"
      data-slot="command-list"
      className={cn("no-scrollbar max-h-72 scroll-py-1 overflow-y-auto p-1", className)}
      {...props}
    />
  );
}

// No matches prints as a quiet instrument line.
function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center type-instrument text-muted-foreground", className)}
      {...props}
    />
  );
}

// Group headings use the list's meta labels and item inset.
function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-1.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:type-meta [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

// A 1 px rule separates command groups.
function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

// cmdk selected means the pointer or keys position, so it takes the hover fill and no chosen state.
function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex h-9 [@media(max-width:600px)]:h-11 cursor-default items-center gap-2.5 border border-transparent px-2.5 text-ui select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) data-[disabled=true]:pointer-events-none data-[disabled=true]:text-disabled data-[selected=true]:bg-raised-hover [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  );
}

// Keys sit at the row end in Fragment Mono.
function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto font-mono text-[11px] tracking-[0.14em] text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
