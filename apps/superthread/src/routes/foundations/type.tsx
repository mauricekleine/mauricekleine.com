import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { tokens } from "@/components/superthread/lib/tokens";
import { Copy } from "@/foundations/parts";
import { ModePair } from "@/site/ModePair";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/foundations/type")({
  staticData: {
    openerLede:
      "Four faces, each with one job: Unbounded for display, Supreme for the interface, Erode for reading and Fragment Mono for IDs, times, code and any figure that holds a column.",
    sections: [
      { id: "faces", title: "Faces" },
      { id: "steps", title: "Steps" },
      { id: "links", title: "Links" },
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
    role: "Display",
    use: "Titles, section heads and the board, at 300 in the first ink; the wordmark at 400",
    sample: "Runs this week",
  },
  {
    name: "Supreme",
    family: "sans",
    role: "UI",
    use: "Controls, tables, notes and the body of these pages, at 400 and 500",
    sample: "3 of 5 runs done, 2 queued",
  },
  {
    name: "Erode",
    family: "serif",
    role: "Reading",
    use: "The reading page, ledes and page titles, from 400 to 600",
    sample: "A slow page, set for reading",
  },
  {
    name: "Fragment Mono",
    family: "mono",
    role: "Mono",
    use: "IDs, times, figures that hold a column, code and the caps legends",
    sample: "run 7f3a2c · 00:04:12",
  },
];

const faceName: Record<Family, string> = {
  display: "Unbounded",
  sans: "Supreme",
  serif: "Erode",
  mono: "Fragment Mono",
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
  long: "type-long",
  section: "type-section",
  page: "type-page",
  headline: "type-headline",
  hero: "type-hero",
  display: "type-display",
} as const satisfies Record<Step, string>;

const stepSample: Record<Step, string> = {
  meta: "Queued · 3 runs",
  instrument: "Updated four minutes ago",
  ui: "Deploy the board to Orbit",
  summary: "Three runs are waiting on review",
  subtitle: "Rename this board",
  read: "The reading column sets Erode at nineteen on thirty-two, about sixty-six characters to the line, so a long page stays easy to follow.",
  lede: "A page opens with one short paragraph that says what it is for.",
  title: "Fleet status",
  long: "Check whether the deck still matches",
  section: "Ship spots",
  page: "Notes on dithering",
  headline: "Reply to the chapter notes",
  hero: "Runs",
  display: "Fleet",
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
      <Section id="faces" title="Faces">
        <Copy>{tokens.fonts.faces.length} files in all. Each line below is set in the cut it names.</Copy>
        <ul className="st-f-faces">
          {families.map(({ name, family, role, use, sample }) => (
            <li key={name}>
              <div className="st-f-face-head">
                <span className="type-meta">{role}</span>
                <b style={{ fontFamily: `var(--font-${family})` }}>{name}</b>
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

      <Section id="steps" title="Steps">
        <Copy>
          {steps.length} steps, size over line height in px, from the caps legend to the display line. At{" "}
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

      <Section id="links" title="Links">
        <Copy>
          A link in running text prints in foreground with a 1 px underline at rest. In a working panel the base layer
          does this for any anchor no item owns. <code>link-quiet</code> is the one second form: a muted word that turns
          foreground on hover, for a way onward beside a head or a row. A link in a paragraph rings flush to its sides,
          so the word space beside it keeps the ring off the words around it. The last line prints keyboard focus.
        </Copy>
        <ModePair>
          <AppShellPanel className="grid justify-items-start gap-3">
            <p className="type-summary">
              The run left <a href="#links">three notes</a> for the morning.
            </p>
            <a className="type-instrument link-quiet" href="#links">
              All runs
            </a>
            <p className="type-instrument text-muted-foreground">
              Mail needs a sign-in.{" "}
              <a href="#links" data-demo="focus-visible" tabIndex={-1}>
                See sources
              </a>
            </p>
          </AppShellPanel>
        </ModePair>
      </Section>
    </>
  );
}
