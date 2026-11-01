import type { ReactNode } from "react";
import { cn } from "@/components/superthread/lib/utils";

// A page section: a 1 px rule that runs across the whole column, then the heading and the body on the 64/44 rhythm
// (64 px above the rule, 44 below it). Its id is the anchor the aside's "on this page" links to; list the same id
// and title in the route's staticData.sections.
export function Section({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const heading = `${id}-title`;
  return (
    <section id={id} aria-labelledby={heading} className={cn("st-section", className)}>
      <h2 id={heading} className="type-section text-first">
        {title}
      </h2>
      {children}
    </section>
  );
}
