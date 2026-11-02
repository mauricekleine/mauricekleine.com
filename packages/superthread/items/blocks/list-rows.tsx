import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

// A collection of ruled rows. The list owns the first rule and every row owns the one below it.
function ListRows({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-mk="list-rows"
      data-slot="list-rows"
      className={cn("min-w-0 list-none border-t border-border", className)}
      {...props}
    />
  );
}

// The optional lead, title and time share a line. On phones the time moves below the title, before the meta line. A
// closed row stays in the list with its title muted and struck through.
function ListRow({ className, closed, ...props }: React.ComponentProps<"li"> & { closed?: boolean }) {
  return (
    <li
      data-mk="list-rows"
      data-slot="list-row"
      data-closed={closed || undefined}
      className={cn(
        "group/list-row grid min-h-(--spacing-row-board) min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-b border-border px-4 py-3 [grid-template-areas:'title_aside'_'meta_meta'_'actions_actions'] has-[[data-slot=list-row-lead]]:grid-cols-[auto_minmax(0,1fr)_auto] has-[[data-slot=list-row-lead]]:[grid-template-areas:'lead_title_aside'_'lead_meta_meta'_'._actions_actions'] [@media(max-width:600px)]:grid-cols-[minmax(0,1fr)] [@media(max-width:600px)]:[grid-template-areas:'title'_'aside'_'meta'_'actions'] [@media(max-width:600px)]:has-[[data-slot=list-row-lead]]:grid-cols-[auto_minmax(0,1fr)] [@media(max-width:600px)]:has-[[data-slot=list-row-lead]]:[grid-template-areas:'lead_title'_'lead_aside'_'lead_meta'_'._actions']",
        className,
      )}
      {...props}
    />
  );
}

// A checkbox or status glyph sits against the first line, leaving the title room to wrap.
function ListRowLead({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-row-lead"
      className={cn("flex min-h-[21px] items-center self-start [grid-area:lead]", className)}
      {...props}
    />
  );
}

// The title is plain text until it gets an href or the app's router link through render. Either way it prints in
// foreground, and a linked title underlines on hover and takes the hit area on a phone. A closed row's title keeps its
// strike under the pointer.
function ListRowTitle({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "list-row-title" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "min-w-0 text-ui font-medium text-foreground [grid-area:title] [overflow-wrap:anywhere] decoration-1 underline-offset-4 [&:is(a)]:hover:underline [@media(max-width:600px)]:[&:is(a)]:relative [@media(max-width:600px)]:[&:is(a)]:hit-area group-data-[closed]/list-row:text-muted-foreground group-data-[closed]/list-row:line-through group-data-[closed]/list-row:hover:line-through focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
          className,
        ),
      },
      props,
    ),
  });
}

// A time, a count or a small status badge sits at the end on wide rows. On a phone it wraps below the title, flush with
// it, and figures stay mono.
function ListRowAside({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-row-aside"
      className={cn(
        "min-w-0 text-right type-instrument text-muted-foreground font-mono tabular-nums [grid-area:aside] [overflow-wrap:anywhere] [@media(max-width:600px)]:text-left",
        className,
      )}
      {...props}
    />
  );
}

// A meta line's pieces, read through fragments, so a row can group or map them.
function metaPieces(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? metaPieces(child.props.children)
      : [child],
  );
}

