import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

// Rows come from the row spacing: table rows are 48 px and board rows 56 px, each plus its 1 px rule. Rules live on
// the cells, since a separate-border table paints no row borders. The row edge (texture-rowedge) gives every first
// cell 16 px of left padding and draws a 4 px strip at its left edge, inside the cell, at the half on hover and
// solid on a selected row.
const tableVariants = cva(
  "w-full caption-bottom border-separate border-spacing-0 text-ui tabular-nums texture-rowedge",
  {
    variants: {
      rows: {
        table: "[--row:var(--spacing-row-table)]",
        board: "[--row:var(--spacing-row-board)]",
      },
    },
    defaultVariants: {
      rows: "table",
    },
  },
);

function Table({
  className,
  rows = "table",
  ...props
}: React.ComponentProps<"table"> & VariantProps<typeof tableVariants>) {
  return (
    <div data-slot="table-container" data-mk="table" className="relative w-full overflow-x-auto">
      <table data-slot="table" data-rows={rows} className={cn(tableVariants({ rows }), className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("bg-muted font-medium", className)} {...props} />;
}

// No hover fill: hover shows only the strip. A selected row takes the accent ground under its cells.
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors duration-(--duration-instant) ease-(--ease-brand) has-aria-expanded:bg-control-hover aria-selected:bg-accent data-[state=selected]:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

// Ids and numbers set in mono; numbers align right. Every figure in the table is tabular.
const cellKind = cva("", {
  variants: {
    kind: {
      id: "font-mono",
      number: "text-right font-mono",
    },
  },
});

type CellKind = VariantProps<typeof cellKind>;

function TableHead({ className, kind, ...props }: React.ComponentProps<"th"> & CellKind) {
  return (
    <th
      data-slot="table-head"
      data-kind={kind ?? undefined}
      className={cn(
        "border-b border-foreground pr-4 pb-3 text-left align-bottom type-meta whitespace-nowrap text-muted-foreground last:pr-0 [&:has([role=checkbox])]:pr-0",
        cellKind({ kind }),
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, kind, ...props }: React.ComponentProps<"td"> & CellKind) {
  return (
    <td
      data-slot="table-cell"
      data-kind={kind ?? undefined}
      className={cn(
        "h-[calc(var(--row)+1px)] border-b border-border pr-4 align-middle leading-5 whitespace-nowrap last:pr-0 [&:has([role=checkbox])]:pr-0",
        cellKind({ kind }),
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-instrument text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
