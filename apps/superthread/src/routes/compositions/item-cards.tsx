import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  ItemCards,
  ItemCard,
  ItemCardMedia,
  ItemCardId,
  ItemCardTitle,
  ItemCardWhen,
  ItemCardLede,
  ItemCardMeta,
  ItemCardActions,
} from "@/components/superthread/blocks/item-cards";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Badge } from "@/components/superthread/ui/badge";
import { SourceMark } from "@/components/superthread/ui/source-mark";
import { catalog } from "@/components/superthread/catalog";
import { GroundFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { marks } from "@/examples/source-mark";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "item-cards")!
  .serves!.map((app) => (app === "www" ? "the public site" : app))
  .join(", ");
export const Route = createFileRoute("/compositions/item-cards")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "link states" },
      { id: "phone", title: "on a phone" },
      { id: "full", title: "full width" },
      { id: "decided", title: "decided" },
      { id: "panel", title: "in the panel" },
      { id: "tiles", title: "tiles" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

// Fictional sources with generic drawings. The first needs the reader, so it alone prints on paper with an action.
function Tiles({ last }: { last?: boolean }) {
  return (
    <ItemCards tiles last={last} aria-label="sources">
      <ItemCard paper>
        <ItemCardMedia>
          <SourceMark {...marks.mail} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">mail</ItemCardTitle>
        <ItemCardLede>work mail and the shared inbox</ItemCardLede>
        <ItemCardMeta>needs signing in</ItemCardMeta>
        <ItemCardActions>
          <Button size="sm">sign in</Button>
        </ItemCardActions>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.calendar} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">calendar</ItemCardTitle>
        <ItemCardLede>the day&rsquo;s fixed points, across two accounts</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.card} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">card</ItemCardTitle>
        <ItemCardLede>the card for checkouts on your word</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.phone} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">phone</ItemCardTitle>
        <ItemCardLede>where you call in</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.chat} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">chat</ItemCardTitle>
        <ItemCardLede>messages, voice notes and groups</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.notes} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">notes</ItemCardTitle>
        <ItemCardLede>meeting notes and their summaries, kept as they were written</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.files} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">files</ItemCardTitle>
        <ItemCardLede>the shared drive</ItemCardLede>
      </ItemCard>
    </ItemCards>
  );
}

function CardsExample() {
  const [saved, setSaved] = useState(false);
  return (
    <ItemCards aria-label="fleet drafts">
      <ItemCard>
        <ItemCardMedia>
          <svg
            viewBox="0 0 320 200"
            role="img"
            aria-label="chapter outline: three connected sections"
            className="st-cb-diagram"
          >
            <path d="M44 100H276" stroke="currentColor" fill="none" />
            <rect x="32" y="88" width="24" height="24" fill="currentColor" />
            <rect x="148" y="88" width="24" height="24" fill="currentColor" />
            <rect x="264" y="88" width="24" height="24" fill="currentColor" />
          </svg>
        </ItemCardMedia>
        <ItemCardId>qt-014</ItemCardId>
        <ItemCardTitle href="#states">a chapter in three parts</ItemCardTitle>
        <ItemCardMeta>
          <span>quanta</span>
          <time dateTime="2026-10-25">25 oct</time>
        </ItemCardMeta>
        <ItemCardActions>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={saved ? "unsave chapter" : "save chapter"}
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            <Icon name={saved ? "check" : "plus"} />
          </Button>
        </ItemCardActions>
      </ItemCard>
      <ItemCard>
        <ItemCardId>tr-008</ItemCardId>
        <ItemCardTitle>notes before the next draft</ItemCardTitle>
        <ItemCardMeta>
          <span>trisys</span>
          <Badge variant="queued" />
        </ItemCardMeta>
      </ItemCard>
      <ItemCard>
        <ItemCardId>ar-021</ItemCardId>
        <ItemCardTitle href="#phone">a report ready to read</ItemCardTitle>
        <ItemCardMeta>
          <span>artifacts</span>
          <Badge variant="done" />
        </ItemCardMeta>
      </ItemCard>
    </ItemCards>
  );
}

