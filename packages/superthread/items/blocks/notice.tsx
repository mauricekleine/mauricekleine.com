import { cn } from "@/components/superthread/lib/utils";
import { Icon, StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

// A flat notice in the page's own fill. Only the small glyph takes status ink; failures interrupt, other updates wait.
// The quiet form is one muted line: no box, no glyph and no state, for a fact that never asks for anything, such as a
// newer version waiting. It takes its line while it's empty, so the words arrive without moving a target and a screen
// reader hears them. A line too long for a phone wraps, so nothing is clipped, and reserve takes the longest words it can
// print: they sit unseen and unread in the same cell, so a wrapped line holds its height while it's empty.
function Notice({
  className,
  state,
  variant,
  reserve,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "role"> &
  (
    | { state?: StatusState; variant?: undefined; reserve?: undefined }
    | { state?: undefined; variant: "quiet"; reserve?: React.ReactNode }
  )) {
  if (variant === "quiet") {
    return (
      <div
        {...props}
        data-mk="notice"
        data-slot="notice"
        data-variant="quiet"
        role="status"
        className={cn(
          "grid min-h-lh min-w-0 grid-cols-[minmax(0,1fr)] type-instrument text-muted-foreground [overflow-wrap:anywhere]",
          className,
        )}
      >
        {reserve != null && (
          <span aria-hidden="true" className="invisible col-start-1 row-start-1">
            {reserve}
          </span>
        )}
        <span className="col-start-1 row-start-1">{children}</span>
      </div>
    );
  }
  return (
    <div
      {...props}
      data-mk="notice"
      data-slot="notice"
      data-state={state}
      role={state === "failed" ? "alert" : "status"}
      className={cn("flex min-w-0 gap-3 border border-border p-4", className)}
    >
      <span data-slot="notice-glyph" className="mt-1 flex shrink-0">
        {state ? <StatusGlyph state={state} aria-label={state} /> : <Icon name="i" />}
      </span>
      <div
        data-slot="notice-content"
        className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 [@media(max-width:600px)]:grid-cols-1"
      >
        {children}
      </div>
    </div>
  );
}

// The notice's first sentence carries the point in interface type.
function NoticeTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="notice-title"
      className={cn("col-start-1 min-w-0 text-ui font-medium [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

// Supporting words stay quiet and wrap within the page.
function NoticeDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="notice-description"
      className={cn("col-start-1 min-w-0 type-instrument text-muted-foreground [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

// The app's buttons sit beside the words, then wrap beneath them on a phone.
function NoticeActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notice-actions"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex flex-wrap items-center gap-2 self-center [@media(max-width:600px)]:col-start-1 [@media(max-width:600px)]:row-span-1 [@media(max-width:600px)]:row-start-auto [@media(max-width:600px)]:mt-2",
        className,
      )}
      {...props}
    />
  );
}

export { Notice, NoticeTitle, NoticeDescription, NoticeActions };
