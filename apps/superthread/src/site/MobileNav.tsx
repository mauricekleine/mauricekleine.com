import { useState } from "react";
import { Button } from "@/components/superthread/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/superthread/ui/sheet";
import { SideNav } from "./SideNav";

// At 900 px and below the nav leaves the page: the masthead's menu opens it in a sheet from the left, mode control
// included, and choosing a page closes it.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="st-menu" />}>menu</SheetTrigger>
      <SheetContent side="left" className="st-sheet-nav">
        <SheetTitle className="sr-only">pages</SheetTitle>
        <SideNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
