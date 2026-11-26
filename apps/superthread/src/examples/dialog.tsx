import { useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/superthread/ui/dialog";

const drafts = [
  { chapter: "Chapter 8", title: "Waves that keep their shape" },
  { chapter: "Chapter 9", title: "What a measurement does" },
  { chapter: "Chapter 10", title: "The double slit, again" },
  { chapter: "Chapter 11", title: "Spin, without the spinning" },
];

function Confirm() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete this draft?</DialogTitle>
        <DialogDescription>
          The draft and its 3 comments go for good. Published chapters stay as they are.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <DialogClose render={<Button variant="destructive" />}>Delete draft</DialogClose>
      </DialogFooter>
    </>
  );
}

// The dialog as it stands open, printed inside a frame that plays the window. The frame is a containing block for
// fixed boxes (contain: layout), so the scrim and the centred sheet land in it. DialogContent's portalProps hand its
// portal the frame instead of the body, and the frame comes from state, so the portal waits for it (a null container
// holds it back). Inert: nothing in the print takes focus or the pointer, and it stays open.
export function DialogPrinted() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="st-c-screen" inert>
      <div className="st-c-drafts">
        <p className="type-meta">Drafts</p>
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
        <DialogContent portalProps={{ container: frame }} initialFocus={false} finalFocus={false}>
          <Confirm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// The same dialog for real: it opens over the page, in the page's mode.
export function DialogLive() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>Delete draft</DialogTrigger>
      <DialogContent>
        <Confirm />
      </DialogContent>
    </Dialog>
  );
}
