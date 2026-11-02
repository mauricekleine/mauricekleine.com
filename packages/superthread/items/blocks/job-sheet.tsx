import { Notice } from "@/components/superthread/blocks/notice";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import { FitTitle } from "@/components/superthread/ui/fit-title";
import { Paper } from "@/components/superthread/ui/paper";
import { Toggle } from "@/components/superthread/ui/toggle";

// The one job, on the page's paper. Its rows are held by the grid and not by what's in them, so a state that drops a part
// or a read that answers after the sheet prints moves nothing. Paper reaches past the panel by its own padding, so the
// words share the panel's left edge; it answers to its own width, so a full panel and everything narrower hold one height
// each, and a phone a third. The space above it is held too, so the sheet keeps one y through the day. On a light page it
// is white on a white panel, where the lift alone can't show its top and left: it draws a 1 px edge in border inside its
// box, as an outline, so nothing moves. On a dark page the white is its edge.
function JobSheet({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <Paper
      render={<section {...props} />}
      className={cn(
        "@container/job-sheet -mx-6 mt-5 py-7 not-dark:outline not-dark:-outline-offset-1 not-dark:outline-border [@media(max-width:600px)]:-mx-4 [@media(max-width:600px)]:mt-4",
        className,
      )}
    >
      <div
        data-mk="job-sheet"
        data-slot="job-sheet"
        className="group/job-sheet grid grid-cols-[minmax(0,1fr)] grid-rows-[24px_136px_33px_20px_48px] gap-y-3 [grid-template-areas:'cue'_'title'_'why'_'changed'_'actions'] [@media(max-width:600px)]:grid-rows-[24px_176px_62px_20px_48px] [@media(max-width:600px)]:gap-y-2 [@media(min-width:601px)]:@max-[784px]/job-sheet:grid-rows-[24px_176px_66px_20px_48px]"
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
// the width truncates, because the slot never grows. On a phone, open answers in the why take two rows of 44 px targets,
// which reach into this slot, so the line steps out of sight and out of the pointer's way until they close; a screen
// reader still hears it. A third row would reach the actions, so a phone's answers keep to two.
function JobSheetChanged({ className, ...props }: Omit<React.ComponentProps<"div">, "role">) {
  return (
    <Notice
      variant="quiet"
      className={cn(
        "[grid-area:changed] [&>span]:truncate [@media(max-width:600px)]:group-has-[[data-slot=inline-answers][data-open]]/job-sheet:pointer-events-none [@media(max-width:600px)]:group-has-[[data-slot=inline-answers][data-open]]/job-sheet:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

// The row of actions, at the sheet's foot. A phone gives the first action what the others leave, down to its floor.
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
// same cell, so the button holds its width when its word changes. The words sit in the middle of that cell, so a short
// word stays centred beside a reserve that takes more lines, and words that need three lines keep to two.
// It's a link when it leads somewhere: pass render and
// nativeButton={false}. It fills with plum on paper; a sheet with nothing pressing passes variant="outline". On a phone
// the row is narrow, so its words take two lines inside the button's 48 px rather than lose the end of the step, and it
// gives the row's width to a toggle beside it down to 84 px, which holds a short step on two lines. On a sheet under
// 360 px the toggle takes a column of its own, and the primary takes the rest.
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
        "min-w-28 [@media(max-width:600px)]:min-w-21 [@media(max-width:600px)]:@max-[328px]/job-sheet:min-w-0 [@media(max-width:600px)]:flex-1 [@media(max-width:600px)]:shrink [@media(max-width:600px)]:px-3",
        className,
      )}
      {...props}
    >
      <span className="grid min-w-0 grid-cols-[minmax(0,auto)] items-center justify-items-center text-center">
        {reserve != null && (
          <span
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 max-w-full [@media(max-width:600px)]:whitespace-normal"
          >
            {reserve}
          </span>
        )}
        <span className="col-start-1 row-start-1 max-w-full truncate [@media(max-width:600px)]:line-clamp-2 [@media(max-width:600px)]:whitespace-normal">
          {children}
        </span>
      </span>
    </Button>
  );
}

// A way of holding the whole page, such as `only what can't slip`: a toggle after the actions, with its tick holding its
// space. A phone sets its words at the instrument step, on one line beside the other actions; only a row too narrow for
// them and the primary's floor wraps them. A wrapped toggle keeps the width of its one line, so on a sheet under 360 px,
// 328 px inside its padding, where the line no longer fits beside that floor, it takes a 100 px column of two lines and
// leaves the primary the rest.
function JobSheetToggle({ className, ...props }: Omit<React.ComponentProps<typeof Toggle>, "size" | "variant">) {
  return (
    <Toggle
      data-slot="job-sheet-toggle"
      size="lg"
      className={cn(
        "[@media(max-width:600px)]:shrink [@media(max-width:600px)]:@max-[328px]/job-sheet:w-25 [@media(max-width:600px)]:@max-[328px]/job-sheet:shrink-0 [@media(max-width:600px)]:gap-1 [@media(max-width:600px)]:px-2 [@media(max-width:600px)]:text-left [@media(max-width:600px)]:type-instrument [@media(max-width:600px)]:whitespace-normal",
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
