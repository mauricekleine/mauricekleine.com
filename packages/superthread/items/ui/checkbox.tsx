import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "@/components/superthread/lib/utils";

import { Icon } from "@/components/superthread/ui/glyphs";

// A square box with the input edge. Checked fills it in foreground; mixed (some, not all) keeps the stock fill inside
// a foreground edge and prints foreground at 50 percent (texture-mixed). It is a control, not a field: keyboard focus
// draws the 2 px ring 2 px outside it.
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-mk="checkbox"
      className={cn(
        "peer relative flex size-[18px] shrink-0 items-center justify-center border border-input bg-background texture-mixed after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) aria-invalid:border-error data-checked:border-foreground data-checked:bg-foreground data-checked:text-background data-indeterminate:border-foreground data-disabled:cursor-not-allowed data-disabled:data-checked:border-input data-disabled:data-checked:bg-faint data-disabled:data-checked:text-disabled data-disabled:not-data-checked:bg-faint",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current data-indeterminate:hidden"
      >
        <Icon name="check" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
