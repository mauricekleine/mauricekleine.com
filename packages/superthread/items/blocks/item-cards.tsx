import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { Card, CardTitle } from "@/components/superthread/ui/card";

// Cards fill the available measure, keeping a single column when the space is narrower than one card.
function ItemCards({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-mk="item-cards"
      data-slot="item-cards"
      className={cn(
        "grid min-w-0 list-none grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-2",
        className,
      )}
      {...props}
    />
  );
}

// The list keeps its semantics and the small card keeps its own surface. It also bounds the title's link.
function ItemCard({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-mk="item-cards" data-slot="item-card" className={cn("min-w-0", className)} {...props}>
      <Card size="sm" className="relative h-full min-w-0">
        {children}
      </Card>
    </li>
  );
}

// A thumbnail runs to both edges above the words, with one rule separating image and text.
function ItemCardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-card-media"
      className={cn(
        "-mt-(--card-spacing) aspect-[16/10] min-w-0 overflow-hidden border-b border-border [&>img]:size-full [&>img]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

// The id occupies a quiet line, leaving the corner free for a menu.
function ItemCardId({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-card-id"
      className={cn(
        "min-w-0 px-(--card-spacing) pr-12 type-instrument text-muted-foreground font-mono tabular-nums [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
  );
}

// A linked title gives the whole card one real link and an inside focus ring. Its visible words are printed once;
// the link's copy is screen-reader text so a corner action remains a separate control above it.
function ItemCardTitle({ className, children, href, render, ...props }: useRender.ComponentProps<"a">) {
  const linked = href !== undefined || render !== undefined;
  const title = useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "item-card-link" },
    props: mergeProps<"a">(
      {
        href,
        className: linked
          ? "absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)"
          : undefined,
        children: linked ? <span className="sr-only">{children}</span> : children,
      },
      props,
    ),
  });
  return (
    <CardTitle
      data-slot="item-card-title"
      className={cn("min-w-0 px-(--card-spacing) pr-12 [overflow-wrap:anywhere]", className)}
    >
      {linked && <span aria-hidden="true">{children}</span>}
      {title}
    </CardTitle>
  );
}

// The bottom line pairs context with a time. Times carry their own mono face, without changing the context's face.
function ItemCardMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-card-meta"
      className={cn(
        "flex min-w-0 flex-wrap justify-between gap-2 px-(--card-spacing) type-instrument text-muted-foreground [overflow-wrap:anywhere] [&_time]:font-mono [&_time]:tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

// A corner menu sits above the stretched link, so opening it never opens the card.
function ItemCardActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-card-actions"
      className={cn(
        "absolute top-3 right-3 z-10 flex max-w-[calc(100%-24px)] flex-wrap items-center justify-end gap-2",
        className,
      )}
      {...props}
    />
  );
}

export { ItemCards, ItemCard, ItemCardMedia, ItemCardId, ItemCardTitle, ItemCardMeta, ItemCardActions };
