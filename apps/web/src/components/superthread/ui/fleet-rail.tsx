import type { ReactNode } from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'

export type FleetApp = { name: string; href: string; mark: string }

export const defaultApps: FleetApp[] = [
  { name: 'mauricekleine.com', href: 'https://www.mauricekleine.com', mark: 'https://www.mauricekleine.com/favicon.ico' },
  { name: 'nonobench.com', href: 'https://nonobench.com', mark: 'https://www.mauricekleine.com/superthread/nonobench-mark.svg' },
  { name: 'orbit', href: 'https://orbit.mauricekleine.com', mark: 'https://www.mauricekleine.com/superthread/marks/orbit.svg' },
  { name: 'quanta', href: 'https://quanta.mauricekleine.com', mark: 'https://www.mauricekleine.com/superthread/marks/quanta.svg' },
  { name: 'hyperspeed', href: 'https://hyperspeed.mauricekleine.com', mark: 'https://www.mauricekleine.com/superthread/marks/hyperspeed.svg' },
  { name: 'trisys', href: 'https://trisys.mauricekleine.com', mark: 'https://www.mauricekleine.com/superthread/marks/trisys.svg' },
  { name: 'constellation', href: 'https://constellation.mauricekleine.com', mark: 'https://www.mauricekleine.com/superthread/marks/constellation.svg' },
  { name: 'soliton', href: 'https://soliton.mauricekleine.com', mark: 'https://www.mauricekleine.com/superthread/marks/soliton.svg' },
]

export function FleetRail({ apps = defaultApps, current, children }: { apps?: readonly FleetApp[]; current: string; children?: ReactNode }) {
  return <SidebarProvider defaultOpen={false}>
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {apps.map((app) => <SidebarMenuItem key={app.href}>
              <SidebarMenuButton render={<a href={app.href} aria-current={current === app.name ? 'page' : undefined} />} isActive={current === app.name} tooltip={app.name}>
                <img src={app.mark} alt="" width="16" height="16" />
                <span>{app.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    {children}
  </SidebarProvider>
}
