import { createContext, useContext, useId } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AppShellPanelFoot } from "@/components/superthread/blocks/app-shell";
import { cn } from "@/components/superthread/lib/utils";
import { Paper } from "@/components/superthread/ui/paper";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)";

// A reader, a section or a block names itself through the title inside it, so the app wires no ids. titleId gives the
// app a known one.
const TitleContext = createContext<string | undefined>(undefined);

function useTitleId(supplied?: string) {
  const generated = useId();
  return supplied ?? generated;
}

function useTitle() {
  return useContext(TitleContext);
}

// One page of reading. The reader is a size container, so it answers to its own width and fits a panel or a page. With a
// rail and 640 px to spare, the lead and the rail share the top row in a reading column and 248 px of margin, and all
// else runs the whole width under them; below that it's one column, in source order. The app writes the lead, the wide
// row and the body, then the rail, then the foot, so a keyboard meets them in the order a phone prints them.
function Reader({
  className,
  children,
  titleId: suppliedTitleId,
  ...props
}: React.ComponentProps<"article"> & { titleId?: string }) {
  const titleId = useTitleId(suppliedTitleId);
  return (
    <TitleContext value={titleId}>
      <article
        data-mk="reader"
        data-slot="reader"
        aria-labelledby={titleId}
        className={cn("@container/reader min-w-0", className)}
        {...props}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 @min-[640px]/reader:has-[>[data-slot=reader-rail]]:grid-cols-[minmax(0,1fr)_248px]">
          {children}
        </div>
      </article>
    </TitleContext>
  );
}

// The reading column's top: what the page is, the lead line, and the next action.
function ReaderLead({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="reader-lead" className={cn("col-start-1 row-start-1 min-w-0", className)} {...props} />;
}

// The margin rail beside the lead. It holds what moves around the writing, such as a month or the page's contents, and
// sets its width with the reader. Below the fold it takes its place in the source.
function ReaderRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="reader-rail"
      className={cn(
        "mt-10 min-w-0 @min-[640px]/reader:col-start-2 @min-[640px]/reader:row-start-1 @min-[640px]/reader:mt-0",
        className,
      )}
      {...props}
    />
  );
}

// The date on the line above the lead, and when the writing was written, in mono at the end. The 28 px line sits level
// with a month's head in the rail.
function ReaderHead({
  className,
  written,
  children,
  ...props
}: React.ComponentProps<"p"> & { written?: React.ReactNode }) {
  return (
    <p
      data-slot="reader-head"
      className={cn(
        "flex min-w-0 items-baseline justify-between gap-4 text-instrument leading-7 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="min-w-0">{children}</span>
      {written != null && <span className="shrink-0 font-mono">{written}</span>}
    </p>
  );
}

// The page in one sentence, at the reading sheet's heading step in the first ink. It names the reader. A page whose head
// holds no h1 renders it one level up.
function ReaderLine({ className, render = <h2 />, ...props }: useRender.ComponentProps<"h2">) {
  const titleId = useTitle();
  return useRender({
    render,
    state: { slot: "reader-line" },
    props: mergeProps<"h2">(
      { id: titleId, className: cn("mt-2 min-w-0 type-page text-first text-pretty", className) },
      props,
    ),
  });
}

// What to do next, on the page's one paper. In a working panel the paper hangs 24 px into the margin, so its words keep
// the lead's left edge, and on a phone it runs the panel's whole width. Name it with ReaderNextText and put the one
// action beside it; a long pair wraps, so the action never leaves the paper.
function ReaderNext({
  className,
  children,
  titleId: suppliedTitleId,
  ...props
}: React.ComponentProps<"section"> & { titleId?: string }) {
  const titleId = useTitleId(suppliedTitleId);
  return (
    <TitleContext value={titleId}>
      <Paper
        render={<section aria-labelledby={titleId} {...props} />}
        className={cn(
          "mt-6 py-4 pr-4 pl-6 [@media(max-width:600px)]:mt-4 [@media(max-width:600px)]:in-data-[slot=app-shell-panel]:-mx-(--spacing-panel-inset) [@media(min-width:601px)]:in-data-[slot=app-shell-panel]:-ml-6",
          className,
        )}
      >
        <div
          data-mk="reader"
          data-slot="reader-next"
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
        >
          {children}
        </div>
      </Paper>
    </TitleContext>
  );
}

// The label, which names the block, over the step itself.
function ReaderNextText({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: React.ReactNode }) {
  const titleId = useTitle();
  return (
    <div data-slot="reader-next-text" className={cn("min-w-0 flex-[1_1_10rem]", className)} {...props}>
      <p id={titleId} className="type-instrument text-muted-foreground">
        {label}
      </p>
      <p className="type-subtitle text-pretty">{children}</p>
    </div>
  );
}

// A row at the reader's whole width, for what holds the panel's scale, such as a day line.
function ReaderWide({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="reader-wide"
      className={cn("col-span-full mt-8 min-w-0 [@media(max-width:600px)]:mt-6", className)}
      {...props}
    />
  );
}

// The writing itself: its sections and the closing line.
function ReaderBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="reader-body" className={cn("col-span-full mt-8 min-w-0", className)} {...props} />;
}

function ReaderSection({
  className,
  titleId: suppliedTitleId,
  ...props
}: React.ComponentProps<"section"> & { titleId?: string }) {
  const titleId = useTitleId(suppliedTitleId);
  return (
    <TitleContext value={titleId}>
      <section
        data-slot="reader-section"
        aria-labelledby={titleId}
        className={cn("min-w-0 not-first:mt-12 [@media(max-width:600px)]:not-first:mt-8", className)}
        {...props}
      />
    </TitleContext>
  );
}

// A section's title sits a level under the lead line. Under a page's h2 sections, render it a level down.
function ReaderSectionTitle({ className, render = <h3 />, ...props }: useRender.ComponentProps<"h3">) {
  const titleId = useTitle();
  return useRender({
    render,
    state: { slot: "reader-section-title" },
    props: mergeProps<"h3">({ id: titleId, className: cn("min-w-0 type-title text-first", className) }, props),
  });
}

// A paragraph at the read step, on the reading measure. A plain anchor in it is running text, through the panel's link
// rule.
function ReaderText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="reader-text"
      className={cn("mt-3 max-w-[27.5em] type-read text-pretty in-data-[slot=reader-block]:mt-2", className)}
      {...props}
    />
  );
}