// The second line holds context, and it prints the dot between its pieces, so a row writes only the pieces. The dot is
// its own element outside each piece, so a link keeps it out of its underline and a hit area keeps its ::after. It stays
// with the piece before it, so it ends a wrapped line rather than starting the next, and it is decoration, so a screen
// reader skips it. Each piece may wrap without truncating the title. A status sits outside it, in the aside.
function ListRowMeta({ className, children, ...props }: React.ComponentProps<"div">) {
  const pieces = metaPieces(children);
  return (
    <div
      data-slot="list-row-meta"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 type-instrument text-muted-foreground [grid-area:meta] [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    >
      {pieces.map((piece, index) => (
        <span key={index} data-slot="list-row-meta-piece" className="min-w-0">
          {piece}
          {index < pieces.length - 1 && (
            <span aria-hidden="true" data-slot="list-row-meta-dot" className="ml-2">
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// Actions stay at the end of their own line, outside the title link and able to wrap on a phone.
function ListRowActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-row-actions"
      className={cn("flex min-w-0 flex-wrap items-center justify-end gap-2 [grid-area:actions]", className)}
      {...props}
    />
  );
}

type PlainRowsVariant = "plain" | "nested" | "ruled";

// Each form sets the row's height. A ruled list bleeds to the panel's edges, so --bleed repeats the panel's inset.
const plainRowsVariants: Record<PlainRowsVariant, string> = {
  plain: "[--row:var(--spacing-row-plain)]",
  nested: "[--row:var(--spacing-row-nested)]",
  ruled:
    "[--row:var(--spacing-row-table)] in-data-[slot=app-shell-panel]:[--bleed:3rem] [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:[--bleed:1rem]",
};

// A list that reads as words: no rules and no padding, the row a line of its own. Plain is 40 px, nested is 36 px for a
// list under a quiet head, ruled is 48 px with a rule under each row. Every form is 56 px on a phone. clamp lets a title
// take two lines on a phone, for a list whose titles lose their meaning when they cut.
function PlainRows({
  className,
  variant = "plain",
  clamp,
  render,
  ...props
}: useRender.ComponentProps<"ul"> & { variant?: PlainRowsVariant; clamp?: boolean }) {
  return useRender({
    defaultTagName: "ul",
    render,
    state: { slot: "plain-rows", mk: "list-rows", variant, clamp },
    props: mergeProps<"ul">(
      {
        className: cn(
          "group/plain-rows -mx-(--bleed) min-w-0 list-none [--bleed:0px]",
          plainRowsVariants[variant],
          "[@media(max-width:600px)]:[--row:var(--spacing-row-board)]",
          className,
        ),
      },
      props,
    ),
  });
}

// The row is the link's box: the title stretches its link across it, and a tick or actions sit above that. Wide, the
// row is one line with its columns in a row, so an absent column takes no space. A phone stacks the title over
// `kind · when` and keeps the right edge clear for a tick. A closed row stays in the list, muted and struck through.
function PlainRow({ className, closed, ...props }: React.ComponentProps<"li"> & { closed?: boolean }) {
  return (
    <li
      data-mk="list-rows"
      data-slot="plain-row"
      data-closed={closed || undefined}
      className={cn(
        "group/plain-row relative flex h-(--row) min-w-0 items-center gap-x-4 px-(--bleed) group-data-[variant=ruled]/plain-rows:border-b group-data-[variant=ruled]/plain-rows:border-border [@media(max-width:600px)]:grid [@media(max-width:600px)]:grid-cols-[auto_minmax(0,1fr)] [@media(max-width:600px)]:content-center [@media(max-width:600px)]:gap-x-0 [@media(max-width:600px)]:has-[[data-slot=plain-row-actions]]:h-auto [@media(max-width:600px)]:has-[[data-slot=plain-row-actions]]:py-1.5 [@media(max-width:600px)]:has-[[data-slot=plain-row-tick]]:pr-[calc(var(--bleed)+2.75rem)] [@media(max-width:600px)]:group-data-[clamp]/plain-rows:h-auto [@media(max-width:600px)]:group-data-[clamp]/plain-rows:min-h-11 [@media(max-width:600px)]:group-data-[clamp]/plain-rows:py-1.5",
        className,
      )}
      {...props}
    />
  );
}

// The tick hangs in the gutter, so every title keeps the list's left edge, and on a phone it sits at the right edge.
// Wide, a row can be 36 px, so its checkbox takes the pointer inside the row and hit areas never overlap.
function PlainRowTick({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="plain-row-tick"
      className={cn(
        "absolute inset-y-0 right-[calc(100%-var(--bleed))] z-1 grid w-9 place-items-center [@media(max-width:600px)]:right-(--bleed) [@media(max-width:600px)]:w-11 [@media(max-width:600px)]:justify-items-end [@media(min-width:601px)]:[&_[data-slot=checkbox]]:after:h-(--row) [@media(min-width:601px)]:[&_[data-slot=checkbox]]:after:w-9",
        className,
      )}
      {...props}
    />
  );
}

// The title takes one line and cuts at its end, and the words stay in a tooltip. Linked, its link stretches over the
// row, carries the name, and takes the ring: outside the row, or inside a ruled row that reaches the panel's edges. The
// words underline while the link is under the pointer. Without an href or render it stays plain text.
function PlainRowTitle({ className, children, href, render, ...props }: useRender.ComponentProps<"a">) {
  const linked = href !== undefined || render !== undefined;
  const words = typeof children === "string" ? children : undefined;
  const link = useRender({
    enabled: linked,
    defaultTagName: "a",
    render,
    state: { slot: "plain-row-link" },
    props: mergeProps<"a">(
      {
        href,
        title: words,
        className:
          "peer/plain-row-link absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) group-data-[variant=ruled]/plain-rows:focus-visible:-outline-offset-2",
        children: <span className="sr-only">{children}</span>,
      },
      props,
    ),
  });
  return (
    <span
      data-slot="plain-row-title"
      title={linked ? undefined : words}
      className={cn(
        "min-w-0 flex-1 truncate text-ui font-normal text-foreground group-data-[closed]/plain-row:text-muted-foreground [@media(max-width:600px)]:col-span-full [@media(max-width:600px)]:group-data-[clamp]/plain-rows:line-clamp-2 [@media(max-width:600px)]:group-data-[clamp]/plain-rows:whitespace-normal",
        className,
      )}
    >
      {link}
      <span
        aria-hidden={linked || undefined}
        className="decoration-1 underline-offset-4 peer-hover/plain-row-link:underline group-data-[closed]/plain-row:line-through group-data-[closed]/plain-row:peer-hover/plain-row-link:line-through"
      >
        {children}
      </span>
    </span>
  );
}

// What kind of thing the row holds, in an 80 px column that cuts. On a phone it leads the second line, and it prints
// the dot itself when a filled when follows, so a row writes only the two words.
function PlainRowKind({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="plain-row-kind"
      className={cn(
        "w-20 shrink-0 truncate text-instrument leading-(--text-ui--line-height) text-muted-foreground [@media(max-width:600px)]:w-auto",
        className,
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        data-slot="plain-row-dot"
        className="mx-1 hidden [@media(max-width:600px)]:[[data-slot=plain-row-kind]:has(+[data-slot=plain-row-when]:not(:empty))_&]:inline"
      >
        ·
      </span>
    </span>
  );
}

// When, right-aligned in mono in a 128 px column, which a longer word widens toward the title. Left empty it holds the
// column, so a list's times keep their edge. A phone drops the column, so the line prints in the interface face.
function PlainRowWhen({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="plain-row-when"
      className={cn(
        "min-w-32 shrink-0 text-right font-mono text-instrument leading-(--text-ui--line-height) whitespace-nowrap text-muted-foreground [@media(max-width:600px)]:min-w-0 [@media(max-width:600px)]:truncate [@media(max-width:600px)]:text-left [@media(max-width:600px)]:font-sans [@media(max-width:600px)]:empty:hidden",
        className,
      )}
      {...props}
    />
  );
}

// Actions sit at the row's end, above its link, and a trailing ghost button's word ends on the column's edge. On a phone
// they take their own line, and a leading ghost button's word starts on the title's edge instead.
function PlainRowActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="plain-row-actions"
      className={cn(
        "relative z-1 flex shrink-0 items-center gap-1 [@media(max-width:600px)]:col-span-full [@media(max-width:600px)]:mt-1 [@media(max-width:600px)]:gap-2 [@media(max-width:600px)]:[&>[data-variant=ghost]:first-child]:-ml-[13px] [@media(min-width:601px)]:[&>[data-variant=ghost]:last-child]:-mr-[13px]",
        className,
      )}
      {...props}
    />
  );
}

export {
  ListRows,
  ListRow,
  ListRowLead,
  ListRowTitle,
  ListRowAside,
  ListRowMeta,
  ListRowActions,
  PlainRows,
  PlainRow,
  PlainRowTick,
  PlainRowTitle,
  PlainRowKind,
  PlainRowWhen,
  PlainRowActions,
};
