import { useId } from "react";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Input } from "@/components/superthread/ui/input";
import { Label } from "@/components/superthread/ui/label";

// A label names a field through htmlFor, and wraps a checkbox so the whole line toggles it. Each pane gets its own
// ids, so the two copies never point at each other's controls.
export function LabelExample() {
  const id = useId();
  return (
    <div className="st-pass-stack">
      <div className="st-pass-field">
        <Label htmlFor={`${id}-title`}>chapter title</Label>
        <Input id={`${id}-title`} defaultValue="one photon at a time" />
      </div>
      <Label>
        <Checkbox defaultChecked />
        notify me when a run fails
      </Label>
    </div>
  );
}
