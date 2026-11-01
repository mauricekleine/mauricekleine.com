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
// foreground, and a linked title underlines on hover. A closed row's title keeps its strike under the pointer.
function ListRowTitle({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "list-row-title" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "min-w-0 text-ui font-medium text-foreground [grid-area:title] [overflow-wrap:anywhere] decoration-1 underline-offset-4 [&:is(a):hover]:underline group-data-[closed]/list-row:text-muted-foreground group-data-[closed]/list-row:line-through group-data-[closed]/list-row:[&:is(a):hover]:line-through focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
          className,
        ),
      },
      props,
    ),
  });
}

// A time or count sits at the end on wide rows and keeps its mono figures when it wraps below the title.
function ListRowAside({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-row-aside"
      className={cn(
        "min-w-0 text-right type-instrument text-muted-foreground font-mono tabular-nums [grid-area:aside] [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
  );
}

// The second line holds context and badges; each fragment may wrap without truncating the title.
function ListRowMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-row-meta"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 type-instrument text-muted-foreground [grid-area:meta] [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
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

export { ListRows, ListRow, ListRowLead, ListRowTitle, ListRowAside, ListRowMeta, ListRowActions };
