import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/components/superthread/lib/utils";

// A field whose box is its own text control. Focus thickens the 1 px edge to 2 px inside the box, in --fx: the
// house ink, or the error ink when the field is invalid (the caret follows). Nothing outside the box draws, so the
// text never moves. Disabled: never focused, a flat fill and the edge screened back.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-mk="input"
      className={cn(
        "h-10 w-full min-w-0 border border-input bg-background px-3 text-ui text-foreground caret-(--fx) [--fx:var(--primary)] placeholder:text-muted-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-ui file:font-medium file:text-foreground focus:border-(--fx) focus:outline-2 focus:-outline-offset-2 focus:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled texture-disabled",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
