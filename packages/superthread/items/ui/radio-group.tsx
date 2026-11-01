import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "@/components/superthread/lib/utils";

// A grid of square choices, with 12 px between controls. On a phone bare controls sit 44 px apart, so their hit areas
// never overlap; a choice in a field or a label takes its row's 44 px from the field item.
function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-mk="radio-group"
      className={cn("grid w-full gap-3 [@media(max-width:600px)]:has-[>[role=radio]]:gap-[26px]", className)}
      {...props}
    />
  );
}

// An 18 px stock box; chosen, its foreground edge encloses an 8 px foreground square. Focus sits outside the box.
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex size-[18px] shrink-0 items-center justify-center border border-input bg-background hit-area focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) data-checked:border-foreground aria-invalid:border-error data-disabled:cursor-not-allowed data-disabled:border-disabled data-disabled:bg-faint data-disabled:data-checked:border-disabled",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center">
        <span className="size-2 bg-foreground group-data-disabled/radio-group-item:bg-disabled" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
