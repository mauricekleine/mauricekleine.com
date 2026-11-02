import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

// A collection of ruled rows. The list owns the first rule and every row owns the one below it. Straight under a section
// header the rows hang from the header's rule, so the two never print 16 px apart.
function ListRows({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-mk="list-rows"
      data-slot="list-rows"
      className={cn(
        "min-w-0 list-none border-t border-border has-[>[data-variant=day]]:border-t-0 [[data-slot=section-header]+&]:-mt-4 [[data-slot=section-header]+&]:border-t-0",
        className,
      )}
      {...props}
    />
  );
}

// A day row reads across one 44 px line with no rule, so a day's plain list looks like nothing to work through: a time,
// the title, its kind and what ends the row. The columns hold across rows, and a row with no kind leaves its column open.
// On a phone the kind's column gives way first: the title is the row's point, so it keeps half the row.
const DAY_ROW =
  "group/list-row grid h-11 min-w-0 grid-cols-[48px_minmax(0,1fr)_80px_128px] items-center gap-x-4 type-ui [grid-template-areas:'time_title_kind_when'] [@media(max-width:600px)]:grid-cols-[44px_minmax(50%,1fr)_minmax(0,auto)_48px] [@media(max-width:600px)]:gap-x-2";

// The optional lead, title and time share a line. On phones the time moves below the title, before the meta line. A
// closed row stays in the list with its title muted and struck through. A receding row is still live and fading, so its
// title prints muted and takes no strike.
function ListRow({
  className,
  closed,
  receding,
  variant,
  ...props
}: React.ComponentProps<"li"> & { closed?: boolean; receding?: boolean; variant?: "day" }) {
  return (
    <li
      data-mk="list-rows"
      data-slot="list-row"
      data-closed={closed || undefined}
      data-receding={receding || undefined}
      data-variant={variant}
      className={cn(
        variant === "day"
          ? DAY_ROW
          : "group/list-row grid min-h-(--spacing-row-board) min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-b border-border px-4 py-3 [grid-template-areas:'title_aside'_'meta_meta'_'actions_actions'] has-[[data-slot=list-row-lead]]:grid-cols-[auto_minmax(0,1fr)_auto] has-[[data-slot=list-row-lead]]:[grid-template-areas:'lead_title_aside'_'lead_meta_meta'_'._actions_actions'] [@media(max-width:600px)]:grid-cols-[minmax(0,1fr)] [@media(max-width:600px)]:[grid-template-areas:'title'_'aside'_'meta'_'actions'] [@media(max-width:600px)]:has-[[data-slot=list-row-lead]]:grid-cols-[auto_minmax(0,1fr)] [@media(max-width:600px)]:has-[[data-slot=list-row-lead]]:[grid-template-areas:'lead_title'_'lead_aside'_'lead_meta'_'._actions']",
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
// strike under the pointer. In a day row it holds one line in the regular weight, and a link fills the row's 44 px on a
// phone through its line height, because truncating clips a hit area. kind="id" sets a mono identifier.
function ListRowTitle({ className, href, kind, render, ...props }: useRender.ComponentProps<"a"> & { kind?: "id" }) {
  return useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "list-row-title", kind },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "min-w-0 text-ui font-medium text-foreground [grid-area:title] [overflow-wrap:anywhere] decoration-1 underline-offset-4 [&:is(a)]:hover:underline [@media(max-width:600px)]:[&:is(a)]:relative [@media(max-width:600px)]:[&:is(a)]:hit-area group-data-[closed]/list-row:text-muted-foreground group-data-[closed]/list-row:line-through group-data-[closed]/list-row:hover:line-through group-data-[receding]/list-row:text-muted-foreground group-data-[variant=day]/list-row:truncate group-data-[variant=day]/list-row:font-normal [@media(max-width:600px)]:group-data-[variant=day]/list-row:[&:is(a)]:leading-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
          kind === "id" && "font-mono font-normal",
          className,
        ),
      },
      props,
    ),
  });
}

// A day row's time, in its own column.
function ListRowTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="list-row-time"
      className={cn(
        "min-w-0 font-mono type-instrument whitespace-nowrap text-muted-foreground tabular-nums [grid-area:time]",
        className,
      )}
      {...props}
    />
  );
}