// The closing line. It tells the reader the page is finished, so a reading page prints exactly one, last.
function ReaderEnd({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-mk="reader"
      data-slot="reader-end"
      className={cn("mt-12 type-lede text-muted-foreground italic [@media(max-width:600px)]:mt-8", className)}
      {...props}
    />
  );
}

// The ways on from the page, under a rule: back at the start, onward at the end. It's the panel's foot, so it comes last
// in the panel and reaches the sheet's edges and its bottom.
function ReaderFoot({ className, ...props }: React.ComponentProps<typeof AppShellPanelFoot>) {
  return (
    <AppShellPanelFoot
      data-mk="reader"
      data-slot="reader-foot"
      className={cn("col-span-full mt-6 justify-between [@media(max-width:600px)]:mt-4", className)}
      {...props}
    />
  );
}

// One sentence for the room: the thing to raise before a meeting, or what was agreed after it. It sits on the paper under
// the meeting's title, and its measure takes that paper's width.
function ReaderRaised({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: React.ReactNode }) {
  return (
    <div
      data-mk="reader"
      data-slot="reader-raised"
      className={cn("mt-4 min-w-0 [@media(max-width:600px)]:mt-3", className)}
      {...props}
    >
      <p className="type-instrument text-muted-foreground">{label}</p>
      <p className="max-w-[32em] type-lede text-pretty">{children}</p>
    </div>
  );
}

// A meeting brief's small blocks under its paper, two to a row at 640 px of their own width and one below it. It answers
// to itself, so it needs no reader around it.
function ReaderBlocks({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-mk="reader"
      data-slot="reader-blocks"
      className={cn("@container/reader-blocks mt-5 min-w-0 first:mt-0", className)}
      {...props}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-5 @min-[640px]/reader-blocks:grid-cols-[repeat(2,minmax(0,1fr))]">
        {children}
      </div>
    </div>
  );
}

// A labelled block. Its ink reaches everything in it that has no ink of its own, so asWritten turns a block that says
// what was written before the meeting muted, whatever it holds.
function ReaderBlock({
  className,
  asWritten,
  titleId: suppliedTitleId,
  ...props
}: React.ComponentProps<"section"> & { asWritten?: boolean; titleId?: string }) {
  const titleId = useTitleId(suppliedTitleId);
  return (
    <TitleContext value={titleId}>
      <section
        data-slot="reader-block"
        aria-labelledby={titleId}
        className={cn("min-w-0", asWritten ? "text-muted-foreground" : "text-foreground", className)}
        {...props}
      />
    </TitleContext>
  );
}

