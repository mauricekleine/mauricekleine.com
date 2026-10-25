import { chromes, markUrl, type MarkId } from "./marks";
import type { Mode } from "./master";

// the 16 x 16 grid the marks are drawn on: a line between every two cells, none on the outer edge
const grid = Array.from({ length: 15 }, (_, i) => `M${i + 1} 0V16M0 ${i + 1}H16`).join("");

// A mark drawn large, at whole cells (11 px wide, 9 px on a phone), with its grid laid over it so each pixel of
// the 16 px original reads as a cell.
export function MarkDrawing({ id, mode, label }: { id: MarkId; mode: Mode; label: string }) {
  return (
    <div className="st-f-drawing">
      <img src={markUrl(id, mode)} alt={label} width={176} height={176} />
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d={grid} />
      </svg>
    </div>
  );
}

// The true 16 px mark on the four browser chromes it meets as a favicon: the light mark on light chrome, the dark
// mark on dark.
export function MarkChromes({ id }: { id: MarkId }) {
  return (
    <ul className="st-f-chromes" aria-label="16 px on light strip, light tab, dark strip and dark tab">
      {chromes.map((chrome) => (
        <li key={chrome.name} style={{ background: chrome.color }} title={chrome.name}>
          <img src={markUrl(id, chrome.mode)} alt="" width={16} height={16} />
        </li>
      ))}
    </ul>
  );
}
