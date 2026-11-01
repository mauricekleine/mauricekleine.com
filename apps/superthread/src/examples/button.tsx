import type { ReactNode } from "react";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";

type Mode = "light" | "dark";

// A specimen with its note under it, in mono, as the world prints a state.
export function Specimen({ note, children }: { note: ReactNode; children: ReactNode }) {
  return (
    <span className="st-b-specimen">
      {children}
      <span className="st-b-note">{note}</span>
    </span>
  );
}

const variants = [
  { variant: "default", word: "publish" },
  { variant: "secondary", word: "save draft" },
  { variant: "outline", word: "preview" },
  { variant: "ghost", word: "cancel" },
  { variant: "destructive", word: "delete" },
  { variant: "key", word: "open in orbit" },
  { variant: "link", word: "read the log" },
] as const;

export function ButtonVariants() {
  return (
    <div className="st-b-row st-b-specimens">
      {variants.map(({ variant, word }) => (
        <Specimen key={variant} note={variant}>
          <Button variant={variant}>{word}</Button>
        </Specimen>
      ))}
    </div>
  );
}

// The world's notes for each state: light overprints key on the ink, and dark's default takes the outline's states.
const notes = {
  light: { hover: "+ key 20", pressed: "+ key 36, inset", outline: "key 5", destructive: "key 88" },
  dark: { hover: "paper 1", pressed: "paper 3", outline: "paper 1", destructive: "paper 60" },
} as const;

// Printed states: data-demo draws each from the button's own classes, so they are specimens, not controls, and
// stay out of the tab order. The disabled buttons below them are real ones.
export function ButtonStates({ mode }: { mode: Mode }) {
  const note = notes[mode];
  return (
    <>
      <div className="st-b-row st-b-specimens">
        <Specimen note={note.hover}>
          <Button size="sm" data-demo="hover" tabIndex={-1}>
            hover
          </Button>
        </Specimen>
        <Specimen note={note.pressed}>
          <Button size="sm" data-demo="active" tabIndex={-1}>
            pressed
          </Button>
        </Specimen>
        <Specimen note="2 px ring, 2 px out">
          <Button size="sm" data-demo="focus-visible" tabIndex={-1}>
            focus
          </Button>
        </Specimen>
        <Specimen note={note.outline}>
          <Button size="sm" variant="outline" data-demo="hover" tabIndex={-1}>
            hover
          </Button>
        </Specimen>
        <Specimen note={note.destructive}>
          <Button size="sm" variant="destructive" data-demo="hover" tabIndex={-1}>
            hover
          </Button>
        </Specimen>
        <Specimen note={note.destructive}>
          <Button size="sm" variant="key" data-demo="hover" tabIndex={-1}>
            hover
          </Button>
        </Specimen>
      </div>
      <div className="st-b-row st-b-specimens">
        {(["default", "secondary", "outline"] as const).map((variant) => (
          <Specimen key={variant} note={`${variant}, disabled`}>
            <Button variant={variant} disabled>
              publish
            </Button>
          </Specimen>
        ))}
      </div>
    </>
  );
}

const textSizes = [
  { size: "xs", note: "xs · 24" },
  { size: "sm", note: "sm · 32" },
  { size: "default", note: "default · 40" },
  { size: "lg", note: "lg · 48" },
] as const;

const iconSizes = [
  { size: "icon-xs", note: "icon-xs" },
  { size: "icon-sm", note: "icon-sm" },
  { size: "icon", note: "icon" },
  { size: "icon-lg", note: "icon-lg" },
] as const;

export function ButtonSizes() {
  return (
    <>
      <div className="st-b-row st-b-specimens">
        {textSizes.map(({ size, note }) => (
          <Specimen key={size} note={note}>
            <Button size={size} variant="outline">
              preview
            </Button>
          </Specimen>
        ))}
      </div>
      <div className="st-b-row st-b-specimens">
        {iconSizes.map(({ size, note }) => (
          <Specimen key={size} note={note}>
            <Button size={size} variant="outline" aria-label="add a run">
              <Icon name="plus" />
            </Button>
          </Specimen>
        ))}
      </div>
    </>
  );
}
