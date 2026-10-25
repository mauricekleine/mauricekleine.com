import { useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/superthread/ui/dialog";

const drafts = [
  { chapter: "chapter 8", title: "waves that keep their shape" },
  { chapter: "chapter 9", title: "what a measurement does" },
  { chapter: "chapter 10", title: "the double slit, again" },
  { chapter: "chapter 11", title: "spin, without the spinning" },
];

function Confirm() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>delete this draft?</DialogTitle>
        <DialogDescription>
          the draft and its 3 comments go for good. published chapters stay as they are.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>cancel</DialogClose>
        <DialogClose render={<Button variant="destructive" />}>delete draft</DialogClose>
      </DialogFooter>
    </>
  );
}

// The dialog as it stands open, printed inside a frame that plays the window. The frame is a containing block for
// fixed boxes (contain: layout), so the scrim and the centred sheet land in it. DialogContent portals to the body on
// its own; the outer portal hands it the frame instead, and the frame comes from state, so the portal waits for it.
// Inert: nothing in the print takes focus or the pointer, and it stays open.
export function DialogPrinted() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="st-c-screen" inert>
      <div className="st-c-drafts">
        <p className="type-meta">drafts</p>
        <ul>
          {drafts.map((draft) => (
            <li key={draft.chapter}>
              <span>{draft.chapter}</span>
              <span aria-hidden="true">·</span>
              <span>{draft.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <Dialog open modal={false}>
        <DialogPortal container={frame}>
          <DialogContent initialFocus={false} finalFocus={false}>
            <Confirm />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

// The same dialog for real: it opens over the page, in the page's mode.
export function DialogLive() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>delete draft</DialogTrigger>
      <DialogContent>
        <Confirm />
      </DialogContent>
    </Dialog>
  );
}
