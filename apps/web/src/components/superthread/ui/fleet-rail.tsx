import type { ReactNode } from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator } from '@/components/ui/sidebar'

type FleetApp = { name: string; href: string; mark: string }

const marks = 'https://www.mauricekleine.com/superthread/marks'

// Public apps open in a new tab: they have no rail to come back through.
const publicApps: FleetApp[] = [
  { name: 'mauricekleine.com', href: 'https://www.mauricekleine.com', mark: 'https://www.mauricekleine.com/favicon.ico' },
  { name: 'fluncle.com', href: 'https://www.fluncle.com', mark: `${marks}/fluncle.png` },
  { name: 'nonobench.com', href: 'https://www.nonobench.com', mark: 'https://www.mauricekleine.com/superthread/nonobench-mark.svg' },
]

const privateApps: FleetApp[] = ['orbit', 'quanta', 'hyperspeed', 'trisys', 'constellation'].map((name) => ({ name, href: `https://${name}.mauricekleine.com`, mark: `${marks}/${name}.svg` }))

export function FleetRail({ current, sidebar, children }: { current: string; sidebar?: ReactNode; children?: ReactNode }) {
  const group = (apps: FleetApp[], external: boolean) => <SidebarGroup>
    <SidebarMenu>
      {apps.map((app) => <SidebarMenuItem key={app.href}>
        <SidebarMenuButton render={<a href={app.href} aria-current={current === app.name ? 'page' : undefined} {...(external && { target: '_blank', rel: 'noopener' })} />} isActive={current === app.name} tooltip={app.name}>
          <img src={app.mark} alt="" width="16" height="16" />
          <span>{app.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>)}
    </SidebarMenu>
  </SidebarGroup>
  const rail = <SidebarContent>
    {group(publicApps, true)}
    <SidebarSeparator />
    {group(privateApps, false)}
  </SidebarContent>

  return <SidebarProvider defaultOpen={!!sidebar}>
    <Sidebar collapsible="icon" className={sidebar ? 'overflow-hidden *:data-[sidebar=sidebar]:flex-row' : undefined}>
      {sidebar ? <>
        <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r max-md:h-auto">{rail}</Sidebar>
        <Sidebar collapsible="none" className="flex-1">{sidebar}</Sidebar>
      </> : rail}
    </Sidebar>
    {children}
  </SidebarProvider>
}
