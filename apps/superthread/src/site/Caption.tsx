import { places } from "../../../../packages/superthread/texture/places.json";
import { tokens } from "@/components/superthread/lib/tokens";
import { cn } from "@/components/superthread/lib/utils";

// a component detail, from the tokens
export type DetailKey = (typeof tokens.texture.details)[number]["key"];

// one of the five places the world screens, from the package's place captions (the progress edge is `ramp`). JSON
// types its keys as plain strings, so an unknown key throws while the page prerenders instead of failing the type check.
export type PlaceKey = (typeof places)[number]["key"];

const captions: readonly { key: string; detail: string; job: string }[] = [...tokens.texture.details, ...places];

// A screen's caption: its name, then the one line that says what the screen is for, from the package by key.
export function Caption({ detail, className }: { detail: DetailKey | PlaceKey; className?: string }) {
  const entry = captions.find((candidate) => candidate.key === detail);
  if (!entry) throw new Error(`no texture caption has the key "${detail}"`);
  return (
    <p className={cn("st-caption", className)}>
      <span className="type-meta">{entry.detail}</span>
      <span>{entry.job}</span>
    </p>
  );
}
