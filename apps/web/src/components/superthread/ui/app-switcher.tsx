import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export type FleetApp = { name: string; href: string }

export const defaultApps: FleetApp[] = [
  { name: 'mauricekleine.com', href: 'https://www.mauricekleine.com' },
  { name: 'nonobench.com', href: 'https://nonobench.com' },
  { name: 'orbit', href: 'https://orbit.mauricekleine.com' },
  { name: 'quanta', href: 'https://quanta.mauricekleine.com' },
  { name: 'hyperspeed', href: 'https://hyperspeed.mauricekleine.com' },
  { name: 'trisys', href: 'https://trisys.mauricekleine.com' },
]

export function AppSwitcher({ apps = defaultApps }: { apps?: readonly FleetApp[] }) {
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>fleet</DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      {apps.map((app) => <DropdownMenuItem key={app.name} render={<a href={app.href} />}>{app.name}</DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>
}
