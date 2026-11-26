import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/superthread/ui/collapsible";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States } from "@/examples/input";
export function CollapsibleExample({ open = false }: { open?: boolean }) {
  return (
    <Collapsible defaultOpen={open} className="st-gl-stack">
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Run logs
        <Icon name="chevron" data-icon="inline-end" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="st-gl-logs">
          <li>
            <span>or-412</span>
            <span>Build complete</span>
          </li>
          <li>
            <span>or-413</span>
            <span>Review ready</span>
          </li>
          <li>
            <span>or-414</span>
            <span>Waiting for a task</span>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
export function CollapsibleStates() {
  return (
    <States>
      {(
        [
          ["closed", "Closed", "Trigger uses the caller's button"],
          ["open", "Open", "Panel follows, chevron turns"],
          ["hover", "Hover", "Trigger uses the caller's button"],
          ["focus", "Focus", "Button's outside ring"],
          ["pressed", "Pressed", "Trigger uses the caller's button"],
          ["disabled", "Disabled", "Disclosure cannot open"],
        ] as const
      ).map(([state, name, note]) => (
        <State key={state} name={name} note={note}>
          <div inert>
            <Collapsible open={state === "open"} disabled={state === "disabled"}>
              <CollapsibleTrigger
                render={<Button variant="outline" />}
                data-demo={state === "focus" ? "focus-visible" : state === "pressed" ? "active" : state}
                tabIndex={-1}
              >
                Run logs
                <Icon name="chevron" data-icon="inline-end" />
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
