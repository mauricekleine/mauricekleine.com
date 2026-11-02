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
const DAY_ROW =
  "group/list-row grid h-11 min-w-0 grid-cols-[48px_minmax(0,1fr)_80px_128px] items-center gap-x-4 type-ui [grid-template-areas:'time_title_kind_when'] [@media(max-width:600px)]:grid-cols-[44px_minmax(0,1fr)_auto_48px] [@media(max-width:600px)]:gap-x-2";

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
          "min-w-0 truncate type-instrument text-muted-foreground [grid-area:kind] decoration-1 underline-offset-4 [&:is(a)]:type-ui [&:is(a)]:text-foreground [&:is(a)]:hover:underline [@media(max-width:600px)]:justify-self-end [@media(max-width:600px)]:[&:is(a)]:relative [@media(max-width:600px)]:[&:is(a)]:overflow-visible [@media(max-width:600px)]:[&:is(a)]:hit-area focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
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

// The second line holds context, and it prints the dot between its pieces, so a row writes only the pieces. The dot is
// its own element outside each piece, so a link keeps it out of its underline and a hit area keeps its ::after. It stays
// with the piece before it, so it ends a wrapped line rather than starting the next, and it is decoration, so a screen
// reader skips it. A component can render nothing, which only the page can see, so the page hides that piece and its
// dot, a dot with nothing after it, and a line with nothing on it. Each piece may wrap without truncating the title. A
// status sits outside it, in the aside.
function ListRowMeta({ className, children, ...props }: React.ComponentProps<"div">) {
  const pieces = metaPieces(children);
  return (
    <div
      data-slot="list-row-meta"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 type-instrument text-muted-foreground [grid-area:meta] [overflow-wrap:anywhere] [&:not(:has([data-slot=list-row-meta-text]:not(:empty)))]:hidden [&>[data-slot=list-row-meta-piece]:has(>[data-slot=list-row-meta-text]:empty)]:hidden [&>[data-slot=list-row-meta-piece]:not(:has(~[data-slot=list-row-meta-piece]>[data-slot=list-row-meta-text]:not(:empty)))>[data-slot=list-row-meta-dot]]:hidden",
        className,
      )}
      {...props}
    >
      {pieces.map((piece, index) => (
        <span key={index} data-slot="list-row-meta-piece" className="min-w-0">
          <span data-slot="list-row-meta-text">{piece}</span>
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
};
