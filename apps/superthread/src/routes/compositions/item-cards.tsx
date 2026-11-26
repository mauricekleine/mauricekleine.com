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
  .serves!.map((app) => (app === "www" ? "the public site" : app[0]!.toUpperCase() + app.slice(1)))
  .join(", ");
export const Route = createFileRoute("/compositions/item-cards")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "Link states" },
      { id: "phone", title: "On a phone" },
      { id: "full", title: "Full width" },
      { id: "decided", title: "Decided" },
      { id: "panel", title: "In the panel" },
      { id: "tiles", title: "Tiles" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

// Fictional sources with generic drawings. The first needs the reader, so it alone prints on paper with an action.
function Tiles({ last }: { last?: boolean }) {
  return (
    <ItemCards tiles last={last} aria-label="Sources">
      <ItemCard paper>
        <ItemCardMedia>
          <SourceMark {...marks.mail} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Mail</ItemCardTitle>
        <ItemCardLede>Work mail and the shared inbox</ItemCardLede>
        <ItemCardMeta>Needs signing in</ItemCardMeta>
        <ItemCardActions>
          <Button size="sm">Sign in</Button>
        </ItemCardActions>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.calendar} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Calendar</ItemCardTitle>
        <ItemCardLede>The day&rsquo;s fixed points, across two accounts</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.card} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Card</ItemCardTitle>
        <ItemCardLede>The card for checkouts on your word</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.phone} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Phone</ItemCardTitle>
        <ItemCardLede>Where you call in</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.chat} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Chat</ItemCardTitle>
        <ItemCardLede>Messages, voice notes and groups</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.notes} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Notes</ItemCardTitle>
        <ItemCardLede>Meeting notes and their summaries, kept as they were written</ItemCardLede>
      </ItemCard>
      <ItemCard>
        <ItemCardMedia>
          <SourceMark {...marks.files} />
        </ItemCardMedia>
        <ItemCardTitle href="#tiles">Files</ItemCardTitle>
        <ItemCardLede>The shared drive</ItemCardLede>
      </ItemCard>
    </ItemCards>
  );
}

function CardsExample() {
  const [saved, setSaved] = useState(false);
  return (
    <ItemCards aria-label="Fleet drafts">
      <ItemCard>
        <ItemCardMedia>
          <svg
            viewBox="0 0 320 200"
            role="img"
            aria-label="Chapter outline: three connected sections"
            className="st-cb-diagram"
          >
            <path d="M44 100H276" stroke="currentColor" fill="none" />
            <rect x="32" y="88" width="24" height="24" fill="currentColor" />
            <rect x="148" y="88" width="24" height="24" fill="currentColor" />
            <rect x="264" y="88" width="24" height="24" fill="currentColor" />
          </svg>
        </ItemCardMedia>
        <ItemCardId>qt-014</ItemCardId>
        <ItemCardTitle href="#states">A chapter in three parts</ItemCardTitle>
        <ItemCardMeta>
          <span>Quanta</span>
          <time dateTime="2026-10-25">25 Oct</time>
        </ItemCardMeta>
        <ItemCardActions>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={saved ? "Unsave chapter" : "Save chapter"}
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            <Icon name={saved ? "check" : "plus"} />
          </Button>
        </ItemCardActions>
      </ItemCard>
      <ItemCard>
        <ItemCardId>tr-008</ItemCardId>
        <ItemCardTitle>Notes before the next draft</ItemCardTitle>
        <ItemCardMeta>
          <span>Trisys</span>
          <Badge variant="queued" />
        </ItemCardMeta>
      </ItemCard>
      <ItemCard>
        <ItemCardId>ar-021</ItemCardId>
        <ItemCardTitle href="#phone">A report ready to read</ItemCardTitle>
        <ItemCardMeta>
          <span>Artifacts</span>
          <Badge variant="done" />
        </ItemCardMeta>
      </ItemCard>
    </ItemCards>
  );
}

