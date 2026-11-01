import * as React from "react";
import { cn } from "@/components/superthread/lib/utils";

import { Icon } from "@/components/superthread/ui/glyphs";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

// The native box owns the same inside focus edge as the select trigger, without a texture.
function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
  return (
    <div
      className={cn("group/native-select relative w-fit", className)}
      data-slot="native-select-wrapper"
      data-mk="native-select"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-10 w-full min-w-0 appearance-none border border-input bg-background px-3 pr-8 text-ui text-foreground select-none [@media(max-width:600px)]:h-11 [@media(max-width:600px)]:data-[size=sm]:h-11 [--fx:var(--ring)] focus:border-(--fx) focus:outline-2 focus:-outline-offset-2 focus:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled data-[size=sm]:h-8"
        {...props}
      />
      <Icon
        name="chevron"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground select-none"
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
