import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
} from "@/components/superthread/blocks/page-header";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { Button } from "@/components/superthread/ui/button";
import { GroundFrame, Serves, ViewportFrame } from "@/examples/compositions-a";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/page-header")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "sizes", title: "Sizes" },
      { id: "phone", title: "Phone" },
      { id: "short", title: "A short title" },
      { id: "parts", title: "Parts" },
    ],
  },
  component: Page,
});

function Header({ size = "panel" }: { size?: "panel" | "page" }) {
  const [count, setCount] = useState(12);
  return (
    <div className="st-ca-inset">
      <PageHeader size={size}>
        <PageHeaderBack href={size === "page" ? "/mock/reading" : "/mock/board"}>
          {size === "page" ? "Reading" : "Workspace"}
        </PageHeaderBack>
        <PageHeaderTitle>{size === "page" ? "Small runs" : "Board"}</PageHeaderTitle>
        <PageHeaderMeta>
          {count} {size === "page" ? "notes" : "tasks"}, 2 running
        </PageHeaderMeta>
        <PageHeaderActions>
          <Button size="sm" onClick={() => setCount((n) => n + 1)}>
            Add {size === "page" ? "note" : "task"}
          </Button>
        </PageHeaderActions>
        <PageHeaderDescription>
          {size === "page"
            ? "A record of small changes, what they taught us and what comes next."
            : "The work in flight, with the next task ready to pick up."}
        </PageHeaderDescription>
      </PageHeader>
    </div>
  );
}

function Pair({ size = "panel", phone = false }: { size?: "panel" | "page"; phone?: boolean }) {
  const label = size === "page" ? "Page" : "Panel";
  return (
    <ModePair
      className={phone ? undefined : "st-ca-wide-pair"}
      light={
        <ViewportFrame
          mode="light"
          title={`${label} header, ${phone ? "phone" : "desktop"}, light`}
          width={phone ? 390 : 720}
          height={size === "page" ? 400 : 280}
        >
          <Header size={size} />
        </ViewportFrame>
      }
      dark={
        <ViewportFrame
          mode="dark"
          title={`${label} header, ${phone ? "phone" : "desktop"}, dark`}
          width={phone ? 390 : 720}
          height={size === "page" ? 400 : 280}
        >
          <Header size={size} />
        </ViewportFrame>
      }
    />
  );
}

// A short title with no meta or actions, in a working panel at full width: room beside the title, and the lede still
// takes the line below it.
function ShortPair({ phone = false }: { phone?: boolean }) {
  const header = (
    <AppShellPanel>
      <PageHeader>
        <PageHeaderTitle>Drafts</PageHeaderTitle>
        <PageHeaderDescription>What waits for a first read, newest first.</PageHeaderDescription>
      </PageHeader>
    </AppShellPanel>
  );
  return (
    <ModePair
      className={phone ? undefined : "st-ca-wide-pair"}
      light={
        <GroundFrame
          mode="light"
          title={`A short title, ${phone ? "phone" : "full width"}, light`}
          width={phone ? 390 : 960}
          height={phone ? 160 : 220}
        >
          {header}
        </GroundFrame>
      }
      dark={
        <GroundFrame
          mode="dark"
          title={`A short title, ${phone ? "phone" : "full width"}, dark`}
          width={phone ? 390 : 960}
          height={phone ? 160 : 220}
        >
          {header}
        </GroundFrame>
      }
    />
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Page header"
        lede="A title, a way back, live meta and the next action, with a lede under them. A panel keeps the section step; a public page gives the title more room."
      >
        <InstallLine items={["page-header"]} />
      </PageHead>
      <Serves name="page-header" />
      <Section id="example" title="Example">
        <p className="st-ca-copy">
          Add a task and the meta count changes with it. The description takes its own line below the title and actions.
        </p>
        <Pair />
      </Section>
      <Section id="sizes" title="Sizes">
        <p className="st-ca-copy">
          <code>panel</code> is the default above, its title at the section step in the first ink. <code>page</code>{" "}
          below uses the hero title. Both print the same lede, held to a reading measure of 27.5em.
        </p>
        <Pair size="page" />
      </Section>
      <Section id="phone" title="Phone">
        <p className="st-ca-copy">
          The header wraps as its space narrows. The page title and lede take their phone sizes at 600 px.
        </p>
        <Pair phone />
        <Pair size="page" phone />
      </Section>
      <Section id="short" title="A short title">
        <p className="st-ca-copy">
          With no meta or actions a short title leaves room beside it in a working panel. The lede still takes the line
          below, held to its measure.
        </p>
        <ShortPair />
        <ShortPair phone />
      </Section>
      <Section id="parts" title="Parts">
        <dl className="st-ca-parts">
          <dt>
            <code>PageHeaderBack</code>
          </dt>
          <dd>A link above the title, with a left arrow and the destination in words.</dd>
          <dt>
            <code>PageHeaderTitle</code>
          </dt>
          <dd>
            The page's h1, sized by <code>PageHeader</code>.
          </dd>
          <dt>
            <code>PageHeaderMeta</code>
          </dt>
          <dd>
            A live line that pushes <code>PageHeaderActions</code> to the far end.
          </dd>
          <dt>
            <code>PageHeaderDescription</code>
          </dt>
          <dd>The supporting sentence on a full line.</dd>
        </dl>
      </Section>
    </>
  );
}
