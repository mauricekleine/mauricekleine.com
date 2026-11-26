import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { JumpLine, JumpLineLink } from "@/components/superthread/blocks/jump-line";
import { PlainRow, PlainRows, PlainRowTitle } from "@/components/superthread/blocks/list-rows";
import { Section as BlockSection, SectionHeader, SectionTitle } from "@/components/superthread/blocks/section-header";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/jump-line")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "States" },
      { id: "phone", title: "On a phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

const shelves = [
  { id: "today", title: "Today", rows: ["Read Sam's notes on chapter 7", "Send the outline for chapter 8"] },
  { id: "week", title: "This week", rows: ["Draw the bands", "Check the captions", "Reset the worked number"] },
  { id: "later", title: "Later", rows: ["Plan the chapter after"] },
];

// A short page with real targets: the mode keeps each pane's ids its own.
function ShortPage({ mode }: { mode: "light" | "dark" }) {
  return (
    <div>
      <JumpLine>
        {shelves.map((shelf) => (
          <JumpLineLink key={shelf.id} href={`#${mode}-${shelf.id}`} count={shelf.rows.length}>
            {shelf.title}
          </JumpLineLink>
        ))}
      </JumpLine>
      {shelves.map((shelf) => (
        <BlockSection key={shelf.id} id={`${mode}-${shelf.id}`} className="mt-8">
          <SectionHeader quiet="subtitle">
            <SectionTitle>{shelf.title}</SectionTitle>
          </SectionHeader>
          <PlainRows variant="nested" aria-label={shelf.title}>
            {shelf.rows.map((row) => (
              <PlainRow key={row}>
                <PlainRowTitle href={`#${mode}-${shelf.id}`}>{row}</PlainRowTitle>
              </PlainRow>
            ))}
          </PlainRows>
        </BlockSection>
      ))}
    </div>
  );
}

const week = [
  ["Today", 3],
  ["This week", 5],
  ["Next week", 2],
  ["The worked number, and how each of its bands was drawn", 4],
  ["Later", 7],
  ["Someday", 12],
  ["Done", 31],
] as const;

function PhoneLine() {
  return (
    <AppShellPanel>
      <JumpLine>
        {week.map(([name, count]) => (
          <JumpLineLink key={name} href="#phone" count={count}>
            {name}
          </JumpLineLink>
        ))}
      </JumpLine>
    </AppShellPanel>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Jump line"
        lede="A line of anchors to a long page's sections, each with how many it holds, so the head of the page says what's on it."
      >
        <InstallLine items={["jump-line"]} />
      </PageHead>
      <Serves name="jump-line" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Each name jumps to its section, and the figure beside it prints muted in mono. The dots between the names are
          decoration, so a screen reader reads a list of links.
        </p>
        <ModePair light={<ShortPage mode="light" />} dark={<ShortPage mode="dark" />} />
      </Section>
      <Section id="states" title="States">
        <p className="st-ca-copy">
          Hover underlines the name and leaves the figure alone, and keyboard focus draws the control ring. While a
          filter holds the page, drop <code>count</code>, since the figure would no longer say what the section shows.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            {[
              { name: "Rest", note: "Name and figure" },
              { name: "Hover", demo: "hover", note: "The name underlines" },
              { name: "Focus", demo: "focus-visible", note: "2 px house ring" },
            ].map((state) => (
              <State className="st-ca-state" key={state.name} name={state.name} note={state.note}>
                <JumpLine aria-label={`${state.name} line`}>
                  <JumpLineLink href="#example" count={3} data-demo={state.demo} tabIndex={-1}>
                    Today
                  </JumpLineLink>
                  <JumpLineLink href="#example" count={5} tabIndex={-1}>
                    This week
                  </JumpLineLink>
                </JumpLine>
              </State>
            ))}
            <State className="st-ca-state" name="Filtered" note="No figures">
              <JumpLine aria-label="Filtered line">
                <JumpLineLink href="#example" tabIndex={-1}>
                  Today
                </JumpLineLink>
                <JumpLineLink href="#example" tabIndex={-1}>
                  This week
                </JumpLineLink>
              </JumpLine>
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-ca-copy">
          At 600 px and below, the line drops its dots and each link holds a 44 px row, so the wrapped lines stay easy
          to hit. A name wider than the line wraps, with its figure after its last word. Both frames use a 390 px
          viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Jump line phone, light" height={216}>
              <PhoneLine />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Jump line phone, dark" height={216}>
              <PhoneLine />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>JumpLine</code>
          </dt>
          <dd>
            The nav. It names itself <code>On this page</code>, and <code>aria-label</code> gives it another name.
          </dd>
          <dt>
            <code>JumpLineLink</code>
          </dt>
          <dd>
            One anchor. <code>count</code> prints after the name, and <code>render</code> takes the app&rsquo;s router
            link. Leave out a section&rsquo;s link and its dot goes with it.
          </dd>
        </dl>
      </Section>
    </>
  );
}
