import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

// The button sizes, with a quiet rest and a boxed current state. Only ink and fill transition; focus snaps on.
const toggleVariants = cva(
  "group/toggle relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 border border-transparent text-ui font-medium whitespace-nowrap text-foreground transition-[color,background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) select-none not-data-disabled:not-aria-pressed:hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) aria-invalid:border-error aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:text-accent-foreground data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// A standalone pressed control keeps the outside house ring. Disabled outline toggles take the faint stock.
function Toggle({
  className,
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
    />
  );
}

export { Toggle, toggleVariants };
