import { createFileRoute } from "@tanstack/react-router";
import { SkeletonRows, SkeletonTable } from "@/examples/skeleton";
import { Caption } from "@/site/Caption";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/components/skeleton")({
  staticData: {
    sections: [
      { id: "rows", title: "loading rows" },
      { id: "table", title: "in a table" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="skeleton"
        lede="a placeholder in the first ink at 18.75&nbsp;percent, on whole-pixel bars. it holds still: no shimmer, no pulse."
      >
        <InstallLine items={["skeleton"]} />
      </PageHead>

      <Section id="rows" title="loading rows">
        <p className="st-b-copy">
          a bar is 12&nbsp;px tall and square unless you size it. size each one to the words it stands in for.
        </p>
        <ModePair className="st-b-stack">
          <SkeletonRows />
        </ModePair>
        <Caption detail="skeleton" />
      </Section>

      <Section id="table" title="in a table">
        <p className="st-b-copy">
          a table keeps its header and its rules while its rows load. mark the loading region with{" "}
          <code>aria-busy</code>.
        </p>
        <ModePair className="st-b-stack">
          <SkeletonTable />
        </ModePair>
      </Section>
    </>
  );
}
