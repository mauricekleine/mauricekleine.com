import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  ListRows,
  ListRow,
  ListRowLead,
  ListRowTitle,
  ListRowAside,
  ListRowMeta,
  ListRowActions,
  ListRowKind,
  ListRowTime,
  ListRowWhen,
  PlainRows,
  PlainRow,
  PlainRowTick,
  PlainRowTitle,
  PlainRowActions,
} from "@/components/superthread/blocks/list-rows";
import {
  Section as BlockSection,
  SectionCount,
  SectionHeader,
  SectionTitle,
} from "@/components/superthread/blocks/section-header";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { catalog } from "@/components/superthread/catalog";
import { GroundFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "list-rows")!
  .serves!.map((app) => (app === "www" ? "the public site" : app[0]!.toUpperCase() + app.slice(1)))
  .join(", ");
export const Route = createFileRoute("/compositions/list-rows")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "Title states" },
      { id: "header", title: "Under a section header" },
      { id: "markers", title: "Markers" },
      { id: "phone", title: "On a phone" },
      { id: "day", title: "A day's rows" },
      { id: "plain", title: "Plain rows" },
      { id: "plain-states", title: "Plain title states" },
      { id: "plain-phone", title: "Plain rows on a phone" },
      { id: "plain-parts", title: "Plain parts" },
    ],
  },
  component: Page,
});

function RowsExample() {
  const [done, setDone] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <ListRows aria-label="Chapter tasks">
      <ListRow closed={done}>
        <ListRowLead>
          <Checkbox aria-label="Complete the reading layout review" checked={done} onCheckedChange={setDone} />
        </ListRowLead>
        <ListRowTitle href="#states">Review the reading layout on a small screen</ListRowTitle>
        <ListRowAside>
          <time dateTime="2026-10-25T09:00:00Z">09:00</time>
        </ListRowAside>
        <ListRowMeta>
          <span>Quanta</span>
          <span>Chapter 03</span>
        </ListRowMeta>
        <ListRowActions>
          <Button size="sm" variant="outline" aria-pressed={pinned} onClick={() => setPinned(!pinned)}>
            {pinned ? "Unpin" : "Pin"}
          </Button>
        </ListRowActions>
      </ListRow>
      <ListRow>
        <ListRowTitle>Collect the next chapter notes</ListRowTitle>
        <ListRowAside>3 notes</ListRowAside>
        <ListRowMeta>
          <span>Quanta</span>
          <span>Chapter 04</span>
        </ListRowMeta>
      </ListRow>
      <ListRow>
        <ListRowTitle>Leave room for a longer title without cutting off the last word</ListRowTitle>
      </ListRow>
      <ListRow>
        <ListRowTitle>Render the chapter plates</ListRowTitle>
        <ListRowAside>
          <Badge size="sm" variant="running" />
        </ListRowAside>
        <ListRowMeta>
          <span>Quanta</span>
          <span>Chapter 05</span>
          <time dateTime="2026-10-25T08:12:00Z">08:12</time>
        </ListRowMeta>
      </ListRow>
    </ListRows>
  );
}

// Hangs from the header's rule, so one rule prints above the rows.
function UnderHeaderExample() {
  return (
    <div>
      <SectionHeader>
        <SectionTitle>This week</SectionTitle>
        <SectionCount>2</SectionCount>
      </SectionHeader>
      <ListRows aria-label="This week">
        <ListRow>
          <ListRowTitle>Draft the release note</ListRowTitle>
        </ListRow>
        <ListRow>
          <ListRowTitle>Read the chapter notes</ListRowTitle>
        </ListRow>
      </ListRows>
    </div>
  );
}

// A piece that decides on its own to print nothing, as a component reading its own data does.
function NoReviewer() {
  return null;
}

function MarkersExample() {
  return (
    <ListRows aria-label="Exports">
      <ListRow>
        <ListRowTitle kind="id">ex-2041</ListRowTitle>
        <ListRowMeta>
          <span>Quanta</span>
          <span>Chapter 03</span>
          <NoReviewer />
        </ListRowMeta>
        <ListRowActions variant="markers">
          <span>PDF</span>
          <span>EPUB</span>
          <span>Shared</span>
        </ListRowActions>
      </ListRow>
      <ListRow>
        <ListRowTitle kind="id">ex-2040</ListRowTitle>
        <ListRowMeta>
          <NoReviewer />
        </ListRowMeta>
        <ListRowActions variant="markers">
          <NoReviewer />
        </ListRowActions>
      </ListRow>
    </ListRows>
  );
}

