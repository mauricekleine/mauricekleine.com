import type { ReactNode } from "react";
import { cn } from "@/components/superthread/lib/utils";

// The same specimen in both modes, side by side: the left pane scoped .light, the right .dark, whatever mode the
// page is in. Each pane re-reads the tokens for its own mode. Below 900 px the panes stack.
export function ModePair({
  children,
  light,
  dark,
  className,
}: {
  // one specimen for both panes, or a different one per pane
  children?: ReactNode;
  light?: ReactNode;
  dark?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("st-modepair", className)}>
      <div className="light st-modepair-pane">
        <p className="type-meta">light</p>
        <div className="st-modepair-body">{light ?? children}</div>
      </div>
      <div className="dark st-modepair-pane">
        <p className="type-meta">dark</p>
        <div className="st-modepair-body">{dark ?? children}</div>
      </div>
    </div>
  );
}
