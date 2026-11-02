import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { fleet } from "@/components/superthread/lib/fleet";
import {
  AppShell,
  AppShellGround,
  AppShellNav,
  AppShellNavItem,
  AppShellNavTier,
  AppShellPageFoot,
  AppShellPanel,
  AppShellPanelFoot,
} from "@/components/superthread/blocks/app-shell";
import { Facts, Fact, FactLabel, FactValue } from "@/components/superthread/blocks/facts";
import { QuickAddNav } from "@/components/superthread/blocks/quick-add";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
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
      { id: "feet", title: "feet" },
      { id: "tiers", title: "tiers" },
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
      skipLink={false}
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
          <h1 className="type-section text-first">{page}</h1>
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

// Both feet at once: the nav's slot with the quiet add above it, and the row that closes the panel. The nav's line and the
// page's are one value, so a phone reads the same words.
function FootedWorkspace() {
  const [added, setAdded] = useState<string[]>([]);
  const needsYou = <a href="#feet">google needs signing in</a>;
  return (
    <AppShell
      current="orbit"
      markBase="/marks"
      hrefs={hrefs}
      skipLink={false}
      sidebar={
        <AppShellNav ship="orbit" foot={needsYou}>
          <AppShellNavItem render={<button type="button" />} isActive number={1}>
            now
          </AppShellNavItem>
          <AppShellNavItem render={<button type="button" />} number={2}>
            week
          </AppShellNavItem>
          <QuickAddNav
            label="add a task"
            placeholder="add a task"
            hotkey={null}
            onAdd={(title) => setAdded((current) => [...current, title])}
          />
        </AppShellNav>
      }
    >
      <AppShellGround render={<div />}>
        <AppShellPanel>
          <h1 className="type-section text-first">now</h1>
          <p className="st-ca-panel-copy">
            {added.length > 0 ? `added: ${added.join(", ")}` : "add a task from the nav. it lands here."}
          </p>
          <AppShellPanelFoot render={<nav aria-label="briefs" />}>
            <span>briefs</span>
            <a href="#feet">today</a>
            <a href="#feet">yesterday</a>
            <a href="#feet">last week</a>
          </AppShellPanelFoot>
        </AppShellPanel>
        <AppShellPageFoot>{needsYou}</AppShellPageFoot>
      </AppShellGround>
    </AppShell>
  );
}

// A phone's page taller than its window, with tabbed sections down it, so keyboard focus scrolls the page as it moves.
function LongWorkspace() {
  const days = [
    { title: "today", runs: ["run-024 type-check", "run-025 unit tests", "run-026 screenshots"] },
    { title: "this week", runs: ["run-018 select listbox", "run-019 toast place", "run-021 field type"] },
  ];
  return (
    <AppShell
      current="orbit"
      markBase="/marks"
      hrefs={hrefs}
      skipLink={false}
      sidebar={
        <AppShellNav ship="orbit">
          <AppShellNavItem render={<button type="button" />} isActive number={1}>
            runs
          </AppShellNavItem>
          <AppShellNavItem render={<button type="button" />} number={2}>
            agents
          </AppShellNavItem>
        </AppShellNav>
      }
    >
      <AppShellGround render={<div />}>
        <AppShellPanel>
          <h1 className="type-section text-first">runs</h1>
          {days.map((day) => (
            <section key={day.title} aria-label={day.title} className="mt-8">
              <Tabs defaultValue="queued">
                <TabsList>
                  <TabsTrigger value="queued">queued</TabsTrigger>
                  <TabsTrigger value="done">done</TabsTrigger>
                </TabsList>
                <TabsContent value="queued">
                  <ul className="st-ca-panel-copy">
                    {day.runs.map((run) => (
                      <li key={run}>{run}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="done">
                  <p className="st-ca-panel-copy">nothing finished {day.title}.</p>
                </TabsContent>
              </Tabs>
            </section>
          ))}
        </AppShellPanel>
      </AppShellGround>
    </AppShell>
  );
}

const firstTier = ["today", "inbox", "drafts", "notes"];
const secondTier = ["schedules", "history", "sources"];

// The second tier holds the pages a reader visits now and then. Open it on a phone and pick history: the more prints
// selected, since the current page now sits behind it.
function TieredWorkspace({ initial = "inbox" }: { initial?: string }) {
  const [page, setPage] = useState(initial);
  const [added, setAdded] = useState<string[]>([]);
  const link = (name: string) => (
    <AppShellNavItem
      key={name}
      render={<button type="button" />}
      isActive={page === name}
      onClick={() => setPage(name)}
    >
      {name}
    </AppShellNavItem>
  );
  return (
    <AppShell
      current="orbit"
      markBase="/marks"
      hrefs={hrefs}
      skipLink={false}
      sidebar={
        <AppShellNav ship="orbit" overflow="schedules, history and sources">
          {firstTier.map(link)}
          <AppShellNavTier>{secondTier.map(link)}</AppShellNavTier>
          <QuickAddNav
            label="add a task"
            placeholder="add a task"
            hotkey={null}
            onAdd={(title) => setAdded((current) => [...current, title])}
          />
        </AppShellNav>
      }
    >
      <AppShellGround render={<div />}>
        <AppShellPanel>
          <h1 className="type-section text-first">{page}</h1>
          <p className="st-ca-panel-copy">
            {added.length > 0
              ? `added: ${added.join(", ")}`
              : "the first tier is the day's work. the second is the rest."}
          </p>
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
            <ViewportFrame mode="light" title="orbit desktop, light" width={1100} height={490}>
              <Workspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit desktop, dark" width={1100} height={490}>
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
            <ViewportFrame mode="light" title="orbit nav states, light" width={1100} height={490}>
              <Workspace printed />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit nav states, dark" width={1100} height={490}>
              <Workspace printed />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="feet" title="feet">
        <p className="st-ca-copy">
          pass <code>foot</code> to the nav, even as <code>null</code>, and its column runs to full height with a slot
          at the bottom. the slot holds its place while it&rsquo;s empty, so a line that comes and goes moves nothing.
          it prints one line, only when something needs the reader. <code>AppShellPanelFoot</code> closes the panel with
          a row under a rule that reaches both edges of the sheet.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <ViewportFrame mode="light" title="orbit with both feet, light" width={1100} height={490}>
              <FootedWorkspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit with both feet, dark" width={1100} height={490}>
              <FootedWorkspace />
            </ViewportFrame>
          }
        />
        <p className="st-ca-copy">
          at 900 px and below the slot steps aside with the ship&rsquo;s name, and <code>AppShellPageFoot</code> prints
          the same words under the panel. print both or neither. each link in the panel&rsquo;s row is a 44 px box on a
          phone.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="orbit with both feet on a phone, light" height={420}>
              <FootedWorkspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit with both feet on a phone, dark" height={420}>
              <FootedWorkspace />
            </ViewportFrame>
          }
        />
      </Section>
      <Section id="tiers" title="tiers">
        <p className="st-ca-copy">
          <code>AppShellNavTier</code> holds the pages a reader visits now and then, under a rule, in muted words. the
          current one prints like any current item. at 900 px and below the rule steps aside and its items join the row.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <ViewportFrame mode="light" title="a nav with two tiers, light" width={1100} height={490}>
              <TieredWorkspace initial="schedules" />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="a nav with two tiers, dark" width={1100} height={490}>
              <TieredWorkspace initial="schedules" />
            </ViewportFrame>
          }
        />
        <p className="st-ca-copy">
          set <code>overflow</code> on the nav to the words that name the tier, and at 600 px and below it sits behind a{" "}
          <code>...</code> at the row&rsquo;s end. the <code>...</code> opens a list of 44 px rows, and prints selected
          while the current page sits behind it. open it here and pick one.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="a nav with overflow on a phone, light" height={420}>
              <TieredWorkspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="a nav with overflow on a phone, dark" height={420}>
              <TieredWorkspace />
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
        <p className="st-ca-copy">
          a ship&rsquo;s window scrolls what focus brings into view 16 px clear of its top and bottom, so a ring never
          meets the edge. the frame never covers the panel, so no nav&rsquo;s height adds to it. click into a frame and
          press tab: each tab that scrolls in stops short of the edge with its ring whole.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="orbit phone with tabs, light" height={320}>
              <LongWorkspace />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="orbit phone with tabs, dark" height={320}>
              <LongWorkspace />
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
            holds the ship name and its named nav, with an optional <code>foot</code> and <code>overflow</code>. each{" "}
            <code>AppShellNavItem</code> takes a number, a live count and the app's link or button.
          </dd>
          <dt>
            <code>AppShellNavTier</code>
          </dt>
          <dd>
            the nav&rsquo;s quiet second tier, a list of <code>AppShellNavItem</code>s. it sits after the first tier and
            before a <code>QuickAddNav</code>, so on a phone the row reads first tier, add, <code>...</code>.
          </dd>
          <dt>
            <code>AppShellGround</code>
          </dt>
          <dd>
            is the page's main, named workspace, with <code>id="main"</code> for the rail&rsquo;s skip link, and leaves
            the gutter around <code>AppShellPanel</code>, the raised working surface. inside a layout that already owns
            main, render a div and pass <code>role="group"</code> to <code>AppShellNav</code>. the panel takes{" "}
            <code>render</code> too, so a hand-built main needs no wrapper.
          </dd>
          <dt>
            <code>AppShellPanelFoot</code>
          </dt>
          <dd>
            the panel&rsquo;s last row. a span prints as the muted lead word, and links read as chrome. render a named
            nav for a row of links.
          </dd>
          <dt>
            <code>AppShellPageFoot</code>
          </dt>
          <dd>
            the nav&rsquo;s foot line, 900 px and below, last in the ground. pass it what <code>foot</code> holds.
            empty, it takes no room.
          </dd>
        </dl>
      </Section>
    </>
  );
}
