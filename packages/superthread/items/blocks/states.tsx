import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { FitTitle, type FitTitleStep } from "@/components/superthread/ui/fit-title";
import { StatusGlyph } from "@/components/superthread/ui/glyphs";
import { Door } from "@/components/superthread/ui/onward";
import { Skeleton } from "@/components/superthread/ui/skeleton";

// The three places a collection holds when it has no rows to show: still loading, failed, or empty. Each stands where
// the rows would, at the rows' left edge, and says what happened in the collection's own words. A page with one job has a
// fourth: clear, which stands where the job would.

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

// Clear: nothing is waiting, in one sentence on the panel, with no sheet. It takes the job sheet's box and held rows in
// each width band, so the sentence starts where the cue does, and the reason and the door land where the why and the
// primary do. It holds the height of the work that's gone in every band, a job sheet over a then head, three rows, a door
// and the panel's foot, so the panel's edge stays put when the last thing clears. A phone's rows take two lines each, so
// its work runs 51 px further.
function ClearState({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="clear-state"
      data-mk="states"
      className={cn(
        "@container/clear-state -mx-6 mt-5 px-6 py-7 [@media(max-width:600px)]:-mx-4 [@media(max-width:600px)]:mt-4 [@media(max-width:600px)]:p-4",
        className,
      )}
      {...props}
    >
      <div
        data-slot="clear-state-rows"
        className="grid min-h-[549px] grid-cols-[minmax(0,1fr)] grid-rows-[24px_136px_33px_20px_48px] gap-y-3 [grid-template-areas:'title'_'title'_'reason'_'.'_'door'] [@media(max-width:600px)]:min-h-[653px] [@media(max-width:600px)]:grid-rows-[24px_176px_62px_20px_48px] [@media(max-width:600px)]:gap-y-2 [@media(min-width:601px)]:@max-[784px]/clear-state:min-h-[622px] [@media(min-width:601px)]:@max-[784px]/clear-state:grid-rows-[24px_176px_66px_20px_48px]"
      >
        {children}
      </div>
    </section>
  );
}

// The claim fits its rows by measurement, as large as it holds: display at a full panel, hero below it, which prints 52/56
// on a phone, and a smaller step only when the sentence needs one, so it never runs into the reason. Its lines fill from
// the first, so the sentence reads in one piece. It's the page's h1 until render says otherwise.
const CLAIM: readonly FitTitleStep[] = ["display", "hero", "headline", "section", "long"];

function ClearStateTitle({ className, ...props }: Omit<React.ComponentProps<typeof FitTitle>, "steps">) {
  return <FitTitle steps={CLAIM} className={cn("text-wrap [grid-area:title]", className)} {...props} />;
}

// What makes it true, in one sentence, in the why's slot.
function ClearStateReason({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="clear-state-reason"
      className={cn(
        "min-w-0 type-lede text-foreground [grid-area:reason] [overflow-wrap:anywhere] [@media(max-width:420px)]:type-read",
        className,
      )}
      {...props}
    />
  );
}

// The way to everything that didn't count, in the primary's slot.
function ClearStateDoor({ className, ...props }: React.ComponentProps<typeof Door>) {
  return <Door className={cn("self-center [grid-area:door]", className)} {...props} />;
}

export {
  ClearState,
  ClearStateDoor,
  ClearStateReason,
  ClearStateTitle,
  EmptyState,
  EmptyStateActions,
  EmptyStateMedia,
  EmptyStateText,
  FailedState,
  LoadingState,
};
