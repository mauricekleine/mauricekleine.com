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
  PlainRows,
  PlainRow,
  PlainRowTick,
  PlainRowTitle,
  PlainRowKind,
  PlainRowWhen,
  PlainRowActions,
} from "@/components/superthread/blocks/list-rows";
import { Section as BlockSection, SectionHeader, SectionTitle } from "@/components/superthread/blocks/section-header";
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
  .serves!.map((app) => (app === "www" ? "the public site" : app))
  .join(", ");
export const Route = createFileRoute("/compositions/list-rows")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "title states" },
      { id: "phone", title: "on a phone" },
      { id: "plain", title: "plain rows" },
      { id: "plain-states", title: "plain title states" },
      { id: "plain-phone", title: "plain rows on a phone" },
      { id: "plain-parts", title: "plain parts" },
    ],
  },
  component: Page,
});

function RowsExample() {
  const [done, setDone] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <ListRows aria-label="chapter tasks">
      <ListRow closed={done}>
        <ListRowLead>
          <Checkbox aria-label="complete the reading layout review" checked={done} onCheckedChange={setDone} />
        </ListRowLead>
        <ListRowTitle href="#states">review the reading layout on a small screen</ListRowTitle>
        <ListRowAside>
          <time dateTime="2026-10-25T09:00:00Z">09:00</time>
        </ListRowAside>
        <ListRowMeta>
          <span>quanta</span>
          <span>chapter 03</span>
        </ListRowMeta>
        <ListRowActions>
          <Button size="sm" variant="outline" aria-pressed={pinned} onClick={() => setPinned(!pinned)}>
            {pinned ? "unpin" : "pin"}
          </Button>
        </ListRowActions>
      </ListRow>
      <ListRow>
        <ListRowTitle>collect the next chapter notes</ListRowTitle>
        <ListRowAside>3 notes</ListRowAside>
        <ListRowMeta>
          <span>quanta</span>
          <span>chapter 04</span>
        </ListRowMeta>
      </ListRow>
      <ListRow>
        <ListRowTitle>leave room for a longer title without cutting off the last word</ListRowTitle>
      </ListRow>
      <ListRow>
        <ListRowTitle>render the chapter plates</ListRowTitle>
        <ListRowAside>
          <Badge size="sm" variant="running" />
        </ListRowAside>
        <ListRowMeta>
          <span>quanta</span>
          <span>chapter 05</span>
          <time dateTime="2026-10-25T08:12:00Z">08:12</time>
        </ListRowMeta>
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
      title={`phone specimen, ${mode}`}
      className="st-cb-phone"
      srcDoc="<!doctype html><html><head><base target=_parent></head><body></body></html>"
    >
      {body && createPortal(children, body)}
    </iframe>
  );
}

const chapters = [
  { title: "read sam's notes on chapter 7", kind: "mail", when: "10:30" },
  { title: "send the outline for chapter 8", kind: "task", when: "thu 5 nov" },
  {
    title: "leave the figures for chapter 9 until the bands are drawn, then check each caption against the text",
    kind: "note",
    when: "next week",
  },
];

