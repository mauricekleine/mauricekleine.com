import { useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/superthread/ui/sonner";
import { Button, buttonVariants } from "@/components/superthread/ui/button";
import { State, States, type Mode } from "@/examples/input";

type Kind = "plain" | "success" | "info" | "warning" | "error" | "loading";
const messages = {
  plain: ["run saved", "or-412 is ready for its next step."],
  success: ["chapter 7 published", "quanta rebuilt 14 pages in 38 s."],
  info: ["run or-412 started", "orbit picked up the next task."],
  warning: ["review is waiting", "artifacts needs a review before it ships."],
  error: ["the build failed", "trisys stopped at step 3. open the log to retry."],
  loading: ["publishing chapter 8", "quanta is building its pages."],
} as const;
function notify(
  kind: Kind,
  toasterId: string,
  options: { duration?: number; actions?: boolean; onDismiss?: () => void } = {},
) {
  const [title, description] = messages[kind];
  const config = {
    toasterId,
    description,
    duration: options.duration ?? 3500,
    onDismiss: options.onDismiss,
    onAutoClose: options.onDismiss,
    ...(options.actions
      ? {
          action: { label: "view", onClick: () => {} },
          cancel: { label: "undo", onClick: () => {} },
        }
      : {}),
  };
  return kind === "plain" ? toast(title, config) : toast[kind](title, config);
}
// Each print has its own toaster and one toast. Only placement changes: the original item renders its own glyph,
// title, description, actions and contact edge. An inert frame keeps the persistent print out of the tab order.
function PrintedToast({ kind, mode, actions = false }: { kind: Kind; mode: Mode; actions?: boolean }) {
  const id = useId();
  useEffect(() => {
    const toastId = notify(kind, id, { duration: Infinity, actions });
    return () => {
      toast.dismiss(toastId);
    };
  }, [id, kind, actions]);
  return (
    <div className="st-gl-toast-print" inert aria-hidden="true">
      <Toaster
        id={id}
        theme={mode}
        position="top-left"
        closeButton={actions}
        style={{ position: "absolute", inset: "0 auto auto 0", width: "100%" }}
      />
    </div>
  );
}
export function SonnerExample({ mode }: { mode: Mode }) {
  const id = useId();
  const ids = useRef(new Set<string | number>());
  const timers = useRef(new Map<string | number, ReturnType<typeof setTimeout>>());
  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      for (const item of ids.current) toast.dismiss(item);
    },
    [],
  );
  function dismissAll() {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    for (const item of ids.current) toast.dismiss(item);
    ids.current.clear();
  }
  function show(kind: Kind) {
    const item = notify(kind, id, {
      onDismiss: () => {
        ids.current.delete(item);
        clearTimeout(timers.current.get(item));
        timers.current.delete(item);
      },
    });
    ids.current.add(item);
    // Loading has no timeout in sonner. Resolve only while this example still owns the live notification.
    if (kind === "loading")
      timers.current.set(
        item,
        setTimeout(() => {
          timers.current.delete(item);
          if (ids.current.has(item))
            toast.success("chapter 8 published", {
              id: item,
              toasterId: id,
              description: "quanta rebuilt 15 pages in 41 s.",
              duration: 3500,
              onDismiss: () => {
                ids.current.delete(item);
              },
              onAutoClose: () => {
                ids.current.delete(item);
              },
            });
        }, 1800),
      );
  }
  return (
    <div className="st-gl-stack">
      <div className="st-gl-tools">
        {(["success", "info", "warning", "error", "loading"] as const).map((kind) => (
          <Button key={kind} variant="outline" onClick={() => show(kind)}>
            {kind}
          </Button>
        ))}
        <Button variant="ghost" onClick={dismissAll}>
          dismiss all
        </Button>
      </div>
      <p className="st-gl-note">notifications close after a few seconds. loading finishes with a success message.</p>
      <div className="st-gl-live-toasts">
        <Toaster
          id={id}
          theme={mode}
          position="top-left"
          closeButton
          visibleToasts={2}
          style={{ position: "absolute", inset: "0 auto auto 0", width: "100%" }}
        />
      </div>
    </div>
  );
}
export function SonnerOpen({ mode }: { mode: Mode }) {
  return <PrintedToast mode={mode} kind="success" actions />;
}
export function SonnerKinds({ mode }: { mode: Mode }) {
  return (
    <div className="st-gl-stack">
      {(["plain", "success", "info", "warning", "error", "loading"] as const).map((kind) => (
        <State
          className="st-gl-full"
          key={kind}
          name={kind}
          note={
            kind === "loading"
              ? "static running glyph, no spinner"
              : kind === "plain"
                ? "words without a status glyph"
                : "status glyph beside the words"
          }
        >
          <PrintedToast mode={mode} kind={kind} />
        </State>
      ))}
    </div>
  );
}

// These are the action and cancel classes from Toaster, including its flat disabled edge. The printed state uses
// the same data-demo variants as a live small button; it does not add a second texture to the toast.
export function SonnerStates() {
  return (
    <States>
      {["rest", "hover", "focus-visible", "active", "disabled"].map((state) => (
        <State
          key={state}
          name={state === "focus-visible" ? "focus" : state === "active" ? "pressed" : state}
          note={
            state === "disabled"
              ? "flat disabled actions"
              : state === "focus-visible"
                ? "outside control ring"
                : "small action and outline cancel"
          }
        >
          <div inert className="st-gl-tools">
            <button
              type="button"
              data-demo={state}
              disabled={state === "disabled"}
              className={buttonVariants({ size: "sm" }).replace("texture-disabled", "")}
            >
              view
            </button>
            <button
              type="button"
              data-demo={state}
              disabled={state === "disabled"}
              className={buttonVariants({ variant: "outline", size: "sm" }).replace("texture-disabled", "")}
            >
              undo
            </button>
          </div>
        </State>
      ))}
    </States>
  );
}
