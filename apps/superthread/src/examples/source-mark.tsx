import { SourceMark } from "@/components/superthread/ui/source-mark";

// Drawings for the page's fictional sources, in 16 cells with two frames each. A ship keeps its own marks: real ones never
// go in this public registry.
export const marks = {
  mail: {
    d: "M1 3h14v1h-14zM1 4h2v1h-2zM13 4h2v1h-2zM1 5h1v7h-1zM3 5h2v1h-2zM11 5h2v1h-2zM14 5h1v7h-1zM5 6h2v1h-2zM9 6h2v1h-2zM7 7h2v1h-2zM1 12h14v1h-14z",
    hover:
      "M7 2h2v1h-2zM5 3h2v1h-2zM9 3h2v1h-2zM3 4h2v1h-2zM11 4h2v1h-2zM1 5h2v1h-2zM13 5h2v1h-2zM1 6h1v1h-1zM14 6h1v1h-1zM1 7h2v1h-2zM13 7h2v1h-2zM1 8h1v4h-1zM3 8h2v1h-2zM11 8h2v1h-2zM14 8h1v4h-1zM5 9h2v1h-2zM9 9h2v1h-2zM7 10h2v1h-2zM1 12h14v1h-14z",
  },
  calendar: {
    d: "M3 2h2v1h-2zM11 2h2v1h-2zM1 3h14v2h-14zM1 5h1v7h-1zM14 5h1v7h-1zM4 6h2v2h-2zM7 6h2v2h-2zM10 6h2v2h-2zM4 9h2v2h-2zM7 9h2v2h-2zM10 9h2v2h-2zM1 12h14v1h-14z",
    hover:
      "M3 2h2v1h-2zM11 2h2v1h-2zM1 3h14v2h-14zM1 5h1v7h-1zM14 5h1v7h-1zM4 6h2v2h-2zM7 6h2v2h-2zM10 6h2v2h-2zM4 9h2v2h-2zM10 9h2v2h-2zM1 12h14v1h-14z",
  },
  card: {
    d: "M1 3h14v1h-14zM1 4h1v1h-1zM14 4h1v1h-1zM1 5h14v2h-14zM1 7h1v5h-1zM14 7h1v5h-1zM3 9h1v1h-1zM5 9h1v1h-1zM7 9h1v1h-1zM4 10h1v1h-1zM6 10h1v1h-1zM11 10h2v1h-2zM1 12h14v1h-14z",
    hover:
      "M1 3h14v1h-14zM1 4h1v1h-1zM14 4h1v1h-1zM1 5h14v2h-14zM1 7h1v5h-1zM14 7h1v5h-1zM3 9h6v2h-6zM11 10h2v1h-2zM1 12h14v1h-14z",
  },
  phone: {
    d: "M3 2h3v1h-3zM2 3h5v1h-5zM2 4h6v1h-6zM2 5h5v1h-5zM2 6h4v1h-4zM3 7h3v1h-3zM3 8h4v1h-4zM4 9h4v1h-4zM5 10h4v1h-4zM11 10h2v1h-2zM6 11h9v1h-9zM7 12h8v1h-8zM9 13h5v1h-5zM11 14h2v1h-2z",
    hover:
      "M3 2h3v1h-3zM10 2h3v1h-3zM2 3h5v1h-5zM12 3h2v1h-2zM2 4h6v1h-6zM13 4h2v1h-2zM2 5h5v1h-5zM10 5h2v1h-2zM14 5h1v2h-1zM2 6h4v1h-4zM11 6h2v1h-2zM3 7h3v1h-3zM12 7h1v1h-1zM3 8h4v1h-4zM4 9h4v1h-4zM5 10h4v1h-4zM11 10h2v1h-2zM6 11h9v1h-9zM7 12h8v1h-8zM9 13h5v1h-5zM11 14h2v1h-2z",
  },
  chat: {
    d: "M2 3h12v1h-12zM2 4h1v6h-1zM13 4h1v6h-1zM5 6h2v2h-2zM9 6h2v2h-2zM2 10h12v1h-12zM5 11h3v1h-3zM5 12h2v1h-2zM5 13h1v1h-1z",
    hover:
      "M2 3h12v1h-12zM2 4h1v6h-1zM13 4h1v6h-1zM5 5h2v2h-2zM9 6h2v2h-2zM2 10h12v1h-12zM5 11h3v1h-3zM5 12h2v1h-2zM5 13h1v1h-1z",
  },
  notes: {
    d: "M4 4h9v2h-9zM4 6h3v6h-3zM10 6h3v6h-3z",
    hover: "M4 4h9v2h-9zM4 6h3v6h-3zM10 6h3v6h-3zM4 13h9v1h-9z",
  },
  files: {
    d: "M1 3h6v1h-6zM1 4h1v3h-1zM6 4h1v1h-1zM6 5h9v1h-9zM14 6h1v1h-1zM1 7h14v1h-14zM1 8h1v4h-1zM14 8h1v4h-1zM1 12h14v1h-14z",
    hover:
      "M1 3h6v1h-6zM1 4h1v6h-1zM6 4h1v1h-1zM6 5h9v1h-9zM14 6h1v1h-1zM4 7h11v1h-11zM3 8h1v2h-1zM14 8h1v1h-1zM13 9h1v1h-1zM1 10h2v2h-2zM12 10h2v1h-2zM12 11h1v1h-1zM1 12h11v1h-11z",
  },
} as const;

// Every drawing, each with its second frame under the pointer.
export function SourceMarksExample() {
  return (
    <ul className="st-marks-sheet">
      {Object.entries(marks).map(([name, frames]) => (
        <li key={name} className="st-marks-cell">
          <SourceMark d={frames.d} hover={frames.hover} />
          <span className="st-glyphs-name">
            <code>{name}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}

// Both frames at rest: the first as drawn and the second held up.
export function SourceMarkFrames() {
  return (
    <ul className="st-marks-sheet">
      <li className="st-marks-cell">
        <SourceMark d={marks.phone.d} hover={marks.phone.hover} />
        <span className="st-glyphs-name">
          <code>at rest</code>
        </span>
      </li>
      <li className="st-marks-cell">
        <SourceMark d={marks.phone.d} hover={marks.phone.hover} held />
        <span className="st-glyphs-name">
          <code>held</code>
        </span>
      </li>
    </ul>
  );
}
