import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ItemCards,
  ItemCard,
  ItemCardMedia,
  ItemCardId,
  ItemCardTitle,
  ItemCardMeta,
  ItemCardActions,
} from "@/components/superthread/blocks/item-cards";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Badge } from "@/components/superthread/ui/badge";
import { catalog } from "@/components/superthread/catalog";
import { State } from "@/examples/input";
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
    ],
  },
  component: Page,
});

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
        lede="small cards that fill the available width. a title can link the whole card while a corner action stays a separate control."
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
    </>
  );
}
