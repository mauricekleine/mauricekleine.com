import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/components/superthread/lib/utils";

import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// The scrim: the world's --scrim, the key at 42 percent in light and black at 60 percent in dark. No blur. It and the
// sheet fade in and out as animations, so nothing on either transitions.
function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-scrim transition-none duration-(--duration-quick) ease-(--ease-brand) data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

// A square sheet on the sheet lift. Its centring offsets, the half-way point and the half size, each round to a whole
// pixel, so at any viewport its edges and contact screen land on the pixel grid at 1x and 2x. portalProps go to its
// portal, for example a container that holds the page's mode.
function DialogContent({
  className,
  children,
  showCloseButton = true,
  portalProps,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  portalProps?: DialogPrimitive.Portal.Props;
}) {
  return (
    <DialogPortal {...portalProps}>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-mk="dialog"
        className={cn(
          "fixed top-[round(50%,1px)] left-[round(50%,1px)] z-50 grid w-full max-w-[calc(100%-2rem)] [translate:round(-50%,1px)_round(-50%,1px)] gap-6 border bg-popover px-7 pt-7 pb-6 text-ui text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)] transition-none duration-(--duration-quick) ease-(--ease-brand) sm:max-w-[440px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="absolute top-3 right-3 hover:bg-raised-hover" size="icon-sm" />}
          >
            <Icon name="close" />
            <span className="sr-only">close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && <DialogPrimitive.Close render={<Button variant="outline" />}>close</DialogPrimitive.Close>}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("type-subtitle", className)} {...props} />;
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-ui text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
