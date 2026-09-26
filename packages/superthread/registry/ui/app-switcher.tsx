import { Menu } from '@base-ui/react/menu'
import { useRef, type ReactNode } from 'react'
import { cn } from '../lib/utils'

export type FleetApp = {
  name: string
  href: string
  description?: string
  mark?: ReactNode
  private?: boolean
}

export const defaultApps: FleetApp[] = [
  { name: 'mauricekleine.com', href: 'https://www.mauricekleine.com', description: 'the site' },
  { name: 'nonobench.com', href: 'https://nonobench.com', description: 'nonogram benchmark' },
  { name: 'orbit', href: 'https://orbit.mauricekleine.com', description: 'work in motion', mark: <img src="https://www.mauricekleine.com/superthread/orbit-mark.png" alt="" />, private: true },
  { name: 'quanta', href: 'https://quanta.mauricekleine.com', description: 'reading on paper', mark: <img src="https://www.mauricekleine.com/superthread/quanta-mark-void.png" alt="" />, private: true },
  { name: 'hyperspeed', href: 'https://hyperspeed.mauricekleine.com', description: 'agent fleet', mark: <img src="https://www.mauricekleine.com/superthread/hyperspeed-mark.png" alt="" />, private: true },
  { name: 'trisys', href: 'https://trisys.mauricekleine.com', description: 'private ship', private: true },
]

export function AppSwitcher({ apps = defaultApps, className }: { apps?: readonly FleetApp[]; className?: string }) {
  const portal = useRef<HTMLSpanElement>(null)
  return <Menu.Root>
    <Menu.Trigger className={cn('inline-flex min-h-10 items-center gap-sm rounded-sm border border-line-strong bg-surface px-md font-body text-ink outline-none transition-colors duration-150 ease-snap hover:border-thread-bright focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright motion-reduce:transition-none', className)}>
      <span aria-hidden="true">✦</span> fleet <span aria-hidden="true">⌄</span>
    </Menu.Trigger>
    <span ref={portal} style={{ display: 'contents' }} />
    <Menu.Portal container={portal}>
      <Menu.Positioner sideOffset={8} align="start" className="z-50">
        <Menu.Popup className="w-[min(19rem,calc(100vw-2rem))] rounded-md border border-line-strong bg-surface p-xs font-body text-ink shadow-[0_16px_48px_var(--ground-deep)] outline-none">
          <div className="px-md py-sm font-label text-[length:var(--text-label)] tracking-label text-ink-dim-ui">ships</div>
          {apps.map((app) => <Menu.LinkItem key={app.name} href={app.href} className="flex items-center gap-md rounded-xs px-md py-sm text-ink no-underline outline-none hover:bg-thread-soft focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-thread-bright data-[highlighted]:bg-thread-soft">
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-xs border border-line text-thread">{app.mark ?? '✦'}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{app.name}</span>{app.description && <span className="block truncate text-xs text-ink-muted">{app.description}</span>}</span>
            {app.private && <span className="font-label text-[length:var(--text-label)] text-ink-dim-ui" aria-label="private ship">private ⟐</span>}
          </Menu.LinkItem>)}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
}