function FullCards({ last }: { last?: boolean }) {
  return (
    <ItemCards aria-label="drafts to review" last={last}>
      <ItemCard variant="full">
        <ItemCardTitle href="#full">reply to sam about chapter 7</ItemCardTitle>
        <ItemCardWhen clock>before 11:00</ItemCardWhen>
        <ItemCardLede>for the 11:00 call, and first in today&rsquo;s brief.</ItemCardLede>
        <ItemCardMeta>
          <span>to sam okafor</span>
          <span>re: chapter 7 notes</span>
        </ItemCardMeta>
      </ItemCard>
      <ItemCard variant="full">
        <ItemCardTitle href="#full">send mina the figures for the tunnelling chapter</ItemCardTitle>
        <ItemCardWhen>since monday</ItemCardWhen>
        <ItemCardLede>answers mina&rsquo;s mail, mon 2 nov.</ItemCardLede>
        <ItemCardMeta>
          <span>to mina rao and 2 more</span>
          <span>re: figures · draft-3.pdf</span>
        </ItemCardMeta>
      </ItemCard>
      <ItemCard variant="full">
        <ItemCardTitle href="#full">say no to the sponsored chapter</ItemCardTitle>
        <ItemCardWhen>since friday</ItemCardWhen>
        <ItemCardLede>answers the publisher&rsquo;s mail, fri 30 oct.</ItemCardLede>
        <ItemCardMeta>
          <span>to the publisher</span>
          <span>re: a quick idea</span>
        </ItemCardMeta>
        <ItemCardActions>
          <Button variant="outline" size="sm">
            reject
          </Button>
        </ItemCardActions>
      </ItemCard>
    </ItemCards>
  );
}

// Printed states: the card takes the pointer and its link takes focus, so each sits on the element a real one reaches.
function FullStates() {
  return (
    <div className="st-cb-flow">
      <State name="hover" note="the edge lifts and the title underlines">
        <ItemCards aria-label="a card under the pointer">
          <ItemCard variant="full" data-demo="hover">
            <ItemCardTitle href="#full">reply to sam about chapter 7</ItemCardTitle>
            <ItemCardWhen clock>before 11:00</ItemCardWhen>
            <ItemCardMeta>
              <span>to sam okafor</span>
              <span>re: chapter 7 notes</span>
            </ItemCardMeta>
          </ItemCard>
        </ItemCards>
      </State>
      <State name="focus" note="the ring outlines the whole card, 2 px outside its edge">
        <ItemCards aria-label="a focused card">
          <ItemCard variant="full">
            <ItemCardTitle href="#full" data-demo="focus-visible">
              reply to sam about chapter 7
            </ItemCardTitle>
            <ItemCardWhen clock>before 11:00</ItemCardWhen>
            <ItemCardMeta>
              <span>to sam okafor</span>
              <span>re: chapter 7 notes</span>
            </ItemCardMeta>
          </ItemCard>
        </ItemCards>
      </State>
    </div>
  );
}

function DecidedStates() {
  return (
    <div className="st-cb-flow">
      <State name="hover" note="the title underlines">
        <ItemCards aria-label="a row under the pointer">
          <ItemCard variant="decided" data-demo="hover">
            <ItemCardTitle href="#decided">reply to sam about chapter 6</ItemCardTitle>
            <ItemCardMeta>sent</ItemCardMeta>
            <ItemCardWhen>mon 2 nov</ItemCardWhen>
          </ItemCard>
        </ItemCards>
      </State>
      <State name="focus" note="the ring stays inside the row and clear of its words">
        <ItemCards aria-label="a focused row">
          <ItemCard variant="decided">
            <ItemCardTitle href="#decided" data-demo="focus-visible">
              reply to sam about chapter 6
            </ItemCardTitle>
            <ItemCardMeta>sent</ItemCardMeta>
            <ItemCardWhen>mon 2 nov</ItemCardWhen>
          </ItemCard>
        </ItemCards>
      </State>
    </div>
  );
}

