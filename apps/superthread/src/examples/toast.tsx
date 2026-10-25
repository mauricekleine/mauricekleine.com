import { useEffect, useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  createToastManager,
  toast,
  useToastManager,
} from "@/components/superthread/ui/toast";

// what a printed toast can carry beyond the item's options: a second, ghost button beside its one action
type Printed = { undo?: string };

// A list of our own, built as the item's ToastList is, from its parts and its ToastIcon. ToastList prints one action
// per toast; this one adds the ghost button a toast's data names.
function PrintedList() {
  const { toasts } = useToastManager<Printed>();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastIcon type={item.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
          <div className="mt-1.5 flex gap-2 empty:hidden">
            <ToastAction />
            {item.data?.undo && (
              <Button variant="ghost" size="sm">
                {item.data.undo}
              </Button>
            )}
          </div>
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

// Three toasts, newest in front, on a manager of their own that never times out. The provider subscribes in its own
// effect, which runs before this one, so the toasts land. The viewport leaves its fixed corner and sits in the page,
// as tall as the front toast plus the two 12 px peeks. Inert: the stack never expands or pauses.
export function ToastPrinted() {
  const [manager] = useState(() => createToastManager<Printed>());
  useEffect(() => {
    const ids = [
      manager.add({
        title: "artifacts is waiting",
        description: "a review needs you before it ships.",
        type: "warning",
        timeout: 0,
      }),
      manager.add({
        title: "or-412 picked up",
        description: "codex 2 started on the select listbox.",
        type: "info",
        timeout: 0,
      }),
      manager.add({
        title: "chapter 7 published",
        description: "quanta rebuilt 14 pages in 38 s.",
        type: "success",
        timeout: 0,
        actionProps: { children: "view chapter" },
        data: { undo: "undo" },
      }),
    ];
    return () => {
      for (const id of ids) manager.close(id);
    };
  }, [manager]);

  return (
    <div className="st-c-toasts" inert>
      <ToastProvider toastManager={manager}>
        <ToastViewport className="relative inset-auto z-auto mx-0 h-[calc(var(--toast-frontmost-height,0px)+24px)] w-full max-w-[420px] sm:inset-auto">
          <PrintedList />
        </ToastViewport>
      </ToastProvider>
    </div>
  );
}

let undone = 0;

function success() {
  const id = `chapter-${++undone}`;
  toast.add({
    id,
    title: "chapter 7 published",
    description: "quanta rebuilt 14 pages in 38 s.",
    type: "success",
    actionProps: {
      children: "undo",
      onClick: () =>
        toast.update(id, {
          title: "chapter 7 is a draft again",
          description: "readers see the last published version.",
          type: "info",
          actionProps: undefined,
        }),
    },
  });
}

const kinds = [
  { type: "success", show: success },
  {
    type: "info",
    show: () =>
      toast.add({ title: "or-412 picked up", description: "codex 2 started on the select listbox.", type: "info" }),
  },
  {
    type: "warning",
    show: () =>
      toast.add({
        title: "artifacts is waiting",
        description: "a review needs you before it ships.",
        type: "warning",
      }),
  },
  {
    type: "error",
    show: () =>
      toast.add({
        title: "the build failed",
        description: "trisys stopped at step 3 of 5. the log has the rest.",
        type: "error",
      }),
  },
  {
    type: "loading",
    show: () =>
      toast.promise(new Promise((resolve) => setTimeout(resolve, 2400)), {
        loading: { title: "publishing chapter 8", description: "quanta is building its pages." },
        success: { title: "chapter 8 published", description: "quanta rebuilt 15 pages in 41 s." },
        error: { title: "chapter 8 did not publish", description: "the build stopped. try again." },
      }),
  },
] as const;

// The item's Toaster, once on the page, and a button per type. Its stack sits in the window's corner, in the
// page's mode.
export function ToastLive() {
  return (
    <>
      <div className="st-c-tools">
        {kinds.map((kind) => (
          <Button key={kind.type} variant="outline" onClick={kind.show}>
            {kind.type}
          </Button>
        ))}
      </div>
      <Toaster />
    </>
  );
}
