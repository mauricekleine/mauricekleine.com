import * as React from "react";
import { cn } from "@/components/superthread/lib/utils";

import { Icon } from "@/components/superthread/ui/glyphs";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
  variant?: "default" | "quiet";
};

const selectVariants = {
  default:
    "h-10 w-full min-w-0 appearance-none border border-input bg-background px-3 pr-8 text-ui text-foreground select-none [@media(max-width:600px)]:h-11 [@media(max-width:600px)]:data-[size=sm]:h-11 [--fx:var(--ring)] focus:border-(--fx) focus:outline-2 focus:-outline-offset-2 focus:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled data-[size=sm]:h-8",
  quiet:
    "h-11 w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-6 pl-2 text-right [text-align-last:right] text-ui text-muted-foreground select-none hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) disabled:cursor-not-allowed disabled:text-disabled",
};

// The native box owns the same inside focus edge as the select trigger, without a texture. The quiet form is a muted
// word and its chevron for a scope beside a list: no box at rest, right-aligned, 44 px at every width whatever its size.
// Keyboard focus draws one edge inside its 44 px. That box hangs 4 px past the column, so the chevron ends on the
// column's edge and the focus edge clears it. Disabled prints both inks disabled.
function NativeSelect({ className, size = "default", variant = "default", ...props }: NativeSelectProps) {
  return (
    <div
      className={cn("group/native-select relative w-fit", variant === "quiet" && "-mr-1", className)}
      data-slot="native-select-wrapper"
      data-mk="native-select"
      data-size={size}
      data-variant={variant}
    >
      <select data-slot="native-select" data-size={size} className={selectVariants[variant]} {...props} />
      <Icon
        name="chevron"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground select-none group-data-[variant=quiet]/native-select:right-1 group-data-[variant=quiet]/native-select:group-has-[select:disabled]/native-select:text-disabled"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

// Native options keep the platform menu semantics on the role inks.
function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return (
    <option data-slot="native-select-option" className={cn("bg-background text-foreground", className)} {...props} />
  );
}

// Group names stay native so the platform keeps its own option navigation.
function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-background text-foreground", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
