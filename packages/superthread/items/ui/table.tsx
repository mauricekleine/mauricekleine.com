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
      fold: {
        true: "table-fixed text-instrument text-muted-foreground @max-[776px]/fold:block",
      },
    },
    defaultVariants: {
      rows: "table",
    },
  },
);

// The fold reaches the panel's edges and answers to its own width, so it needs no panel to measure: above 776 px of
// container, the panel's 680 px of measure, it is a table of fixed columns whose first and last cells keep the panel's
// inset and whose words end in an ellipsis. Below that each row folds into two lines on one grid, with no sideways
// scroll. Display changes strip a table's meaning in some browsers, so a folding table carries its roles out loud.
const Folding = React.createContext(false);

function Table({
  className,
  rows = "table",
  fold = false,
  ...props
}: React.ComponentProps<"table"> & Omit<VariantProps<typeof tableVariants>, "fold"> & { fold?: boolean }) {
  return (
    <div
      data-slot="table-container"
      data-mk="table"
      className={cn(
        "relative",
        fold ? "@container/fold -mx-(--spacing-panel-inset)" : "w-full overflow-x-auto hit-area-scroller",
      )}
    >
      <Folding.Provider value={fold}>
        <table
          data-slot="table"
          data-rows={rows}
          data-fold={fold ? "" : undefined}
          role={fold ? "table" : undefined}
          className={cn(tableVariants({ rows, fold: fold || undefined }), className)}
          {...props}
        />
      </Folding.Provider>
    </div>
  );
}

// Folded, a head leaves the screen and stays with a screen reader, unless it sorts: then the row stands as one line of
// sort buttons over a foreground rule, so the sort stays in reach.
const foldedHeader =
  "@max-[776px]/fold:block @max-[776px]/fold:[&>tr]:flex @max-[776px]/fold:[&>tr]:min-h-0 @max-[776px]/fold:[&>tr]:gap-x-4 @max-[776px]/fold:[&>tr]:border-0 @max-[776px]/fold:[&>tr]:py-0 @max-[776px]/fold:has-data-[slot=sortable-head]:[&>tr]:border-b @max-[776px]/fold:has-data-[slot=sortable-head]:[&>tr]:border-foreground @max-[776px]/fold:has-data-[slot=sortable-head]:[&>tr]:pb-2";

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const fold = React.useContext(Folding);
  return (
    <thead
      data-slot="table-header"
      role={fold ? "rowgroup" : undefined}
      className={fold ? cn(foldedHeader, className) : className}
      {...props}
    />
  );
}

// Folded, the body opens on a rule, since no head prints above it.
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const fold = React.useContext(Folding);
  return (
    <tbody
      data-slot="table-body"
      role={fold ? "rowgroup" : undefined}
      className={
        fold
          ? cn(
              "@max-[776px]/fold:block @max-[776px]/fold:border-t @max-[776px]/fold:border-border @max-[776px]/fold:[thead:has([data-slot=sortable-head])+&]:border-t-0",
              className,
            )
          : className
      }
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  const fold = React.useContext(Folding);
  return (
    <tfoot
      data-slot="table-footer"
      role={fold ? "rowgroup" : undefined}
      className={cn("bg-muted font-medium", fold && "@max-[776px]/fold:block", className)}
      {...props}
    />
  );
}

// Folded, a row is a 64 px grid at the panel's inset: a fixed lead column when a cell takes it, 72 px or the table's
// --fold-lead, then the title's words and a column for what sits beside them. The rule moves from the cells to the row.
const foldedRow =
  "relative @max-[776px]/fold:grid @max-[776px]/fold:min-h-16 @max-[776px]/fold:grid-cols-[minmax(0,1fr)_auto] @max-[776px]/fold:content-center @max-[776px]/fold:gap-x-2 @max-[776px]/fold:border-b @max-[776px]/fold:border-border @max-[776px]/fold:px-(--spacing-panel-inset) @max-[776px]/fold:py-2 @max-[776px]/fold:[grid-template-areas:'title_aside'_'meta_note'] @max-[776px]/fold:has-data-[fold=lead]:grid-cols-[var(--fold-lead,72px)_minmax(0,1fr)_auto] @max-[776px]/fold:has-data-[fold=lead]:[grid-template-areas:'lead_title_aside'_'lead_meta_note'] @max-[776px]/fold:has-data-[slot=table-detail-trigger]:pr-[calc(var(--spacing-panel-inset)+20px)]";

