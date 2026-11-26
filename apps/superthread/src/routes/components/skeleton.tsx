import { createFileRoute } from "@tanstack/react-router";
import { EmptyRuns, SkeletonRows, SkeletonTable } from "@/examples/skeleton";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/skeleton")({
  staticData: {
    sections: [
      { id: "rows", title: "Loading rows" },
      { id: "table", title: "In a table" },
      { id: "empty", title: "Empty" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Skeleton"
        lede="A placeholder in the first ink at 18.75&nbsp;percent, on whole-pixel bars. It holds still: no shimmer, no pulse."
      >
        <InstallLine items={["skeleton"]} />
      </PageHead>

      <Section id="rows" title="Loading rows">
        <p className="st-b-copy">
          A bar is 12&nbsp;px tall and square unless you size it. Size each one to the words it stands in for.
        </p>
        <ModePair className="st-b-stack">
          <SkeletonRows />
        </ModePair>
        <Caption detail="skeleton" />
      </Section>

      <Section id="table" title="In a table">
        <p className="st-b-copy">
          A table keeps its header and its rules while its rows load. Mark the loading region with{" "}
          <code>aria-busy</code>.
        </p>
        <ModePair className="st-b-stack">
          <SkeletonTable />
        </ModePair>
      </Section>

      <Section id="empty" title="Empty">
        <p className="st-b-copy">
          With nothing to load, the list prints the empty wedge in crop marks and says what lands there.
        </p>
        <ModePair className="st-b-stack">
          <EmptyRuns />
        </ModePair>
      </Section>
    </>
  );
}
