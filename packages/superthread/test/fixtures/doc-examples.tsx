import {
  DocBand,
  DocBeforeAndAfter,
  DocChip,
  DocClaims,
  DocClosingLine,
  DocContents,
  DocDecisions,
  DocDraftStrip,
  DocFigure,
  DocFooter,
  DocHero,
  DocLede,
  DocMetaLine,
  DocModeToggle,
  DocNotice,
  DocRows,
  DocSectionHead,
  DocSlimHead,
  DocSources,
  DocStatRow,
  DocSteps,
  DocTable,
  DocTimeline,
  DocTranscript,
} from "@/components/superthread/ui/doc-react";

// The docs show these JSX regions beside the HTML. The same examples render in the parity test and clean room.
export const docExamples = {
  // #region hero
  hero: (
    <DocHero
      brand={{ href: "#", label: "maurice kleine", edition: "sections" }}
      navLabel="groups"
      links={[
        { href: "#openers", label: "openers" },
        { href: "#lines", label: "lines" },
        { href: "#blocks", label: "blocks" },
        { href: "#endings", label: "endings" },
      ]}
      title="the parts of a page."
      lede="every section the kit's templates are made of, live in light and dark, each with its markup. copy the markup, keep the classes, change the words."
      meta={["superthread", "@mk/doc", { chip: "draft" }, "20 nov 2026"]}
      contents={[
        { href: "#openers", reference: "[o]", label: "openers", count: "03" },
        { href: "#lines", reference: "[l]", label: "lines", count: "08" },
        { href: "#blocks", reference: "[b]", label: "blocks", count: "08" },
        { href: "#endings", reference: "[e]", label: "endings", count: "03" },
      ]}
    />
  ),
  // #endregion
  // #region slim-head
  "slim-head": (
    <DocSlimHead
      brand={{ href: "#", label: "maurice kleine", edition: "brief" }}
      navLabel="sections"
      links={[
        { href: "#", label: "needs you" },
        { href: "#", label: "today" },
      ]}
      title="friday, 20 november"
      meta={["brief", "07:00"]}
    />
  ),
  // #endregion
  // #region band
  band: <DocBand title="findings" caption="what holds" reference="03" />,
  // #endregion
  // #region meta-line
  "meta-line": <DocMetaLine parts={["project", "report", { chip: "draft" }, "20 nov 2026"]} />,
  // #endregion
  // #region contents
  contents: (
    <DocContents
      entries={[
        { href: "#", reference: "[f]", label: "findings", count: "03" },
        { href: "#", reference: "[p]", label: "plan", count: "04" },
      ]}
    />
  ),
  // #endregion
  // #region lede
  lede: (
    <DocLede>
      a lede says what the section holds and why it matters, before the first claim. it reads in a breath.
    </DocLede>
  ),
  // #endregion
  // #region section-head
  "section-head": <DocSectionHead title="the work" line="one muted line under the head." />,
  // #endregion
  // #region steps
  steps: (
    <DocSteps
      steps={[
        "write the spec, so the next change has something to agree with.",
        "build the part once, where every surface can install it.",
      ]}
    />
  ),
  // #endregion
  // #region rows
  rows: (
    <DocRows
      rows={[
        { title: "publish the brief", reason: "one source still needs a link.", status: "failed", open: true },
        {
          title: "back up to the second disk",
          reason: "the 02:10 run failed and the 02:40 retry closed it.",
          status: "done",
        },
      ]}
    />
  ),
  // #endregion
  // #region timeline
  timeline: (
    <DocTimeline
      events={[
        { dateTime: "2026-11-20", date: "20 nov", text: "the first draft lands." },
        { dateTime: "2026-11-30", date: "30 nov", text: "the report goes out.", open: true },
      ]}
    />
  ),
  // #endregion
  // #region sources
  sources: (
    <DocSources
      sources={[
        <>
          <a href="https://superthread.mauricekleine.com/">superthread.mauricekleine.com</a> · the design system
        </>,
        "packages/superthread/DESIGN.md · the values and rules",
      ]}
    />
  ),
  // #endregion
  // #region claim
  claim: (
    <DocClaims
      claims={[
        {
          reference: "01",
          confidence: "high",
          title: "a claim is one sentence you could defend.",
          reason: ["the reason beside it says why it holds, in two or three sentences."],
          source: "where it comes from · path/to/file.ts:42",
        },
      ]}
    />
  ),
  // #endregion
  // #region stat-row
  "stat-row": (
    <DocStatRow
      stats={[
        { value: 3, label: "steps", note: "each one ships on its own" },
        { value: 2, label: "repos", note: "the site and the cli" },
        { value: 0, label: "new tokens", note: "the values already hold" },
      ]}
    />
  ),
  // #endregion
  // #region table
  table: (
    <DocTable
      columns={[
        { label: "step" },
        { label: "what" },
        { label: "where", kind: "muted" },
        { label: "days", kind: "number" },
      ]}
      rows={[
        ["spec", "the rules, written as they are", "the design doc", 2],
        ["part", "one item every surface installs", "the registry", 3],
      ]}
    />
  ),
  // #endregion
  // #region figure
  figure: (
    <DocFigure
      caption="fig. 1 · open items per week"
      chart={{
        viewBox: "0 0 800 200",
        label: "open items per week: 10, 7, 5, and 3 planned",
        bars: [
          { x: 20, y: 0, width: 140, height: 200 },
          { x: 220, y: 60, width: 140, height: 140 },
          { x: 420, y: 100, width: 140, height: 100 },
          { x: 621, y: 141, width: 138, height: 58, open: true },
        ],
        axis: ["week 1", "week 2", "week 3", "week 4"],
      }}
    />
  ),
  // #endregion
  // #region before-and-after
  "before-and-after": (
    <DocBeforeAndAfter
      before={{ label: "round dots", swatch: { pattern: "dots", label: "a field of round dots" } }}
      after={{
        label: "square pixels",
        swatch: { pattern: "pixels", label: "a field of 2 px square pixels in a checker" },
      }}
    />
  ),
  // #endregion
  // #region notice
  notice: <DocNotice label="heads up">the count includes open items through friday.</DocNotice>,
  // #endregion
  // #region decisions
  decisions: (
    <DocDecisions
      decisions={[
        {
          reference: "01",
          status: "open",
          question: "ship the part before every surface can take it?",
          answer: "yes.",
          reason: "the part improves faster with one user than with none.",
        },
        {
          reference: "02",
          status: "decided",
          question: "keep both drafts in the contents?",
          answer: "no.",
          reason: "the contents link to the version readers can use.",
        },
      ]}
    />
  ),
  // #endregion
  // #region transcript
  transcript: (
    <DocTranscript
      entries={[
        { speaker: "alex", dateTime: "PT4M12S", time: "00:04:12", text: "the first week gives us a baseline." },
        { speaker: "sam", dateTime: "PT4M31S", time: "00:04:31", text: "put that count next to the forecast." },
      ]}
    />
  ),
  // #endregion
  // #region closing-line
  "closing-line": <DocClosingLine>that's all for today.</DocClosingLine>,
  // #endregion
  // #region footer
  footer: <DocFooter credit="superthread · documents" meta="report · draft · 20 nov 2026" />,
  // #endregion
  // #region draft-strip
  "draft-strip": <DocDraftStrip label="draft">still being shaped · 20 nov 2026</DocDraftStrip>,
  // #endregion
  // #region chip
  chip: <DocChip>draft</DocChip>,
  // #endregion
  // #region mode-toggle
  "mode-toggle": <DocModeToggle />,
  // #endregion
};
