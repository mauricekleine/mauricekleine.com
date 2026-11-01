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
import { Button } from "@/components/superthread/ui/button";
import { Serves, ViewportFrame } from "@/examples/compositions-a";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/page-header")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "sizes", title: "sizes" },
      { id: "phone", title: "phone" },
      { id: "parts", title: "parts" },
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
          {size === "page" ? "reading" : "workspace"}
        </PageHeaderBack>
        <PageHeaderTitle>{size === "page" ? "small runs" : "board"}</PageHeaderTitle>
        <PageHeaderMeta>
          {count} {size === "page" ? "notes" : "tasks"}, 2 running
        </PageHeaderMeta>
        <PageHeaderActions>
          <Button size="sm" onClick={() => setCount((n) => n + 1)}>
            add {size === "page" ? "note" : "task"}
          </Button>
        </PageHeaderActions>
        <PageHeaderDescription>
          {size === "page"
            ? "a record of small changes, what they taught us and what comes next."
            : "the work in flight, with the next task ready to pick up."}
        </PageHeaderDescription>
      </PageHeader>
    </div>
  );
}

function Pair({ size = "panel", phone = false }: { size?: "panel" | "page"; phone?: boolean }) {
  return (
    <ModePair
      className={phone ? undefined : "st-ca-wide-pair"}
      light={
        <ViewportFrame
          mode="light"
          title={`${size} header, ${phone ? "phone" : "desktop"}, light`}
          width={phone ? 390 : 720}
          height={size === "page" ? 400 : 280}
        >
          <Header size={size} />
        </ViewportFrame>
      }
      dark={
        <ViewportFrame
          mode="dark"
          title={`${size} header, ${phone ? "phone" : "desktop"}, dark`}
          width={phone ? 390 : 720}
          height={size === "page" ? 400 : 280}
        >
          <Header size={size} />
        </ViewportFrame>
      }
    />
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="page header"
        lede="a title, a way back, live meta and the next action, with a lede under them. a panel keeps the section step; a public page gives the title more room."
      >
        <InstallLine items={["page-header"]} />
      </PageHead>
      <Serves name="page-header" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          add a task and the meta count changes with it. the description takes its own line below the title and actions.
        </p>
        <Pair />
      </Section>
      <Section id="sizes" title="sizes">
        <p className="st-ca-copy">
          <code>panel</code> is the default above, its title at the section step in the first ink. <code>page</code>{" "}
          below uses the hero title. both print the same lede, held to a reading measure of 27.5em.
        </p>
        <Pair size="page" />
      </Section>
      <Section id="phone" title="phone">
        <p className="st-ca-copy">
          the header wraps as its space narrows. the page title and lede take their phone sizes at 600 px.
        </p>
        <Pair phone />
        <Pair size="page" phone />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>PageHeaderBack</code>
          </dt>
          <dd>a link above the title, with a left arrow and the destination in words.</dd>
          <dt>
            <code>PageHeaderTitle</code>
          </dt>
          <dd>
            the page's h1, sized by <code>PageHeader</code>.
          </dd>
          <dt>
            <code>PageHeaderMeta</code>
          </dt>
          <dd>
            a live line that pushes <code>PageHeaderActions</code> to the far end.
          </dd>
          <dt>
            <code>PageHeaderDescription</code>
          </dt>
          <dd>the supporting sentence on a full line.</dd>
        </dl>
      </Section>
    </>
  );
}
