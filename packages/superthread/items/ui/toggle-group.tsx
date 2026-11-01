import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/components/superthread/lib/utils";

import { ToggleTick, toggleVariants } from "@/components/superthread/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
});

// Joined by default; a positive spacing gives each toggle its own edge and outside ring.
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-mk="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

// Shared edges overlap by 1 px. The pressed edge rises above its neighbour; joined focus draws inside. On a phone a joined
// item's box reaches 44 px along the group, since a hit area there would take taps from its neighbour. The item renders
// the primitive itself, so it draws the tick a Toggle draws.
function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "relative shrink-0 focus-visible:z-20 aria-pressed:z-10",
        context.spacing === 0 && "focus-visible:-outline-offset-2",
        context.spacing === 0 &&
          (context.orientation === "vertical"
            ? "not-first:-mt-px [@media(max-width:600px)]:min-h-11"
            : "not-first:-ml-px [@media(max-width:600px)]:min-w-11"),
        className,
      )}
      {...props}
    >
      {children}
      <ToggleTick size={context.size || size} />
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
