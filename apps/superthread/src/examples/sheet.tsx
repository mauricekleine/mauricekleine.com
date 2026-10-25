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

// A run's details in a sheet from the right. The sheet renders at the end of the page, outside its pane, so it
// takes the mode it is given: each pane passes its own.
export function SheetExample({ mode }: { mode: "light" | "dark" }) {
  return (
    <>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>open or-412</SheetTrigger>
        <SheetContent className={mode}>
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
            <dd>4m ago</dd>
            <dt>ship</dt>
            <dd>orbit</dd>
          </dl>
        </SheetContent>
      </Sheet>
      <p className="st-pass-hint">it opens from the right in this pane&rsquo;s mode. close it with the x or escape.</p>
    </>
  );
}
