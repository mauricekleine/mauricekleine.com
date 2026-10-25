import { useId, useState } from "react";
import { Input } from "@/components/superthread/ui/input";
import { Kbd, KbdGroup } from "@/components/superthread/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/superthread/ui/tooltip";
import { Button } from "@/components/superthread/ui/button";
import { State } from "@/examples/input";
function Shortcut() {
  return (
    <KbdGroup aria-label="control and enter">
      <Kbd>ctrl</Kbd>
      <Kbd>enter</Kbd>
    </KbdGroup>
  );
}
export function KbdExample() {
  const id = useId();
  const [name, setName] = useState("run 024");
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
        orbit run name
      </label>
      <Input id={id} value={name} onChange={(event) => setName(event.target.value)} />
      <div className="st-e-row">
        <Button type="submit">save</Button>
        <Shortcut />
      </div>
      <p className="st-e-hint" role="status">
        {saved ? `saved ${saved}` : "press ctrl enter while editing to save"}
      </p>
    </form>
  );
}
export function KbdParts() {
  return (
    <div className="st-e-stack">
      <State name="single key" note="20 px high, 11 px mono">
        <div className="st-e-row">
          <Kbd>esc</Kbd>
        </div>
      </State>
      <State className="st-a-wide" name="group" note="4 px between keycaps">
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
        <TooltipTrigger render={<Button variant="outline" />}>save run</TooltipTrigger>
        <TooltipContent portalProps={{ container: frame }}>
          save <Shortcut />
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
