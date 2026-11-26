import {
  DocBand,
  DocBeforeAndAfter,
  DocChapter,
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
  DocNotesToggle,
  DocNotice,
  DocOpener,
  DocRows,
  DocSectionHead,
  DocSheetHead,
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
  // #region opener
  opener: (
    <DocOpener
      brand={{ href: "#", label: "Maurice Kleine", edition: "Report" }}
      navLabel="Sections"
      links={[
        { href: "#findings", label: "Findings" },
        { href: "#plan", label: "Plan" },
      ]}
      kicker="superthread · Report · 26 Nov 2026"
      title="Flat where you read, printed where you look."
      lede="One framed 3.5 px proof halftone plate beside clean typography, separated by uniform 1 px hairlines."
      meta={["Project", "Report", { chip: "Draft" }, "26 Nov 2026"]}
      plate="planes ratios=42,24,18,16 seed=7"
      index={[
        { href: "#findings", label: "Findings", count: "03" },
        { href: "#plan", label: "Plan", count: "04" },
        { href: "#open", label: "Open", count: "02" },
        { href: "#sources", label: "Sources", count: "05" },
      ]}
    />
  ),
  // #endregion
  // #region sheet-head
  "sheet-head": (
    <DocSheetHead
      brand={{ href: "#", label: "Orbit", edition: "RFC 0001" }}
      navLabel="Sections"
      links={[
        { href: "#summary", label: "Summary" },
        { href: "#design", label: "Design" },
      ]}
      kicker="Orbit · RFC 0001 · 26 Nov 2026"
      title="Units, one runner for every agent, step and workflow."
      lede="Every event lands in one queue, passes one gate, and leaves through one outbox."
      meta={["RFC", { chip: "Draft" }, "26 Nov 2026"]}
    />
  ),
  // #endregion
  // #region chapter
  chapter: <DocChapter title="Findings" caption="What holds" reference="03" plate="grid cols=6 rows=4 seed=19" />,
  // #endregion
  // #region hero
  hero: (
    <DocHero
      brand={{ href: "#", label: "Maurice Kleine", edition: "Sections" }}
      navLabel="Groups"
      links={[
        { href: "#openers", label: "Openers" },
        { href: "#lines", label: "Lines" },
        { href: "#blocks", label: "Blocks" },
        { href: "#endings", label: "Endings" },
      ]}
      title="The parts of a page."
      lede="Every section the kit's templates are made of, live in light and dark, each with its markup. Copy the markup, keep the classes, change the words."
      meta={["superthread", "@mk/doc", { chip: "Draft" }, "20 Nov 2026"]}
      contents={[
        { href: "#openers", reference: "[O]", label: "Openers", count: "03" },
        { href: "#lines", reference: "[L]", label: "Lines", count: "08" },
        { href: "#blocks", reference: "[B]", label: "Blocks", count: "08" },
        { href: "#endings", reference: "[E]", label: "Endings", count: "03" },
      ]}
    />
  ),
  // #endregion
  // #region slim-head
  "slim-head": (
    <DocSlimHead
      brand={{ href: "#", label: "Maurice Kleine", edition: "Brief" }}
      navLabel="Sections"
      links={[
        { href: "#", label: "Needs you" },
        { href: "#", label: "Today" },
      ]}
      title="Friday, 20 November"
      meta={["Brief", "07:00"]}
    />
  ),
  // #endregion
  // #region band
  band: <DocBand title="Findings" caption="What holds" reference="03" />,
  // #endregion
  // #region meta-line
  "meta-line": <DocMetaLine parts={["Project", "Report", { chip: "Draft" }, "20 Nov 2026"]} />,
  // #endregion
  // #region contents
  contents: (
    <DocContents
      entries={[
        { href: "#", reference: "[F]", label: "Findings", count: "03" },
        { href: "#", reference: "[P]", label: "Plan", count: "04" },
      ]}
    />
  ),
  // #endregion
  // #region lede
  lede: (
    <DocLede>
      A lede says what the section holds and why it matters, before the first claim. It reads in a breath.
    </DocLede>
  ),
  // #endregion
  // #region section-head
  "section-head": <DocSectionHead title="The work" line="One muted line under the head." />,
  // #endregion
  // #region steps
  steps: (
    <DocSteps
      steps={[
        "Write the spec, so the next change has something to agree with.",
        "Build the part once, where every surface can install it.",
      ]}
    />
  ),
  // #endregion
  // #region rows
  rows: (
    <DocRows
      rows={[
        { title: "Publish the brief", reason: "One source still needs a link.", status: "Failed", open: true },
        {
          title: "Back up to the second disk",
          reason: "The 02:10 run failed and the 02:40 retry closed it.",
          status: "Done",
        },
      ]}
    />
  ),
  // #endregion
  // #region timeline
  timeline: (
    <DocTimeline
      events={[
        { dateTime: "2026-11-20", date: "20 Nov", text: "The first draft lands." },
        { dateTime: "2026-11-30", date: "30 Nov", text: "The report goes out.", open: true },
      ]}
    />
  ),
  // #endregion
  // #region sources
  sources: (
    <DocSources
      sources={[
        <>
          <a href="https://superthread.mauricekleine.com/">superthread.mauricekleine.com</a> · The design system
        </>,
        "packages/superthread/DESIGN.md · The values and rules",
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
          confidence: "High",
          title: "A claim is one sentence you could defend.",
          reason: ["The reason beside it says why it holds, in two or three sentences."],
          source: "Where it comes from · path/to/file.ts:42",
        },
      ]}
    />
  ),
  // #endregion
  // #region stat-row
  "stat-row": (
    <DocStatRow
      stats={[
        { value: 3, label: "Steps", note: "Each one ships on its own" },
        { value: 2, label: "Repos", note: "The site and the CLI" },
        { value: 0, label: "New tokens", note: "The values already hold" },
      ]}
    />
  ),
  // #endregion
  // #region table
  table: (
    <DocTable
      columns={[
        { label: "Step" },
        { label: "What" },
        { label: "Where", kind: "muted" },
        { label: "Days", kind: "number" },
      ]}
      rows={[
        ["Spec", "The rules, written as they are", "The design doc", 2],
        ["Part", "One item every surface installs", "The registry", 3],
      ]}
    />
  ),
  // #endregion
  // #region figure
  figure: (
    <DocFigure
      caption="Fig. 1 · Open items per week"
      chart={{
        viewBox: "0 0 800 200",
        label: "Open items per week: 10, 7, 5, and 3 planned",
        bars: [
          { x: 20, y: 0, width: 140, height: 200 },
          { x: 220, y: 60, width: 140, height: 140 },
          { x: 420, y: 100, width: 140, height: 100 },
          { x: 621, y: 141, width: 138, height: 58, open: true },
        ],
        axis: ["Week 1", "Week 2", "Week 3", "Week 4"],
      }}
    />
  ),
  // #endregion
  // #region before-and-after
  "before-and-after": (
    <DocBeforeAndAfter
      before={{ label: "Round dots", swatch: { pattern: "dots", label: "A field of round dots" } }}
      after={{
        label: "Square pixels",
        swatch: { pattern: "pixels", label: "A field of 2 px square pixels in a checker" },
      }}
    />
  ),
  // #endregion
  // #region notice
  notice: <DocNotice label="Heads up">The count includes open items through Friday.</DocNotice>,
  // #endregion
  // #region decisions
  decisions: (
    <DocDecisions
      decisions={[
        {
          reference: "01",
          status: "Open",
          question: "Ship the part before every surface can take it?",
          answer: "Yes.",
          reason: "The part improves faster with one user than with none.",
        },
        {
          reference: "02",
          status: "Decided",
          question: "Keep both drafts in the contents?",
          answer: "No.",
          reason: "The contents link to the version readers can use.",
        },
      ]}
    />
  ),
  // #endregion
  // #region transcript
  transcript: (
    <DocTranscript
      entries={[
        { speaker: "Alex", dateTime: "PT4M12S", time: "00:04:12", text: "The first week gives us a baseline." },
        { speaker: "Sam", dateTime: "PT4M31S", time: "00:04:31", text: "Put that count next to the forecast." },
      ]}
    />
  ),
  // #endregion
  // #region closing-line
  "closing-line": <DocClosingLine>That's all for today.</DocClosingLine>,
  // #endregion
  // #region footer
  footer: <DocFooter credit="superthread · Documents" meta="Report · Draft · 20 Nov 2026" />,
  // #endregion
  // #region draft-strip
  "draft-strip": <DocDraftStrip label="Draft">Still being shaped · 20 Nov 2026</DocDraftStrip>,
  // #endregion
  // #region chip
  chip: <DocChip>Draft</DocChip>,
  // #endregion
  // #region mode-toggle
  "mode-toggle": <DocModeToggle />,
  // #endregion
  // #region notes-toggle
  "notes-toggle": <DocNotesToggle />,
  // #endregion
};
