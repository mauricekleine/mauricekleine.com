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
      { id: "example", title: "example" },
      { id: "states", title: "states" },
      { id: "phone", title: "on a phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

const shelves = [
  { id: "today", title: "today", rows: ["read sam's notes on chapter 7", "send the outline for chapter 8"] },
  { id: "week", title: "this week", rows: ["draw the bands", "check the captions", "reset the worked number"] },
  { id: "later", title: "later", rows: ["plan the chapter after"] },
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
  ["today", 3],
  ["this week", 5],
  ["next week", 2],
  ["this month", 4],
  ["later", 7],
  ["someday", 12],
  ["done", 31],
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
        title="jump line"
        lede="a line of anchors to a long page's sections, each with how many it holds, so the head of the page says what's on it."
      >
        <InstallLine items={["jump-line"]} />
      </PageHead>
      <Serves name="jump-line" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          each name jumps to its section, and the figure beside it prints muted in mono. the dots between the names are
          decoration, so a screen reader reads a list of links.
        </p>
        <ModePair light={<ShortPage mode="light" />} dark={<ShortPage mode="dark" />} />
      </Section>
      <Section id="states" title="states">
        <p className="st-ca-copy">
          hover underlines the name and leaves the figure alone, and keyboard focus draws the control ring. while a
          filter holds the page, drop <code>count</code>, since the figure would no longer say what the section shows.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            {[
              { name: "rest", note: "name and figure" },
              { name: "hover", demo: "hover", note: "the name underlines" },
              { name: "focus", demo: "focus-visible", note: "2 px house ring" },
            ].map((state) => (
              <State className="st-ca-state" key={state.name} name={state.name} note={state.note}>
                <JumpLine aria-label={`${state.name} line`}>
                  <JumpLineLink href="#example" count={3} data-demo={state.demo} tabIndex={-1}>
                    today
                  </JumpLineLink>
                  <JumpLineLink href="#example" count={5} tabIndex={-1}>
                    this week
                  </JumpLineLink>
                </JumpLine>
              </State>
            ))}
            <State className="st-ca-state" name="filtered" note="no figures">
              <JumpLine aria-label="filtered line">
                <JumpLineLink href="#example" tabIndex={-1}>
                  today
                </JumpLineLink>
                <JumpLineLink href="#example" tabIndex={-1}>
                  this week
                </JumpLineLink>
              </JumpLine>
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-ca-copy">
          at 600 px and below, the line drops its dots and each link holds a 44 px row, so the wrapped lines stay easy
          to hit. both frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="jump line phone, light" height={180}>
              <PhoneLine />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="jump line phone, dark" height={180}>
              <PhoneLine />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>JumpLine</code>
          </dt>
          <dd>
            the nav. it names itself <code>on this page</code>, and <code>aria-label</code> gives it another name.
          </dd>
          <dt>
            <code>JumpLineLink</code>
          </dt>
          <dd>
            one anchor. <code>count</code> prints after the name, and <code>render</code> takes the app&rsquo;s router
            link. leave out a section&rsquo;s link and its dot goes with it.
          </dd>
        </dl>
      </Section>
    </>
  );
}
