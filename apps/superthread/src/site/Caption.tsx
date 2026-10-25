import { tokens } from "@/components/superthread/lib/tokens";
import { cn } from "@/components/superthread/lib/utils";

export type DetailKey = (typeof tokens.texture.details)[number]["key"];

// A texture detail's caption: its name, then the one line that says what the screen is for, from the tokens.
export function Caption({ detail, className }: { detail: DetailKey; className?: string }) {
  const entry = tokens.texture.details.find((candidate) => candidate.key === detail);
  if (!entry) return null;
  return (
    <p className={cn("st-caption", className)}>
      <span className="type-meta">{entry.detail}</span>
      <span>{entry.job}</span>
    </p>
  );
}
