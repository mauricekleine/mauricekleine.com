import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { EmptyState, EmptyStateText } from "@/components/superthread/blocks/states";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Table, TableCell, TableHead, TableRow } from "@/components/superthread/ui/table";

// A named collection with the table item's own scrolling box, row measures and selection edge, or its full-bleed fold
// through fold. The app supplies its columns and rows, including aria-selected or data-state="selected" when a row is
// chosen.
function DataTable({ className, label, ...props }: React.ComponentProps<typeof Table> & { label: string }) {
  return (
    <div data-mk="data-table" data-slot="data-table" role="region" aria-label={label} className="min-w-0 max-w-full">
      <Table aria-label={label} className={cn(className)} {...props} />
    </div>
  );
}

type SortDirection = "ascending" | "descending";

// The active sort is announced on the head. An unsorted head previews its chevron only under pointer or keys. In a folded
// table it stays on screen, so the sort stays in reach.
function SortableHead({
  className,
  children,
  sort,
  kind,
  onSort,
  ...props
}: React.ComponentProps<typeof TableHead> & {
  sort?: SortDirection | null;
  onSort: (direction: SortDirection) => void;
}) {
  return (
    <TableHead
      data-mk="data-table"
      data-slot="sortable-head"
      scope="col"
      aria-sort={sort ?? "none"}
      kind={kind}
      className={cn("@max-[776px]/fold:not-sr-only @max-[776px]/fold:border-0 @max-[776px]/fold:pb-0", className)}
      {...props}
    >
      <button
        data-slot="sortable-head-button"
        type="button"
        onClick={() => onSort(sort === "ascending" ? "descending" : "ascending")}
        className={cn(
          "group/sort relative flex w-full items-center gap-2 text-left type-instrument @max-[776px]/fold:w-auto [@media(max-width:600px)]:hit-area focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)",
          kind === "number" ? "justify-end" : "justify-between",
        )}
      >
        {children}
        <Icon
          name="chevron"
          className={cn(
            "shrink-0",
            sort === "ascending" && "rotate-180",
            !sort && "invisible group-hover/sort:visible group-focus-visible/sort:visible",
          )}
        />
      </button>
    </TableHead>
  );
}

// A row's name, the table's form of a list row's title. It is plain text until it gets an href or the app's router link
// through render. Either way it prints in foreground, or muted on a receding row, and a link underlines on hover and takes
// the hit area on a phone, as an inline-block so the table's scroller can contain it. In the fold it prints at weight 400
// and a link covers its whole row, which underlines it on hover and takes its focus ring inside the row, so it needs no
// hit area of its own.
function TableTitle({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "table-title", mk: "data-table" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "min-w-0 text-ui font-medium text-foreground decoration-1 underline-offset-4 in-[table[data-fold]]:font-normal in-data-[receding]:text-muted-foreground [&:is(a)]:hover:underline not-in-[table[data-fold]]:[@media(max-width:600px)]:[&:is(a)]:relative not-in-[table[data-fold]]:[@media(max-width:600px)]:[&:is(a)]:inline-block not-in-[table[data-fold]]:[@media(max-width:600px)]:[&:is(a)]:hit-area in-[table[data-fold]]:[&:is(a)]:after:absolute in-[table[data-fold]]:[&:is(a)]:after:inset-0 in-[table[data-fold]]:[&:is(a)]:after:content-[''] [@media(hover:hover)]:in-[table[data-fold]]:[tr:hover_&:is(a)]:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) in-[table[data-fold]]:[&:is(a)]:focus-visible:outline-0 in-[table[data-fold]]:[&:is(a)]:focus-visible:after:outline-2 in-[table[data-fold]]:[&:is(a)]:focus-visible:after:-outline-offset-2 in-[table[data-fold]]:[&:is(a)]:focus-visible:after:outline-(--ring)",
          className,
        ),
      },
      props,
    ),
  });
}

// An empty collection still occupies one real row. Its words span every column and announce a changed result.
function TableEmpty({
  className,
  columns,
  title = "nothing here",
  children,
  ...props
}: Omit<React.ComponentProps<typeof TableRow>, "title"> & { columns: number; title?: React.ReactNode }) {
  return (
    <TableRow data-mk="data-table" data-slot="table-empty" className={cn(className)} {...props}>
      <TableCell colSpan={columns} className="pb-7 whitespace-normal">
        <EmptyState role="status" aria-live="polite" aria-atomic="true">
          <EmptyStateText title={title}>{children}</EmptyStateText>
        </EmptyState>
      </TableCell>
    </TableRow>
  );
}

type Detail = { open: boolean; id: string; toggle: () => void };

const DetailContext = createContext<Detail | null>(null);

