import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "@/components/superthread/lib/utils";

// The bar sits above its meter: a 12 px track with a 1 px edge, and an 8 px fill at a 1 px inset. The meter's label
// and value read below it in 13/20, the value in mono.
function Progress({ className, children, value, ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      data-mk="progress"
      className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-2.5", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative order-first flex h-3 w-full items-center overflow-hidden border border-input p-px",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

// A flat foreground fill whose leading 24 px is the 24 x 8 ramp (texture-ramp, one of the five places). A
// finished bar has no leading edge, so it prints solid. Width travels at the brand ease, and reduced motion zeroes
// the duration, so the bar steps. max-h holds the fill to 8 px against Base UI's inline height: inherit.
function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "h-2 max-h-2 texture-ramp transition-[width] duration-(--duration-travel) ease-(--ease-brand) data-complete:[mask:none]",
        className,
      )}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-instrument text-muted-foreground", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn("ml-auto font-mono text-instrument text-muted-foreground tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  );
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue };
