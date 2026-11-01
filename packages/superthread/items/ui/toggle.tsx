import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

// The button sizes, with a quiet rest and a pressed state of a foreground edge and a tick, never plum. Only ink and
// fill transition; focus snaps on. On a phone it takes the same 44 px hit area as a button.
const toggleVariants = cva(
  "group/toggle relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 [@media(max-width:600px)]:hit-area border border-transparent text-ui font-medium whitespace-nowrap text-foreground transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) select-none not-data-disabled:not-aria-pressed:hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) aria-invalid:border-error aria-pressed:border-foreground data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:text-disabled data-disabled:aria-pressed:border-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-input bg-transparent data-disabled:bg-faint",
      },
      size: {
        default: "h-10 min-w-10 px-4.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        sm: "h-8 min-w-8 gap-2 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-12 min-w-12 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ToggleSize = VariantProps<typeof toggleVariants>["size"];

// The tick after the words. It holds its space at rest, so the words don't move when the toggle turns on. An icon size
// holds one glyph in a square, so its edge alone says pressed, as a pressed toggle's foreground edge does anywhere.
function ToggleTick({ size }: { size?: ToggleSize }) {
  if (size?.startsWith("icon")) return null;
  return <Icon name="check" data-icon="inline-end" className="invisible group-aria-pressed/toggle:visible" />;
}

// A standalone pressed control keeps the outside ring. Disabled outline toggles take the faint stock.
function Toggle({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-mk="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      <ToggleTick size={size} />
    </TogglePrimitive>
  );
}

export { Toggle, ToggleTick, toggleVariants };
