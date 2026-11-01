import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { cn } from "@/components/superthread/lib/utils";

import { Button } from "@/components/superthread/ui/button";

// Cancel registers itself here, so the sheet can open on the way back.
const CancelContext = React.createContext<React.RefObject<HTMLButtonElement | null> | null>(null);

// The root keeps Base UI's modal confirmation behaviour.
function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" data-mk="alert-dialog" {...props} />;
}

// The trigger is a control with the house ring outside it.
function AlertDialogTrigger({ className, ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      className={cn("focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)", className)}
      {...props}
    />
  );
}

// A portal for callers composing a confirmation sheet.
function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

// The scrim fades on keyframes at the quick duration, with no blur.
function AlertDialogOverlay({ className, ...props }: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-scrim transition-none duration-(--duration-quick) ease-(--ease-brand) data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

// A whole-pixel centred sheet keeps its contact edge visible. The small size keeps the compact upstream width. Focus
// opens on cancel, so a stray Enter keeps what the sheet asks about; initialFocus moves it.
function AlertDialogContent({
  className,
  size = "default",
  portalProps,
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  portalProps?: AlertDialogPrimitive.Portal.Props;
  size?: "default" | "sm";
}) {
  const cancel = React.useRef<HTMLButtonElement>(null);
  return (
    <AlertDialogPortal {...portalProps}>
      <AlertDialogOverlay />
      <CancelContext value={cancel}>
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          data-mk="alert-dialog"
          data-size={size}
          initialFocus={cancel}
          className={cn(
            "group/alert-dialog-content fixed isolate top-[round(50%,1px)] left-[round(50%,1px)] z-50 w-full max-w-[calc(100%-2rem)] [translate:round(-50%,1px)_round(-50%,1px)] border border-border bg-popover p-7 text-ui text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)] transition-none duration-(--duration-quick) ease-(--ease-brand) sm:max-w-[440px] data-[size=sm]:max-w-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className,
          )}
          {...props}
        />
      </CancelContext>
    </AlertDialogPortal>
  );
}

// The title and explanation form one left-aligned group.
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-left", className)} {...props} />;
}

// Actions align right, 24 px below the explanation.
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
}

// A 40 px secondary square holds a caller's confirmation glyph.
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn("mb-2 inline-flex size-10 items-center justify-center bg-secondary [&_svg]:size-6", className)}
      {...props}
    />
  );
}

// The confirmation title prints at Supreme's subtitle step.
function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("type-subtitle", className)} {...props} />
  );
}

// The explanation prints at the UI step in the muted ink, and a link in it in the foreground ink, underlined.
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-ui text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

// The action keeps our button API, variants and control states, so the default prints in the house ink on paper and as
// the outline on a dark sheet. An action that leaves the app takes the key variant.
function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="alert-dialog-action" className={cn(className)} {...props} />;
}

// Cancel closes the sheet through an outline button, and takes focus when the sheet opens.
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  const cancel = React.useContext(CancelContext);
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button ref={cancel} variant={variant} size={size} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
