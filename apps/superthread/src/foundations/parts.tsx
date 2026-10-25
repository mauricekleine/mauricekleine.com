import type { ReactNode } from "react";
import { cn } from "@/components/superthread/lib/utils";

// A section's few lines of prose, in the muted ink at the summary step.
export function Copy({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("st-f-copy", className)}>{children}</p>;
}

// One ink as a value: a 16 px chip inside a 1 px edge, its hex in mono, and an optional note under it. The chip
// takes `color` when given (a token var, so it re-inks with its pane), else the hex itself.
export function Ink({ hex, note, color }: { hex: string; note?: ReactNode; color?: string }) {
  return (
    <span className="st-f-ink">
      <i style={{ background: color ?? hex }} aria-hidden="true" />
      <code>{hex}</code>
      {note !== undefined && <small>{note}</small>}
    </span>
  );
}

// A legend over a specimen: mono caps in the muted ink.
export function Legend({ children }: { children: ReactNode }) {
  return <p className="st-f-legend type-meta">{children}</p>;
}