// What a day row is, as a muted word, or as a link in foreground once it leads somewhere: `brief`. The link underlines
// on hover and takes the hit area on a phone.
function ListRowKind({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "list-row-kind" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "min-w-0 truncate type-instrument text-muted-foreground [grid-area:kind] decoration-1 underline-offset-4 [&:is(a)]:type-ui [&:is(a)]:text-foreground [&:is(a)]:hover:underline [@media(max-width:600px)]:text-right [@media(max-width:600px)]:[&:is(a)]:relative [@media(max-width:600px)]:[&:is(a)]:overflow-visible [@media(max-width:600px)]:[&:is(a)]:hit-area focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
          className,
        ),
      },
      props,
    ),
  });
}

// What ends a day row, at its right edge: a time, or one small control. The column keeps its width on a phone, so a
// small button there drops its inline padding and fills it, and every row's end lines up.
function ListRowWhen({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-row-when"
      className={cn(
        "min-w-0 justify-self-end text-right type-instrument whitespace-nowrap text-muted-foreground [grid-area:when] [&>time]:font-mono [&>time]:tabular-nums [@media(max-width:600px)]:[&>[data-slot=button]]:w-12 [@media(max-width:600px)]:[&>[data-slot=button]]:px-0",
        className,
      )}
      {...props}
    />
  );
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

// The second line holds context, and it prints the dot between its pieces, so a row writes only the pieces. Each dot
// leads the piece after it, in a slot as wide as the gap and pulled back over it, so the row's clip takes the dot of the
// piece that starts a line: a wrap leaves no dot hanging at either end. The clip falls on the padding edge, so the
// line's padding, pulled back by its margin, keeps a link's focus ring inside it. The dot sits outside the piece's own
// element, so a link keeps it out of its underline and a hit area keeps its ::after, and it is decoration, so a screen
// reader skips it. A component can render nothing, which only the page can see, so the page hides that piece with its
// dot, and a line with nothing on it. Each piece may wrap without truncating the title. A status sits outside it, in
// the aside.
function ListRowMeta({ className, children, ...props }: React.ComponentProps<"div">) {
  const pieces = metaPieces(children);
  return (
    <div
      data-slot="list-row-meta"
      className={cn(
        "-mx-1 flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1 overflow-x-clip px-1 type-instrument text-muted-foreground [grid-area:meta] [overflow-wrap:anywhere] [&:not(:has([data-slot=list-row-meta-text]:not(:empty)))]:hidden [&>[data-slot=list-row-meta-piece]:has(>[data-slot=list-row-meta-text]:empty)]:hidden",
        className,
      )}
      {...props}
    >
      {pieces.map((piece, index) => (
        <span
          key={index}
          data-slot="list-row-meta-piece"
          className={cn("flex min-w-0 items-baseline", index > 0 && "-ml-5")}
        >
          {index > 0 && (
            <span aria-hidden="true" data-slot="list-row-meta-dot" className="w-5 shrink-0 text-center">
              ·
            </span>
          )}
          <span data-slot="list-row-meta-text" className="min-w-0">
            {piece}
          </span>
        </span>
      ))}
    </div>
  );
}

// Actions stay at the end of their own line, outside the title link and able to wrap on a phone. variant="markers" holds
// a line of quiet facts instead, muted from the row's start. Either way a line with nothing in it takes no room.
function ListRowActions({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: "markers" }) {
  return (
    <div
      data-slot="list-row-actions"
      data-variant={variant}
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-end gap-2 [grid-area:actions] empty:hidden",
        variant === "markers" && "justify-start type-instrument text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type PlainRowsVariant = "plain" | "nested" | "ruled";

// Each form sets the row's height. A ruled list bleeds to the panel's edges, so --bleed reads the panel's inset.
const plainRowsVariants: Record<PlainRowsVariant, string> = {
  plain: "[--row:var(--spacing-row-plain)]",
  nested: "[--row:var(--spacing-row-nested)]",
  ruled: "[--row:var(--spacing-row-table)] in-data-[slot=app-shell-panel]:[--bleed:var(--spacing-panel-inset)]",
};

// A list that reads as words: no rules and no padding, the row a line of its own. Plain is 40 px, nested is 36 px for a
// list under a quiet head, ruled is 48 px with a rule under each row. Every form is 56 px on a phone. clamp lets a title
// take two lines on a phone, and its row grows to hold them, for a list whose titles lose their meaning when they cut.
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
        "group/plain-row relative flex h-(--row) min-w-0 items-center gap-x-4 px-(--bleed) group-data-[variant=ruled]/plain-rows:border-b group-data-[variant=ruled]/plain-rows:border-border [@media(max-width:600px)]:grid [@media(max-width:600px)]:grid-cols-[auto_minmax(0,1fr)] [@media(max-width:600px)]:content-center [@media(max-width:600px)]:gap-x-0 [@media(max-width:600px)]:has-[[data-slot=plain-row-actions]]:h-auto [@media(max-width:600px)]:has-[[data-slot=plain-row-actions]]:py-1.5 [@media(max-width:600px)]:has-[[data-slot=plain-row-tick]]:pr-[calc(var(--bleed)+2.75rem)] [@media(max-width:600px)]:group-data-[clamp]/plain-rows:h-auto [@media(max-width:600px)]:group-data-[clamp]/plain-rows:min-h-(--row) [@media(max-width:600px)]:group-data-[clamp]/plain-rows:py-1.5",
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

const plainRowWords =
  "decoration-1 underline-offset-4 peer-hover/plain-row-link:underline group-data-[closed]/plain-row:line-through group-data-[closed]/plain-row:peer-hover/plain-row-link:line-through";

// The title takes one line and cuts at its end, and the words stay in a tooltip. With an href or the app's router link
// through render, its link stretches over the row and carries the name, and the words beside it underline while the
// link is under the pointer. The ring prints outside the row, or inside a ruled row, which reaches the panel's edges.
// With neither it stays plain text.
function PlainRowTitle({ className, children, href, render, ...props }: useRender.ComponentProps<"a">) {
  const linked = href !== undefined || render !== undefined;
  const title = useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: linked ? { slot: "plain-row-link" } : undefined,
    props: mergeProps<"a">(
      {
        href,
        title: typeof children === "string" ? children : undefined,
        className: linked
          ? "peer/plain-row-link absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) group-data-[variant=ruled]/plain-rows:focus-visible:-outline-offset-2"
          : plainRowWords,
        children: linked ? <span className="sr-only">{children}</span> : children,
      },
      props,
    ),
  });
  return (
    <span
      data-slot="plain-row-title"
      className={cn(
        "min-w-0 flex-1 truncate text-ui font-normal text-foreground group-data-[closed]/plain-row:text-muted-foreground [@media(max-width:600px)]:col-span-full [@media(max-width:600px)]:group-data-[clamp]/plain-rows:line-clamp-2 [@media(max-width:600px)]:group-data-[clamp]/plain-rows:whitespace-normal",
        className,
      )}
    >
      {title}
      {linked && (
        <span aria-hidden="true" className={plainRowWords}>
          {children}
        </span>
      )}
    </span>
  );
}

// What kind of thing the row holds, in an 80 px column that cuts. On a phone it leads the second line, and when it has
// words and a filled when follows it prints the dot itself, so a row writes only the two words.
function PlainRowKind({ className, children, ...props }: React.ComponentProps<"span">) {
  const filled = Children.toArray(children).some((child) => child !== "");
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
      {filled && (
        <span
          aria-hidden="true"
          data-slot="plain-row-dot"
          className="mx-1 hidden [@media(max-width:600px)]:[[data-slot=plain-row-kind]:has(+[data-slot=plain-row-when]:not(:empty))_&]:inline"
        >
          ·
        </span>
      )}
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
// they take their own line and hug their buttons, so the rest of that line stays the link, and a leading ghost button's
// word starts on the title's edge instead.
function PlainRowActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="plain-row-actions"
      className={cn(
        "relative z-1 flex shrink-0 items-center gap-1 [@media(max-width:600px)]:col-span-full [@media(max-width:600px)]:mt-1 [@media(max-width:600px)]:justify-self-start [@media(max-width:600px)]:gap-2 [@media(max-width:600px)]:[&>[data-variant=ghost]:first-child]:-ml-[13px] [@media(min-width:601px)]:[&>[data-variant=ghost]:last-child]:-mr-[13px]",
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
  ListRowTime,
  ListRowKind,
  ListRowWhen,
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
