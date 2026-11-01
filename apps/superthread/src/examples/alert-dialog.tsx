import { useState } from "react";
import * as Alert from "@/components/superthread/ui/alert-dialog";
import { Button } from "@/components/superthread/ui/button";
import { Icon } from "@/components/superthread/ui/glyphs";
import { State, States, type Mode } from "@/examples/input";

const CONFIRMATIONS = {
  delete: {
    title: "delete run or-412?",
    explanation: "the run and its 3 logs are removed. this cannot be undone.",
    action: "delete run",
    variant: "destructive",
  },
  inside: {
    title: "rerun or-412?",
    explanation: "the run starts again from its last step.",
    action: "rerun",
    variant: "default",
  },
  outward: {
    title: "send the reply to sam?",
    explanation: "sam gets it by email, so it can't be taken back.",
    action: "send reply",
    variant: "key",
  },
} as const;

type Kind = keyof typeof CONFIRMATIONS;

function Confirmation({ confirm, kind = "delete" }: { confirm?: () => void; kind?: Kind }) {
  const { title, explanation, action, variant } = CONFIRMATIONS[kind];
  return (
    <>
      <Alert.AlertDialogHeader>
        {kind === "delete" && (
          <Alert.AlertDialogMedia>
            <Icon name="trash" />
          </Alert.AlertDialogMedia>
        )}
        <Alert.AlertDialogTitle>{title}</Alert.AlertDialogTitle>
        <Alert.AlertDialogDescription>{explanation}</Alert.AlertDialogDescription>
      </Alert.AlertDialogHeader>
      <Alert.AlertDialogFooter>
        <Alert.AlertDialogCancel>cancel</Alert.AlertDialogCancel>
        <Alert.AlertDialogAction variant={variant} onClick={confirm}>
          {action}
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
export function AlertDialogOpen({
  kind,
  size = "default",
  scrim = false,
}: {
  kind?: Kind;
  size?: "default" | "sm";
  scrim?: boolean;
}) {
  const content = (
    <Alert.AlertDialog>
      <div
        data-size={size}
        className="st-gl-alert relative isolate w-full border border-border bg-popover p-7 text-ui text-popover-foreground shadow-sheet texture-contact [--contact-lift:var(--elevation-sheet-rake)] max-w-[440px] data-[size=sm]:max-w-xs"
      >
        <Confirmation kind={kind} />
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
export function AlertDialogActions() {
  return (
    <div className="st-gl-stack">
      <State name="default" note="house ink on paper, the outline on a dark sheet" className="st-gl-full">
        <AlertDialogOpen kind="inside" />
      </State>
      <State name="key" note="an action that leaves the app" className="st-gl-full">
        <AlertDialogOpen kind="outward" />
      </State>
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
