import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/components/superthread/lib/utils";

// A square track with the input edge and a square thumb. Off, the thumb prints in the input ink at the start; on, the
// track fills in foreground and the thumb crosses to the end in the stock ink on it, so on reads as settled. It
// is a control, not a field: keyboard focus draws the 2 px ring 2 px outside the track. The thumb moves on the
// quick duration; reduced motion moves it at once. No screen: an 18 px track has no room for a ramp, and on is solid.
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-mk="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center border border-input bg-background transition-[background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) hit-area not-data-disabled:hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) aria-invalid:border-error data-[size=default]:h-[18px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-checked:border-foreground data-checked:bg-foreground not-data-disabled:data-checked:hover:border-destructive-hover not-data-disabled:data-checked:hover:bg-destructive-hover data-disabled:cursor-not-allowed data-disabled:border-disabled data-disabled:bg-faint data-disabled:data-checked:border-disabled data-disabled:data-checked:bg-faint",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block translate-x-0.5 bg-input transition-[translate,background-color] duration-(--duration-quick) ease-(--ease-brand) group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3 data-checked:bg-background group-data-disabled/switch:bg-disabled group-data-disabled/switch:data-checked:bg-disabled"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
