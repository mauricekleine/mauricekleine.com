import { useId, useState } from "react";
import { Input } from "@/components/superthread/ui/input";
import { Kbd, KbdGroup } from "@/components/superthread/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/superthread/ui/tooltip";
import { Button } from "@/components/superthread/ui/button";
import { State } from "@/examples/input";
function Shortcut() {
  return (
    <KbdGroup aria-label="Control and Enter">
      <Kbd>Ctrl</Kbd>
      <Kbd>Enter</Kbd>
    </KbdGroup>
  );
}
export function KbdExample() {
  const id = useId();
  const [name, setName] = useState("Run 024");
  const [saved, setSaved] = useState("");
  return (
    <form
      className="st-e-stack"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(name);
      }}
      onKeyDown={(event) => {
        if (event.ctrlKey && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <label htmlFor={id} className="st-e-label">
        Orbit run name
      </label>
      <Input id={id} value={name} onChange={(event) => setName(event.target.value)} />
      <div className="st-e-row">
        <Button type="submit">Save</Button>
        <Shortcut />
      </div>
      <p className="st-e-hint" role="status">
        {saved ? `Saved ${saved}` : "Press Ctrl Enter while editing to save"}
      </p>
    </form>
  );
}
export function KbdParts() {
  return (
    <div className="st-e-stack">
      <State name="Single key" note="20 px high, 11 px mono">
        <div className="st-e-row">
          <Kbd>Esc</Kbd>
        </div>
      </State>
      <State className="st-a-wide" name="Group" note="4 px between keycaps">
        <Shortcut />
      </State>
    </div>
  );
}
export function KbdContext() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div className="st-e-tooltip" ref={setFrame} inert>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline" />}>Save run</TooltipTrigger>
        <TooltipContent portalProps={{ container: frame }}>
          Save <Shortcut />
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
