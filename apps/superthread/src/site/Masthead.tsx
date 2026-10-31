import { Link } from "@tanstack/react-router";
import { useEntry } from "./layout";
import { MobileNav } from "./MobileNav";
import { Search } from "./Search";

declare const __BUILD_DATE__: string;
declare const __SUPERTHREAD_VERSION__: string;

// The superthread mark, inked from the tokens so it follows the mode: the first ink (key in light, paper-white in
// dark), the stock knocked out of it, and the house spot. The same 16 x 16 cells as /marks/superthread/.
export function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="st-mark"
    >
      <path
        style={{ fill: "var(--first)" }}
        d="M1 0h14v1h-14zM0 1h7v1h-7zM8 1h8v1h-8zM0 2h5v1h-5zM11 2h5v1h-5zM0 3h4v1h-4zM6 3h1v1h-1zM8 3h2v1h-2zM12 3h4v1h-4zM0 4h3v1h-3zM4 4h3v1h-3zM8 4h4v1h-4zM13 4h3v1h-3zM0 5h2v1h-2zM4 5h2v1h-2zM10 5h2v1h-2zM14 5h2v1h-2zM0 6h2v1h-2zM3 6h2v1h-2zM11 6h2v1h-2zM14 6h2v1h-2zM0 7h1v1h-1zM15 7h1v1h-1zM0 8h2v1h-2zM3 8h2v1h-2zM11 8h2v1h-2zM14 8h2v1h-2zM0 9h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM14 9h2v1h-2zM0 10h2v1h-2zM4 10h2v1h-2zM10 10h2v1h-2zM14 10h2v1h-2zM0 11h3v1h-3zM4 11h3v1h-3zM8 11h4v1h-4zM13 11h3v1h-3zM0 12h4v1h-4zM6 12h1v1h-1zM8 12h2v1h-2zM12 12h4v1h-4zM0 13h5v1h-5zM11 13h5v1h-5zM0 14h7v1h-7zM8 14h8v1h-8zM1 15h14v1h-14z"
      />
      <path
        style={{ fill: "var(--background)" }}
        d="M7 1h1v1h-1zM5 2h6v1h-6zM4 3h2v1h-2zM7 3h1v1h-1zM10 3h2v1h-2zM3 4h1v1h-1zM7 4h1v1h-1zM12 4h1v1h-1zM2 5h2v1h-2zM6 5h3v1h-3zM12 5h2v1h-2zM2 6h1v1h-1zM5 6h1v1h-1zM7 6h1v1h-1zM9 6h1v1h-1zM13 6h1v1h-1zM1 7h14v1h-14zM2 8h1v1h-1zM5 8h1v1h-1zM7 8h1v1h-1zM9 8h1v1h-1zM13 8h1v1h-1zM2 9h1v1h-1zM6 9h3v1h-3zM10 9h1v1h-1zM13 9h1v1h-1zM2 10h2v1h-2zM7 10h1v1h-1zM9 10h1v1h-1zM12 10h2v1h-2zM3 11h1v1h-1zM7 11h1v1h-1zM12 11h1v1h-1zM4 12h2v1h-2zM7 12h1v1h-1zM10 12h2v1h-2zM5 13h6v1h-6zM7 14h1v1h-1z"
      />
      <path
        style={{ fill: "var(--primary)" }}
        d="M9 5h1v1h-1zM6 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM6 8h1v1h-1zM8 8h1v1h-1zM10 8h1v1h-1zM5 9h1v1h-1zM9 9h1v1h-1zM6 10h1v1h-1zM8 10h1v1h-1z"
      />
    </svg>
  );
}

// where the page sits: the system for the overview, install and the not-found page, its section otherwise
function crumbFor(section: string) {
  return section === "overview" || section === "icons" || section === "install" ? "superthread" : section;
}

// The masthead's cells, left to right: the mark and wordmark, the crumb and the search, the system's name, version
// and build date, and the house swatch. At 900 px and below it becomes the top bar: the wordmark, the menu and the
// swatch, with the search on its own row.
export function Masthead() {
  const entry = useEntry();
  return (
    <header className="st-mast">
      <Link to="/" className="st-brand">
        <Mark />
        superthread
      </Link>
      <div className="st-crumb">
        <span className="type-meta">{crumbFor(entry.section)}</span>
        <span className="type-meta" aria-hidden="true">
          /
        </span>
        <b>{entry.title}</b>
      </div>
      <Search className="st-mast-search" />
      <dl className="st-meta">
        <dt className="type-meta">system</dt>
        <dd>superthread</dd>
        <dt className="type-meta">version</dt>
        <dd>{__SUPERTHREAD_VERSION__}</dd>
        <dt className="type-meta">date</dt>
        <dd>{__BUILD_DATE__}</dd>
      </dl>
      <div className="st-mast-menu">
        <MobileNav />
      </div>
      <div className="st-house" role="img" aria-label="the house ink: plum" title="the house ink: plum">
        <i />
      </div>
    </header>
  );
}
