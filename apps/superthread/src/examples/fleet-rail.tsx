import { useEffect, useRef } from "react";
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/superthread/ui/sidebar";

// Where each cell goes on this site: home to the overview, orbit and quanta to their mock pages, the other ships to
// the page that shows every mark. The printed states leave trisys out: a ship with no link is a disabled cell.
const marks = "/foundations/marks";
const withoutTrisys = {
  home: "/",
  orbit: "/mock/orbit",
  quanta: "/mock/reading",
  constellation: marks,
  artifacts: marks,
  soliton: marks,
};
const hrefs = { ...withoutTrisys, trisys: marks };

// The site serves the marks itself, under /marks/<id>/.
const markBase = "/marks";

// Orbit's rail, every cell a link.
export function RailLive() {
  return (
    <div className="st-c-ground st-c-ground-tab">
      <FleetRail current="orbit" hrefs={hrefs} markBase={markBase} />
    </div>
  );
}

// The rail's states, printed: quanta under the pointer, artifacts under keyboard focus and trisys with no link, which
// makes it a disabled cell. The rail sets no props on its cells, so the demo states go on after it mounts. Quanta's
// tab hangs right and artifacts' hangs left, so on a phone's bar both show and never meet. The print is inert, so it
// takes no pointer and no focus; the ground around it still scrolls.
export function RailStates() {
  const print = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cells = print.current?.querySelectorAll('[data-slot="fleet-rail-cell"]');
    cells?.[1]?.setAttribute("data-demo", "hover");
    cells?.[4]?.setAttribute("data-demo", "focus-visible");
  }, []);
  return (
    <div className="st-c-ground st-c-ground-tab st-c-print">
      <div ref={print} inert>
        <FleetRail current="orbit" hrefs={withoutTrisys} markBase={markBase} />
      </div>
    </div>
  );
}

const pages = ["board", "direction", "agents", "settings"];

// Orbit's own nav, passed as the rail's sidebar: it prints beside the rail on the same ground.
function OrbitNav() {
  return (
    <>
      <SidebarHeader className="h-[57px] justify-center px-[11px] py-0">
        <p className="type-subtitle">orbit</p>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarMenu>
            {pages.map((page) => (
              <SidebarMenuItem key={page}>
                <SidebarMenuButton isActive={page === "board"}>
                  <span>{page}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

export function RailWithNav() {
  return (
    <div className="st-c-ground">
      <FleetRail current="orbit" hrefs={hrefs} markBase={markBase} sidebar={<OrbitNav />} />
    </div>
  );
}
