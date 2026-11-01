import { cn } from "@/components/superthread/lib/utils";
import { EmptyState, EmptyStateText } from "@/components/superthread/blocks/states";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Table, TableCell, TableHead, TableRow } from "@/components/superthread/ui/table";

// A named collection with the table item's own scrolling box, row measures and selection edge. The app supplies
// its columns and rows, including aria-selected or data-state="selected" when a row is chosen.
function DataTable({ className, label, ...props }: React.ComponentProps<typeof Table> & { label: string }) {
  return (
    <div data-mk="data-table" data-slot="data-table" role="region" aria-label={label} className="min-w-0 max-w-full">
      <Table aria-label={label} className={cn(className)} {...props} />
    </div>
  );
}

type SortDirection = "ascending" | "descending";

// The active sort is announced on the head. An unsorted head previews its chevron only under pointer or keys.
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
      className={cn(className)}
      {...props}
    >
      <button
        data-slot="sortable-head-button"
        type="button"
        onClick={() => onSort(sort === "ascending" ? "descending" : "ascending")}
        className={cn(
          "group/sort relative flex w-full items-center gap-2 text-left type-instrument [@media(max-width:600px)]:hit-area focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)",
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

export { DataTable, SortableHead, TableEmpty, type SortDirection };
