import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ListRows,
  ListRow,
  ListRowLead,
  ListRowTitle,
  ListRowAside,
  ListRowMeta,
  ListRowActions,
} from "@/components/superthread/blocks/list-rows";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { catalog } from "@/components/superthread/catalog";
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
    ],
  },
  component: Page,
});

function RowsExample() {
  const [done, setDone] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <ListRows aria-label="chapter tasks">
      <ListRow>
        <ListRowLead>
          <Checkbox aria-label="complete the reading layout review" checked={done} onCheckedChange={setDone} />
        </ListRowLead>
        <ListRowTitle href="#states">review the reading layout on a small screen</ListRowTitle>
        <ListRowAside>
          <time dateTime="2026-10-25T09:00:00Z">09:00</time>
        </ListRowAside>
        <ListRowMeta>
          <span>quanta</span>
          <Badge variant={done ? "done" : "queued"} />
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

function Page() {
  return (
    <>
      <PageHead
        title="list rows"
        lede="ruled rows for tasks, chapters and notes. a lead is optional; the title, time, context and actions each keep their place."
      >
        <InstallLine items={["list-rows"]} />
      </PageHead>
      <p className="st-cb-serves">serves {serves}.</p>

      <Section id="example" title="example">
        <p className="st-cb-copy">
          check the first task to complete it, or pin it for later. its title links to the states below; the next two
          titles are plain text.
        </p>
        <ModePair className="st-cb-stack">
          <RowsExample />
        </ModePair>
      </Section>
      <Section id="states" title="title states">
        <p className="st-cb-copy">
          a linked title takes the house ink. hover adds an underline, and keyboard focus draws the control ring.
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
    </>
  );
}
