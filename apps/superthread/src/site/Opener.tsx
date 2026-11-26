import { Plate } from "@/components/superthread/ui/plate";

export type OpenerKind = "home" | "slim";

const plateSpecs: Record<string, string> = {
  "/": "planes ratios=42,24,18,16 seed=7",
  "/foundations/colour": "planes ratios=36,26,20,18 seed=11",
  "/foundations/type": "planes ratios=48,22,18,12 seed=23 flip",
  "/foundations/space": "grid cols=6 rows=4 seed=19",
  "/foundations/motion": "planes ratios=16,24,28,32 seed=31",
  "/foundations/marks": "grid cols=8 rows=4 seed=43",
  "/foundations/texture": "grid cols=5 rows=3 seed=59 flip",
  "/install": "planes ratios=30,25,25,20 seed=71",
};

function specFor(kind: OpenerKind, path?: string) {
  if (path && plateSpecs[path]) return plateSpecs[path];
  return kind === "home" ? plateSpecs["/"] : "grid cols=6 rows=4 seed=19";
}

// Stock-first framed split opener: flat typography on the left, a 3.5 px two-ink proof halftone plate on the right,
// separated by uniform 1 px hairlines.
export function Opener({
  kind,
  title,
  lede,
  kicker,
  path,
}: {
  kind: OpenerKind;
  title: string;
  lede: string;
  kicker: string;
  path?: string;
}) {
  return (
    <header id="top" className="st-opener" data-kind={kind}>
      <div className="st-opener-copy">
        <p className="st-opener-kicker">
          <span className="st-opener-sq" aria-hidden="true" />
          {kicker}
        </p>
        <h1>{title}</h1>
        <p className="st-opener-lede type-lede">{lede}</p>
      </div>
      <div className="st-opener-art" aria-hidden="true">
        <Plate spec={specFor(kind, path)} breath="vivid" className="st-opener-plate" />
      </div>
    </header>
  );
}