function ReaderBlockTitle({ className, render = <h3 />, ...props }: useRender.ComponentProps<"h3">) {
  const titleId = useTitle();
  return useRender({
    render,
    state: { slot: "reader-block-title" },
    props: mergeProps<"h3">(
      { id: titleId, className: cn("min-w-0 type-instrument text-muted-foreground", className) },
      props,
    ),
  });
}

const QUIET = "min-w-0 text-instrument leading-(--text-ui--line-height) text-muted-foreground";

// Who's in the room. Names, notes and sightings share their columns across rows: the names as wide as the longest, to
// half the block, the notes the room left, the sightings as wide as they need.
function ReaderWho({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="reader-who"
      className={cn("mt-1 grid min-w-0 grid-cols-[fit-content(50%)_minmax(0,1fr)_auto] gap-x-3", className)}
      {...props}
    />
  );
}

// One person: their name, a note on who they are, and where they were last seen, which holds its mono column. A name
// alone takes the row. A long note wraps rather than cuts, because the note is why the row is there.
function ReaderPerson({
  className,
  note,
  seen,
  children,
  ...props
}: React.ComponentProps<"li"> & { note?: React.ReactNode; seen?: React.ReactNode }) {
  return (
    <li
      data-slot="reader-person"
      className={cn(
        "col-span-full grid min-w-0 grid-cols-subgrid items-baseline py-1 type-ui [&>:only-child]:col-span-full [@media(max-width:600px)]:py-3",
        className,
      )}
      {...props}
    >
      <span className="min-w-11">{children}</span>
      {note != null && <span className={QUIET}>{note}</span>}
      {seen != null && <span className={cn(QUIET, "col-start-3 text-right font-mono")}>{seen}</span>}
    </li>
  );
}

// What's owed, in either direction.
function ReaderOwed({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="reader-owed" className={cn("mt-1 min-w-0", className)} {...props} />;
}

// One thing owed and when, which holds its end in mono. With an href or a router link through render the whole row is one
// link and only its words underline; without either it's a plain line. On a phone when drops under the words in the
// interface's face, and a link stays 44 px with nothing under it.
function ReaderOwedRow({
  className,
  href,
  render,
  when,
  children,
  ...props
}: useRender.ComponentProps<"a"> & { when?: React.ReactNode }) {
  const row = useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "reader-owed-row" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-1 type-ui [@media(max-width:600px)]:min-h-11 [@media(max-width:600px)]:grid-cols-[minmax(0,1fr)] [@media(max-width:600px)]:content-center [@media(max-width:600px)]:py-2",
          FOCUS,
          className,
        ),
        children: (
          <>
            <span className="min-w-0 decoration-1 underline-offset-4 [a:hover>&]:underline">{children}</span>
            {when != null && (
              <span
                className={cn(
                  QUIET,
                  "justify-self-end text-right font-mono [@media(max-width:600px)]:justify-self-start [@media(max-width:600px)]:text-left [@media(max-width:600px)]:font-sans [@media(max-width:600px)]:leading-(--text-instrument--line-height)",
                )}
              >
                {when}
              </span>
            )}
          </>
        ),
      },
      props,
    ),
  });
  return <li className="min-w-0">{row}</li>;
}

// A block with nothing to say prints what it can't say, in the same place a first row would sit: `not in the record`.
function ReaderGap({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="reader-gap" className={cn("mt-1 py-1 type-ui text-muted-foreground", className)} {...props} />;
}

export {
  Reader,
  ReaderLead,
  ReaderRail,
  ReaderHead,
  ReaderLine,
  ReaderNext,
  ReaderNextText,
  ReaderWide,
  ReaderBody,
  ReaderSection,
  ReaderSectionTitle,
  ReaderText,
  ReaderEnd,
  ReaderFoot,
  ReaderRaised,
  ReaderBlocks,
  ReaderBlock,
  ReaderBlockTitle,
  ReaderWho,
  ReaderPerson,
  ReaderOwed,
  ReaderOwedRow,
  ReaderGap,
};
