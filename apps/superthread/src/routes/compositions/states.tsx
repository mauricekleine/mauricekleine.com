import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateMedia,
  EmptyStateText,
  FailedState,
  LoadingState,
} from "@/components/superthread/blocks/states";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { ClearStateExample } from "@/examples/job-sheet";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/states")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "loading", title: "loading" },
      { id: "failed", title: "failed" },
      { id: "empty", title: "empty" },
      { id: "clear", title: "clear" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Recovery() {
  const [recovered, setRecovered] = useState(false);
  return (
    <div className="st-ca-stack">
      {recovered ? (
        <>
          <ul className="st-ca-rows">
            <li>run-024 · orbit · done</li>
            <li>run-023 · quanta · done</li>
          </ul>
          <Button variant="outline" size="sm" onClick={() => setRecovered(false)}>
            show failure again
          </Button>
          <p role="status" className="st-ca-note">
            2 runs loaded.
          </p>
        </>
      ) : (
        <FailedState title="the runs did not load" onRetry={() => setRecovered(true)}>
          the request timed out. try the same request again.
        </FailedState>
      )}
    </div>
  );
}
function Empty({ actions = false, media = false }: { actions?: boolean; media?: boolean }) {
  const [added, setAdded] = useState(false);
  return added ? (
    <div className="st-ca-stack">
      <p role="status" className="st-ca-copy">
        run-025 is queued.
      </p>
      <Button variant="outline" size="sm" onClick={() => setAdded(false)}>
        clear queue
      </Button>
    </div>
  ) : (
    <EmptyState>
      {media && (
        <EmptyStateMedia>
          <div className="st-ca-empty-media">
            <Icon name="plus" />
          </div>
        </EmptyStateMedia>
      )}
      <EmptyStateText title={actions ? "nothing queued" : "no failed runs"}>
        {actions ? "add a task to start the next run." : "failed runs appear here when a task needs another look."}
      </EmptyStateText>
      {actions && (
        <EmptyStateActions>
          <Button size="sm" onClick={() => setAdded(true)}>
            add task
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAdded(true)}>
            use sample task
          </Button>
        </EmptyStateActions>
      )}
    </EmptyState>
  );
}
function Page() {
  return (
    <>
      <PageHead
        title="states"
        lede="what takes the rows' place while a collection loads, when it fails and when it has nothing to show, and the job's place when nothing's left. each state says what happened in its own words."
      >
        <InstallLine items={["states"]} />
      </PageHead>
      <Serves name="states" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          retry the failed request to load two sample runs. the action restores the collection in place.
        </p>
        <ModePair>
          <Recovery />
        </ModePair>
      </Section>
      <Section id="loading" title="loading">
        <p className="st-ca-copy">
          still skeleton bars at the 48 px table measure. the named status announces loading once; the bars stay silent.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            <State className="st-ca-state" name="three rows" note="the default">
              <LoadingState label="loading recent runs" />
            </State>
            <State className="st-ca-state" name="five rows" note="a longer collection">
              <LoadingState rows={5} label="loading run history" />
            </State>
          </div>
        </ModePair>
        <Caption detail="skeleton" />
      </Section>
      <Section id="failed" title="failed">
        <p className="st-ca-copy">
          a failure is an alert with its glyph, the reason and a retry when recovery is possible. omit the callback when
          the reader cannot retry.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            <Recovery />
            <FailedState title="this run log is unavailable">the sample log has expired. open another run.</FailedState>
          </div>
        </ModePair>
      </Section>
      <Section id="empty" title="empty">
        <p className="st-ca-copy">
          words can stand alone. add actions when the reader can fill the collection, and use the optional media slot
          for an app's own figure.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            <State className="st-ca-state" name="without actions" note="nothing needs recovery">
              <Empty />
            </State>
            <State className="st-ca-state" name="with actions and media" note="start from here">
              <Empty actions media />
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="clear" title="clear">
        <p className="st-ca-copy">
          clear is a claim, so it prints only after a complete read. it takes a <code>JobSheet</code>&rsquo;s box with
          no paper: the sentence starts where the cue does, and the reason and the door land where the why and the
          primary do. above a phone the panel holds the height of the work that&rsquo;s gone, so its edge doesn&rsquo;t
          jump when the last thing clears.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="clear, light" width={1100} height={860}>
              <ClearStateExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="clear, dark" width={1100} height={860}>
              <ClearStateExample />
            </GroundFrame>
          }
        />
        <p className="st-ca-copy">
          the sentence prints as large as its rows hold it, from display down, and a smaller step only when the words
          need one. its lines fill from the first. on a phone the panel ends at the door.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="clear on a phone, light" height={660}>
              <ClearStateExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="clear on a phone, dark" height={660}>
              <ClearStateExample />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>LoadingState</code>
          </dt>
          <dd>
            rows at the table&rsquo;s height, read out once. <code>rows</code> and <code>label</code> set how many and
            what&rsquo;s loading.
          </dd>
          <dt>
            <code>FailedState</code>
          </dt>
          <dd>
            the failed glyph, what failed and why. pass <code>onRetry</code> when the reader can try again.
          </dd>
          <dt>
            <code>EmptyState</code>, <code>EmptyStateMedia</code>, <code>EmptyStateText</code>,{" "}
            <code>EmptyStateActions</code>
          </dt>
          <dd>an optional figure, what&rsquo;s missing and how to fill it.</dd>
          <dt>
            <code>ClearState</code>
          </dt>
          <dd>
            the job sheet&rsquo;s box with no paper. print it in the job&rsquo;s place, right after what stands over it,
            and name it with <code>aria-labelledby</code> and the title&rsquo;s <code>id</code>.
          </dd>
          <dt>
            <code>ClearStateTitle</code>
          </dt>
          <dd>
            the claim, one sentence with its full stop. an <code>h1</code> until <code>render</code> says otherwise.
          </dd>
          <dt>
            <code>ClearStateReason</code>
          </dt>
          <dd>what makes it true, in one sentence.</dd>
          <dt>
            <code>ClearStateDoor</code>
          </dt>
          <dd>the way to everything that didn&rsquo;t count.</dd>
        </dl>
      </Section>
    </>
  );
}
