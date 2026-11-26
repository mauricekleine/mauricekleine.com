import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Notice, NoticeActions, NoticeDescription, NoticeTitle } from "@/components/superthread/blocks/notice";
import { Button } from "@/components/superthread/ui/button";
import type { StatusState } from "@/components/superthread/ui/glyphs";
import { Serves, ViewportFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/notice")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "States" },
      { id: "quiet", title: "The quiet line" },
      { id: "phone", title: "Phone" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function ActionNotice() {
  const [state, setState] = useState<StatusState>("failed");
  const [details, setDetails] = useState(false);
  return (
    <Notice state={state}>
      <NoticeTitle>{state === "failed" ? "Failed: run-024 did not finish" : "Done: run-024 finished"}</NoticeTitle>
      <NoticeDescription>
        {state === "failed"
          ? "The sample check timed out. Your draft is safe."
          : "The retry passed. The draft is ready to review."}
        {details && " The sample run checks three pages in Orbit."}
      </NoticeDescription>
      <NoticeActions>
        <Button variant="outline" size="sm" onClick={() => setState(state === "failed" ? "done" : "failed")}>
          {state === "failed" ? "Retry" : "Reset"}
        </Button>
        <Button variant="ghost" size="sm" aria-expanded={details} onClick={() => setDetails(!details)}>
          {details ? "Hide details" : "Details"}
        </Button>
      </NoticeActions>
    </Notice>
  );
}

const newerLine = "A newer version is waiting. It won't replace this one.";

// The line is there from the first paint and reserves its words, so they arrive without moving the button under it,
// even where they wrap.
function QuietLine() {
  const [newer, setNewer] = useState(true);
  return (
    <div className="st-ca-stack">
      <Notice variant="quiet" reserve={newerLine}>
        {newer && newerLine}
      </Notice>
      <Button variant="outline" size="sm" onClick={() => setNewer(!newer)}>
        {newer ? "Clear the line" : "Print the line"}
      </Button>
    </div>
  );
}

const notices: { state?: StatusState; label: string; title: string; description: string }[] = [
  { label: "No state", title: "Sample data only", description: "These runs reset when you reload the page." },
  { state: "done", label: "Done", title: "Done: draft saved", description: "The latest changes are ready for review." },
  {
    state: "running",
    label: "Running",
    title: "Running: checking the draft",
    description: "The sample run is checking three pages.",
  },
  {
    state: "waiting",
    label: "Waiting",
    title: "Waiting: review the draft",
    description: "The next run starts after your review.",
  },
  {
    state: "failed",
    label: "Failed",
    title: "Failed: the check timed out",
    description: "The draft is safe. Retry from the run page.",
  },
  {
    state: "queued",
    label: "Queued",
    title: "Queued: run-025",
    description: "The next free agent picks up this task.",
  },
];
function Page() {
  return (
    <>
      <PageHead
        title="Notice"
        lede="A message in the page's own flow. The small glyph carries the status ink; the words and actions stay on a flat fill."
      >
        <InstallLine items={["notice"]} />
      </PageHead>
      <Serves name="notice" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Retry the sample run to change failed to done, or open its details. A failed notice interrupts as an alert;
          other updates use a status.
        </p>
        <ModePair className="st-ca-wide-pair">
          <ActionNotice />
        </ModePair>
      </Section>
      <Section id="states" title="States">
        <p className="st-ca-copy">
          Without a state, the notice uses the information glyph. Each status below keeps its word beside its own glyph.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            {notices.map((notice) => (
              <State
                className="st-ca-state"
                key={notice.state ?? "none"}
                name={notice.label}
                note={notice.state === "failed" ? "Alert" : "Status"}
              >
                <Notice state={notice.state}>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  <NoticeDescription>{notice.description}</NoticeDescription>
                </Notice>
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="quiet" title="The quiet line">
        <p className="st-ca-copy">
          One muted line: no box, no glyph and no state, for a fact that asks for nothing, such as a newer version
          waiting. It takes its line while it&rsquo;s empty, and it wraps on a phone rather than clip, so it takes the
          longest words it can print as <code>reserve</code> and holds their height, and the button below stays put.
          It&rsquo;s always a status, so a screen reader hears it without being interrupted.
        </p>
        <ModePair className="st-ca-wide-pair">
          <QuietLine />
        </ModePair>
      </Section>
      <Section id="phone" title="Phone">
        <p className="st-ca-copy">
          At 600 px the action row moves below the description. Both frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="Notice phone, light" height={250}>
              <div className="st-ca-inset">
                <ActionNotice />
              </div>
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="Notice phone, dark" height={250}>
              <div className="st-ca-inset">
                <ActionNotice />
              </div>
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Notice</code>
          </dt>
          <dd>
            Sets the glyph and announcement role from <code>state</code>, or prints one line with{" "}
            <code>variant=&quot;quiet&quot;</code>. The quiet line takes its words as children, with none of the parts
            below, and <code>reserve</code> takes the longest words it can print.
          </dd>
          <dt>
            <code>NoticeTitle</code>
          </dt>
          <dd>
            The first sentence, followed by <code>NoticeDescription</code> for supporting words.
          </dd>
          <dt>
            <code>NoticeActions</code>
          </dt>
          <dd>The app's buttons beside the message, then below it on a phone.</dd>
        </dl>
      </Section>
    </>
  );
}
