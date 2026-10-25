import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { QuickAdd } from "@/components/superthread/blocks/quick-add";
import { Button } from "@/components/superthread/ui/button";
import { catalog } from "@/components/superthread/catalog";
import { State } from "@/examples/input";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

const serves = catalog
  .find((entry) => entry.name === "quick-add")!
  .serves!.map((app) => (app === "www" ? "the public site" : app))
  .join(", ");
export const Route = createFileRoute("/compositions/quick-add")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "states", title: "submission states" },
      { id: "labels", title: "compact label" },
    ],
  },
  component: Page,
});

function AddExample() {
  const [tasks, setTasks] = useState<string[]>(["review the chapter outline"]);
  return (
    <div className="st-cb-flow">
      <QuickAdd
        label="new task"
        placeholder="what needs doing?"
        onAdd={(title) => setTasks((current) => [...current, title])}
      />
      <ul className="st-cb-preview-rows" aria-label="task queue" aria-live="polite">
        {tasks.map((title, index) => (
          <li key={index}>{title}</li>
        ))}
      </ul>
    </div>
  );
}
type Fixture = "rest" | "ready" | "focus" | "pending" | "failed" | "disabled";
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
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "review the chapter notes");
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
        label={`${state} task`}
        placeholder="what needs doing?"
        inputProps={{ disabled: state === "disabled" }}
        onAdd={async (title) => {
          attempts.current++;
          if (state === "pending") {
            setResult("adding task");
            await new Promise<void>((resolve) => {
              release.current = resolve;
            });
            release.current = null;
          }
          if (state === "failed" && attempts.current === 1) throw new Error("could not add the task. try again.");
          setResult(`added: ${title}`);
        }}
      />
      {state === "pending" && (
        <Button size="sm" variant="outline" onClick={() => release.current?.()} disabled={!release.current}>
          finish the add
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
  const [result, setResult] = useState("the label stays available to screen readers.");
  return (
    <div className="st-cb-flow">
      <QuickAdd
        label="new chapter"
        hideLabel
        placeholder="chapter title"
        submitLabel="create"
        inputProps={{ "aria-describedby": id }}
        onAdd={(title) => setResult(`created: ${title}`)}
      />
      <p id={id} className="st-cb-note" role="status">
        {result}
      </p>
    </div>
  );
}

function Page() {
  return (
    <>
      <PageHead
        title="quick add"
        lede="one field and its add button. a successful add clears the draft and returns focus; a failed add keeps the words ready to try again."
      >
        <InstallLine items={["quick-add"]} />
      </PageHead>
      <p className="st-cb-serves">serves {serves}.</p>

      <Section id="example" title="example">
        <p className="st-cb-copy">
          type a task and press enter, or use add. leading and trailing spaces are trimmed; an empty draft cannot
          submit.
        </p>
        <ModePair className="st-cb-stack">
          <AddExample />
        </ModePair>
      </Section>
      <Section id="states" title="submission states">
        <p className="st-cb-copy">
          these are real forms. the pending example waits until you finish the add; its field can hold a newer draft
          meanwhile. the failed example succeeds on retry.
        </p>
        <ModePair className="st-cb-stack">
          <div className="st-cb-flow">
            {(["rest", "ready", "focus", "pending", "failed", "disabled"] as const).map((state) => (
              <State
                key={state}
                name={state}
                note={
                  {
                    rest: "empty draft, add disabled",
                    ready: "a nonblank draft enables add",
                    focus: "one inside edge on the field",
                    pending: "a second add is blocked",
                    failed: "the draft stays, the error names recovery",
                    disabled: "the field and add control stay disabled",
                  }[state]
                }
              >
                <AddState state={state} />
              </State>
            ))}
          </div>
        </ModePair>
      </Section>
      <Section id="labels" title="compact label">
        <p className="st-cb-copy">
          hide the visible label when the surrounding page gives enough context. the field still has its own name, and
          the submit word can match the task.
        </p>
        <ModePair className="st-cb-stack">
          <CompactAdd />
        </ModePair>
      </Section>
    </>
  );
}
