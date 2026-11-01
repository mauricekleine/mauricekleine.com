import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/components/superthread/lib/utils";

// A flat foreground range on an 8 px ruled track. The 16 px thumbs are square controls with outside focus.
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: SliderPrimitive.Root.Props) {
  const values = value ?? defaultValue ?? [min, max];
  const thumbCount = Array.isArray(values) ? values.length : 1;

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      data-mk="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:cursor-not-allowed data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden border border-input bg-background select-none data-horizontal:h-2 data-horizontal:w-full data-vertical:h-full data-vertical:w-2 data-disabled:border-disabled data-disabled:bg-faint"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-foreground select-none data-horizontal:h-full data-vertical:w-full data-disabled:bg-disabled"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-4 shrink-0 border border-foreground bg-background transition-[background-color,border-color] duration-(--duration-instant) ease-(--ease-brand) select-none hit-area focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-(--ring) not-data-disabled:hover:bg-control-hover data-dragging:bg-control-hover data-disabled:pointer-events-none data-disabled:border-disabled"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
