import { useId } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)";

// A wrapping row of cited sources at the instrument step: the label, the sources in the order they're cited, and with
// end what closes the line, in mono at its far side: `written 07:00`. The list's box gives way, so all of them wrap as one
// row. On a phone every line is 44 px, so no target's reach lands on another's, and end joins the words in the interface's
// face.
function SourceLine({
  className,
  children,
  end,
  label = "sources",
  ...props
}: React.ComponentProps<"div"> & { end?: React.ReactNode; label?: React.ReactNode }) {
  const labelId = useId();
  return (
    <div
      data-mk="source-line"
      data-slot="source-line"
      className={cn(
        "flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 type-instrument text-muted-foreground [@media(max-width:600px)]:items-center [@media(max-width:600px)]:gap-y-0",
        className,
      )}
      {...props}
    >
      <span id={labelId}>{label}</span>
      <ul role="list" aria-labelledby={labelId} className="contents">
        {children}
      </ul>
      {end != null && (
        <span
          data-slot="source-line-end"
          className="ml-auto min-w-0 font-mono [@media(max-width:600px)]:ml-0 [@media(max-width:600px)]:font-sans"
        >
          {end}
        </span>
      )}
    </div>
  );
}

// One source. With an href or a router link through render it's a link in foreground, underlined at rest as running text
// is, because a citation has to read as something you can open. Without either it's a plain name in the line's ink. On a
// phone a link is its own 44 px box.
function SourceLineItem({ className, href, render, children, ...props }: useRender.ComponentProps<"a">) {
  const source = useRender({
    defaultTagName: "span",
    render: render ?? (href !== undefined ? <a /> : undefined),
    state: { slot: "source-line-item" },
    props: mergeProps<"a">(
      {
        href,
        className: cn(
          "[overflow-wrap:anywhere] decoration-1 underline-offset-4 [&:is(a)]:text-foreground [&:is(a)]:underline [&:is(a)]:hover:text-first [@media(max-width:600px)]:[&:is(a)]:inline-flex [@media(max-width:600px)]:[&:is(a)]:min-h-11 [@media(max-width:600px)]:[&:is(a)]:min-w-11 [@media(max-width:600px)]:[&:is(a)]:items-center",
          FOCUS,
          className,
        ),
        children,
      },
      props,
    ),
  });
  return <li className="min-w-0">{source}</li>;
}

export { SourceLine, SourceLineItem };