// No hover fill: hover shows only the strip. A selected row keeps its strip over the control hover fill. A receding row
// is still live and fading, so it prints muted and takes no strike. A row and the detail or sub-entry under it read as
// one, so no rule prints between them. A row with a detail trigger anchors whatever covers it, its first cell's strip
// included, and a plain table keeps its last cell clear of the trigger's chevron.
function TableRow({ className, receding, ...props }: React.ComponentProps<"tr"> & { receding?: boolean }) {
  const fold = React.useContext(Folding);
  return (
    <tr
      data-slot="table-row"
      data-receding={receding || undefined}
      role={fold ? "row" : undefined}
      className={cn(
        "transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) has-[[aria-expanded=true]:not([data-slot=table-detail-trigger])]:bg-control-hover has-data-[slot=table-detail-trigger]:relative aria-selected:bg-control-hover data-[state=selected]:bg-control-hover data-[receding]:text-muted-foreground [&:has(+[data-slot=table-detail]:not([hidden]),+[data-slot=table-sub])]:border-b-transparent [&:has(+[data-slot=table-detail]:not([hidden]),+[data-slot=table-sub])>*]:border-b-transparent",
        fold
          ? foldedRow
          : "has-data-[slot=table-detail-trigger]:[&>:first-child]:static has-data-[slot=table-detail-trigger]:[&>:last-child]:pr-7",
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

// Where a cell lands when its row folds. The lead holds the row's first column across both lines; title and meta stack
// beside it, each taking the line's whole width when nothing sits at its end; aside and note end those lines. A cell
// with no place takes a line of its own.
const cellFold = cva("", {
  variants: {
    fold: {
      lead: "@max-[776px]/fold:[grid-area:lead]",
      title:
        "@max-[776px]/fold:[grid-area:title] @max-[776px]/fold:[tr:not(:has(>[data-fold=aside]))>&]:[grid-column-end:-1]",
      aside: "@max-[776px]/fold:[grid-area:aside] @max-[776px]/fold:text-right",
      meta: "@max-[776px]/fold:[grid-area:meta] @max-[776px]/fold:[tr:not(:has(>[data-fold=note]))>&]:[grid-column-end:-1]",
      note: "@max-[776px]/fold:[grid-area:note] @max-[776px]/fold:text-right",
    },
  },
});

type CellFold = VariantProps<typeof cellFold>;

// A head is a word, so it sets in Supreme at the instrument step, over its column's alignment. In the fold its first and
// last heads keep the panel's inset, and the important padding outranks the row edge's first cell.
function TableHead({ className, kind, ...props }: React.ComponentProps<"th"> & CellKind) {
  const fold = React.useContext(Folding);
  return (
    <th
      data-slot="table-head"
      data-kind={kind ?? undefined}
      role={fold ? "columnheader" : undefined}
      className={cn(
        "border-b border-foreground pr-4 pb-3 text-left align-bottom type-instrument whitespace-nowrap text-muted-foreground last:pr-0 [&:has([role=checkbox])]:pr-0",
        kind === "number" && "text-right",
        fold &&
          "first:pl-(--spacing-panel-inset)! last:pr-(--spacing-panel-inset) @max-[776px]/fold:sr-only @max-[776px]/fold:first:pl-0! @max-[776px]/fold:last:pr-0",
        className,
      )}
      {...props}
    />
  );
}

// In the fold every cell prints muted at the instrument step: a row's name prints through TableTitle, and flag lifts a
// fact that is still open to foreground. The row, not the first cell, anchors the row edge and whatever covers the row,
// and a control in a cell sits above that cover. scope makes the cell the row's own head, printed as any other cell.
const foldedCell =
  "overflow-hidden text-ellipsis first:static first:pl-(--spacing-panel-inset)! last:pr-(--spacing-panel-inset) [&_:is(a,button,[role=checkbox]):not([data-slot=table-title],[data-slot=table-detail-trigger])]:relative [&_:is(a,button,[role=checkbox]):not([data-slot=table-title],[data-slot=table-detail-trigger])]:z-1 @min-[776px]/fold:[tbody:not(thead+*)>tr:first-child>&]:border-t @max-[776px]/fold:h-auto @max-[776px]/fold:min-w-0 @max-[776px]/fold:overflow-visible @max-[776px]/fold:border-0 @max-[776px]/fold:pr-0 @max-[776px]/fold:whitespace-normal @max-[776px]/fold:first:pl-0! @max-[776px]/fold:last:pr-0";

function TableCell({
  className,
  kind,
  fold,
  flag,
  scope,
  ...props
}: Omit<React.ComponentProps<"td">, "scope"> &
  CellKind &
  CellFold & {
    flag?: boolean;
    scope?: "row";
  }) {
  const folding = React.useContext(Folding);
  const Cell = scope ? "th" : "td";
  return (
    <Cell
      data-slot="table-cell"
      data-kind={kind ?? undefined}
      data-fold={fold ?? undefined}
      scope={scope}
      role={folding ? (scope ? "rowheader" : "cell") : undefined}
      className={cn(
        "h-[calc(var(--row)+1px)] border-b border-border pr-4 align-middle leading-5 whitespace-nowrap last:pr-0 [&:has([role=checkbox])]:pr-0",
        scope && "text-left font-normal",
        cellKind({ kind }),
        folding && foldedCell,
        folding && (fold ? cellFold({ fold }) : "@max-[776px]/fold:col-span-full"),
        flag && "text-foreground in-data-[receding]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  const fold = React.useContext(Folding);
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-4 text-instrument text-muted-foreground",
        fold && "px-(--spacing-panel-inset) @max-[776px]/fold:block",
        className,
      )}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
