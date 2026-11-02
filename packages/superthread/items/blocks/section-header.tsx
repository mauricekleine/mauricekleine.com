import { createContext, useContext, useId } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

const SectionContext = createContext<string | undefined>(undefined);

// A section names itself through its title. The first starts in place; the next leaves 48 px above its head.
// It owns its title's id, so the section keeps its name; pass titleId when the app needs a known id.
function Section({
  className,
  titleId: suppliedTitleId,
  ...props
}: React.ComponentProps<"section"> & { titleId?: string }) {
  const generatedTitleId = useId();
  const titleId = suppliedTitleId ?? generatedTitleId;
  return (
    <SectionContext value={titleId}>
      <section
        data-mk="section-header"
        data-slot="section"
        aria-labelledby={titleId}
        className={cn("mt-12 min-w-0 first:mt-0", className)}
        {...props}
      />
    </SectionContext>
  );
}

// The title, count and way onward share a baseline, then a rule, before the section's content starts. A quiet head
// prints no rule and sits 4 px over its content, its title at the subtitle step or in muted instrument, so a page of
// sections reads as one list of words.
function SectionHeader({
  className,
  quiet,
  ...props
}: React.ComponentProps<"header"> & { quiet?: "subtitle" | "instrument" }) {
  return (
    <header
      data-mk="section-header"
      data-slot="section-header"
      data-quiet={quiet}
      className={cn(
        "group/section-header mb-4 flex flex-wrap items-baseline gap-3 border-b border-foreground pb-3 data-quiet:mb-1 data-quiet:border-b-0 data-quiet:pb-0",
        className,
      )}
      {...props}
    />
  );
}

// The title supplies the section's accessible name without making the app wire ids by hand.
function SectionTitle({ className, ...props }: Omit<React.ComponentProps<"h2">, "id">) {
  const titleId = useContext(SectionContext);
  return (
    <h2
      data-mk="section-header"
      data-slot="section-title"
      className={cn(
        "min-w-0 type-title break-words text-first group-data-[quiet=instrument]/section-header:type-instrument group-data-[quiet=instrument]/section-header:text-muted-foreground group-data-[quiet=subtitle]/section-header:type-subtitle group-data-[quiet=subtitle]/section-header:text-foreground",
        className,
      )}
      {...props}
      id={titleId}
    />
  );
}

// A changing count stays quiet visually and is read out when the collection changes.
function SectionCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-mk="section-header"
      data-slot="section-count"
      aria-live="polite"
      aria-atomic="true"
      className={cn("type-instrument font-mono text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

// The way onward sits at the end of the head as a quiet link; render lets the app supply its own router link.
function SectionAction({ className, children = "more", render = <a />, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    render,
    state: { slot: "section-action", mk: "section-header" },
    props: mergeProps<"a">(
      {
        className: cn(
          "ml-auto inline-flex shrink-0 items-center gap-2 type-instrument link-quiet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)",
          className,
        ),
        children: (
          <>
            <span>{children}</span>
            <Icon name="arrow" />
          </>
        ),
      },
      props,
    ),
  });
}

export { Section, SectionAction, SectionCount, SectionHeader, SectionTitle };
