import { Fragment, useEffect, type ReactNode } from "react";
import { mountDocNotes } from "@/components/superthread/lib/doc-notes";
import type { BreathStrength, PlateDraw } from "@/components/superthread/lib/plate-core";
import { toggleTheme, useTheme } from "@/components/superthread/lib/theme";
import { Plate } from "@/components/superthread/ui/plate";
import { Table } from "@/components/superthread/ui/table";
import { Weave } from "@/components/superthread/ui/weave";

type Link = { href: string; label: string };
type IndexEntry = Link & { reference: string; count: string | number };
type OpenerIndexEntry = Link & { count: string | number };
type MetaPart = string | { chip: string };
type Top = {
  brand: Link & { edition: string };
  navLabel: string;
  links: readonly Link[];
};

function DocTop({
  brand,
  navLabel,
  links,
  modeToggle,
  notesToggle = false,
  ruled = false,
}: Top & { modeToggle: boolean; notesToggle?: boolean; ruled?: boolean }) {
  return (
    <div className={ruled ? "top top-ruled" : "top"}>
      <a className="brand" href={brand.href}>
        {brand.label}
        <span>{brand.edition}</span>
      </a>
      <nav aria-label={navLabel}>
        <ul>
          {links.map((link, index) => (
            <li key={index}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          {notesToggle && (
            <li>
              <DocNotesToggle />
            </li>
          )}
          {modeToggle && (
            <li>
              <DocModeToggle />
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export function DocOpener({
  kicker,
  title,
  lede,
  meta,
  index,
  plate = "planes ratios=42,24,18,16 seed=7",
  plateSrc,
  plateDraw,
  breath,
  still = false,
  modeToggle = true,
  notesToggle = true,
  ...top
}: Top & {
  kicker: ReactNode;
  title: string;
  lede: ReactNode;
  meta: readonly MetaPart[];
  index?: readonly OpenerIndexEntry[];
  plate?: string;
  plateSrc?: string;
  plateDraw?: PlateDraw;
  breath?: BreathStrength;
  still?: boolean;
  modeToggle?: boolean;
  notesToggle?: boolean;
}) {
  return (
    <header className="opener">
      <DocTop {...top} ruled modeToggle={modeToggle} notesToggle={notesToggle} />
      <div className="opener-grid">
        <div className="opener-copy">
          <div>
            <p className="opener-kicker">
              <span className="plum-sq" aria-hidden="true" />
              {kicker}
            </p>
            <h1 className="opener-title">{title}</h1>
            <p className="opener-lede">{lede}</p>
          </div>
          <DocMetaLine parts={meta} />
        </div>
        <Plate
          className="opener-plate"
          spec={plate}
          src={plateSrc}
          draw={plateDraw}
          breath={breath}
          still={still}
          aria-hidden="true"
        />
      </div>
      {index && index.length > 0 && (
        <nav className="opener-index" aria-label="Contents">
          {index.map(({ href, label, count }, i) => (
            <a href={href} key={i}>
              <span>{label}</span>
              <span>{count}</span>
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function DocSheetHead({
  kicker,
  title,
  lede,
  meta,
  modeToggle = true,
  notesToggle = true,
  ...top
}: Top & {
  kicker: ReactNode;
  title: string;
  lede: ReactNode;
  meta: readonly MetaPart[];
  modeToggle?: boolean;
  notesToggle?: boolean;
}) {
  return (
    <header className="sheet-head">
      <DocTop {...top} ruled modeToggle={modeToggle} notesToggle={notesToggle} />
      <div className="sheet-head-in">
        <p className="opener-kicker">{kicker}</p>
        <h1 className="sheet-head-title">{title}</h1>
        <p className="opener-lede">{lede}</p>
        <DocMetaLine parts={meta} />
      </div>
    </header>
  );
}

export function DocChapter({
  title,
  caption,
  reference,
  plate = "grid cols=6 rows=4 seed=19",
  plateSrc,
  plateDraw,
  breath,
  still = false,
}: {
  title: string;
  caption: string;
  reference: string;
  plate?: string;
  plateSrc?: string;
  plateDraw?: PlateDraw;
  breath?: BreathStrength;
  still?: boolean;
}) {
  return (
    <div className="chapter">
      <div className="chapter-inner">
        <div className="chapter-copy">
          <div>
            <h2 className="chapter-word">{title}</h2>
            <div className="chapter-bar" aria-hidden="true" />
          </div>
          <p className="chapter-cap">
            <span>{caption}</span>
            <span>{reference}</span>
          </p>
        </div>
        <Plate
          className="chapter-plate"
          spec={plate}
          src={plateSrc}
          draw={plateDraw}
          breath={breath}
          still={still}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

const heroWeave = "run=down fray=arch apex=.24 sides=.45 wobble=2 period=60 ramp=fade thread=2.4 knot=.36 knotr=19.5";

export function DocHero({
  title,
  lede,
  meta,
  contents,
  still = false,
  modeToggle = true,
  ...top
}: Top & {
  title: string;
  lede: ReactNode;
  meta: readonly MetaPart[];
  contents: readonly IndexEntry[];
  still?: boolean;
  modeToggle?: boolean;
}) {
  return (
    <header className="hero">
      <div className="island dark">
        <DocTop {...top} modeToggle={modeToggle} />
        <div className="hero-in">
          <div>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-lede">{lede}</p>
            <DocMetaLine parts={meta} />
          </div>
          <DocContents entries={contents} />
        </div>
      </div>
      <Weave className="hero-weave" spec={`${heroWeave}${still ? "" : " live"} seed=3`} aria-hidden="true" />
    </header>
  );
}

export function DocSlimHead({
  title,
  meta,
  modeToggle = false,
  ...top
}: Top & { title: string; meta: readonly MetaPart[]; modeToggle?: boolean }) {
  return (
    <header className="slim">
      <div className="island dark">
        <DocTop {...top} modeToggle={modeToggle} />
        <div className="slim-in">
          <h1 className="slim-title">{title}</h1>
          <DocMetaLine parts={meta} />
        </div>
      </div>
      <Weave
        className="slim-weave"
        spec="run=down fray=.2 waves=3 amp=3 wobble=1 period=40 ramp=fade thread=3 seed=5"
        aria-hidden="true"
      />
    </header>
  );
}

export function DocBand({
  title,
  caption,
  reference,
  ramp = "held",
}: {
  title: string;
  caption: string;
  reference: string;
  ramp?: "held" | "steady" | "bet" | "fade";
}) {
  return (
    <div className="band">
      <div className="band-solid island dark">
        <h4 className="band-word">{title}</h4>
        <p className="band-caption">
          <span>{caption}</span>
          <span>{reference}</span>
        </p>
      </div>
      <Weave
        className="band-weave"
        spec={`run=right phone=down fray=.06 bow=8 wobble=1.5 period=30 ramp=${ramp} thread=6 seed=11`}
        aria-hidden="true"
      />
    </div>
  );
}

export function DocMetaLine({ parts }: { parts: readonly MetaPart[] }) {
  return (
    <p className="meta">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <span>·</span>}
          {typeof part === "string" ? part : <DocChip>{part.chip}</DocChip>}
        </Fragment>
      ))}
    </p>
  );
}

export function DocContents({ entries }: { entries: readonly IndexEntry[] }) {
  return (
    <nav className="contents" aria-label="Contents">
      <ol>
        {entries.map(({ href, label, reference, count }, index) => (
          <li key={index}>
            <a href={href}>
              <span className="ix-ref">{reference}</span>
              <span className="ix-lead" />
              <span className="ix-name">{label}</span>
              <span className="ix-count">{count}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DocLede({ children }: { children: ReactNode }) {
  return <p className="lede">{children}</p>;
}

export function DocSectionHead({ title, line }: { title: string; line?: ReactNode }) {
  return (
    <div className="sec">
      <h4 className="sec-head">{title}</h4>
      {line != null && <p className="sec-line">{line}</p>}
    </div>
  );
}

export function DocSteps({ steps }: { steps: readonly ReactNode[] }) {
  return (
    <ol className="rules">
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  );
}

export function DocRows({
  rows,
}: {
  rows: readonly { title: ReactNode; reason: ReactNode; status: string; open?: boolean }[];
}) {
  return (
    <ol className="rows">
      {rows.map(({ title, reason, status, open }, index) => (
        <li key={index}>
          <span className="row-title">{title}</span>
          <span className="row-why">{reason}</span>
          <span className={open ? "row-word open" : "row-word"}>{status}</span>
        </li>
      ))}
    </ol>
  );
}

export function DocTimeline({
  events,
}: {
  events: readonly { dateTime: string; date: string; text: ReactNode; open?: boolean }[];
}) {
  return (
    <ol className="timeline">
      {events.map(({ dateTime, date, text, open }, index) => (
        <li key={index}>
          <time dateTime={dateTime}>{date}</time>
          <span className={open ? "dot open" : "dot"} />
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
}

export function DocSources({ sources }: { sources: readonly ReactNode[] }) {
  return (
    <ol className="sources">
      {sources.map((source, index) => (
        <li key={index}>
          <span>{source}</span>
        </li>
      ))}
    </ol>
  );
}

type Claim = {
  reference: string;
  confidence?: string;
  title: string;
  reason: readonly ReactNode[];
  source?: ReactNode;
  figure?: ReactNode;
};

export function DocClaims({ claims }: { claims: readonly Claim[] }) {
  return (
    <ol className="claims">
      {claims.map(({ reference, confidence, title, reason, source, figure }, index) => (
        <li className="claim" key={index}>
          <div className="claim-grid">
            <p className="claim-ref">
              <span>{reference}</span>
              {confidence && <DocChip>{confidence}</DocChip>}
            </p>
            <h4 className="claim-head">{title}</h4>
            <div className="claim-body">
              {reason.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {source != null && <p className="claim-src">{source}</p>}
            </div>
            {figure}
          </div>
        </li>
      ))}
    </ol>
  );
}

type Stat = { value: string | number; unit?: string; label: string; note?: ReactNode };

export function DocStatRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <div className="stats">
      {stats.map(({ value, unit, label, note }, index) => (
        <div className="stat" key={index}>
          <p className="stat-n">
            {value}
            {unit && <small>{unit}</small>}
          </p>
          <p className="stat-label">{label}</p>
          {note != null && <p className="stat-note">{note}</p>}
        </div>
      ))}
    </div>
  );
}

type Column = { label: ReactNode; kind?: "number" | "muted" };

export function DocTable({ columns, rows }: { columns: readonly Column[]; rows: readonly (readonly ReactNode[])[] }) {
  return (
    <Table appearance="document">
      <thead>
        <tr>
          {columns.map(({ label, kind }, index) => (
            <th key={index} className={kind === "number" ? "num" : undefined}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map(({ kind }, index) => (
              <td key={index} className={kind === "number" ? "num" : kind}>
                {row[index]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

type Chart = {
  viewBox: string;
  label: string;
  bars: readonly { x: number; y: number; width: number; height: number; open?: boolean }[];
  axis: readonly string[];
};

export function DocFigure({
  caption,
  chart,
  children,
}: { caption: ReactNode } & ({ chart: Chart; children?: never } | { chart?: never; children: ReactNode })) {
  return (
    <figure className="fig">
      {chart ? (
        <div className="chart">
          <svg viewBox={chart.viewBox} role="img" aria-label={chart.label}>
            {chart.bars.map(({ open, ...rect }, index) => (
              <rect key={index} className={open ? "bar-open" : "bar"} {...rect} />
            ))}
          </svg>
          <p className="chart-axis" aria-hidden="true">
            {chart.axis.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </p>
        </div>
      ) : (
        children
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

type Comparison = { label: string } & (
  { swatch: { pattern: "dots" | "pixels"; label: string }; media?: never } | { swatch?: never; media: ReactNode }
);

export function DocBeforeAndAfter({ before, after }: { before: Comparison; after: Comparison }) {
  return (
    <div className="pair">
      {(["before", "after"] as const).map((stage) => {
        const { label, swatch, media } = stage === "before" ? before : after;
        return (
          <figure className="fig" key={stage}>
            <p className="pair-label">
              <b>{stage === "before" ? "Before" : "After"}</b> · {label}
            </p>
            {swatch ? <div className={`swatch ${swatch.pattern}`} role="img" aria-label={swatch.label} /> : media}
          </figure>
        );
      })}
    </div>
  );
}

export function DocNotice({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="notice" role="note">
      <span className="notice-glyph" aria-hidden="true">
        i
      </span>
      <span className="notice-word">{label}</span>
      <p>{children}</p>
    </div>
  );
}

export function DocDecisions({
  decisions,
}: {
  decisions: readonly { reference: string; status: string; question: string; answer: string; reason: ReactNode }[];
}) {
  return (
    <ol className="decisions">
      {decisions.map(({ reference, status, question, answer, reason }, index) => (
        <li key={index}>
          <span className="n">{reference}</span> <DocChip>{status}</DocChip>
          <h4>{question}</h4>
          <p>
            <b>{answer}</b> {reason}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function DocTranscript({
  entries,
}: {
  entries: readonly { speaker: string; dateTime: string; time: string; text: ReactNode }[];
}) {
  return (
    <dl className="transcript">
      {entries.map(({ speaker, dateTime, time, text }, index) => (
        <div key={index}>
          <dt>
            {speaker}
            <time dateTime={dateTime}>{time}</time>
          </dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DocClosingLine({ children }: { children: ReactNode }) {
  return <p className="closing">{children}</p>;
}

export function DocFooter({ credit, meta }: { credit: ReactNode; meta: ReactNode }) {
  return (
    <footer className="foot">
      <span>{credit}</span>
      <span>{meta}</span>
    </footer>
  );
}

export function DocDraftStrip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="draft-strip">
      <b>{label}</b> · {children}
    </p>
  );
}

export function DocChip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

export function DocModeToggle() {
  const next = useTheme() === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Dark" : "Light";
  return (
    <button className="mode" type="button" data-doc-mode="" aria-label={`Switch to ${next} mode`} onClick={toggleTheme}>
      {label}
    </button>
  );
}

export function DocNotesToggle() {
  useEffect(() => {
    const controller = mountDocNotes(document);
    return () => controller?.destroy();
  }, []);
  return (
    <button className="notes-btn" type="button" data-doc-notes="" aria-label="Open notes">
      Notes
      <span className="notes-count" data-doc-notes-count="">
        0
      </span>
    </button>
  );
}