function FullCards({ last }: { last?: boolean }) {
  return (
    <ItemCards aria-label="Drafts to review" last={last}>
      <ItemCard variant="full">
        <ItemCardTitle href="#full">Reply to Sam about chapter 7</ItemCardTitle>
        <ItemCardWhen clock>Before 11:00</ItemCardWhen>
        <ItemCardLede>For the 11:00 call, and first in today&rsquo;s brief.</ItemCardLede>
        <ItemCardMeta>
          <span>To Sam Okafor</span>
          <span>Re: chapter 7 notes</span>
        </ItemCardMeta>
      </ItemCard>
      <ItemCard variant="full">
        <ItemCardTitle href="#full">Send Mina the figures for the tunnelling chapter</ItemCardTitle>
        <ItemCardWhen>Since Monday</ItemCardWhen>
        <ItemCardLede>Answers Mina&rsquo;s mail, Mon 2 Nov.</ItemCardLede>
        <ItemCardMeta>
          <span>To Mina Rao and 2 more</span>
          <span>Re: figures · draft-3.pdf</span>
        </ItemCardMeta>
      </ItemCard>
      <ItemCard variant="full">
        <ItemCardTitle href="#full">Say no to the sponsored chapter</ItemCardTitle>
        <ItemCardWhen>Since Friday</ItemCardWhen>
        <ItemCardLede>Answers the publisher&rsquo;s mail, Fri 30 Oct.</ItemCardLede>
        <ItemCardMeta>
          <span>To the publisher</span>
          <span>Re: a quick idea</span>
        </ItemCardMeta>
        <ItemCardActions>
          <Button variant="outline" size="sm">
            Reject
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
      <State name="Hover" note="The edge lifts and the title underlines">
        <ItemCards aria-label="A card under the pointer">
          <ItemCard variant="full" data-demo="hover">
            <ItemCardTitle href="#full">Reply to Sam about chapter 7</ItemCardTitle>
            <ItemCardWhen clock>Before 11:00</ItemCardWhen>
            <ItemCardMeta>
              <span>To Sam Okafor</span>
              <span>Re: chapter 7 notes</span>
            </ItemCardMeta>
          </ItemCard>
        </ItemCards>
      </State>
      <State name="Focus" note="The ring outlines the whole card, 2 px outside its edge">
        <ItemCards aria-label="A focused card">
          <ItemCard variant="full">
            <ItemCardTitle href="#full" data-demo="focus-visible">
              Reply to Sam about chapter 7
            </ItemCardTitle>
            <ItemCardWhen clock>Before 11:00</ItemCardWhen>
            <ItemCardMeta>
              <span>To Sam Okafor</span>
              <span>Re: chapter 7 notes</span>
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
      <State name="Hover" note="The title underlines">
        <ItemCards aria-label="A row under the pointer">
          <ItemCard variant="decided" data-demo="hover">
            <ItemCardTitle href="#decided">Reply to Sam about chapter 6</ItemCardTitle>
            <ItemCardMeta>Sent</ItemCardMeta>
            <ItemCardWhen>Mon 2 Nov</ItemCardWhen>
          </ItemCard>
        </ItemCards>
      </State>
      <State name="Focus" note="The ring stays inside the row and clear of its words">
        <ItemCards aria-label="A focused row">
          <ItemCard variant="decided">
            <ItemCardTitle href="#decided" data-demo="focus-visible">
              Reply to Sam about chapter 6
            </ItemCardTitle>
            <ItemCardMeta>Sent</ItemCardMeta>
            <ItemCardWhen>Mon 2 Nov</ItemCardWhen>
          </ItemCard>
        </ItemCards>
      </State>
    </div>
  );
}

const decided = [
  { title: "Reply to Sam about chapter 6", word: "Sent", when: "Mon 2 Nov" },
  { title: "Confirm the review date with Mina", word: "In your Outlook drafts", when: "Mon 2 Nov" },
  { title: "Say no to the conference sponsorship", word: "Rejected", when: "Fri 30 Oct" },
  {
    title: "Answer the printer about the second run of the figures for the tunnelling chapter",
    word: "Superseded",
    when: "Thu 29 Oct",
  },
];

