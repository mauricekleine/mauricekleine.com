import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { StatusGlyph } from "@/components/superthread/ui/glyphs";
import { Skeleton } from "@/components/superthread/ui/skeleton";

// The three places a collection holds when it has no rows to show: still loading, failed, or empty. Each stands where
// the rows would, at the rows' left edge, and says what happened in the collection's own words.

// Loading: rows at the table's height, each a still bar through the 18.75 percent screen, read out once as loading.
const WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-2/5"] as const;

function LoadingState({
  className,
  rows = 3,
  label = "loading",
  ...props
}: React.ComponentProps<"div"> & { rows?: number; label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      data-slot="loading-state"
      data-mk="states"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex h-(--spacing-row-table) items-center border-b border-border px-4">
          <Skeleton className={WIDTHS[row % WIDTHS.length]} />
        </div>
      ))}
    </div>
  );
}

// Failed: the failed glyph, what failed, why, and a way to try again. The glyph is the only colour, at badge scale.
function FailedState({
  className,
  title = "this did not load",
  onRetry,
  retryLabel = "try again",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      data-slot="failed-state"
      data-mk="states"
      className={cn("flex flex-col items-start gap-4 px-4 pt-7", className)}
      {...props}
    >
      <p className="flex items-start gap-2.5 type-instrument text-muted-foreground">
        <StatusGlyph state="failed" className="mt-[3px]" />
        <span>
          <b className="block font-medium text-foreground">{title}</b>
          {children}
        </span>
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

// Empty: an optional figure (an app's empty plate in its crop marks), then what is missing and how to fill it.
function EmptyState({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      data-mk="states"
      className={cn("flex flex-col items-start gap-7 px-4 pt-7", className)}
      {...props}
    />
  );
}

function EmptyStateMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-state-media" aria-hidden="true" className={cn("w-full", className)} {...props} />;
}

function EmptyStateText({
  className,
  title,
  children,
  ...props
}: Omit<React.ComponentProps<"p">, "title"> & { title: React.ReactNode }) {
  return (
    <p data-slot="empty-state-text" className={cn("type-instrument text-muted-foreground", className)} {...props}>
      <b className="block font-medium text-foreground">{title}</b>
      {children}
    </p>
  );
}

function EmptyStateActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-state-actions" className={cn("flex flex-wrap gap-2", className)} {...props} />;
}

export { EmptyState, EmptyStateActions, EmptyStateMedia, EmptyStateText, FailedState, LoadingState };
