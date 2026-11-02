import * as React from "react";
import { cn } from "@/components/superthread/lib/utils";

const CODE_TEXT = { autoCapitalize: "off", autoComplete: "off", autoCorrect: "off", spellCheck: false };

// A field whose box is its own text control, as the input is: focus thickens the 1 px edge to 2 px inside the box,
// in --fx (the ring's ink, or the error ink when invalid), the caret follows, and the text never moves. It grows with
// its words from three lines. Disabled: never focused, a flat fill and the edge screened back. At 600 px and below it
// sets 16 on 24, so iOS Safari never zooms the page in on focus, and its lines grow with the line. kind="code" is the
// form for json and keys: mono at the instrument step, and at 16 on 24 on a phone like every field, five lines tall at
// either size, its line breaks kept and a long line wrapped anywhere, so nothing scrolls sideways, and the browser
// leaves the text as typed.
function Textarea({ className, kind, ...props }: React.ComponentProps<"textarea"> & { kind?: "code" }) {
  return (
    <textarea
      data-slot="textarea"
      data-mk="textarea"
      data-kind={kind}
      {...(kind === "code" && CODE_TEXT)}
      className={cn(
        "flex field-sizing-content min-h-[calc(3lh+20px)] w-full resize-none border border-input bg-background px-3 py-[9px] text-ui leading-5 text-foreground [@media(max-width:600px)]:text-[16px] [@media(max-width:600px)]:leading-6 caret-(--fx) [--fx:var(--ring)] placeholder:text-muted-foreground focus:border-(--fx) focus:outline-2 focus:-outline-offset-2 focus:outline-(--fx) aria-invalid:border-error aria-invalid:[--fx:var(--error)] disabled:cursor-not-allowed disabled:bg-faint disabled:text-disabled texture-disabled",
        kind === "code" && "min-h-[calc(5lh+20px)] font-mono text-instrument [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
