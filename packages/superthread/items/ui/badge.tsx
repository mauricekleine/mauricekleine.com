import type { ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";
import { StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

const STATES = ["done", "running", "waiting", "failed", "queued"] as const satisfies readonly StatusState[];

// Square, 1 px edge, 13 px words, in Supreme wherever it lands, a mono row aside included. A status badge is the
// sanctioned exception to one colour, at badge scale only: a fill near the stock, the edge at about half strength, the
// 14 px glyph square at full strength and the word. failed is the one solid badge, so it is the most urgent by its
// form, not by a louder ink. sm is 24 px, the height of an xs button, with the glyph square as evenly set in it. A long
// badge wraps inside its parent's width and grows downward, and a table cell's no-wrap holds it to one line. Its words
// break only as a last resort, so a wrapper that can shrink stops at its longest word. The link variant is a link part:
// it lets its 44 px hit area out of the clip on a phone.
const badgeVariants = cva(
  "group/badge inline-flex w-fit max-w-full shrink-0 items-center justify-center overflow-hidden border border-transparent font-sans text-instrument leading-4 font-medium [overflow-wrap:break-word] transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) aria-invalid:border-error [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-foreground bg-foreground text-background [a]:hover:border-destructive-hover [a]:hover:bg-destructive-hover",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover",
        destructive: "bg-destructive text-destructive-foreground [a]:hover:bg-destructive-hover",
        outline: "border-current [a]:hover:bg-control-hover",
        ghost: "hover:bg-control-hover",
        link: "relative overflow-visible text-foreground decoration-1 underline-offset-4 hover:underline [@media(max-width:600px)]:hit-area",
        done: "border-success-edge bg-success-wash text-success-foreground",
        running: "border-info-edge bg-info-wash text-info-foreground",
        waiting: "border-warning-edge bg-warning-wash text-warning-foreground",
        failed: "border-error-solid bg-error-solid text-error-solid-foreground",
        queued: "border-neutral-edge bg-neutral-wash text-neutral-foreground",
      },
      size: {
        default:
          "min-h-[30px] gap-2 px-[11px] py-1 has-data-[icon=inline-end]:pr-[7px] has-data-[icon=inline-start]:pl-[7px]",
        sm: "min-h-6 gap-1.5 px-2 py-0.5 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1",
      },
    },
    compoundVariants: [
      { variant: [...STATES], size: "default", className: "pl-[7px]" },
      { variant: [...STATES], size: "sm", className: "pl-1" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const isState = (variant: string): variant is StatusState => (STATES as readonly string[]).includes(variant);

// Plain words in a box that can shrink past them, so a word wider than its parent breaks rather than running out of the
// clip on both sides. A wrapper still measures the longest word.
const words = (children: ReactNode) =>
  typeof children === "string" ? <span className="min-w-0">{children}</span> : children;

// A status variant prints its glyph square before the word, and the state's own name when it is given no word.
// On the failed solid the square takes the label ink, so its cross still knocks out to the solid.
// The default element declares data-mk in the source, as every other item does, so a grep finds it; the state's mk
// keeps the mark on an element the caller renders instead.
function Badge({
  className,
  variant = "default",
  size = "default",
  render = <span data-mk="badge" />,
  children,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const state = variant != null && isState(variant) ? variant : null;
  return useRender({
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
        children: state ? (
          <>
            <StatusGlyph state={state} className={state === "failed" ? "text-error-solid-foreground" : undefined} />
            {words(children ?? state)}
          </>
        ) : (
          words(children)
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      mk: "badge",
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
