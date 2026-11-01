import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

// The head of a page: an optional way back, the title, a count or meta line beside it, the actions at the far end,
// and a lede on its own line below. Children flow in that order and wrap; the description always takes a full line.
// A working panel's head (size "panel", the default) sets the title at the section step in the first ink; a page on
// the stock (size "page") sets the hero title. Both print the same Erode lede under it. No eyebrow above the title:
// the title carries its own weight.
function PageHeader({
  className,
  size = "panel",
  ...props
}: React.ComponentProps<"header"> & { size?: "panel" | "page" }) {
  return (
    <header
      data-slot="page-header"
      data-mk="page-header"
      data-size={size}
      className={cn("group/page-header flex flex-wrap items-center gap-x-4 gap-y-4", className)}
      {...props}
    />
  );
}

// The way back: a quiet link with the left arrow, on its own line above the title. Pass the router's link as render.
function PageHeaderBack({ className, children = "back", render = <a />, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    props: mergeProps<"a">(
      {
        className: cn("inline-flex basis-full items-center gap-2 type-instrument link-quiet", className),
        children: (
          <>
            <Icon name="left" />
            <span>{children}</span>
          </>
        ),
      },
      props,
    ),
    render,
    state: { slot: "page-header-back" },
  });
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn(
        "min-w-0 type-section text-balance text-first group-data-[size=page]/page-header:type-hero",
        className,
      )}
      {...props}
    />
  );
}

// The line beside the title: a count, a state, when it last changed. It pushes the actions to the far end, and
// updates are read out, so a count that changes says so.
function PageHeaderMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-meta"
      aria-live="polite"
      className={cn("mr-auto flex flex-wrap items-baseline gap-x-3 type-summary text-muted-foreground", className)}
      {...props}
    />
  );
}

function PageHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn("ml-auto flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

// The sentence under the title, on its own line at the lede step and held to a reading measure.
function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("max-w-[27.5em] basis-full type-lede text-pretty text-foreground", className)}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderActions, PageHeaderBack, PageHeaderDescription, PageHeaderMeta, PageHeaderTitle };