// One day's meetings, read across: a time, the title, what it is and what ends the row.
function DayRowsExample() {
  return (
    <ListRows aria-label="Tuesday's meetings">
      <ListRow variant="day">
        <ListRowTime dateTime="2026-11-03T09:30:00+01:00">09:30</ListRowTime>
        <ListRowTitle>Team standup</ListRowTitle>
        <ListRowWhen>
          <Button size="sm" variant="outline" aria-label="Join team standup">
            Join
          </Button>
        </ListRowWhen>
      </ListRow>
      <ListRow variant="day">
        <ListRowTime dateTime="2026-11-03T11:00:00+01:00">11:00</ListRowTime>
        <ListRowTitle>Renewal call</ListRowTitle>
        <ListRowKind href="#day" aria-label="Brief for renewal call">
          Brief
        </ListRowKind>
        <ListRowWhen>
          <Button size="sm" variant="outline" aria-label="Join renewal call">
            Join
          </Button>
        </ListRowWhen>
      </ListRow>
      <ListRow variant="day">
        <ListRowTime dateTime="2026-11-03T14:00:00+01:00">14:00</ListRowTime>
        <ListRowTitle>A meeting whose title runs on past the end of its one line, as long titles do</ListRowTitle>
        <ListRowKind>Tentative</ListRowKind>
        <ListRowWhen>
          <time dateTime="PT45M">45 min</time>
        </ListRowWhen>
      </ListRow>
    </ListRows>
  );
}

// An iframe gives the block a real phone viewport, so its own media queries run unchanged.
function PhoneFrame({ mode, children }: { mode: "light" | "dark"; children: ReactNode }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(400);
  useEffect(() => {
    const iframe = frame.current;
    function mount() {
      const doc = iframe?.contentDocument;
      if (!doc?.body) return;
      document
        .querySelectorAll('link[rel="stylesheet"], style')
        .forEach((style) => doc.head.appendChild(style.cloneNode(true)));
      doc.documentElement.className = mode;
      doc.body.className = "st-cb-phone-body";
      setBody(doc.body);
    }
    iframe?.addEventListener("load", mount);
    mount();
    return () => iframe?.removeEventListener("load", mount);
  }, [mode]);
  useEffect(() => {
    if (!body) return;
    const size = () => setHeight(Math.ceil(body.getBoundingClientRect().height));
    const observer = new ResizeObserver(size);
    observer.observe(body);
    body.ownerDocument.fonts.ready.then(size);
    size();
    return () => observer.disconnect();
  }, [body]);
  return (
    <iframe
      ref={frame}
      height={height}
      title={`Phone specimen, ${mode}`}
      className="st-cb-phone"
      srcDoc="<!doctype html><html><head><base target=_parent></head><body></body></html>"
    >
      {body && createPortal(children, body)}
    </iframe>
  );
}

const chapters = [
  { title: "Read Sam's notes on chapter 7", kind: "Mail", when: "10:30" },
  { title: "Send the outline for chapter 8", kind: "Task", when: "Thu 5 Nov" },
  {
    title: "Leave the figures for chapter 9 until the bands are drawn, then check each caption against the text",
    kind: "Note",
    when: "Next week",
  },
];

// Every row a list can hold, in a working panel, so the gutter and the ruled bleed print as they do in a ship.
function PlainExample({ clamp }: { clamp?: boolean }) {
  const [ticked, setTicked] = useState(false);
  return (
    <AppShellPanel>
      <BlockSection>
        <SectionHeader quiet="instrument">
          <SectionTitle>Next</SectionTitle>
        </SectionHeader>
        <PlainRows aria-label="Next">
          {chapters.map((row) => (
            <PlainRow key={row.title}>
              <PlainRowTitle href="#plain">{row.title}</PlainRowTitle>
              <ListRowKind>{row.kind}</ListRowKind>
              <ListRowWhen>{row.when}</ListRowWhen>
            </PlainRow>
          ))}
        </PlainRows>
      </BlockSection>
      <BlockSection>
        <SectionHeader quiet="subtitle">
          <SectionTitle>This week</SectionTitle>
        </SectionHeader>
        <PlainRows aria-label="This week" variant="nested" clamp={clamp}>
          <PlainRow closed={ticked}>
            <PlainRowTick>
              <Checkbox aria-label="Mark done: Draw the bands" checked={ticked} onCheckedChange={setTicked} />
            </PlainRowTick>
            <PlainRowTitle href="#plain">Draw the bands</PlainRowTitle>
            <ListRowKind>Task</ListRowKind>
            <ListRowWhen>Wed 4 Nov</ListRowWhen>
          </PlainRow>
          {chapters.slice(2).map((row) => (
            <PlainRow key={row.title}>
              <PlainRowTick>
                <Checkbox aria-label={`Mark done: ${row.title}`} />
              </PlainRowTick>
              <PlainRowTitle href="#plain">{row.title}</PlainRowTitle>
              <ListRowKind>{row.kind}</ListRowKind>
              <ListRowWhen />
            </PlainRow>
          ))}
          <PlainRow>
            <PlainRowTitle href="#plain">A weekly note from the chapter drafts</PlainRowTitle>
            <PlainRowActions>
              <Button size="sm" variant="ghost">
                Keep
              </Button>
              <Button size="sm" variant="ghost">
                Drop
              </Button>
            </PlainRowActions>
          </PlainRow>
        </PlainRows>
      </BlockSection>
      <BlockSection>
        <SectionHeader quiet="subtitle">
          <SectionTitle>Sources</SectionTitle>
        </SectionHeader>
        <PlainRows aria-label="Sources" variant="ruled">
          <PlainRow>
            <PlainRowTitle href="#plain">Chapter drafts</PlainRowTitle>
            <ListRowWhen>2h ago</ListRowWhen>
          </PlainRow>
          <PlainRow>
            <PlainRowTitle href="#plain">Figure library</PlainRowTitle>
            <ListRowWhen>Since Friday</ListRowWhen>
          </PlainRow>
        </PlainRows>
      </BlockSection>
    </AppShellPanel>
  );
}

