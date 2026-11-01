import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

import { Separator } from "@/components/superthread/ui/separator";

// Neighbouring boxes share a 1 px edge; the focused child rises so its ring stays visible. On a phone a group holding a
// field takes the field's 44 px across every child, so joined boxes keep one height, and a button's box reaches 44 px
// along the group, since a hit area there would take taps from the button beside it.
const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 [@media(max-width:600px)]:has-[>input,>[data-slot=input-group],>[data-slot=select-trigger]]:*:h-11",
  {
    variants: {
      orientation: {
        horizontal: "*:not-first:-ml-px [@media(max-width:600px)]:[&>[data-slot=button]]:min-w-11",
        vertical: "flex-col *:not-first:-mt-px [@media(max-width:600px)]:[&>[data-slot=button]]:min-h-11",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

// A group of actions, laid out horizontally unless the caller stacks it.
function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-mk="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

// An addon prints on secondary stock at the default button height. Its render prop keeps upstream composition.
function ButtonGroupText({ className, render, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-10 items-center gap-2 border border-input bg-secondary px-3 text-ui text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "button-group-text",
    },
  });
}

// The shared separator stretches along the buttons in the input ink.
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };
