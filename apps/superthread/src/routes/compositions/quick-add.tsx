import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import {
  AppShell,
  AppShellGround,
  AppShellNav,
  AppShellNavItem,
  AppShellPanel,
} from "@/components/superthread/blocks/app-shell";
import { QuickAdd, QuickAddNav } from "@/components/superthread/blocks/quick-add";
import { fleet } from "@/components/superthread/lib/fleet";
import { Button } from "@/components/superthread/ui/button";
import { catalog } from "@/components/superthread/catalog";
import { ViewportFrame } from "@/examples/compositions-a";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "quick-add")!
  .serves!.map((app) => (app === "www" ? "the public site" : app[0]!.toUpperCase() + app.slice(1)))
  .join(", ");
export const Route = createFileRoute("/compositions/quick-add")({
  staticData: {
    sections: [
      { id: "example", title: "Example" },
      { id: "states", title: "Submission states" },
      { id: "labels", title: "Compact label" },
      { id: "nav", title: "In a nav" },
    ],
  },
  component: Page,
});

function AddExample() {
  const [tasks, setTasks] = useState<string[]>(["Review the chapter outline"]);
  return (
    <div className="st-cb-flow">
      <QuickAdd
        label="New task"
        placeholder="What needs doing?"
        onAdd={(title) => setTasks((current) => [...current, title])}
      />
      <ul className="st-cb-preview-rows" aria-label="Task queue" aria-live="polite">
        {tasks.map((title, index) => (
          <li key={index}>{title}</li>
        ))}
      </ul>
    </div>
  );
}
type Fixture = "rest" | "ready" | "focus" | "pending" | "failed" | "disabled";
const stateNames: Record<Fixture, string> = {
  rest: "Rest",
  ready: "Ready",
  focus: "Focus",
  pending: "Pending",
  failed: "Failed",
  disabled: "Disabled",
};
function AddState({ state }: { state: Fixture }) {
  const host = useRef<HTMLDivElement>(null);
  const release = useRef<(() => void) | null>(null);
  const attempts = useRef(0);
  const [result, setResult] = useState("");
  // Seed a real submission through the public form boundary; no alternate drawing of the block's states.
  useEffect(() => {
    if (state === "focus") {
      host.current?.querySelector('[data-slot="input-group"]')?.setAttribute("data-demo", "focus");
      return;
    }
    if (state !== "ready" && state !== "pending" && state !== "failed") return;
    const input = host.current?.querySelector("input");
    if (!input) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Review the chapter notes");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const frame = requestAnimationFrame(() => {
      if (state !== "ready") host.current?.querySelector("form")?.requestSubmit();
    });
    return () => {
      cancelAnimationFrame(frame);
      release.current?.();
    };
  }, [state]);
  return (
    <div ref={host} className="st-cb-flow">
      <QuickAdd
        label={`${stateNames[state]} task`}
        placeholder="What needs doing?"
        inputProps={{ disabled: state === "disabled" }}
        onAdd={async (title) => {
          attempts.current++;
          if (state === "pending") {
            setResult("Adding task");
            await new Promise<void>((resolve) => {
              release.current = resolve;
            });
            release.current = null;
          }
          if (state === "failed" && attempts.current === 1) throw new Error("Could not add the task. Try again.");
          setResult(`Added: ${title}`);
        }}
      />
      {state === "pending" && (
        <Button size="sm" variant="outline" onClick={() => release.current?.()} disabled={!release.current}>
          Finish the add
        </Button>
      )}
      <p className="st-cb-note" role="status">
        {result}
      </p>
    </div>
  );
}
function CompactAdd() {
  const id = useId();
  const [result, setResult] = useState("The label stays available to screen readers.");
  return (
    <div className="st-cb-flow">
      <QuickAdd
        label="New chapter"
        hideLabel
        placeholder="Chapter title"
        submitLabel="Create"
        inputProps={{ "aria-describedby": id }}
        onAdd={(title) => setResult(`Created: ${title}`)}
      />
      <p id={id} className="st-cb-note" role="status">
        {result}
      </p>
    </div>
  );
}

const hrefs = { ...Object.fromEntries(fleet.map((ship) => [ship.id, null])), home: "/" };

// The key reaches every copy on a page, so only one specimen answers it.
function NavAdd({ hotkey = null }: { hotkey?: string | null }) {
  const [tasks, setTasks] = useState<string[]>([]);
  return (
    <AppShell
      current="orbit"
      markBase="/marks"
      hrefs={hrefs}
      skipLink={false}
      sidebar={
        <AppShellNav ship="orbit" foot={null}>
          <AppShellNavItem render={<button type="button" />} isActive>
            Now
          </AppShellNavItem>
          <QuickAddNav
            label="Add a task"
            placeholder="Add a task"
            hotkey={hotkey}
            onAdd={(title) => setTasks((current) => [...current, title])}
          />
        </AppShellNav>
      }
    >
      <AppShellGround render={<div />}>
        <AppShellPanel>
          <h1 className="type-section text-first">To sort</h1>
          <ul className="st-cb-preview-rows" aria-label="Added tasks" aria-live="polite">
            {tasks.length > 0 ? tasks.map((title, index) => <li key={index}>{title}</li>) : <li>Nothing here yet</li>}
          </ul>
        </AppShellPanel>
      </AppShellGround>
    </AppShell>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="Quick add"
        lede="One field and its add button. A successful add clears the draft and returns focus; a failed add keeps the words ready to try again."
      >
        <InstallLine items={["quick-add"]} />
      </PageHead>
      <p className="st-cb-serves">Serves {serves}.</p>

      <Section id="example" title="Example">
        <p className="st-cb-copy">
          Type a task and press Enter, or use Add. Leading and trailing spaces are trimmed; an empty draft cannot
          submit.
        </p>
        <ModePair className="st-cb-stack">
          <AddExample />
        </ModePair>
      </Section>
      <Section id="states" title="Submission states">
        <p className="st-cb-copy">
          These are real forms. The pending example waits until you finish the add; its field can hold a newer draft
          meanwhile. The failed example succeeds on retry.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-flow">
            {(["rest", "ready", "focus", "pending", "failed", "disabled"] as const).map((state) => (
              <State
                key={state}
                name={stateNames[state]}
                note={
                  {
                    rest: "Empty draft, add disabled",
                    ready: "A nonblank draft enables add",
                    focus: "One inside edge on the field",
                    pending: "A second add is blocked",
                    failed: "The draft stays, the error names recovery",
                    disabled: "The field and add control stay disabled",
                  }[state]
                }
              >
                <AddState state={state} />
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="labels" title="Compact label">
        <p className="st-cb-copy">
          Hide the visible label when the surrounding page gives enough context. The field still has its own name, and
          the submit word can match the task.
        </p>
        <ModePair className="st-cb-stack">
          <CompactAdd />
        </ModePair>
      </Section>
      <Section id="nav" title="In a nav">
        <p className="st-cb-copy">
          <code>QuickAddNav</code> goes among a ship&rsquo;s nav items. It prints a muted word above the nav&rsquo;s
          foot and opens a one-line field over itself. Enter adds, clears and stays open for the next one. Escape closes
          it, keeps the draft and hands focus back to where it was, or else to the trigger. Press <kbd>n</kbd> away from
          a field and the light copy opens.
        </p>
        <ModePair
          className="st-ca-wide-pair"
          light={
            <ViewportFrame mode="light" title="Quiet add, light" width={1100} height={470}>
              <NavAdd hotkey="n" />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="Quiet add, dark" width={1100} height={470}>
              <NavAdd />
            </ViewportFrame>
          }
        />
        <p className="st-cb-copy">
          At 900 px and below the word moves to the end of the nav&rsquo;s row, and the field runs 12 px from each edge
          with its button. On a phone the trigger is the glyph alone, in a 44 px target.
        </p>
        <ModePair
          light={
            <ViewportFrame mode="light" title="Quiet add on a phone, light" height={380}>
              <NavAdd />
            </ViewportFrame>
          }
          dark={
            <ViewportFrame mode="dark" title="Quiet add on a phone, dark" height={380}>
              <NavAdd />
            </ViewportFrame>
          }
        />
      </Section>
    </>
  );
}
