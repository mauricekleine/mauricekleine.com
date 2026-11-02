import { type RefObject, useCallback, useRef, useSyncExternalStore } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/components/superthread/lib/utils";
import { buttonVariants } from "@/components/superthread/ui/button";
import { Icon, StatusGlyph } from "@/components/superthread/ui/glyphs";

// Whether the window the toaster prints in is a phone's: 600 px wide or less, where sonner's own css takes the phone
// offsets. It asks the wrapper's own window, so a toaster portaled into a frame takes the frame's width.
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

// On a phone the stack drops from the top, 12 px inside the window's edges and in line with the panel: the foot of a
// phone's page holds the thumb and the page's last action, such as a send, and the frame scrolls with the page, so
// nothing sticks at the top for a toast to cover.
const PHONE_OFFSET = { top: "calc(12px + env(safe-area-inset-top, 0px))", right: 12, bottom: 12, left: 12 };

// Sonner drops arbitrary data attributes, so the wrapper marks the item. Toasts keep sonner's toast() API, but print
// unstyled on our leaf lift. Important utilities override sonner's unlayered structural CSS, including its ::after hit
// area, which otherwise covers the contact edge. Expanded stacks never scale a toast. position places the stack above
// 600 px, at the bottom right by default; on a phone it takes the top, where a swipe up or right dismisses a toast.
function Toaster({
  className,
  toastOptions,
  icons,
  expand = true,
  position = "bottom-right",
  swipeDirections,
  ...props
}: ToasterProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const phone = usePhone(wrapper);
  return (
    <div ref={wrapper} data-slot="sonner" data-mk="sonner">
      <Sonner
        theme="system"
        expand={expand}
        position={phone ? "top-center" : position}
        mobileOffset={PHONE_OFFSET}
        swipeDirections={swipeDirections ?? (phone ? ["top", "right"] : undefined)}
        gap={12}
        containerAriaLabel="notifications"
        customAriaLabel="notifications"
        className={cn(
          "font-sans! transition-[transform]! duration-(--duration-travel)! ease-(--ease-brand)!",
          className,
        )}
        icons={{
          success: <StatusGlyph state="done" />,
          info: <StatusGlyph state="running" />,
          warning: <StatusGlyph state="waiting" />,
          error: <StatusGlyph state="failed" />,
          loading: <StatusGlyph state="running" />,
          close: <Icon name="close" />,
          ...icons,
        }}
        toastOptions={{
          ...toastOptions,
          unstyled: true,
          closeButtonAriaLabel: toastOptions?.closeButtonAriaLabel ?? "close toast",
          classNames: {
            toast:
              "isolate flex w-full flex-wrap items-start gap-3 border border-border bg-popover p-4 text-popover-foreground shadow-leaf! texture-contact! [--contact-lift:var(--elevation-leaf-rake)] transition-[transform,opacity,height]! duration-(--duration-travel)! ease-(--ease-brand)! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-(--ring)!",
            icon: "mt-[3px] flex size-3.5 shrink-0 items-center justify-center",
            loader: "relative! top-auto! left-auto! transform-none! transition-none! [&[data-visible=false]]:hidden",
            content: "flex min-w-[min(100%,12rem)] flex-1 flex-col gap-1",
            title: "text-ui font-medium",
            description: "type-instrument text-muted-foreground!",
            // The toast owns the contact detail; its actions keep the button look with a flat disabled edge. When the
            // words need the width, the actions wrap below them and keep to the end.
            actionButton: cn(
              buttonVariants({ size: "sm" }).replace("texture-disabled", ""),
              "ml-auto [[data-cancel]+&]:ml-0",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
            ),
            cancelButton: cn(
              buttonVariants({ variant: "outline", size: "sm" }).replace("texture-disabled", ""),
              "ml-auto",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
            ),
            closeButton:
              "absolute top-1 right-1 flex size-6 items-center justify-center [@media(max-width:600px)]:hit-area border border-transparent! bg-popover! text-muted-foreground! hover:bg-raised-hover! hover:text-foreground! focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)",
            ...toastOptions?.classNames,
          },
        }}
        {...props}
      />
    </div>
  );
}

export { Toaster };
