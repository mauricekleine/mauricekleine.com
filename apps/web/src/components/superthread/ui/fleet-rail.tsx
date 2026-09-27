import type { CSSProperties, ReactNode } from 'react'
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

export function FleetRail({ apps = defaultApps, current, sidebar, children }: { apps?: readonly FleetApp[]; current: string; sidebar?: ReactNode; children?: ReactNode }) {
  const rail = <SidebarContent>
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

  return <SidebarProvider defaultOpen={!!sidebar} style={sidebar ? { '--sidebar-width': '350px' } as CSSProperties : undefined}>
    <Sidebar collapsible="icon" className={sidebar ? 'overflow-hidden *:data-[sidebar=sidebar]:flex-row' : undefined}>
      {sidebar ? <>
        <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r max-md:h-auto">{rail}</Sidebar>
        <Sidebar collapsible="none" className="flex-1">{sidebar}</Sidebar>
      </> : rail}
    </Sidebar>
    {children}
  </SidebarProvider>
}
