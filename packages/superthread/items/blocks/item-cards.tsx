import { Children, createContext, useContext, type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { Card, CardTitle } from "@/components/superthread/ui/card";
import { Icon } from "@/components/superthread/ui/glyphs";

// A card the width of its list, for a queue someone works down, and its decided form, one line in a ruled list.
type ItemCardVariant = "full" | "decided";

const VariantContext = createContext<ItemCardVariant | undefined>(undefined);

// Cards fill the available measure, keeping a single column when the space is narrower than one card. A full or decided
// card turns the grid into one column. Inside the working panel a list of decided rows reaches the panel's edges so its
// rules do, and on a phone a full list does too; a list that mixes the two forms keeps its measure, so a card changing
// form never widens the others. last says nothing follows the list in the panel, wrappers included, so on a phone it
// also runs down to the panel's foot and drops its closing rule; a page has to say so, because a selector can't see past
// a wrapper or a tab's hidden panel.
function ItemCards({ className, last, ...props }: React.ComponentProps<"ul"> & { last?: boolean }) {
  return (
    <ul
      data-mk="item-cards"
      data-slot="item-cards"
      className={cn(
        "grid min-w-0 list-none grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-2 has-[>[data-variant]]:grid-cols-1 has-[>[data-variant]]:gap-0 [@media(min-width:601px)]:in-data-[slot=app-shell-panel]:not-has-[>[data-variant=full]]:has-[>[data-variant=decided]]:-mx-(--spacing-panel-inset) [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:has-[>[data-variant]]:-mx-(--spacing-panel-inset)",
        last &&
          "[@media(max-width:600px)]:in-data-[slot=app-shell-panel]:has-[>[data-variant]]:-mb-4 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:[&>[data-variant]:last-child]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

const cardVariants: Record<ItemCardVariant, string> = {
  full: "group/item-card relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border border-border px-6 pt-5 pb-3.5 transition-[border-color] duration-(--duration-quick) ease-(--ease-brand) not-first:mt-3 [grid-template-areas:'title_when'_'lede_lede'_'meta_go'] has-[[data-slot=item-card-link]]:hover:border-input [@media(max-width:600px)]:p-4 [@media(max-width:600px)]:[grid-template-areas:'title_title'_'when_when'_'lede_lede'_'meta_go'] [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:border-x-0 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:border-t-0 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:not-first:mt-0",
  decided:
    "group/item-card relative grid h-12 min-w-0 grid-cols-[minmax(0,1fr)_152px_88px] items-center gap-x-4 border-b border-border px-3 type-ui text-foreground [grid-template-areas:'title_meta_when'] in-[[data-slot=app-shell-panel]_[data-slot=item-cards]:not(:has(>[data-variant=full]))]:px-(--spacing-panel-inset) [@media(max-width:600px)]:h-14 [@media(max-width:600px)]:grid-cols-[auto_minmax(0,1fr)] [@media(max-width:600px)]:content-center [@media(max-width:600px)]:gap-x-0 [@media(max-width:600px)]:[grid-template-areas:'title_title'_'meta_when'] [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:px-(--spacing-panel-inset)",
};

// The list keeps its semantics and the small card keeps its own surface, which also bounds the title's link. A full or
// decided card prints on the page's own fill, so the list item is the card and the parts place themselves on its grid. A
// linked one lifts its edge or underlines its title under the pointer.
function ItemCard({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"li"> & { variant?: ItemCardVariant }) {
  return (
    <VariantContext.Provider value={variant}>
      <li
        data-mk="item-cards"
        data-slot="item-card"
        data-variant={variant}
        className={cn(variant ? cardVariants[variant] : "min-w-0", className)}
        {...props}
      >
        {variant ? (
          children
        ) : (
          <Card size="sm" className="relative h-full min-w-0">
            {children}
          </Card>
        )}
      </li>
    </VariantContext.Provider>
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

const titleVariants: Record<ItemCardVariant, string> = {
  full: "min-w-0 self-baseline pr-2 type-title text-first text-pretty [grid-area:title] [overflow-wrap:anywhere]",
  decided: "min-w-0 truncate [grid-area:title]",
};

// A small card's ring sits inside the link, as a decided row's does, because that row reaches the panel's edges. The
// row's own padding keeps the ring off its words.
const linkInside =
  "absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)";

// A full card's link covers its edge and its ring sits outside it, so the ring outlines the whole card, until the card
// reaches a phone's edges inside the panel and the ring comes back in.
const linkOutside =
  "absolute -inset-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:inset-0 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:focus-visible:-outline-offset-2";

// A linked title gives the whole card one real link. Its visible words are printed once; the link's copy is
// screen-reader text so an action remains a separate control above it. A full card's title is a heading, level 2 unless
// it says otherwise, and its arrow ends the card's foot. A decided row's title stays on its line and ellipsizes.
function ItemCardTitle({
  className,
  children,
  href,
  render,
  level = 2,
  ...props
}: useRender.ComponentProps<"a"> & { level?: number }) {
  const variant = useContext(VariantContext);
  const linked = href !== undefined || render !== undefined;
  const title = useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: linked ? { slot: "item-card-link" } : undefined,
    props: mergeProps<"a">(
      {
        href,
        className: linked ? (variant === "full" ? linkOutside : linkInside) : undefined,
        children: linked ? <span className="sr-only">{children}</span> : children,
      },
      props,
    ),
  });
  if (variant) {
    const heading = variant === "full" ? { role: "heading", "aria-level": level } : undefined;
    return (
      <>
        <div data-slot="item-card-title" className={cn(titleVariants[variant], className)} {...heading}>
          {linked && (
            <span aria-hidden="true" className="decoration-1 underline-offset-4 group-hover/item-card:underline">
              {children}
            </span>
          )}
          {title}
        </div>
        {linked && variant === "full" && (
          <span data-slot="item-card-arrow" className="mt-1.5 flex justify-self-end [grid-area:go]">
            <Icon name="arrow" />
          </span>
        )}
      </>
    );
  }
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

const whenVariants: Record<ItemCardVariant, string> = {
  full: "self-baseline [grid-area:when] [@media(max-width:600px)]:mt-1",
  decided:
    "justify-self-end text-right [grid-area:when] [@media(max-width:600px)]:justify-self-start [@media(max-width:600px)]:text-left",
};

// When it's for, in mono so times hold their column. clock marks a time the reader has to meet, which prints in
// foreground; an age stays muted. A phone drops the column, so the line prints in the interface face.
function ItemCardWhen({ className, clock, ...props }: React.ComponentProps<"p"> & { clock?: boolean }) {
  const variant = useContext(VariantContext);
  return (
    <p
      data-slot="item-card-when"
      className={cn(
        "font-mono text-instrument leading-(--text-ui--line-height) whitespace-nowrap [@media(max-width:600px)]:font-sans",
        clock ? "text-foreground" : "text-muted-foreground",
        variant ? whenVariants[variant] : "px-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

// Why this card is here, in reading type. A decided row drops it, like everything but its title, word and date.
function ItemCardLede({ className, ...props }: React.ComponentProps<"p">) {
  const variant = useContext(VariantContext);
  if (variant !== "full") return null;
  return (
    <p
      data-slot="item-card-lede"
      className={cn("mt-1 min-w-0 type-read text-pretty [grid-area:lede] [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

// JSX hands `to {name}` over as two strings, so text that runs together joins into one piece, and the blank text between
// two elements is no piece at all.
function metaPieces(children: ReactNode) {
  const pieces: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    const text = typeof child === "string" || typeof child === "number";
    const before = pieces.at(-1);
    if (text && typeof before === "string") pieces[pieces.length - 1] = `${before}${child}`;
    else pieces.push(text ? String(child) : child);
  }
  return pieces.map((piece) => (typeof piece === "string" ? piece.trim() : piece)).filter((piece) => piece !== "");
}

// A full card's foot writes only its pieces, one to an element or a run of text: the first prints in foreground, the rest
// stay muted, and the dot between them is decoration a screen reader skips. It stays with the piece before it, so it ends
// a wrapped line rather than starting the next. On a phone each piece takes its own line.
function fullMeta(children: ReactNode) {
  const pieces = metaPieces(children);
  return (
    <div className="min-w-0">
      {pieces.map((piece, index) => (
        <span key={index} className="first:text-foreground [@media(max-width:600px)]:block">
          {piece}
          {index < pieces.length - 1 && (
            <span aria-hidden="true" className="[@media(max-width:600px)]:hidden">
              {" · "}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// The bottom line pairs context with a time. Times carry their own mono face, without changing the context's face. A
// decided row's meta is the one word it was decided with, which a phone joins to the date with a dot, when there is one.
function ItemCardMeta({ className, children, ...props }: React.ComponentProps<"div">) {
  const variant = useContext(VariantContext);
  if (variant === "full") {
    return (
      <div
        data-slot="item-card-meta"
        className={cn(
          "mt-1.5 flex min-h-8 min-w-0 items-center type-ui text-muted-foreground [grid-area:meta] [overflow-wrap:anywhere]",
          className,
        )}
        {...props}
      >
        {fullMeta(children)}
      </div>
    );
  }
  if (variant === "decided") {
    return (
      <div
        data-slot="item-card-meta"
        className={cn(
          "min-w-0 truncate text-instrument leading-(--text-ui--line-height) text-muted-foreground [grid-area:meta]",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="hidden [@media(max-width:600px)]:group-has-[[data-slot=item-card-when]]/item-card:inline"
        >
          {" · "}
        </span>
      </div>
    );
  }
  return (
    <div
      data-slot="item-card-meta"
      className={cn(
        "flex min-w-0 flex-wrap justify-between gap-2 px-(--card-spacing) type-instrument text-muted-foreground [overflow-wrap:anywhere] [&_time]:font-mono [&_time]:tabular-nums",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// A corner menu sits above the stretched link, so opening it never opens the card. A full card's actions sit in its foot,
// beside the arrow when there is one, and a decided row drops them.
function ItemCardActions({ className, ...props }: React.ComponentProps<"div">) {
  const variant = useContext(VariantContext);
  if (variant === "decided") return null;
  return (
    <div
      data-slot="item-card-actions"
      className={cn(
        variant === "full"
          ? "relative z-10 mt-1.5 flex items-center gap-2 justify-self-end [grid-area:go] group-has-[[data-slot=item-card-link]]/item-card:mr-7"
          : "absolute top-3 right-3 z-10 flex max-w-[calc(100%-24px)] flex-wrap items-center justify-end gap-2",
        className,
      )}
      {...props}
    />
  );
}

export {
  ItemCards,
  ItemCard,
  ItemCardMedia,
  ItemCardId,
  ItemCardTitle,
  ItemCardWhen,
  ItemCardLede,
  ItemCardMeta,
  ItemCardActions,
};
