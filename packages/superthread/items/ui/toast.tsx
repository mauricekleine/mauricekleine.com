import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "@/components/superthread/lib/utils";

import { Button } from "@/components/superthread/ui/button";
import { Icon, StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-[420px] sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

// The stack moves its toasts by whole pixels and never scales them, so each contact screen keeps its 1 px cells: a
// toast behind the front one peeks 12 px higher per place, and the expanded stack sets them 12 px apart. Base UI's
// heights are whole pixels, so every settled offset is too.
function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-mk="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)] will-change-transform select-none",
        "[--gap:12px] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:12px]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))))] transition-[transform,opacity,height] duration-(--duration-travel) ease-(--ease-brand)",
        // The hover bridge to the toast below sits on ::before: the contact screen owns ::after.
        "before:absolute before:top-full before:left-0 before:h-[calc(var(--gap)+1px)] before:w-full before:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-start gap-3 overflow-hidden py-4 pr-4 pl-[18px] transition-opacity duration-(--duration-travel) ease-(--ease-brand) data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("text-ui font-medium", className)} {...props} />;
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-instrument text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0 self-start", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="close toast"
      render={render}
      className={cn(
        "relative -mt-1 -mr-1 shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:bg-raised-hover hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <Icon name="close" aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

// Each kind prints its 14 px status glyph in its own ink: tick, i, pause, cross. Loading shows the i.
const TOAST_GLYPHS: Partial<Record<string, StatusState>> = {
  success: "done",
  info: "running",
  warning: "waiting",
  error: "failed",
  loading: "running",
};

function ToastIcon({ type }: { type: string | undefined }) {
  const state = type ? TOAST_GLYPHS[type] : undefined;

  if (!state) {
    return null;
  }

  return (
    <span data-slot="toast-icon" className="mt-[3px] flex shrink-0 [&_svg]:pointer-events-none">
      <StatusGlyph state={state} />
    </span>
  );
}

// The toasts of the nearest provider, as the Toaster prints them. Put it in a viewport of your own to print a stack
// somewhere else, and use ToastIcon to build a list of your own.
function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
          <ToastAction className="mt-1.5" />
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

// portalProps go to the stack's portal, for example a container that holds the page's mode.
function Toaster({
  children,
  toastManager = toast,
  portalProps,
  ...props
}: ToastPrimitive.Provider.Props & { portalProps?: ToastPrimitive.Portal.Props }) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal {...portalProps}>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastList,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
