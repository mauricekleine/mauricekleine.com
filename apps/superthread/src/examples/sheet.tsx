import { useState } from "react";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/superthread/ui/sheet";

const board = [
  { id: "or-418", title: "write the release notes for next.2" },
  { id: "or-412", title: "tighten the select listbox keyboard loop" },
  { id: "or-414", title: "split the board query by ship" },
  { id: "or-411", title: "regenerate the registry css after the token change" },
];

// A run's details: the sheet's header, then its facts on the sheet's 16 px inset.
function Run() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>or-412</SheetTitle>
        <SheetDescription>tighten the select listbox keyboard loop</SheetDescription>
      </SheetHeader>
      <dl className="st-pass-facts">
        <dt>status</dt>
        <dd>
          <Badge variant="running" />
        </dd>
        <dt>agent</dt>
        <dd>codex 2</dd>
        <dt>started</dt>
        <dd className="st-pass-q">4m ago</dd>
        <dt>ship</dt>
        <dd>orbit</dd>
      </dl>
    </>
  );
}

// The sheet as it stands open, printed inside a frame that plays the window. The frame is a containing block for
// fixed boxes (contain: layout), so the scrim and the sheet docked to the right land in it. SheetContent's portalProps
// hand its portal the frame instead of the body, and the frame comes from state, so the portal waits for it (a null
// container holds it back). Inert: nothing in the print takes focus or the pointer, and it stays open.
export function SheetPrinted() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setFrame} className="st-pass-screen" inert>
      <div className="st-pass-board">
        <p className="type-meta">board</p>
        <ul>
          {board.map((task) => (
            <li key={task.id}>
              <span className="st-pass-q">{task.id}</span>
              <span>{task.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <Sheet open modal={false}>
        <SheetContent portalProps={{ container: frame }} initialFocus={false} finalFocus={false}>
          <Run />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// The same sheet for real, from the right. It renders at the end of the page, outside its pane, so each pane hands
// its portal its own mode, and the scrim and the sheet both take it.
export function SheetExample({ mode }: { mode: "light" | "dark" }) {
  return (
    <>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>open or-412</SheetTrigger>
        <SheetContent portalProps={{ className: mode }}>
          <Run />
        </SheetContent>
      </Sheet>
      <p className="st-pass-hint">it opens from the right in this pane&rsquo;s mode. close it with the x or escape.</p>
    </>
  );
}
