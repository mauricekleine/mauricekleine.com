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
      { id: "example", title: "Example" },
      { id: "loading", title: "Loading" },
      { id: "failed", title: "Failed" },
      { id: "empty", title: "Empty" },
      { id: "clear", title: "Clear" },
      { id: "parts", title: "Parts" },
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
            <li>run-024 · Orbit · done</li>
            <li>run-023 · Quanta · done</li>
          </ul>
          <Button variant="outline" size="sm" onClick={() => setRecovered(false)}>
            Show failure again
          </Button>
          <p role="status" className="st-ca-note">
            2 runs loaded.
          </p>
        </>
      ) : (
        <FailedState title="The runs did not load" onRetry={() => setRecovered(true)}>
          The request timed out. Try the same request again.
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
        Clear queue
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
      <EmptyStateText title={actions ? "Nothing queued" : "No failed runs"}>
        {actions ? "Add a task to start the next run." : "Failed runs appear here when a task needs another look."}
      </EmptyStateText>
      {actions && (
        <EmptyStateActions>
          <Button size="sm" onClick={() => setAdded(true)}>
            Add task
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAdded(true)}>
            Use sample task
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
        title="States"
        lede="What takes the rows' place while a collection loads, when it fails and when it has nothing to show, and the job's place when nothing's left. Each state says what happened in its own words."
      >
        <InstallLine items={["states"]} />
      </PageHead>
      <Serves name="states" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Retry the failed request to load two sample runs. The action restores the collection in place.
        </p>
        <ModePair>
          <Recovery />
        </ModePair>
      </Section>
      <Section id="loading" title="Loading">
        <p className="st-ca-copy">
          Still skeleton bars at the 48 px table measure. The named status announces loading once; the bars stay silent.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            <State className="st-ca-state" name="Three rows" note="The default">
              <LoadingState label="Loading recent runs" />
            </State>
            <State className="st-ca-state" name="Five rows" note="A longer collection">
              <LoadingState rows={5} label="Loading run history" />
            </State>
          </div>
        </ModePair>
        <Caption detail="skeleton" />
      </Section>
      <Section id="failed" title="Failed">
        <p className="st-ca-copy">
          A failure is an alert with its glyph, the reason and a retry when recovery is possible. Omit the callback when
          the reader cannot retry.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            <Recovery />
            <FailedState title="This run log is unavailable">The sample log has expired. Open another run.</FailedState>
          </div>
        </ModePair>
      </Section>
      <Section id="empty" title="Empty">
        <p className="st-ca-copy">
          Words can stand alone. Add actions when the reader can fill the collection, and use the optional media slot
          for an app's own figure.
        </p>
        <ModePair>
          <div className="st-ca-stack">
            <State className="st-ca-state" name="Without actions" note="Nothing needs recovery">
              <Empty />
            </State>
            <State className="st-ca-state" name="With actions and media" note="Start from here">
              <Empty actions media />
            </State>
          </div>
        </ModePair>
      </Section>
      <Section id="clear" title="Clear">
        <p className="st-ca-copy">
          Clear is a claim, so it prints only after a complete read. It takes a <code>JobSheet</code>&rsquo;s box with
          no paper: the sentence starts where the cue does, and the reason and the door land where the why and the
          primary do. The panel holds the height of the work that&rsquo;s gone at every width, so its edge doesn&rsquo;t
          jump when the last thing clears.
        </p>
        <ModePair
          className="st-cb-stack"
          light={
            <GroundFrame mode="light" title="Clear, light" width={1100} height={860}>
              <ClearStateExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Clear, dark" width={1100} height={860}>
              <ClearStateExample />
            </GroundFrame>
          }
        />
        <p className="st-ca-copy">
          The sentence prints as large as its rows hold it: display at a full panel, hero below it, and a smaller step
          only when the words need one. Its lines fill from the first.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="Clear on a phone, light" height={900}>
              <ClearStateExample />
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="Clear on a phone, dark" height={900}>
              <ClearStateExample />
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>LoadingState</code>
          </dt>
          <dd>
            Rows at the table&rsquo;s height, read out once. <code>rows</code> and <code>label</code> set how many and
            what&rsquo;s loading.
          </dd>
          <dt>
            <code>FailedState</code>
          </dt>
          <dd>
            The failed glyph, what failed and why. Pass <code>onRetry</code> when the reader can try again.
          </dd>
          <dt>
            <code>EmptyState</code>, <code>EmptyStateMedia</code>, <code>EmptyStateText</code>,{" "}
            <code>EmptyStateActions</code>
          </dt>
          <dd>An optional figure, what&rsquo;s missing and how to fill it.</dd>
          <dt>
            <code>ClearState</code>
          </dt>
          <dd>
            The job sheet&rsquo;s box with no paper. Print it in the job&rsquo;s place, right after what stands over it,
            and name it with <code>aria-labelledby</code> and the title&rsquo;s <code>id</code>.
          </dd>
          <dt>
            <code>ClearStateTitle</code>
          </dt>
          <dd>
            The claim, one sentence with its full stop. An <code>h1</code> until <code>render</code> says otherwise.
          </dd>
          <dt>
            <code>ClearStateReason</code>
          </dt>
          <dd>What makes it true, in one sentence.</dd>
          <dt>
            <code>ClearStateDoor</code>
          </dt>
          <dd>The way to everything that didn&rsquo;t count.</dd>
        </dl>
      </Section>
    </>
  );
}
