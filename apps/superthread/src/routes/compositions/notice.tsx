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
      { id: "example", title: "example" },
      { id: "states", title: "states" },
      { id: "phone", title: "phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function ActionNotice() {
  const [state, setState] = useState<StatusState>("failed");
  const [details, setDetails] = useState(false);
  return (
    <Notice state={state}>
      <NoticeTitle>{state === "failed" ? "failed: run-024 did not finish" : "done: run-024 finished"}</NoticeTitle>
      <NoticeDescription>
        {state === "failed"
          ? "the sample check timed out. your draft is safe."
          : "the retry passed. the draft is ready to review."}
        {details && " the sample run checks three pages in orbit."}
      </NoticeDescription>
      <NoticeActions>
        <Button variant="outline" size="sm" onClick={() => setState(state === "failed" ? "done" : "failed")}>
          {state === "failed" ? "retry" : "reset"}
        </Button>
        <Button variant="ghost" size="sm" aria-expanded={details} onClick={() => setDetails(!details)}>
          {details ? "hide details" : "details"}
        </Button>
      </NoticeActions>
    </Notice>
  );
}
const notices: { state?: StatusState; title: string; description: string }[] = [
  { title: "sample data only", description: "these runs reset when you reload the page." },
  { state: "done", title: "done: draft saved", description: "the latest changes are ready for review." },
  { state: "running", title: "running: checking the draft", description: "the sample run is checking three pages." },
  { state: "waiting", title: "waiting: review the draft", description: "the next run starts after your review." },
  { state: "failed", title: "failed: the check timed out", description: "the draft is safe. retry from the run page." },
  { state: "queued", title: "queued: run-025", description: "the next free agent picks up this task." },
];
function Page() {
  return (
    <>
      <PageHead
        title="notice"
        lede="a message in the page's own flow. the small glyph carries the status ink; the words and actions stay on a flat fill."
      >
        <InstallLine items={["notice"]} />
      </PageHead>
      <Serves name="notice" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          retry the sample run to change failed to done, or open its details. a failed notice interrupts as an alert;
          other updates use a status.
        </p>
        <ModePair className="st-ca-wide-pair">
          <ActionNotice />
        </ModePair>
      </Section>
      <Section id="states" title="states">
        <p className="st-ca-copy">
          without a state, the notice uses the information glyph. each status below keeps its word beside its own glyph.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            {notices.map((notice) => (
              <State
                className="st-ca-state"
                key={notice.state ?? "none"}
                name={notice.state ?? "no state"}
                note={notice.state === "failed" ? "alert" : "status"}
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
      <Section id="phone" title="phone">
        <p className="st-ca-copy">
          at 600 px the action row moves below the description. both frames use a 390 px viewport.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="notice phone, light" height={250}>
              <div className="st-ca-inset">
                <ActionNotice />
              </div>
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="notice phone, dark" height={250}>
              <div className="st-ca-inset">
                <ActionNotice />
              </div>
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>Notice</code>
          </dt>
          <dd>
            sets the glyph and announcement role from <code>state</code>.
          </dd>
          <dt>
            <code>NoticeTitle</code>
          </dt>
          <dd>
            the first sentence, followed by <code>NoticeDescription</code> for supporting words.
          </dd>
          <dt>
            <code>NoticeActions</code>
          </dt>
          <dd>the app's buttons beside the message, then below it on a phone.</dd>
        </dl>
      </Section>
    </>
  );
}