function PlainTitleStates() {
  return (
    <div className="st-cb-states">
      {[
        { name: "Rest", note: "One link across the row" },
        { name: "Hover", note: "The words underline", demo: "hover" },
        { name: "Focus", note: "2 px ring outside the row", demo: "focus-visible" },
      ].map((state) => (
        <State key={state.name} name={state.name} note={state.note}>
          <PlainRows aria-label={`${state.name} row`}>
            <PlainRow>
              <PlainRowTitle href="#plain" data-demo={state.demo} tabIndex={-1}>
                Read the chapter notes
              </PlainRowTitle>
              <ListRowKind>Mail</ListRowKind>
            </PlainRow>
          </PlainRows>
        </State>
      ))}
      <State name="Closed" note="Muted and struck through">
        <PlainRows aria-label="Closed row">
          <PlainRow closed>
            <PlainRowTitle href="#plain">Read the chapter notes</PlainRowTitle>
            <ListRowKind>Mail</ListRowKind>
          </PlainRow>
        </PlainRows>
      </State>
    </div>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="List rows"
        lede="Rows for tasks, chapters and notes. A ruled row keeps a place for its lead, title, time, context and actions; a plain row is a line of words that links."
      >
        <InstallLine items={["list-rows"]} />
      </PageHead>
      <p className="st-cb-serves">Serves {serves}.</p>

      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Check the first task to complete it, or pin it for later. Its title links to the states below; the next titles
          are plain text. The meta line holds context and prints the dot between its pieces. A status sits outside it,
          as a small badge in the aside.
        </p>
        <ModePair className="st-cb-stack">
          <RowsExample />
        </ModePair>
      </Section>
      <Section id="states" title="Title states">
        <p className="st-cb-copy">
          A title prints in foreground, linked or plain. Hover adds an underline to a link, and keyboard focus draws the
          control ring. A closed row stays in the list, with its title muted and struck through. A receding row is still
          live and fading, so its title prints muted with no strike.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-states">
            {["rest", "hover", "focus-visible"].map((state) => (
              <State
                key={state}
                name={state === "focus-visible" ? "Focus" : state === "hover" ? "Hover" : "Rest"}
                note={
                  state === "hover"
                    ? "The title is underlined"
                    : state === "rest"
                      ? "One real link"
                      : "2 px ring outside the title"
                }
              >
                <ListRows
                  aria-label={`${state === "focus-visible" ? "Focus" : state === "hover" ? "Hover" : "Rest"} row`}
                >
                  <ListRow>
                    <ListRowTitle href="#example" data-demo={state}>
                      Read the chapter notes
                    </ListRowTitle>
                  </ListRow>
                </ListRows>
              </State>
            ))}
            <State name="Closed" note="Muted and struck through">
              <ListRows aria-label="Closed row">
                <ListRow closed>
                  <ListRowTitle href="#example">Read the chapter notes</ListRowTitle>
                </ListRow>
              </ListRows>
            </State>
            <State name="Receding" note="Muted, no strike">
              <ListRows aria-label="Receding row">
                <ListRow receding>
                  <ListRowTitle href="#example">Read the chapter notes</ListRowTitle>
                </ListRow>
              </ListRows>
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="header" title="Under a section header">
        <p className="st-cb-copy">
          Straight under a <code>SectionHeader</code> the rows hang from its rule, so one rule prints above them.
        </p>
        <ModePair className="st-cb-stack">
          <UnderHeaderExample />
        </ModePair>
      </Section>
      <Section id="markers" title="Markers">
        <p className="st-cb-copy">
          <code>variant=&quot;markers&quot;</code> makes <code>ListRowActions</code> a muted line of facts, read from
          the row&rsquo;s start. <code>kind=&quot;id&quot;</code> sets a title in mono. A piece that renders nothing
          takes its dot with it, and an empty meta line or actions line takes no room, so the second row here is one
          line.
        </p>
        <ModePair className="st-cb-stack">
          <MarkersExample />
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-cb-copy">
          At 600 px and below, the aside moves under the title and before the meta line. This frame gives the row a real
          phone viewport.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <PhoneFrame mode="light">
              <RowsExample />
            </PhoneFrame>
          }
          dark={
            <PhoneFrame mode="dark">
              <RowsExample />
            </PhoneFrame>
          }
        />
      </Section>
      <Section id="day" title="A day's rows">
        <p className="st-cb-copy">
          <code>variant=&quot;day&quot;</code> sets a row on one 44 px line with no rule: <code>ListRowTime</code>, the
          title, <code>ListRowKind</code> and <code>ListRowWhen</code>. The columns hold across rows, so a row with no
          kind leaves its column open. A kind is a muted word until it gets an href, and then it prints as a link. What
          ends the row is a time or one small control. A long title truncates.
        </p>
        <ModePair className="st-cb-stack">
          <DayRowsExample />
        </ModePair>
        <p className="st-cb-copy">
          On a phone the time column is 44 px and the end column 48 px. The title keeps half the row, so the kind gives
          way first. Each row stays 44 px, and a small button fills its column.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <PhoneFrame mode="light">
              <DayRowsExample />
            </PhoneFrame>
          }
          dark={
            <PhoneFrame mode="dark">
              <DayRowsExample />
            </PhoneFrame>
          }
        />
      </Section>
      <Section id="plain" title="Plain rows">
        <p className="st-cb-copy">
          A plain row has no rules and no padding, so a list reads as words. The whole row is the link, its title holds
          one line at weight 400 and cuts at its end, and <code>ListRowKind</code> and <code>ListRowWhen</code> take 80
          and 128 px columns. A row leaves out a column it doesn&rsquo;t print, and an empty <code>ListRowWhen</code>{" "}
          holds its place.
        </p>
        <p className="st-cb-copy">
          Three forms set the height: plain is 40 px, nested is 36 px for a list under a quiet head, and ruled is 48 px
          with a rule that bleeds to the panel&rsquo;s edges. A tick hangs in the gutter, so every title keeps the
          list&rsquo;s left edge.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="Plain rows, light" width={960} height={656}>
              <PlainExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Plain rows, dark" width={960} height={656}>
              <PlainExample />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="plain-states" title="Plain title states">
        <p className="st-cb-copy">
          Hover underlines the words, and keyboard focus rings the whole row, inside it when the row is ruled, since a
          ruled row reaches the panel&rsquo;s edges. A tick or an action sits above the link and keeps its own click.
        </p>
        <ModePair className="st-cb-stack">
          <PlainTitleStates />
        </ModePair>
      </Section>
      <Section id="plain-phone" title="Plain rows on a phone">
        <p className="st-cb-copy">
          At 600 px and below, every form is 56 px, with the title over <code>kind · when</code> and when in the
          interface face. The tick moves to the right edge at 44 px, and actions take their own line. A list that sets{" "}
          <code>clamp</code> lets its titles take two lines, as the middle list does here. Both frames use a 390 px
          viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Plain rows phone, light" height={740}>
              <PlainExample clamp />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Plain rows phone, dark" height={740}>
              <PlainExample clamp />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="plain-parts" title="Plain parts">
        <dl className="st-ca-parts">
          <dt>
            <code>PlainRows</code>
          </dt>
          <dd>
            The list. <code>variant</code> is <code>plain</code>, <code>nested</code> or <code>ruled</code>, and{" "}
            <code>clamp</code> lets a title take two lines on a phone.
          </dd>
          <dt>
            <code>PlainRow</code>
          </dt>
          <dd>
            One row. <code>closed</code> keeps it in the list, muted and struck through.
          </dd>
          <dt>
            <code>PlainRowTitle</code>
          </dt>
          <dd>
            Stretches its link over the row when it gets an <code>href</code> or the app&rsquo;s router link through{" "}
            <code>render</code>, and stays plain text without one.
          </dd>
          <dt>
            <code>ListRowKind</code>, <code>ListRowWhen</code>
          </dt>
          <dd>
            The columns, the same parts a day row takes. They fold under the title on a phone with a dot between them. A
            control takes <code>PlainRowActions</code>, which sits above the row&rsquo;s link.
          </dd>
          <dt>
            <code>PlainRowTick</code>
          </dt>
          <dd>Holds a checkbox in the gutter, or at the right edge on a phone.</dd>
          <dt>
            <code>PlainRowActions</code>
          </dt>
          <dd>Buttons at the row&rsquo;s end, on their own line on a phone.</dd>
        </dl>
      </Section>
    </>
  );
}
