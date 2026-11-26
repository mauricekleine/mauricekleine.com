import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/superthread/ui/resizable";
import { State, States } from "@/examples/input";
export function ResizableExample({
  orientation = "horizontal",
  withHandle = true,
  disabled = false,
}: {
  orientation?: "horizontal" | "vertical";
  withHandle?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="st-gl-panels">
      <ResizablePanelGroup
        orientation={orientation}
        aria-label={`${orientation === "horizontal" ? "Horizontal" : "Vertical"} run workspace`}
      >
        <ResizablePanel defaultSize="40%" minSize="25%">
          <div className="st-gl-panel">
            <span className="st-gl-note">Runs</span>
            <span className="font-mono">or-412</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={withHandle} disabled={disabled} aria-label="Resize runs and log" />
        <ResizablePanel defaultSize="60%" minSize="25%">
          <div className="st-gl-panel">
            <span className="st-gl-note">Log</span>
            <span>Build finished</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
// The v4 separator writes its own data-separator after caller props. Printed states use the item's rule and
// grip classes in inert markup so native pointer state cannot replace the requested hover or drag print.
function PrintedSplit({ state, withHandle = true }: { state: string; withHandle?: boolean }) {
  return (
    <div className="st-gl-panels st-gl-split" inert aria-hidden="true">
      <div className="st-gl-panel">
        <span className="st-gl-note">Runs</span>
        <span className="font-mono">or-412</span>
      </div>
      <div
        data-separator={state === "dragging" ? "active" : state}
        data-demo={state === "focus" ? "focus-visible" : undefined}
        className={
          withHandle
            ? "group/resizable-handle relative flex w-px items-center justify-center bg-border data-[separator=hover]:bg-foreground data-[separator=active]:bg-foreground focus-visible:bg-foreground focus-visible:outline-0"
            : "relative flex w-px items-center justify-center bg-border focus-visible:bg-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--ring)"
        }
      >
        {withHandle && (
          <div
            data-demo={state === "focus" ? "focus-visible" : undefined}
            className="relative z-10 flex h-4 w-1.5 shrink-0 items-center justify-center gap-0.5 border border-input bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)"
          >
            <div className="h-2 w-px bg-input" />
            <div className="h-2 w-px bg-input" />
          </div>
        )}
      </div>
      <div className="st-gl-panel">
        <span className="st-gl-note">Log</span>
        <span>Build finished</span>
      </div>
    </div>
  );
}
export function ResizableStates() {
  return (
    <States>
      {(
        [
          ["rest", "Rest", "1 px rule, 8 px hit area"],
          ["hover", "Hover", "Rule takes foreground"],
          ["dragging", "Dragging", "Rule takes foreground"],
          ["focus", "Focus", "Inside grip ring"],
          ["plain focus", "Plain focus", "Zero-offset ring on the rule"],
          ["disabled", "Disabled", "Fixed split, no keyboard stop"],
        ] as const
      ).map(([state, name, note]) => (
        <State className="st-gl-resize-state" key={state} name={name} note={note}>
          {state === "disabled" ? (
            <div inert>
              <ResizableExample disabled />
            </div>
          ) : (
            <PrintedSplit state={state === "plain focus" ? "focus" : state} withHandle={state !== "plain focus"} />
          )}
        </State>
      ))}
    </States>
  );
}