const decided = [
  { title: "reply to sam about chapter 6", word: "sent", when: "mon 2 nov" },
  { title: "confirm the review date with mina", word: "in your outlook drafts", when: "mon 2 nov" },
  { title: "say no to the conference sponsorship", word: "rejected", when: "fri 30 oct" },
  {
    title: "answer the printer about the second run of the figures for the tunnelling chapter",
    word: "superseded",
    when: "thu 29 oct",
  },
];

function DecidedCards({ last }: { last?: boolean }) {
  return (
    <ItemCards aria-label="decided drafts" last={last}>
      {decided.map((card) => (
        <ItemCard key={card.title} variant="decided">
          <ItemCardTitle href="#decided">{card.title}</ItemCardTitle>
          <ItemCardMeta>{card.word}</ItemCardMeta>
          <ItemCardWhen>{card.when}</ItemCardWhen>
        </ItemCard>
      ))}
    </ItemCards>
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

function Page() {
  return (
    <>
      <PageHead
        title="item cards"
        lede="cards that fill the available width, small or the full measure. a title can link the whole card while an action stays a separate control."
      >
        <InstallLine items={["item-cards"]} />
      </PageHead>
      <p className="st-cb-serves">serves {serves}.</p>

      <Section id="example" title="example">
        <p className="st-cb-copy">
          the first draft has media and a save control. its title links below; the next card has neither media nor a
          link. the last links without media.
        </p>
        <ModePair className="st-cb-stack">
          <CardsExample />
        </ModePair>
      </Section>
      <Section id="states" title="link states">
        <p className="st-cb-copy">
          the title appears once and names the stretched link. focus stays inside the card, and its corner control keeps
          its own ring.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-states">
            {["rest", "hover", "focus-visible"].map((state) => (
              <State
                key={state}
                name={state === "focus-visible" ? "focus" : state}
                note={state === "focus-visible" ? "the ring follows the whole card" : "the card keeps its flat surface"}
              >
                <ItemCards aria-label={`${state} card`}>
                  <ItemCard>
                    <ItemCardId>ar-021</ItemCardId>
                    <ItemCardTitle href="#example" data-demo={state}>
                      a report ready to read
                    </ItemCardTitle>
                    <ItemCardMeta>artifacts</ItemCardMeta>
                  </ItemCard>
                </ItemCards>
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-cb-copy">
          the grid uses one column when only one card fits. a narrow viewport leaves the title and corner action room to
          work.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <PhoneFrame mode="light">
              <CardsExample />
            </PhoneFrame>
          }
          dark={
            <PhoneFrame mode="dark">
              <CardsExample />
            </PhoneFrame>
          }
        />
      </Section>
      <Section id="full" title="full width">
        <p className="st-cb-copy">
          <code>variant=&quot;full&quot;</code> takes the whole measure, for a queue someone works down: a title, when
          it matters, why it&rsquo;s here, and a foot with who it goes to. the card is one link. an action sits above
          it, so reject never opens the card. a time the reader has to meet takes <code>clock</code>, which prints in
          foreground; an age stays muted.
        </p>
        <ModePair className="st-cb-stack">
          <FullCards />
        </ModePair>
        <p className="st-cb-copy">
          a linked card answers the pointer on its edge and its title. focus takes the whole card.
        </p>
        <ModePair className="st-cb-stack">
          <FullStates />
        </ModePair>
      </Section>
      <Section id="decided" title="decided">
        <p className="st-cb-copy">
          <code>variant=&quot;decided&quot;</code> collapses a card to one line: the title, the word it was decided
          with, and the date. the same parts print, so a card moves from one form to the other by its variant alone. a
          long title ellipsizes, and the lede and actions don&rsquo;t print. at 600 px and below the line can&rsquo;t
          hold all three, so it folds to two in a 56 px row: the title, then the word and the date.
        </p>
        <ModePair className="st-cb-stack">
          <DecidedCards />
        </ModePair>
        <p className="st-cb-copy">
          a row answers the pointer on its title. its ring stays inside its rules, and the row&rsquo;s padding keeps it
          off the words.
        </p>
        <ModePair className="st-cb-stack">
          <DecidedStates />
        </ModePair>
      </Section>
      <Section id="panel" title="in the panel">
        <p className="st-cb-copy">
          inside the working panel a list of decided rows reaches the panel&rsquo;s edges, so its rules do. a list that
          mixes the two forms keeps its measure, so a card changing form never widens the others. these frames use an
          880 px viewport.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="decided cards in the panel, light" width={880} height={320}>
              <AppShellPanel>
                <DecidedCards />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="decided cards in the panel, dark" width={880} height={320}>
              <AppShellPanel>
                <DecidedCards />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <p className="st-cb-copy">
          on a phone a full list reaches them too: its cards give up their boxes for ruled rows. <code>last</code> says
          nothing follows the list in the panel, so it runs down to the panel&rsquo;s foot and drops its closing rule.
          these frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="full cards phone, light" height={640}>
              <AppShellPanel>
                <FullCards last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="full cards phone, dark" height={640}>
              <AppShellPanel>
                <FullCards last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <ModePair
          light={
            <GroundFrame mode="light" title="decided cards phone, light" height={300}>
              <AppShellPanel>
                <DecidedCards last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="decided cards phone, dark" height={300}>
              <AppShellPanel>
                <DecidedCards last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="tiles" title="tiles">
        <p className="st-cb-copy">
          <code>tiles</code> on the list makes it a full-bleed grid of ruled cells, for the things a person holds, such
          as the sources an app reads. the grid hangs from one rule in foreground, and each tile prints a 96 px mark, a
          name, what it holds and, when it needs someone, its state and one action. four columns from 832 px of list,
          three from 624 px, two below. the last tile closes a short row. these frames hold the panel at its full 880
          px.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="tiles in the panel, light" width={960} height={620}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="tiles in the panel, dark" width={960} height={620}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <p className="st-cb-copy">
          <code>paper</code> on a card makes it the one tile that prints on paper: the tile that needs the reader. it
          comes first, so its contact edge lands on the grid, and it keeps its fill under the pointer. a linked tile
          takes the faint fill and its mark&rsquo;s second frame. the action sits level with the state in a 220 px cell
          and takes its own line anywhere narrower. on a phone the mark drops to 80 px and the action stretches to a 44
          px target. these frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="tiles phone, light" height={1000}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="tiles phone, dark" height={1000}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>ItemCards</code>
          </dt>
          <dd>
            the list. <code>ItemCard</code> is one card, and its <code>variant</code> sets the form every part prints
            in. set <code>last</code> when nothing follows the list in the working panel, and <code>tiles</code> for the
            grid of ruled cells, where <code>paper</code> on one <code>ItemCard</code> prints that tile on paper.
          </dd>
          <dt>
            <code>ItemCardTitle</code>
          </dt>
          <dd>
            links the whole card with <code>href</code> or <code>render</code>. a full card&rsquo;s title and a
            tile&rsquo;s are headings: set <code>level</code> under a section&rsquo;s title.
          </dd>
          <dt>
            <code>ItemCardWhen</code>
          </dt>
          <dd>
            a time or an age, in mono. <code>clock</code> marks a time to meet.
          </dd>
          <dt>
            <code>ItemCardLede</code>
          </dt>
          <dd>
            why a full card is here, in reading type, or what a tile holds, at the instrument step. no other card prints
            it.
          </dd>
          <dt>
            <code>ItemCardMeta</code>
          </dt>
          <dd>
            a small card&rsquo;s bottom line. on a full card it takes pieces, one to an element or a run of text, and
            prints the dot between them, with the first in foreground. on a decided card it&rsquo;s the one word, and on
            a tile the state.
          </dd>
          <dt>
            <code>ItemCardActions</code>
          </dt>
          <dd>
            the app&rsquo;s buttons: the corner of a small card, the foot of a full card, a tile&rsquo;s one action,
            nothing when decided.
          </dd>
          <dt>
            <code>ItemCardMedia</code>
          </dt>
          <dd>
            a small card&rsquo;s thumbnail, or a tile&rsquo;s mark, usually a <code>SourceMark</code>.{" "}
            <code>ItemCardId</code> is the small card&rsquo;s quiet id line.
          </dd>
        </dl>
      </Section>
    </>
  );
}
