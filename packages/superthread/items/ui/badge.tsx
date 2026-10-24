import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";
import { StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

// Square, 1 px edge, 13 px words. A status badge is the sanctioned exception to one colour, at badge scale only: a
// fill near the stock, the edge at about half strength, the 14 px glyph square at full strength and the word.
// failed is the one solid badge, so it is the most urgent by its form, not by a louder ink.
const badgeVariants = cva(
  "group/badge inline-flex h-[30px] w-fit shrink-0 items-center justify-center gap-2 overflow-hidden border border-transparent px-[11px] text-instrument leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) has-data-[icon=inline-end]:pr-[7px] has-data-[icon=inline-start]:pl-[7px] aria-invalid:border-error [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground [a]:hover:border-primary-hover [a]:hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover",
        destructive: "bg-destructive text-destructive-foreground [a]:hover:bg-destructive-hover",
        outline: "border-current [a]:hover:bg-control-hover",
        ghost: "hover:bg-control-hover",
        link: "text-primary underline-offset-4 hover:underline",
        done: "border-success-edge bg-success-wash pl-[7px] text-success-foreground",
        running: "border-info-edge bg-info-wash pl-[7px] text-info-foreground",
        waiting: "border-warning-edge bg-warning-wash pl-[7px] text-warning-foreground",
        failed: "border-error-solid bg-error-solid pl-[7px] text-error-solid-foreground",
        queued: "border-neutral-edge bg-neutral-wash pl-[7px] text-neutral-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const STATES: readonly string[] = ["done", "running", "waiting", "failed", "queued"] satisfies StatusState[];

const isState = (variant: string): variant is StatusState => STATES.includes(variant);

// A status variant prints its glyph square before the word, and the state's own name when it is given no word.
// On the failed solid the square takes the label ink, so its cross still knocks out to the solid.
function Badge({
  className,
  variant = "default",
  render,
  children,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const state = variant != null && isState(variant) ? variant : null;
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
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
    },
  });
}

export { Badge, badgeVariants };
