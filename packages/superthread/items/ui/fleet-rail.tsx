import type { ReactNode } from "react";

import { fleet } from "@/components/superthread/lib/fleet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/superthread/ui/sidebar";
import { TooltipProvider } from "@/components/superthread/ui/tooltip";

// One cell per ship, with v1's props. It names no hosts: links, marks and styling come with the skin.
export function FleetRail({
  current,
  sidebar,
  children,
}: {
  current: string;
  sidebar?: ReactNode;
  children?: ReactNode;
}) {
  const rail = (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {fleet.map((ship) => (
            <SidebarMenuItem key={ship.id}>
              <SidebarMenuButton
                isActive={current === ship.id}
                aria-current={current === ship.id ? "page" : undefined}
                tooltip={ship.name}
              >
                <span>{ship.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={!!sidebar}>
        <Sidebar collapsible="icon">
          {sidebar ? (
            <>
              <Sidebar collapsible="none">{rail}</Sidebar>
              <Sidebar collapsible="none">{sidebar}</Sidebar>
            </>
          ) : (
            rail
          )}
        </Sidebar>
        {children}
      </SidebarProvider>
    </TooltipProvider>
  );
}
