import { Notice } from "@/components/superthread/blocks/notice";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { FitTitle } from "@/components/superthread/ui/fit-title";
import { Paper } from "@/components/superthread/ui/paper";
import { Toggle } from "@/components/superthread/ui/toggle";

// The one job, on the page's paper. Its rows are held by the grid and not by what's in them, so a state that drops a part
// or a read that answers after the sheet prints moves nothing. Paper reaches past the panel by its own padding, so the
// words share the panel's left edge; it answers to its own width, so a full panel and everything narrower hold one height
// each, and a phone a third. The space above it is held too, so the sheet keeps one y through the day.
function JobSheet({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <Paper
      render={<section {...props} />}
      className={cn(
        "@container/job-sheet -mx-6 mt-5 py-7 [@media(max-width:600px)]:-mx-4 [@media(max-width:600px)]:mt-4",
        className,
      )}
    >
      <div
        data-mk="job-sheet"
        data-slot="job-sheet"
        className="grid grid-cols-[minmax(0,1fr)] grid-rows-[24px_136px_33px_20px_48px] gap-y-3 [grid-template-areas:'cue'_'title'_'why'_'changed'_'actions'] [@media(max-width:600px)]:grid-rows-[24px_176px_62px_20px_48px] [@media(max-width:600px)]:gap-y-2 [@media(min-width:601px)]:@max-[784px]/job-sheet:grid-rows-[24px_176px_66px_20px_48px]"
      >
        {children}
      </div>
    </Paper>
  );
}

// The gap in plain words, or a fact in the job's place: `48 min until standup`, `11:00 to 11:45 · teams`.
function JobSheetCue({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="job-sheet-cue"
      className={cn("min-w-0 truncate type-subtitle text-foreground [grid-area:cue]", className)}
      {...props}
    />
  );
}

// The job itself, through fit-title, in the slot's held height: two lines of hero at a full panel, and six of long below
// it. Link it to the page that prints it whole, since a cut title has no hover on touch. It's the page's h1 until render
// says otherwise.
function JobSheetTitle({ className, ...props }: React.ComponentProps<typeof FitTitle>) {
  return <FitTitle className={cn("[grid-area:title]", className)} {...props} />;
}

// Why this job, in one short sentence. It prints whole on one line at a full panel and on two below it, where a phone of
// 420 px or less takes the reading step. Its height is held, so what replaces the words in the slot stays in the slot, and
// a ring on a control inside it keeps its 4 px. Inline answers leave the clip off: a target reaches past a held row on a
// phone, and a clip would cut it.
function JobSheetWhy({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="job-sheet-why"
      className={cn(
        "min-w-0 overflow-clip type-lede text-foreground [grid-area:why] [overflow-clip-margin:4px] [overflow-wrap:anywhere] has-data-[slot=inline-answers]:overflow-visible [@media(max-width:420px)]:type-read",
        className,
      )}
      {...props}
    />
  );
}

// One quiet line for what moved since the job was picked, in a slot of its own. Render it from the start, empty until the
// words arrive, so a screen reader hears them; a read that never answers leaves the slot as it was. A line too long for
// the width truncates, because the slot never grows.
function JobSheetChanged({ className, ...props }: Omit<React.ComponentProps<"div">, "role">) {
  return <Notice variant="quiet" className={cn("[grid-area:changed] [&>span]:truncate", className)} {...props} />;
}

// The row of actions, at the sheet's foot. A phone gives the first action what the others leave.
function JobSheetActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="job-sheet-actions"
      className={cn(
        "flex min-w-0 items-center gap-2 [grid-area:actions] [@media(max-width:600px)]:[&>[data-variant=ghost]]:px-2",
        className,
      )}
      {...props}
    />
  );
}

// The one primary, which names the step. reserve takes the longest word it can print: it sits unseen and unread in the
// same cell, so the button holds its width when its word changes. It's a link when it leads somewhere: pass render and
// nativeButton={false}. It fills with plum on paper; a sheet with nothing pressing passes variant="outline".
function JobSheetPrimary({
  className,
  children,
  reserve,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & { reserve?: React.ReactNode }) {
  return (
    <Button
      data-slot="job-sheet-primary"
      size="lg"
      className={cn(
        "min-w-28 [@media(max-width:600px)]:min-w-0 [@media(max-width:600px)]:flex-1 [@media(max-width:600px)]:shrink [@media(max-width:600px)]:px-3",
        className,
      )}
      {...props}
    >
      <span className="grid min-w-0 grid-cols-[minmax(0,auto)] justify-items-center">
        {reserve != null && (
          <span aria-hidden="true" className="invisible col-start-1 row-start-1">
            {reserve}
          </span>
        )}
        <span className="col-start-1 row-start-1 max-w-full truncate">{children}</span>
      </span>
    </Button>
  );
}

// A way of holding the whole page, such as `only what can't slip`: a toggle after the actions, with its tick holding its
// space. A phone sets its words on two lines at the instrument step, so the primary keeps its width.
function JobSheetToggle({ className, ...props }: Omit<React.ComponentProps<typeof Toggle>, "size" | "variant">) {
  return (
    <Toggle
      data-slot="job-sheet-toggle"
      size="lg"
      className={cn(
        "[@media(max-width:600px)]:w-25 [@media(max-width:600px)]:gap-1 [@media(max-width:600px)]:px-2 [@media(max-width:600px)]:text-left [@media(max-width:600px)]:type-instrument [@media(max-width:600px)]:whitespace-normal",
        className,
      )}
      {...props}
    />
  );
}

export {
  JobSheet,
  JobSheetCue,
  JobSheetTitle,
  JobSheetWhy,
  JobSheetChanged,
  JobSheetActions,
  JobSheetPrimary,
  JobSheetToggle,
};
