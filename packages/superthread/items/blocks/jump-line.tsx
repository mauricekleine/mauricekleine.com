import type { ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

// A line of anchors to a long page's sections, near its head. It wraps; a phone drops the dots and gives each anchor a
// 44 px row.
function JumpLine({ className, children, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-mk="jump-line"
      data-slot="jump-line"
      aria-label="on this page"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ul className="flex list-none flex-wrap items-baseline [@media(max-width:600px)]:gap-x-4">{children}</ul>
    </nav>
  );
}

// One section: its name, then how many it holds in muted mono, so the line reads as the page's contents. render takes
// the app's router link. The dot belongs to the item, so a section the app leaves out takes its dot with it, and the
// last item hides its own. A screen reader skips it. Drop count while a filter holds the page, since the figure would
// no longer say what the section shows.
function JumpLineLink({
  className,
  children,
  count,
  render,
  ...props
}: useRender.ComponentProps<"a"> & { count?: ReactNode }) {
  const link = useRender({
    defaultTagName: "a",
    render,
    state: { slot: "jump-line-link", mk: "jump-line" },
    props: mergeProps<"a">(
      {
        className: cn(
          "group/jump-line-link whitespace-nowrap text-ui text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [@media(max-width:600px)]:inline-flex [@media(max-width:600px)]:min-h-11 [@media(max-width:600px)]:min-w-11 [@media(max-width:600px)]:items-center [@media(max-width:600px)]:gap-1",
          className,
        ),
        children: (
          <>
            <span className="decoration-1 underline-offset-4 group-hover/jump-line-link:underline">{children}</span>
            {count !== undefined && (
              <>
                {" "}
                <span data-slot="jump-line-count" className="type-instrument font-mono text-muted-foreground">
                  {count}
                </span>
              </>
            )}
          </>
        ),
      },
      props,
    ),
  });
  return (
    <li data-slot="jump-line-item" className="group/jump-line-item">
      {link}
      <span
        aria-hidden="true"
        data-slot="jump-line-dot"
        className="mx-2 text-muted-foreground group-last/jump-line-item:hidden [@media(max-width:600px)]:hidden"
      >
        ·
      </span>
    </li>
  );
}

export { JumpLine, JumpLineLink };
