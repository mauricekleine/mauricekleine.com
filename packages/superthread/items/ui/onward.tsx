import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)";

// The way onward from a page, in foreground at the ui step with its arrow: `the week`, and with back `today`, whose
// arrow leads. It underlines on hover, as a chrome link does, and reaches 44 px on a phone through its hit area. Give
// render the app's router link.
function Onward({
  back,
  children,
  className,
  render = <a />,
  ...props
}: useRender.ComponentProps<"a"> & { back?: boolean }) {
  return useRender({
    render,
    state: { slot: "onward", mk: "onward" },
    props: mergeProps<"a">(
      {
        className: cn(
          "relative inline-flex items-center gap-2 type-ui text-foreground decoration-1 underline-offset-4 hover:underline [@media(max-width:600px)]:hit-area",
          FOCUS,
          className,
        ),
        children: back ? (
          <>
            <Icon name="left" />
            <span>{children}</span>
          </>
        ) : (
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

// A door out of a finished place: one line of words with an arrow, 40 px tall and 44 px on a phone, so it is a target
// through its own box. Only the words underline on hover, and they truncate before they wrap. It carries no number.
function Door({ children, className, render = <a />, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    render,
    state: { slot: "door", mk: "onward" },
    props: mergeProps<"a">(
      {
        className: cn(
          "flex h-10 w-fit max-w-full items-center gap-2 type-ui text-foreground decoration-1 underline-offset-4 [@media(max-width:600px)]:h-11",
          FOCUS,
          className,
        ),
        children: (
          <>
            <span className="min-w-0 truncate [a:hover>&]:underline">{children}</span>
            <Icon name="arrow" className="shrink-0" />
          </>
        ),
      },
      props,
    ),
  });
}

export { Door, Onward };
