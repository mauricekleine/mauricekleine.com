import { Badge } from "@/components/superthread/ui/badge";

const states = ["done", "running", "waiting", "failed", "queued"] as const;

// The five run states as the status badge prints them: a dusty ink and its glyph square, failed the one solid.
export function States() {
  return (
    <section aria-label="states" className="st-states">
      <p className="type-meta">states</p>
      <div>
        {states.map((state) => (
          <Badge key={state} variant={state} />
        ))}
      </div>
    </section>
  );
}
