import type { ReactNode } from "react";
import { Icon, StatusGlyph, type IconName, type StatusState } from "@/components/superthread/ui/glyphs";

// Every glyph the set draws, and what each 14-cell glyph marks (null for a 12-cell icon). Keyed by IconName, so a
// glyph added to the generated set fails the type check here until this page shows it.
const marks: Record<IconName, string | null> = {
  arrow: null,
  left: null,
  copy: null,
  check: null,
  chevron: null,
  search: null,
  close: null,
  trash: null,
  plus: null,
  tick: "done",
  i: "running",
  pause: "waiting",
  cross: "failed",
  dash: "queued",
  bang: "a field to fix",
};

// each status square and the glyph it knocks out, in the order a board reads them
const squares: Record<StatusState, IconName> = {
  done: "tick",
  running: "i",
  waiting: "pause",
  failed: "cross",
  queued: "dash",
};

const names = Object.keys(marks) as IconName[];
const icons = names.filter((name) => marks[name] === null);
const glyphs = names.filter((name) => marks[name] !== null);

// one cell of the sheet: the shape at 2x, then at its own size beside its name and what it marks
function Cell({ big, small, name, note }: { big: ReactNode; small: ReactNode; name: string; note?: string }) {
  return (
    <li className="st-glyphs-cell">
      <span className="st-glyphs-big">{big}</span>
      <span className="st-glyphs-name">
        {small}
        <code>{name}</code>
      </span>
      {note && <span className="st-glyphs-note">{note}</span>}
    </li>
  );
}

// The 12-cell icons that controls carry, drawn in the current colour.
export function IconsExample() {
  return (
    <ul className="st-glyphs-sheet">
      {icons.map((name) => (
        <Cell key={name} name={name} big={<Icon name={name} className="st-glyphs-x2" />} small={<Icon name={name} />} />
      ))}
    </ul>
  );
}

// The 14-cell status squares, each in its state's glyph ink with its glyph knocked out, then the bare glyphs.
export function StatusGlyphsExample() {
  return (
    <>
      <ul className="st-glyphs-sheet">
        {(Object.keys(squares) as StatusState[]).map((state) => (
          <Cell
            key={state}
            name={state}
            note={squares[state]}
            big={<StatusGlyph state={state} className="st-glyphs-x2" />}
            small={<StatusGlyph state={state} />}
          />
        ))}
      </ul>
      <ul className="st-glyphs-sheet">
        {glyphs.map((name) => (
          <Cell
            key={name}
            name={name}
            note={marks[name] ?? undefined}
            big={<Icon name={name} className="st-glyphs-x2" />}
            small={<Icon name={name} />}
          />
        ))}
      </ul>
    </>
  );
}
