import { Badge } from "@/components/superthread/ui/badge";
import { Specimen } from "./button";

const states = ["done", "running", "waiting", "failed", "queued"] as const;

export function BadgeStates() {
  return (
    <div className="st-b-row">
      {states.map((state) => (
        <Badge key={state} variant={state} />
      ))}
    </div>
  );
}

// A status badge keeps its glyph and takes the word it is given.
const words = [
  { state: "done", word: "shipped" },
  { state: "running", word: "3 running" },
  { state: "waiting", word: "needs review" },
  { state: "failed", word: "2 failed" },
  { state: "queued", word: "next up" },
] as const;

export function BadgeWords() {
  return (
    <div className="st-b-row">
      {words.map(({ state, word }) => (
        <Badge key={state} variant={state}>
          {word}
        </Badge>
      ))}
    </div>
  );
}

// sm is 24 px, the height of an xs button, for a row's aside.
export function BadgeSizes() {
  return (
    <>
      <div className="st-b-row">
        {states.map((state) => (
          <Badge key={state} size="sm" variant={state} />
        ))}
      </div>
      <div className="st-b-row">
        <Badge size="sm">new</Badge>
        <Badge size="sm" variant="secondary">
          draft
        </Badge>
        <Badge size="sm" variant="outline">
          beta
        </Badge>
      </div>
    </>
  );
}

const variants = [
  { variant: "default", word: "new" },
  { variant: "secondary", word: "draft" },
  { variant: "outline", word: "beta" },
  { variant: "ghost", word: "archived" },
  { variant: "destructive", word: "removed" },
  { variant: "link", word: "changelog" },
] as const;

export function BadgeVariants() {
  return (
    <div className="st-b-row st-b-specimens">
      {variants.map(({ variant, word }) => (
        <Specimen key={variant} note={variant}>
          <Badge variant={variant}>{word}</Badge>
        </Specimen>
      ))}
    </div>
  );
}
