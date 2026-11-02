import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { type ReactNode, type RefObject, useCallback, useRef, useSyncExternalStore } from "react";
import { cn } from "@/components/superthread/lib/utils";

import { Button } from "@/components/superthread/ui/button";
import { Icon, StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

const toast = ToastPrimitive.createToastManager();

// Whether the window the toast prints in is a phone's: 600 px wide or less, where the stack drops from the top and a
// swipe up dismisses a toast. It asks the toast's own window, as the css that places it does, so a toast portaled into
// a frame takes the frame's width.
const PHONE = "(max-width: 600px)";
function usePhone(near: RefObject<HTMLElement | null>) {
  const query = useCallback(() => (near.current?.ownerDocument.defaultView ?? window).matchMedia(PHONE), [near]);
  const subscribe = useCallback(
    (change: () => void) => {
      const media = query();
      media.addEventListener("change", change);
      return () => media.removeEventListener("change", change);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => query().matches,
    () => false,
  );
}

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

// The stack sits at the bottom right of the window. On a phone it drops from the top, 12 px inside the window's edges
// and in line with the panel: the foot of a phone's page holds the thumb and the page's last action, such as a send,
// and the frame scrolls with the page, so nothing sticks at the top for a toast to cover. The region's name is
// lowercase, as every label here is; pass aria-label to name it otherwise.
function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      aria-label="notifications"
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-50 w-full max-w-[420px]",
        "[@media(max-width:600px)]:inset-x-3 [@media(max-width:600px)]:top-[calc(12px+env(safe-area-inset-top,0px))] [@media(max-width:600px)]:bottom-auto [@media(max-width:600px)]:w-auto [@media(max-width:600px)]:max-w-none",
        className,
      )}
      {...props}
    />
  );
}

// The stack moves its toasts by whole pixels and never scales them, so each contact screen keeps its 1 px cells: a
// toast behind the front one peeks 12 px further in per place, and the expanded stack sets them 12 px apart. Base UI's
// heights are whole pixels, so every settled offset is too. --grow is the way the stack grows from its edge: up from
// the bottom, or down from the top on a phone, where a toast enters from above and a swipe up or right dismisses it.
function Toast({ className, swipeDirection, ref, ...props }: ToastPrimitive.Root.Props) {
  const root = useRef<HTMLDivElement | null>(null);
  const phone = usePhone(root);
  const attach = useCallback(
    (el: HTMLDivElement | null) => {
      root.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );
  return (
    <ToastPrimitive.Root
      ref={attach}
      data-slot="toast"
      data-mk="toast"
      swipeDirection={swipeDirection ?? (phone ? ["up", "right"] : ["down", "right"])}
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full border bg-popover text-popover-foreground shadow-leaf texture-contact [--contact-lift:var(--elevation-leaf-rake)] will-change-transform select-none",
        "[--grow:-1] [@media(max-width:600px)]:top-0 [@media(max-width:600px)]:bottom-auto [@media(max-width:600px)]:[--grow:1]",
        "[--gap:12px] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc((var(--toast-offset-y)+var(--toast-index)*var(--gap))*var(--grow)+var(--toast-swipe-movement-y))] [--peek:12px]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-index)*var(--peek)*var(--grow)))] transition-[transform,opacity,height] duration-(--duration-travel) ease-(--ease-brand)",
        // The hover bridge across the gap to the toast in front sits on ::before: the contact screen owns ::after.
        "before:absolute before:top-full before:left-0 before:h-[calc(var(--gap)+1px)] before:w-full before:content-[''] [@media(max-width:600px)]:before:top-auto [@media(max-width:600px)]:before:bottom-full",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(calc(var(--grow)*-150%))]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(calc(var(--grow)*-150%))]",
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

const oneAction = () => <ToastAction />;

// The toasts of the nearest provider, as the Toaster prints them. Put it in a viewport of your own to print a stack
// somewhere else, and use ToastIcon to build a list of your own. actions fills each toast's action row from the toast,
// for example its ToastAction and a ghost Button beside it; by default the row holds the toast's one action. The row
// sits 14 px under the text with 8 px between its buttons, and takes no room when it is empty.
function ToastList<Data extends object>({
  actions = oneAction,
}: {
  actions?: (toast: ToastPrimitive.Root.ToastObject<Data>) => ReactNode;
}) {
  const { toasts } = ToastPrimitive.useToastManager<Data>();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
          <div data-slot="toast-actions" className="mt-2.5 flex gap-2 empty:hidden">
            {actions(toastItem)}
          </div>
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
