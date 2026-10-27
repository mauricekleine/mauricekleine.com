import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { fleet } from "@/components/superthread/lib/fleet";
import {
  AppShell,
  AppShellGround,
  AppShellNav,
  AppShellNavItem,
  AppShellPanel,
} from "@/components/superthread/blocks/app-shell";
import { Facts, Fact, FactLabel, FactValue } from "@/components/superthread/blocks/facts";
import { Serves, ViewportFrame } from "@/examples/compositions-a";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/app-shell")({
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

// The mock pages open here; null keeps the other cells off their fleet urls.
const hrefs = {
  ...Object.fromEntries(fleet.map((ship) => [ship.id, null])),
  home: "/",
  orbit: "/mock/orbit",
  quanta: "/mock/reading",
  constellation: "/mock/board",
};

function Workspace({ printed = false }: { printed?: boolean }) {
  const [page, setPage] = useState("board");
  return (
    <AppShell
      current="orbit"
      markBase="/marks"
      hrefs={hrefs}
      sidebar={
        <AppShellNav ship="orbit">
          {["board", "direction", "agents"].map((name, index) => (
            <AppShellNavItem
              key={name}
              render={<button type="button" />}
              isActive={page === name}
              number={index + 1}
              count={name === "board" ? 12 : undefined}
              data-demo={printed ? (index === 1 ? "hover" : index === 2 ? "focus-visible" : undefined) : undefined}
              tabIndex={printed ? -1 : undefined}
              onClick={() => setPage(name)}
            >
              {name}
            </AppShellNavItem>
          ))}
          {printed && (
            <AppShellNavItem render={<button type="button" />} disabled>
              archive
            </AppShellNavItem>
          )}
        </AppShellNav>
      }
    >
      <AppShellGround render={<div />}>
        <AppShellPanel>
          <h1 className="type-section">{page}</h1>
          <p className="st-ca-panel-copy">
            {page === "board"
              ? "12 tasks, 2 running. the next check starts here."
              : page === "direction"
                ? "make each run small enough to review."
                : "two agents are running. one is ready for the next task."}
          </p>
          <Facts aria-label={`${page} summary`}>
            <Fact>
              <FactLabel>ship</FactLabel>
              <FactValue>orbit</FactValue>
            </Fact>
            <Fact>
              <FactLabel>running</FactLabel>
              <FactValue kind="number">2</FactValue>
            </Fact>
            <Fact>
              <FactLabel>next run</FactLabel>
              <FactValue kind="id">run-024</FactValue>
            </Fact>
          </Facts>
        </AppShellPanel>
      </AppShellGround>
    </AppShell>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="app shell"
        lede="the fleet rail, a ship's own nav and a working panel on the deep ground. the panel takes the sheet lift; the frame stays flat."
      >
        <InstallLine items={["app-shell"]} />
      </PageHead>
      <Serves name="app-shell" />
      <Section id="example" title="example">
        <p className="st-ca-copy">
          switch between board, direction and agents. the current link holds its box, and its count stays beside the
          label. ships without a destination stay unlinked.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <ViewportFrame mode="light" title="orbit desktop, light" width={1100} height={470}>
              <Workspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit desktop, dark" width={1100} height={470}>
              <Workspace />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="states" title="states">
        <p className="st-ca-copy">
          board is current, direction prints hover, agents prints keyboard focus and archive is disabled. a nav item
          keeps the sidebar control states.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <ViewportFrame mode="light" title="orbit nav states, light" width={1100} height={470}>
              <Workspace printed />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit nav states, dark" width={1100} height={470}>
              <Workspace printed />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="phone" title="phone">
        <p className="st-ca-copy">
          at 900 px the rail becomes a bar and the ship nav wraps below it. at 600 px the panel keeps 16 px beside its
          content. these frames have a 390 px viewport.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="orbit phone, light" height={540}>
              <Workspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit phone, dark" height={540}>
              <Workspace />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>AppShell</code>
          </dt>
          <dd>
            passes the current ship, links, marks and sidebar to the fleet rail. the specimen holds its viewport inside
            a bounded frame.
          </dd>
          <dt>
            <code>AppShellNav</code>
          </dt>
          <dd>
            holds the ship name and its named nav. each <code>AppShellNavItem</code> takes a number, a live count and
            the app's link or button.
          </dd>
          <dt>
            <code>AppShellGround</code>
          </dt>
          <dd>
            is the page's main, named workspace, and leaves the gutter around <code>AppShellPanel</code>, the raised
            working surface. inside a layout that already owns main, render a div and pass <code>role="group"</code> to{" "}
            <code>AppShellNav</code>.
          </dd>
        </dl>
      </Section>
    </>
  );
}
