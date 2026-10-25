import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/components/superthread/lib/utils";
import { buttonVariants } from "@/components/superthread/ui/button";
import { Icon, StatusGlyph } from "@/components/superthread/ui/glyphs";

// Sonner drops arbitrary data attributes, so the wrapper marks the item. Toasts keep sonner's toast() API and
// placement, but print unstyled on our leaf lift. Important utilities override sonner's unlayered structural CSS,
// including its ::after hit area, which otherwise covers the contact edge. Expanded stacks never scale a toast.
function Toaster({ className, toastOptions, icons, expand = true, ...props }: ToasterProps) {
  return (
    <div data-slot="sonner" data-mk="sonner">
      <Sonner
        theme="system"
        expand={expand}
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
              "isolate flex w-full items-start gap-3 border border-border bg-popover p-4 text-popover-foreground shadow-leaf! texture-contact! [--contact-lift:var(--elevation-leaf-rake)] transition-[transform,opacity,height]! duration-(--duration-travel)! ease-(--ease-brand)! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-(--ring)!",
            icon: "mt-[3px] flex size-3.5 shrink-0 items-center justify-center",
            loader: "relative! top-auto! left-auto! transform-none! transition-none! [&[data-visible=false]]:hidden",
            content: "flex min-w-0 flex-1 flex-col gap-1",
            title: "text-ui font-medium",
            description: "type-instrument text-muted-foreground!",
            // The toast owns the contact detail; its actions keep the button look with a flat disabled edge.
            actionButton: cn(
              buttonVariants({ size: "sm" }).replace("texture-disabled", ""),
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
            ),
            cancelButton: cn(
              buttonVariants({ variant: "outline", size: "sm" }).replace("texture-disabled", ""),
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
            ),
            closeButton:
              "absolute top-1 right-1 flex size-6 items-center justify-center border border-transparent! bg-popover! text-muted-foreground! hover:bg-raised-hover! hover:text-foreground! focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)",
            ...toastOptions?.classNames,
          },
        }}
        {...props}
      />
    </div>
  );
}

export { Toaster };
