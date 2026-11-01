import * as React from "react";
import { cn } from "@/components/superthread/lib/utils";

// A field whose box is its own text control, as the input is: focus thickens the 1 px edge to 2 px inside the box,
// in --fx (the ring's ink, or the error ink when invalid), the caret follows, and the text never moves. It grows with
// its words from three lines. Disabled: never focused, a flat fill and the edge screened back.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      data-mk="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full resize-none border border-input bg-background px-3 py-[9px] text-ui leading-5 text-foreground caret-(--fx) [--fx:var(--ring)] placeholder:text-muted-foreground focus:border-(--fx) focus:outline-2 focus:-outline-offset-2 focus:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled texture-disabled",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
