import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

// One piece of writing, read whole before someone acts on it. The box takes no padding of its own, so a foot such as
// paper reaches both edges, and it never clips or clamps. Inside the working panel on a phone it gives up its side edges
// for the panel's whole width. last says nothing follows it in the panel, wrappers included, so there it also runs down
// to the panel's foot; a page has to say so, because a selector can't see past a wrapper or a tab's hidden panel.
function Letter({ className, last, ...props }: React.ComponentProps<"article"> & { last?: boolean }) {
  return (
    <article
      data-mk="letter"
      data-slot="letter"
      className={cn(
        "min-w-0 border border-border [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:-mx-4 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:border-x-0",
        last &&
          "[@media(max-width:600px)]:in-data-[slot=app-shell-panel]:-mb-4 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

// The subject and kind share a baseline on the table's row height, and a long subject wraps beside the kind.
function LetterHead({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="letter-head"
      className={cn(
        "flex min-w-0 items-baseline justify-between gap-4 border-b border-border px-6 pt-3.5 pb-[13px] [@media(max-width:600px)]:px-4 [@media(max-width:600px)]:pt-3 [@media(max-width:600px)]:pb-[11px]",
        className,
      )}
      {...props}
    />
  );
}

// The subject is a heading, so a screen reader can jump to the writing itself. A letter under a section's title renders
// the level below it.
function LetterSubject({ className, render = <h2 />, ...props }: useRender.ComponentProps<"h2">) {
  return useRender({
    render,
    state: { slot: "letter-subject" },
    props: mergeProps<"h2">(
      { className: cn("min-w-0 text-ui font-medium text-foreground [overflow-wrap:anywhere]", className) },
      props,
    ),
  });
}

// What the writing is and where it comes from, one muted line that stays whole beside the subject.
function LetterKind({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="letter-kind" className={cn("shrink-0 type-instrument text-muted-foreground", className)} {...props} />
  );
}

// The whole body at the reading measure, never clamped. Text keeps the line breaks it was written with, so a plain string
// reads as it was sent; paragraphs passed as elements sit 12 px apart. The measure sits on the content box, in the read
// step's own em, so the padding never eats it. A long address or link wraps, so the letter holds its width.
function LetterBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="letter-body"
      className={cn(
        "box-content max-w-[27.5em] px-6 py-5 type-read whitespace-pre-wrap [overflow-wrap:anywhere] [&>p+p]:mt-3 [@media(max-width:600px)]:p-4",
        className,
      )}
      {...props}
    />
  );
}

// The row under the body: what can be done to the writing at the start, where it came from at the end. The body's bottom
// padding is the gap above it.
function LetterTools({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="letter-tools"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 pb-4 [@media(max-width:600px)]:px-4",
        className,
      )}
      {...props}
    />
  );
}

// The app's buttons. A leading ghost has no edge to line up, so its word takes the text's edge instead of its box: 18 px
// of padding and the 1 px edge it hides.
function LetterActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="letter-actions"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 [&>[data-variant=ghost]:first-child]:-ml-[19px]",
        className,
      )}
      {...props}
    />
  );
}

// A way back to what the writing answers, in the quiet link form. It keeps the row's end when no actions sit beside it.
function LetterSource({ className, href, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    render,
    state: { slot: "letter-source" },
    props: mergeProps<"a">(
      { href, className: cn("ml-auto min-w-0 type-instrument link-quiet [overflow-wrap:anywhere]", className) },
      props,
    ),
  });
}

export { Letter, LetterHead, LetterSubject, LetterKind, LetterBody, LetterTools, LetterActions, LetterSource };