function DecidedCards({ last }: { last?: boolean }) {
  return (
    <ItemCards aria-label="Decided drafts" last={last}>
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
      title={`Phone specimen, ${mode}`}
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
        title="Item cards"
        lede="Cards that fill the available width, small or the full measure. A title can link the whole card while an action stays a separate control."
      >
        <InstallLine items={["item-cards"]} />
      </PageHead>
      <p className="st-cb-serves">Serves {serves}.</p>

      <Section id="example" title="Example">
        <p className="st-cb-copy">
          The first draft has media and a save control. Its title links below; the next card has neither media nor a
          link. The last links without media.
        </p>
        <ModePair className="st-cb-stack">
          <CardsExample />
        </ModePair>
      </Section>
      <Section id="states" title="Link states">
        <p className="st-cb-copy">
          The title appears once and names the stretched link. Focus stays inside the card, and its corner control keeps
          its own ring.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-states">
            {["rest", "hover", "focus-visible"].map((state) => (
              <State
                key={state}
                name={state === "focus-visible" ? "Focus" : state === "hover" ? "Hover" : "Rest"}
                note={state === "focus-visible" ? "The ring follows the whole card" : "The card keeps its flat surface"}
              >
                <ItemCards
                  aria-label={`${state === "focus-visible" ? "Focus" : state === "hover" ? "Hover" : "Rest"} card`}
                >
                  <ItemCard>
                    <ItemCardId>ar-021</ItemCardId>
                    <ItemCardTitle href="#example" data-demo={state}>
                      A report ready to read
                    </ItemCardTitle>
                    <ItemCardMeta>Artifacts</ItemCardMeta>
                  </ItemCard>
                </ItemCards>
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-cb-copy">
          The grid uses one column when only one card fits. A narrow viewport leaves the title and corner action room to
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
      <Section id="full" title="Full width">
        <p className="st-cb-copy">
          <code>variant=&quot;full&quot;</code> takes the whole measure, for a queue someone works down: a title, when
          it matters, why it&rsquo;s here, and a foot with who it goes to. The card is one link. An action sits above
          it, so Reject never opens the card. A time the reader has to meet takes <code>clock</code>, which prints in
          foreground; an age stays muted.
        </p>
        <ModePair className="st-cb-stack">
          <FullCards />
        </ModePair>
        <p className="st-cb-copy">
          A linked card answers the pointer on its edge and its title. Focus takes the whole card.
        </p>
        <ModePair className="st-cb-stack">
          <FullStates />
        </ModePair>
      </Section>
      <Section id="decided" title="Decided">
        <p className="st-cb-copy">
          <code>variant=&quot;decided&quot;</code> collapses a card to one line: the title, the word it was decided
          with, and the date. The same parts print, so a card moves from one form to the other by its variant alone. A
          long title ellipsizes, and the lede and actions don&rsquo;t print. At 600 px and below the line can&rsquo;t
          hold all three, so it folds to two in a 56 px row: the title, then the word and the date.
        </p>
        <ModePair className="st-cb-stack">
          <DecidedCards />
        </ModePair>
        <p className="st-cb-copy">
          A row answers the pointer on its title. Its ring stays inside its rules, and the row&rsquo;s padding keeps it
          off the words.
        </p>
        <ModePair className="st-cb-stack">
          <DecidedStates />
        </ModePair>
      </Section>
      <Section id="panel" title="In the panel">
        <p className="st-cb-copy">
          Inside the working panel a list of decided rows reaches the panel&rsquo;s edges, so its rules do. A list that
          mixes the two forms keeps its measure, so a card changing form never widens the others. These frames use an
          880 px viewport.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Decided cards in the panel, light" width={880} height={320}>
              <AppShellPanel>
                <DecidedCards />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Decided cards in the panel, dark" width={880} height={320}>
              <AppShellPanel>
                <DecidedCards />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <p className="st-cb-copy">
          On a phone a full list reaches them too: its cards give up their boxes for ruled rows. <code>last</code> says
          nothing follows the list in the panel, so it runs down to the panel&rsquo;s foot and drops its closing rule.
          These frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Full cards phone, light" height={660}>
              <AppShellPanel>
                <FullCards last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Full cards phone, dark" height={660}>
              <AppShellPanel>
                <FullCards last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <ModePair
          light={
            <GroundFrame mode="light" title="Decided cards phone, light" height={300}>
              <AppShellPanel>
                <DecidedCards last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Decided cards phone, dark" height={300}>
              <AppShellPanel>
                <DecidedCards last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="tiles" title="Tiles">
        <p className="st-cb-copy">
          <code>tiles</code> on the list makes it a full-bleed grid of ruled cells, for the things a person holds, such
          as the sources an app reads. The grid hangs from one rule in foreground, and each tile prints a 96 px mark, a
          name, what it holds and, when it needs someone, its state and one action. Four columns from 832 px of list,
          three from 624 px, two below. The last tile closes a short row. These frames hold the panel at its full 880
          px.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Tiles in the panel, light" width={960} height={640}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Tiles in the panel, dark" width={960} height={640}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
        <p className="st-cb-copy">
          <code>paper</code> on a card makes it the one tile that prints on paper: the tile that needs the reader. It
          comes first, so its contact edge lands on the grid, and it keeps its fill under the pointer. A linked tile
          takes the faint fill and its mark&rsquo;s second frame. The action sits level with the state in a 220 px cell
          and takes its own line anywhere narrower. On a phone the mark drops to 80 px and the action stretches to a 44
          px target. These frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Tiles phone, light" height={1020}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Tiles phone, dark" height={1020}>
              <AppShellPanel>
                <Tiles last />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>ItemCards</code>
          </dt>
          <dd>
            The list. <code>ItemCard</code> is one card, and its <code>variant</code> sets the form every part prints
            in. Set <code>last</code> when nothing follows the list in the working panel, and <code>tiles</code> for the
            grid of ruled cells, where <code>paper</code> on one <code>ItemCard</code> prints that tile on paper.
          </dd>
          <dt>
            <code>ItemCardTitle</code>
          </dt>
          <dd>
            Links the whole card with <code>href</code> or <code>render</code>. A full card&rsquo;s title and a
            tile&rsquo;s are headings: set <code>level</code> under a section&rsquo;s title.
          </dd>
          <dt>
            <code>ItemCardWhen</code>
          </dt>
          <dd>
            A time or an age, in mono. <code>clock</code> marks a time to meet.
          </dd>
          <dt>
            <code>ItemCardLede</code>
          </dt>
          <dd>
            Why a full card is here, in reading type, or what a tile holds, at the instrument step. No other card prints
            it.
          </dd>
          <dt>
            <code>ItemCardMeta</code>
          </dt>
          <dd>
            A small card&rsquo;s bottom line. On a full card it takes pieces, one to an element or a run of text, and
            prints the dot between them, with the first in foreground. On a decided card it&rsquo;s the one word, and on
            a tile the state.
          </dd>
          <dt>
            <code>ItemCardActions</code>
          </dt>
          <dd>
            The app&rsquo;s buttons: the corner of a small card, the foot of a full card, a tile&rsquo;s one action,
            nothing when decided.
          </dd>
          <dt>
            <code>ItemCardMedia</code>
          </dt>
          <dd>
            A small card&rsquo;s thumbnail, or a tile&rsquo;s mark, usually a <code>SourceMark</code>.{" "}
            <code>ItemCardId</code> is the small card&rsquo;s quiet ID line.
          </dd>
        </dl>
      </Section>
    </>
  );
}
