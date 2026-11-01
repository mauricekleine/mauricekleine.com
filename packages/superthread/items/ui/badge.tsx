import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";
import { StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

const STATES = ["done", "running", "waiting", "failed", "queued"] as const satisfies readonly StatusState[];

// Square, 1 px edge, 13 px words, in Supreme wherever it lands, a mono row aside included. A status badge is the
// sanctioned exception to one colour, at badge scale only: a fill near the stock, the edge at about half strength, the
// 14 px glyph square at full strength and the word. failed is the one solid badge, so it is the most urgent by its
// form, not by a louder ink. sm is 24 px, the height of an xs button, with the glyph square as evenly set in it. The
// link variant is a link part: it lets its 44 px hit area out of the clip on a phone.
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden border border-transparent font-sans text-instrument leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) aria-invalid:border-error [&>svg]:pointer-events-none [&>svg]:shrink-0",
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
        default: "h-[30px] gap-2 px-[11px] has-data-[icon=inline-end]:pr-[7px] has-data-[icon=inline-start]:pl-[7px]",
        sm: "h-6 gap-1.5 px-2 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1",
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
            {children ?? state}
          </>
        ) : (
          children
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