// Every row a list can hold, in a working panel, so the gutter and the ruled bleed print as they do in a ship.
function PlainExample({ clamp }: { clamp?: boolean }) {
  const [ticked, setTicked] = useState(false);
  return (
    <AppShellPanel>
      <BlockSection>
        <SectionHeader quiet="instrument">
          <SectionTitle>next</SectionTitle>
        </SectionHeader>
        <PlainRows aria-label="next">
          {chapters.map((row) => (
            <PlainRow key={row.title}>
              <PlainRowTitle href="#plain">{row.title}</PlainRowTitle>
              <PlainRowKind>{row.kind}</PlainRowKind>
              <PlainRowWhen>{row.when}</PlainRowWhen>
            </PlainRow>
          ))}
        </PlainRows>
      </BlockSection>
      <BlockSection>
        <SectionHeader quiet="subtitle">
          <SectionTitle>this week</SectionTitle>
        </SectionHeader>
        <PlainRows aria-label="this week" variant="nested" clamp={clamp}>
          <PlainRow closed={ticked}>
            <PlainRowTick>
              <Checkbox aria-label="mark done: draw the bands" checked={ticked} onCheckedChange={setTicked} />
            </PlainRowTick>
            <PlainRowTitle href="#plain">draw the bands</PlainRowTitle>
            <PlainRowKind>task</PlainRowKind>
            <PlainRowWhen>wed 4 nov</PlainRowWhen>
          </PlainRow>
          {chapters.slice(2).map((row) => (
            <PlainRow key={row.title}>
              <PlainRowTick>
                <Checkbox aria-label={`mark done: ${row.title}`} />
              </PlainRowTick>
              <PlainRowTitle href="#plain">{row.title}</PlainRowTitle>
              <PlainRowKind>{row.kind}</PlainRowKind>
              <PlainRowWhen />
            </PlainRow>
          ))}
          <PlainRow>
            <PlainRowTitle href="#plain">a weekly note from the chapter drafts</PlainRowTitle>
            <PlainRowActions>
              <Button size="sm" variant="ghost">
                keep
              </Button>
              <Button size="sm" variant="ghost">
                drop
              </Button>
            </PlainRowActions>
          </PlainRow>
        </PlainRows>
      </BlockSection>
      <BlockSection>
        <SectionHeader quiet="subtitle">
          <SectionTitle>sources</SectionTitle>
        </SectionHeader>
        <PlainRows aria-label="sources" variant="ruled">
          <PlainRow>
            <PlainRowTitle href="#plain">chapter drafts</PlainRowTitle>
            <PlainRowWhen>2h ago</PlainRowWhen>
          </PlainRow>
          <PlainRow>
            <PlainRowTitle href="#plain">figure library</PlainRowTitle>
            <PlainRowWhen>since friday</PlainRowWhen>
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
        { name: "rest", note: "one link across the row" },
        { name: "hover", note: "the words underline", demo: "hover" },
        { name: "focus", note: "2 px ring outside the row", demo: "focus-visible" },
      ].map((state) => (
        <State key={state.name} name={state.name} note={state.note}>
          <PlainRows aria-label={`${state.name} row`}>
            <PlainRow>
              <PlainRowTitle href="#plain" data-demo={state.demo} tabIndex={-1}>
                read the chapter notes
              </PlainRowTitle>
              <PlainRowKind>mail</PlainRowKind>
            </PlainRow>
          </PlainRows>
        </State>
      ))}
      <State name="closed" note="muted and struck through">
        <PlainRows aria-label="closed row">
          <PlainRow closed>
            <PlainRowTitle href="#plain">read the chapter notes</PlainRowTitle>
            <PlainRowKind>mail</PlainRowKind>
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
        title="list rows"
        lede="rows for tasks, chapters and notes. a ruled row keeps a place for its lead, title, time, context and actions; a plain row is a line of words that links."
      >
        <InstallLine items={["list-rows"]} />
      </PageHead>
      <p className="st-cb-serves">serves {serves}.</p>

      <Section id="example" title="example">
        <p className="st-cb-copy">
          check the first task to complete it, or pin it for later. its title links to the states below; the next titles
          are plain text. the meta line holds context and prints the dot between its pieces. a status sits outside it,
          as a small badge in the aside.
        </p>
        <ModePair className="st-cb-stack">
          <RowsExample />
        </ModePair>
      </Section>
      <Section id="states" title="title states">
        <p className="st-cb-copy">
          a title prints in foreground, linked or plain. hover adds an underline to a link, and keyboard focus draws the
          control ring. a closed row stays in the list, with its title muted and struck through.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-states">
            {["rest", "hover", "focus-visible"].map((state) => (
              <State
                key={state}
                name={state === "focus-visible" ? "focus" : state}
                note={
                  state === "hover"
                    ? "the title is underlined"
                    : state === "rest"
                      ? "one real link"
                      : "2 px ring outside the title"
                }
              >
                <ListRows aria-label={`${state} row`}>
                  <ListRow>
                    <ListRowTitle href="#example" data-demo={state}>
                      read the chapter notes
                    </ListRowTitle>
                  </ListRow>
                </ListRows>
              </State>
            ))}
            <State name="closed" note="muted and struck through">
              <ListRows aria-label="closed row">
                <ListRow closed>
                  <ListRowTitle href="#example">read the chapter notes</ListRowTitle>
                </ListRow>
              </ListRows>
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-cb-copy">
          at 600 px and below, the aside moves under the title and before the meta line. this frame gives the row a real
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
      <Section id="plain" title="plain rows">
        <p className="st-cb-copy">
          a plain row has no rules and no padding, so a list reads as words. the whole row is the link, its title holds
          one line at weight 400 and cuts at its end, and kind and when take 80 and 128 px columns. a row leaves out a
          column it doesn&rsquo;t print, and an empty <code>PlainRowWhen</code> holds its place.
        </p>
        <p className="st-cb-copy">
          three forms set the height: plain is 40 px, nested is 36 px for a list under a quiet head, and ruled is 48 px
          with a rule that bleeds to the panel&rsquo;s edges. a tick hangs in the gutter, so every title keeps the
          list&rsquo;s left edge.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <GroundFrame mode="light" title="plain rows, light" width={960} height={620}>
              <PlainExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="plain rows, dark" width={960} height={620}>
              <PlainExample />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="plain-states" title="plain title states">
        <p className="st-cb-copy">
          hover underlines the words, and keyboard focus rings the whole row, inside it when the row is ruled, since a
          ruled row reaches the panel&rsquo;s edges. a tick or an action sits above the link and keeps its own click.
        </p>
        <ModePair className="st-cb-stack">
          <PlainTitleStates />
        </ModePair>
      </Section>
      <Section id="plain-phone" title="plain rows on a phone">
        <p className="st-cb-copy">
          at 600 px and below, every form is 56 px, with the title over <code>kind · when</code> and when in the
          interface face. the tick moves to the right edge at 44 px, and actions take their own line. a list that sets{" "}
          <code>clamp</code> lets its titles take two lines, as the middle list does here. both frames use a 390 px
          viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="plain rows phone, light" height={730}>
              <PlainExample clamp />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="plain rows phone, dark" height={730}>
              <PlainExample clamp />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="plain-parts" title="plain parts">
        <dl className="st-ca-parts">
          <dt>
            <code>PlainRows</code>
          </dt>
          <dd>
            the list. <code>variant</code> is <code>plain</code>, <code>nested</code> or <code>ruled</code>, and{" "}
            <code>clamp</code> lets a title take two lines on a phone.
          </dd>
          <dt>
            <code>PlainRow</code>
          </dt>
          <dd>
            one row. <code>closed</code> keeps it in the list, muted and struck through.
          </dd>
          <dt>
            <code>PlainRowTitle</code>
          </dt>
          <dd>
            stretches its link over the row when it gets an <code>href</code> or the app&rsquo;s router link through{" "}
            <code>render</code>, and stays plain text without one.
          </dd>
          <dt>
            <code>PlainRowKind</code>, <code>PlainRowWhen</code>
          </dt>
          <dd>the columns, which fold under the title on a phone with a dot between them.</dd>
          <dt>
            <code>PlainRowTick</code>
          </dt>
          <dd>holds a checkbox in the gutter, or at the right edge on a phone.</dd>
          <dt>
            <code>PlainRowActions</code>
          </dt>
          <dd>buttons at the row&rsquo;s end, on their own line on a phone.</dd>
        </dl>
      </Section>
    </>
  );
}
