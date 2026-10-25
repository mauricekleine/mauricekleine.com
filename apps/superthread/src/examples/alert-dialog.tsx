import { useState } from "react";
import * as Alert from "@/components/superthread/ui/alert-dialog";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States, type Mode } from "@/examples/input";

function Confirmation({ confirm }: { confirm?: () => void }) {
  return (
    <>
      <Alert.AlertDialogHeader>
        <Alert.AlertDialogMedia>
          <Icon name="trash" />
        </Alert.AlertDialogMedia>
        <Alert.AlertDialogTitle>delete run or-412?</Alert.AlertDialogTitle>
        <Alert.AlertDialogDescription>
          the run and its 3 logs are removed. this cannot be undone.
        </Alert.AlertDialogDescription>
      </Alert.AlertDialogHeader>
      <Alert.AlertDialogFooter>
        <Alert.AlertDialogCancel>cancel</Alert.AlertDialogCancel>
        <Alert.AlertDialogAction variant="destructive" onClick={confirm}>
          delete run
        </Alert.AlertDialogAction>
      </Alert.AlertDialogFooter>
    </>
  );
}
export function AlertDialogExample({ mode }: { mode: Mode }) {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="st-gl-stack">
      <Alert.AlertDialog open={open} onOpenChange={setOpen}>
        <Alert.AlertDialogTrigger render={<Button variant="destructive" />}>delete run</Alert.AlertDialogTrigger>
        <Alert.AlertDialogContent portalProps={{ className: mode }}>
          <Confirmation
            confirm={() => {
              setDeleted(true);
              setOpen(false);
            }}
          />
        </Alert.AlertDialogContent>
      </Alert.AlertDialog>
      <p className="st-gl-note" role="status">
        {deleted ? "or-412 removed from this example." : "or-412 has 3 logs. cancel keeps them."}
      </p>
    </div>
  );
}
// AlertDialog is always modal. Its open print keeps the exact content classes in normal flow under a closed root,
// rather than mounting an open primitive that would take focus or lock the document's scroll.
export function AlertDialogOpen({ size = "default", scrim = false }: { size?: "default" | "sm"; scrim?: boolean }) {
  const content = (
    <Alert.AlertDialog>
      <div
        data-size={size}
        className="st-gl-alert relative isolate w-full border border-border bg-popover p-7 text-ui text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)] max-w-[440px] data-[size=sm]:max-w-xs"
      >
        <Confirmation />
      </div>
    </Alert.AlertDialog>
  );
  return (
    <div inert aria-hidden="true" className={scrim ? "st-gl-scrim bg-scrim" : "st-gl-alert-print"}>
      {content}
    </div>
  );
}
export function AlertDialogSizes() {
  return (
    <div className="st-gl-stack">
      {["default", "sm"].map((size) => (
        <State
          key={size}
          name={size}
          note={size === "default" ? "440 px maximum width" : "320 px maximum width"}
          className="st-gl-full"
        >
          <AlertDialogOpen size={size as "default" | "sm"} />
        </State>
      ))}
    </div>
  );
}
export function AlertDialogStates() {
  return (
    <States>
      {["rest", "hover", "focus-visible", "active", "disabled"].map((state) => (
        <State
          key={state}
          name={state === "focus-visible" ? "focus" : state === "active" ? "pressed" : state}
          note={
            state === "focus-visible"
              ? "outside house ring"
              : state === "disabled"
                ? "disabled action"
                : "destructive action in key ink"
          }
        >
          <Alert.AlertDialogAction
            variant="destructive"
            tabIndex={-1}
            data-demo={state}
            disabled={state === "disabled"}
          >
            delete run
          </Alert.AlertDialogAction>
        </State>
      ))}
    </States>
  );
}
