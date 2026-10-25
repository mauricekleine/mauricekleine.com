import { cn } from "@/components/superthread/lib/utils";
import { Icon, StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";

// A flat notice in the page's own fill. Only the small glyph takes status ink; failures interrupt, other updates wait.
function Notice({
  className,
  state,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "role"> & { state?: StatusState }) {
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
