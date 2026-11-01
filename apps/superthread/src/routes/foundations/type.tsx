import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { tokens } from "@/components/superthread/lib/tokens";
import { Copy } from "@/foundations/parts";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/type")({
  staticData: {
    sections: [
      { id: "faces", title: "faces" },
      { id: "steps", title: "steps" },
      { id: "links", title: "links" },
    ],
  },
  component: Page,
});

type Family = "display" | "sans" | "serif" | "mono";

// the four faces in the order the system reaches for them, each with its job and a line to set it in
const families: readonly { name: string; family: Family; role: string; use: string; sample: string }[] = [
  {
    name: "Unbounded",
    family: "display",
    role: "display",
    use: "titles, section heads and the board, at 300 in the first ink; the wordmark at 400",
    sample: "runs this week",
  },
  {
    name: "Supreme",
    family: "sans",
    role: "ui",
    use: "controls, tables, notes and the body of these pages, at 400 and 500",
    sample: "3 of 5 runs done, 2 queued",
  },
  {
    name: "Erode",
    family: "serif",
    role: "reading",
    use: "the reading page, ledes and page titles, from 400 to 600",
    sample: "a slow page, set for reading",
  },
  {
    name: "Fragment Mono",
    family: "mono",
    role: "mono",
    use: "ids, times, figures that hold a column, code and the caps legends",
    sample: "run 7f3a2c · 00:04:12",
  },
];

const faceName: Record<Family, string> = {
  display: "unbounded",
  sans: "supreme",
  serif: "erode",
  mono: "fragment mono",
};

type Step = keyof typeof tokens.type.steps;

// each step's utility, written out so Tailwind finds every class in this source
const stepClass = {
  meta: "type-meta",
  instrument: "type-instrument",
  ui: "type-ui",
  summary: "type-summary",
  subtitle: "type-subtitle",
  read: "type-read",
  lede: "type-lede",
  title: "type-title",
  section: "type-section",
  page: "type-page",
  hero: "type-hero",
  display: "type-display",
} as const satisfies Record<Step, string>;

const stepSample: Record<Step, string> = {
  meta: "queued · 3 runs",
  instrument: "updated four minutes ago",
  ui: "deploy the board to orbit",
  summary: "three runs are waiting on review",
  subtitle: "rename this board",
  read: "the reading column sets erode at nineteen on thirty-two, about sixty-six characters to the line, so a long page stays easy to follow.",
  lede: "a page opens with one short paragraph that says what it is for.",
  title: "fleet status",
  section: "ship spots",
  page: "notes on dithering",
  hero: "runs",
  display: "fleet",
};

type StepSpec = {
  readonly size: number;
  readonly line: number;
  readonly tracking?: string;
  readonly caps?: boolean;
  readonly family: Family;
  readonly weight: number;
  readonly phone?: { readonly size: number; readonly line: number };
};

const steps = Object.entries(tokens.type.steps) as [Step, StepSpec][];
const phoneSteps = steps.filter(([, spec]) => spec.phone).map(([name]) => name);

function spec({ size, line, tracking, caps, family, weight }: StepSpec): string {
  return [`${size}/${line}`, faceName[family], String(weight), tracking, caps ? "caps" : undefined]
    .filter(Boolean)
    .join(" · ");
}

function Page() {
  return (
    <>
      <PageHead
        title="type"
        lede="four faces, each with one job: unbounded for display, supreme for the interface, erode for reading and fragment mono for ids, times, code and any figure that holds a column."
      />

      <Section id="faces" title="faces">
        <Copy>{tokens.fonts.faces.length} files in all. each line below is set in the cut it names.</Copy>
        <ul className="st-f-faces">
          {families.map(({ name, family, role, use, sample }) => (
            <li key={name}>
              <div className="st-f-face-head">
                <span className="type-meta">{role}</span>
                <b style={{ fontFamily: `var(--font-${family})` }}>{name.toLowerCase()}</b>
                <small>{use}</small>
              </div>
              <ul className="st-f-face-cuts">
                {tokens.fonts.faces
                  .filter((face) => face.family === name)
                  .map(({ file, weight, style }) => {
                    const wordmark = family === "display" && weight === tokens.type.wordmark.weight;
                    return (
                      <li key={file}>
                        <span className="type-meta">
                          {weight}
                          {style === "italic" ? " italic" : ""}
                          {wordmark ? " · wordmark" : ""}
                        </span>
                        <span
                          className="st-f-cut"
                          style={{
                            fontFamily: `var(--font-${family})`,
                            fontWeight: weight,
                            fontStyle: style,
                            letterSpacing: wordmark ? tokens.type.wordmark.tracking : undefined,
                          }}
                        >
                          {wordmark ? "superthread" : sample}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="steps" title="steps">
        <Copy>
          {steps.length} steps, size over line height in px, from the caps legend to the display line. at{" "}
          {tokens.type.phone.maxWidth} px and below {phoneSteps.join(", ")} take the smaller size shown beside them.
        </Copy>
        <ol className="st-f-steps">
          {steps.map(([name, step]) => (
            <li key={name}>
              <p className="st-f-step-spec">
                <b className="type-meta">{name}</b>
                <code>{spec(step)}</code>
                {step.phone && (
                  <code>
                    phone {step.phone.size}/{step.phone.line}
                  </code>
                )}
              </p>
              <p className={stepClass[name]}>{stepSample[name]}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="links" title="links">
        <Copy>
          a link in running text prints in foreground with a 1 px underline at rest. in a working panel the base layer
          does this for any anchor no item owns. <code>link-quiet</code> is the one second form: a muted word that turns
          foreground on hover, for a way onward beside a head or a row.
        </Copy>
        <ModePair>
          <AppShellPanel className="grid justify-items-start gap-3">
            <p className="type-summary">
              the run left <a href="#links">three notes</a> for the morning.
            </p>
            <a className="type-instrument link-quiet" href="#links">
              all runs
            </a>
          </AppShellPanel>
        </ModePair>
      </Section>
    </>
  );
}
