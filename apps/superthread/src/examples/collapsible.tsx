import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/superthread/ui/collapsible";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States } from "@/examples/input";
export function CollapsibleExample({ open = false }: { open?: boolean }) {
  return (
    <Collapsible defaultOpen={open} className="st-gl-stack">
      <CollapsibleTrigger render={<Button variant="outline" />}>
        <Icon name="chevron" />
        run logs
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="st-gl-logs">
          <li>
            <span>or-412</span>
            <span>build complete</span>
          </li>
          <li>
            <span>or-413</span>
            <span>review ready</span>
          </li>
          <li>
            <span>or-414</span>
            <span>waiting for a task</span>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
export function CollapsibleStates() {
  return (
    <States>
      {["closed", "open", "hover", "focus", "pressed", "disabled"].map((state) => (
        <State
          key={state}
          name={state}
          note={
            state === "open"
              ? "panel follows the trigger"
              : state === "disabled"
                ? "disclosure cannot open"
                : state === "focus"
                  ? "button's outside ring"
                  : "trigger uses the caller's button"
          }
        >
          <div inert>
            <Collapsible open={state === "open"} disabled={state === "disabled"}>
              <CollapsibleTrigger
                render={<Button variant="outline" />}
                data-demo={state === "focus" ? "focus-visible" : state === "pressed" ? "active" : state}
                tabIndex={-1}
              >
                run logs
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="st-gl-note">3 logs available.</p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </State>
      ))}
    </States>
  );
}
