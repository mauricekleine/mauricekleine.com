import { useEffect, useState } from "react";
import type { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { Letter, LetterBody, LetterHead, LetterKind, LetterSubject } from "@/components/superthread/blocks/letter";
import {
  SendBar,
  SendBarActions,
  SendBarAddress,
  SendBarButton,
  SendBarTitle,
  SendBarTo,
} from "@/components/superthread/blocks/send-bar";
import { Button } from "@/components/superthread/ui/button";
import { GroundFrame } from "@/examples/compositions-a";
import {
  ToastAction,
  ToastList,
  ToastProvider,
  ToastViewport,
  Toaster,
  createToastManager,
  toast,
} from "@/components/superthread/ui/toast";

// what a printed toast can carry beyond the item's options: a second, ghost button beside its one action
type Printed = { undo?: string };

// The action row ToastList prints for each toast: its one action, then the ghost button the toast's data names.
function printedActions(item: ToastPrimitive.Root.ToastObject<Printed>) {
  return (
    <>
      <ToastAction />
      {item.data?.undo && (
        <Button variant="ghost" size="sm">
          {item.data.undo}
        </Button>
      )}
    </>
  );
}

// Three toasts, newest in front, on a manager of their own that never times out, printed by the item's ToastList with
// the action row above. The provider subscribes in its own effect, which runs before this one, so the toasts land.
// The viewport leaves its fixed corner and sits in the page, as tall as the front toast plus the two 12 px peeks.
// Inert: the stack never expands or pauses.
export function ToastPrinted() {
  const [manager] = useState(() => createToastManager<Printed>());
  useEffect(() => {
    const ids = [
      manager.add({
        title: "Artifacts is waiting",
        description: "A review needs you before it ships.",
        type: "warning",
        timeout: 0,
      }),
      manager.add({
        title: "or-412 picked up",
        description: "Codex 2 started on the select listbox.",
        type: "info",
        timeout: 0,
      }),
      manager.add({
        title: "Chapter 7 published",
        description: "Quanta rebuilt 14 pages in 38 s.",
        type: "success",
        timeout: 0,
        actionProps: { children: "View chapter" },
        data: { undo: "Undo" },
      }),
    ];
    return () => {
      for (const id of ids) manager.close(id);
    };
  }, [manager]);

  return (
    <div className="st-c-toasts" inert>
      <ToastProvider toastManager={manager}>
        <ToastViewport className="relative inset-auto z-auto h-[calc(var(--toast-frontmost-height,0px)+24px)] w-full max-w-[420px] [@media(max-width:600px)]:inset-auto [@media(max-width:600px)]:w-full [@media(max-width:600px)]:max-w-[420px]">
          <ToastList actions={printedActions} />
        </ToastViewport>
      </ToastProvider>
    </div>
  );
}

// A review on a phone just after its send: the letter, and the send bar at its foot holding the page's last action,
// now a receipt.
export function SentReview() {
  return (
    <AppShellPanel>
      <Letter aria-label="The reply, as it went out" last>
        <LetterHead>
          <LetterSubject>Re: Chapter 7 notes</LetterSubject>
          <LetterKind>Reply · Mail</LetterKind>
        </LetterHead>
        <LetterBody>
          <p>Hi Sam,</p>
          <p>
            Thanks for the notes. The three figures stay, and the bands move to the end of the chapter so the reader
            meets the result first.
          </p>
          <p>Maurice</p>
        </LetterBody>
        <SendBar aria-label="Where it went">
          <SendBarTo>
            <SendBarTitle>Sam Okafor</SendBarTitle>
            <SendBarAddress>sam@quanta.example</SendBarAddress>
          </SendBarTo>
          <SendBarActions>
            <SendBarButton disabled>Sent to Sam</SendBarButton>
          </SendBarActions>
        </SendBar>
      </Letter>
    </AppShellPanel>
  );
}

// The toast that follows the send, in the item's own viewport and place. It adds its toast once the provider inside
// the frame has subscribed, since the provider's effect runs first. Inert: the stack never expands or pauses.
function SentToast() {
  const [manager] = useState(() => createToastManager());
  useEffect(() => {
    const id = manager.add({
      title: "Sent to Sam",
      description: "The reply to chapter 7 notes is on its way.",
      type: "success",
      timeout: 0,
    });
    return () => manager.close(id);
  }, [manager]);
  return (
    <div inert>
      <ToastProvider toastManager={manager}>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastProvider>
    </div>
  );
}

// A 390 px viewport, so the item's phone place applies as it does on a phone: the toast drops from the top of the
// window and the send bar keeps the foot.
export function ToastOnPhone({ mode }: { mode: "light" | "dark" }) {
  return (
    <GroundFrame mode={mode} title={`Toast on a phone, ${mode}`} height={520}>
      <SentReview />
      <SentToast />
    </GroundFrame>
  );
}

let undone = 0;

function success() {
  const id = `chapter-${++undone}`;
  toast.add({
    id,
    title: "Chapter 7 published",
    description: "Quanta rebuilt 14 pages in 38 s.",
    type: "success",
    actionProps: {
      children: "Undo",
      onClick: () =>
        toast.update(id, {
          title: "Chapter 7 is a draft again",
          description: "Readers see the last published version.",
          type: "info",
          actionProps: undefined,
        }),
    },
  });
}

const kinds = [
  { type: "success", label: "Success", show: success },
  {
    type: "info",
    label: "Info",
    show: () =>
      toast.add({ title: "or-412 picked up", description: "Codex 2 started on the select listbox.", type: "info" }),
  },
  {
    type: "warning",
    label: "Warning",
    show: () =>
      toast.add({
        title: "Artifacts is waiting",
        description: "A review needs you before it ships.",
        type: "warning",
      }),
  },
  {
    type: "error",
    label: "Error",
    show: () =>
      toast.add({
        title: "The build failed",
        description: "Trisys stopped at step 3 of 5. The log has the rest.",
        type: "error",
      }),
  },
  {
    type: "loading",
    label: "Loading",
    show: () =>
      toast.promise(new Promise((resolve) => setTimeout(resolve, 2400)), {
        loading: { title: "Publishing chapter 8", description: "Quanta is building its pages." },
        success: { title: "Chapter 8 published", description: "Quanta rebuilt 15 pages in 41 s." },
        error: { title: "Chapter 8 did not publish", description: "The build stopped. Try again." },
      }),
  },
] as const;

// The item's Toaster, once on the page, and a button per type. Its stack sits at the bottom right of the window, or at
// its top on a phone, in the page's mode.
export function ToastLive() {
  return (
    <>
      <div className="st-c-tools">
        {kinds.map((kind) => (
          <Button key={kind.type} variant="outline" onClick={kind.show}>
            {kind.label}
          </Button>
        ))}
      </div>
      <Toaster />
    </>
  );
}
