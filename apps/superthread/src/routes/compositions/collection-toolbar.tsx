import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  CollectionToolbar,
  ToolbarGroup,
  ToolbarSpacer,
  FilterChip,
  ToolbarCount,
  ViewSwitch,
} from "@/components/superthread/blocks/collection-toolbar";
import { Button } from "@/components/superthread/ui/button";
import { catalog } from "@/components/superthread/catalog";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "collection-toolbar")!
  .serves!.map((app) => (app === "www" ? "the public site" : app[0]!.toUpperCase() + app.slice(1)))
  .join(", ");
export const Route = createFileRoute("/compositions/collection-toolbar")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "filters", title: "Filters and counts" },
      { id: "states", title: "View states" },
      { id: "phone", title: "On a phone" },
    ],
  },
  component: Page,
});

const views = [
  { value: "rows", label: "Rows" },
  { value: "cards", label: "Cards" },
] as const;
const tasks = [
  { title: "Check the reading layout", ship: "Quanta" },
  { title: "Name the new collection", ship: "Orbit" },
  { title: "Review the chapter notes", ship: "Quanta" },
];
function ToolbarExample() {
  const [filtered, setFiltered] = useState(true);
  const [view, setView] = useState("rows");
  const shown = filtered ? tasks.filter((task) => task.ship === "Quanta") : tasks;
  return (
    <div>
      <CollectionToolbar label="Task collection controls">
        <ToolbarGroup label="Ship">
          {filtered ? (
            <FilterChip onClear={() => setFiltered(false)} clearLabel="Clear Quanta filter">
              Quanta
            </FilterChip>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setFiltered(true)}>
              Filter Quanta
            </Button>
          )}
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarCount shown={shown.length} total={tasks.length} />
        <ViewSwitch views={views} value={view} onValueChange={setView} label="Task view" />
      </CollectionToolbar>
      <ul aria-label="Matching tasks" className={view === "cards" ? "st-cb-preview-cards" : "st-cb-preview-rows"}>
        {shown.map((task) => (
          <li key={task.title}>
            <b>{task.title}</b>
            <span>{task.ship}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
function PrintedView({ demo }: { demo: "hover" | "focus-visible" }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    host.current?.querySelectorAll("button")[1]?.setAttribute("data-demo", demo);
  }, [demo]);
  return (
    <div ref={host}>
      <ViewSwitch views={views} label={`${demo === "hover" ? "Hover" : "Focus"} view switch`} />
    </div>
  );
}
function FilterStates() {
  const [counted, setCounted] = useState(true);
  const [plain, setPlain] = useState(true);
  return (
    <div className="st-cb-states">
      <State name="With a count" note="The result stays beside its filter">
        {counted ? (
          <FilterChip shown={2} total={8} onClear={() => setCounted(false)}>
            Queued
          </FilterChip>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setCounted(true)}>
            Restore queued filter
          </Button>
        )}
      </State>
      <State name="Without a count" note="The clear control has its own name">
        {plain ? (
          <FilterChip onClear={() => setPlain(false)} clearLabel="Clear Orbit filter">
            Orbit
          </FilterChip>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setPlain(true)}>
            Restore Orbit filter
          </Button>
        )}
      </State>
      <State name="Zero results" note="Zero remains a result">
        <ToolbarCount shown={0} total={8} />
      </State>
      <State name="All results" note="A count also stands alone">
        <ToolbarCount shown={8} total={8} />
      </State>
    </div>
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
        title="Collection toolbar"
        lede="Filters, a result count and a view switch above one collection. Each group keeps its name when the row wraps."
      >
        <InstallLine items={["collection-toolbar"]} />
      </PageHead>
      <p className="st-cb-serves">Serves {serves}.</p>

      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Clear the ship filter to see every task. Switch to cards and the same results change their layout.
        </p>
        <ModePair className="st-cb-stack">
          <ToolbarExample />
        </ModePair>
      </Section>
      <Section id="filters" title="Filters and counts">
        <p className="st-cb-copy">
          A filter can carry its own count, or leave the count beside the view switch. Clearing a chip removes the
          filter.
        </p>
        <ModePair className="st-cb-stack">
          <FilterStates />
        </ModePair>
      </Section>
      <Section id="states" title="View states">
        <p className="st-cb-copy">
          One view stays pressed, including when it is chosen again. Use the arrow keys to move between views.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-states">
            <State name="Rows pressed" note="The first view is the default">
              <ViewSwitch views={views} />
            </State>
            <State name="Cards pressed" note="A different initial view">
              <ViewSwitch views={views} defaultValue="cards" />
            </State>
            <State name="Disabled" note="The selected view stays visible">
              <ViewSwitch views={views} defaultValue="cards" disabled />
            </State>
            <State name="Hover" note="The unselected control under the pointer">
              <PrintedView demo="hover" />
            </State>
            <State name="Focus" note="The control keeps its keyboard ring">
              <PrintedView demo="focus-visible" />
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="phone" title="On a phone">
        <p className="st-cb-copy">
          A phone viewport, capped at 320 px. The groups wrap before the results begin; the spacer takes only the room
          left over.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <PhoneFrame mode="light">
              <ToolbarExample />
            </PhoneFrame>
          }
          dark={
            <PhoneFrame mode="dark">
              <ToolbarExample />
            </PhoneFrame>
          }
        />
      </Section>
    </>
  );
}
