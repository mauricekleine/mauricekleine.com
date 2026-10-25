import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/superthread/ui/sidebar";
import type { ShipNavItem } from "./data";

// the two ships the mock has pages for; every other cell in the rail prints as a ship this mock does not open
const hrefs = { home: "/", orbit: "/mock/board", quanta: "/mock/reading" };

// An app inside the fleet: the rail and the ship's own nav on the deep ground, then the app's ground beside them.
// At 900 px and below the rail is a bar and the nav a row of links above the app.
export function ShipFrame({
  ship,
  nav,
  current,
  children,
}: {
  ship: string;
  nav: readonly ShipNavItem[];
  // the label of the nav item this page is
  current: string;
  children: ReactNode;
}) {
  return (
    <FleetRail
      current={ship}
      markBase="/marks"
      hrefs={hrefs}
      sidebar={<ShipNav ship={ship} nav={nav} current={current} />}
    >
      <div className="mock-ground">{children}</div>
    </FleetRail>
  );
}

function ShipNav({ ship, nav, current }: { ship: string; nav: readonly ShipNavItem[]; current: string }) {
  return (
    <>
      <SidebarHeader className="h-[59px] justify-center border-b border-sidebar-border px-2.5 py-0 text-[17px] leading-none font-medium [@media(max-width:900px)]:hidden">
        {ship}
      </SidebarHeader>
      <SidebarContent className="overflow-visible">
        <SidebarGroup className="px-0 py-2 [@media(max-width:900px)]:py-0">
          <SidebarGroupContent>
            <nav aria-label={ship}>
              <SidebarMenu className="[@media(max-width:900px)]:flex-row [@media(max-width:900px)]:flex-wrap [@media(max-width:900px)]:gap-x-1 [@media(max-width:900px)]:gap-y-0">
                {nav.map((item) => {
                  const label = (
                    <>
                      {item.number && <span className="font-mono text-[11px] leading-4">{item.number}</span>}
                      <span>{item.label}</span>
                    </>
                  );
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={item.label === current}
                        className="[@media(max-width:900px)]:h-8 [@media(max-width:900px)]:w-auto"
                        render={item.to ? <Link to={item.to} /> : <span role="link" aria-disabled="true" />}
                      >
                        {label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
