import { PageHeader, PageHeaderTitle } from "@/components/superthread/blocks/page-header";
import { FitTitle } from "@/components/superthread/ui/fit-title";

export const SHORT_TITLE = "reply to sam about chapter 7";
export const MEDIAN_TITLE = "reply to sam about the chapter 7 notes and say when the next draft goes up";
const DECK_TITLE =
  "check whether the deck for thursday's review still matches the numbers sam sent after the last call";
export const LONG_TITLE =
  "check whether the deck for thursday's review still matches the numbers sam sent after the last call, and fix the ones that moved, then send the whole thing back to the three people who asked for it";

// A held box at a fixed width, so the page prints the same fit whatever its column does.
function Box({ width, height = 176, title }: { width: number; height?: number; title: string }) {
  return (
    <div className="st-fit-box" style={{ width, height, maxWidth: "100%" }}>
      <FitTitle render={<h3 />}>{title}</FitTitle>
    </div>
  );
}

// One box, three titles: the words pick the step.
export function FitTitleByWords() {
  return (
    <div className="st-fit-stack">
      <Box width={480} title={SHORT_TITLE} />
      <Box width={480} title={DECK_TITLE} />
      <Box width={480} title={LONG_TITLE} />
    </div>
  );
}

// One title, three widths.
export function FitTitleByWidth() {
  return (
    <div className="st-fit-stack">
      <Box width={560} title={MEDIAN_TITLE} />
      <Box width={420} title={MEDIAN_TITLE} />
      <Box width={320} title={MEDIAN_TITLE} />
    </div>
  );
}

// The foot of the ladder runs out, so the title cuts at a word, and the link takes the reader to all of it.
export function FitTitleCut() {
  return (
    <div className="st-fit-box" style={{ width: 340, height: 176, maxWidth: "100%" }}>
      <FitTitle render={<h3 />} href="#the-cut">
        {LONG_TITLE}
      </FitTitle>
    </div>
  );
}

// A page header takes lines in place of a held box, and a shorter ladder, so the page keeps its own title's size.
export function FitTitleInHeader() {
  return (
    <PageHeader>
      <PageHeaderTitle>
        <FitTitle render={<span />} lines={3} steps={["section", "long"]}>
          {LONG_TITLE}
        </FitTitle>
      </PageHeaderTitle>
    </PageHeader>
  );
}
