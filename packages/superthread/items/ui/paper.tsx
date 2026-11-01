import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/components/superthread/lib/utils";

// The one white block on a page, in every theme. It is a .light island on the card fill, so everything inside reads the
// light roles: on a dark page a default button fills with plum and the ring takes the deep value. Its own root still
// reads the page's mode, and texture-contact keys on that. On a light page, white on white, it lifts by the slip rake
// with its screened contact edge. On a dark page the white is its edge, so it prints flat, which is why no shadow-slip
// sits beside the utility. It stays positioned and never clips, or the contact edge goes. Render a section when the block
// names itself.
function Paper({ className, render = <div />, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    render,
    state: { slot: "paper", mk: "paper" },
    props: mergeProps<"div">(
      {
        className: cn(
          "light relative min-w-0 bg-card p-6 text-card-foreground texture-contact [--contact-lift:var(--elevation-slip-rake)] [@media(max-width:600px)]:p-4",
          className,
        ),
      },
      props,
    ),
  });
}

export { Paper };