function useDetail() {
  const detail = useContext(DetailContext);
  if (!detail) throw new Error("a table detail part sits inside TableDetail");
  return detail;
}

// A row that opens a detail underneath. It holds the open state, controlled or its own, and prints nothing, so its two
// rows stay direct children of the table body.
function TableDetail({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const [own, setOwn] = useState(defaultOpen);
  const id = useId();
  const current = open ?? own;
  const toggle = () => {
    setOwn(!current);
    onOpenChange?.(!current);
  };
  return <DetailContext.Provider value={{ open: current, id, toggle }}>{children}</DetailContext.Provider>;
}

// The row's name as a button. Its area covers the row, with the focus ring inside the row's edge, its word underlines
// while the pointer is on the row, and a chevron at the row's end turns over while the detail is open. The chevron takes
// the row's end rather than a column: the fold's inset holds it at width, and the folded row and a plain table each keep
// it room.
function TableDetailTrigger({ className, children, onClick, ...props }: React.ComponentProps<"button">) {
  const { open, id, toggle } = useDetail();
  return (
    <button
      {...props}
      data-mk="data-table"
      data-slot="table-detail-trigger"
      type="button"
      aria-expanded={open}
      aria-controls={id}
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
      className={cn(
        "group/detail block w-full cursor-pointer truncate text-left @max-[776px]/fold:whitespace-normal text-ui text-foreground decoration-1 underline-offset-4 not-in-[table[data-fold]]:font-medium in-data-[receding]:text-muted-foreground after:absolute after:inset-0 after:content-[''] [@media(hover:hover)]:[tr:hover_&]:underline focus-visible:outline-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--ring)",
        className,
      )}
    >
      {children}
      <Icon
        name="chevron"
        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground group-aria-expanded/detail:rotate-180 in-[table[data-fold]]:right-[calc((var(--spacing-panel-inset)-12px)/2)] @max-[776px]/fold:right-(--spacing-panel-inset)"
      />
    </button>
  );
}

type UnderRowProps = React.ComponentProps<typeof TableRow> & { columns: number; lead?: boolean };

// A row under another belongs to it, so it prints no row edge of its own, and its words break anywhere, so a long id
// never widens the table.
const underRow = "[&>:first-child]:before:hidden";
const underCell = "overflow-visible whitespace-normal text-foreground [overflow-wrap:anywhere]";

// The row under the trigger's: the detail lines up with the row's title, under an empty lead cell unless lead is false,
// and its words print in the first ink at the UI step. It stays mounted while closed, so what the reader typed in it
// survives closing it.
function TableDetailRow({ className, columns, lead = true, children, ...props }: UnderRowProps) {
  const { open, id } = useDetail();
  return (
    <TableRow
      data-mk="data-table"
      data-slot="table-detail"
      id={id}
      hidden={!open}
      className={cn(underRow, "@max-[776px]/fold:min-h-0 @max-[776px]/fold:pt-0 @max-[776px]/fold:pb-4", className)}
      {...props}
    >
      {lead && <TableCell fold="lead" className="h-auto" />}
      <TableCell
        fold="title"
        colSpan={lead ? columns - 1 : columns}
        className={cn(underCell, "h-auto pt-1 pb-5 align-top text-ui @max-[776px]/fold:pt-0 @max-[776px]/fold:pb-0")}
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

// A sub-entry hanging off the row above: a line at the instrument step under that row's title, whose connector turns in
// to the words in the rule's ink. It starts under the row's lead column, or, with no lead, at the title's edge, and the
// words step in past it.
function TableSubRow({ className, columns, lead = true, children, ...props }: UnderRowProps) {
  return (
    <TableRow
      data-mk="data-table"
      data-slot="table-sub"
      className={cn(underRow, "@max-[776px]/fold:min-h-0 @max-[776px]/fold:pt-1 @max-[776px]/fold:pb-3", className)}
      {...props}
    >
      {lead && <TableCell fold="lead" className="h-auto" />}
      <TableCell
        fold="title"
        colSpan={lead ? columns - 1 : columns}
        className={cn(underCell, "h-9 pb-3 type-instrument @max-[776px]/fold:pb-0")}
      >
        <span
          data-slot="table-sub-line"
          className={cn(
            "relative block before:absolute before:-top-1.5 before:h-4 before:w-3 before:border-b before:border-l before:border-rule before:content-['']",
            lead ? "before:-left-5" : "pl-5 before:left-0",
          )}
        >
          {children}
        </span>
      </TableCell>
    </TableRow>
  );
}

export {
  DataTable,
  SortableHead,
  TableDetail,
  TableDetailRow,
  TableDetailTrigger,
  TableEmpty,
  TableSubRow,
  TableTitle,
  type SortDirection,
};
