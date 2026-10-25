import { cn } from "@/components/superthread/lib/utils";

// A small mono keycap on muted stock; in a tooltip it takes the inverted ink without translucent fills.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      data-mk="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 border border-border bg-muted px-1 font-mono text-[11px] leading-none text-muted-foreground select-none in-data-[slot=tooltip-content]:border-muted-foreground in-data-[slot=tooltip-content]:bg-foreground in-data-[slot=tooltip-content]:text-background [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

// Shortcut keys stay together with 4 px between their individual boxes.
function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <kbd data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

export { Kbd, KbdGroup };
