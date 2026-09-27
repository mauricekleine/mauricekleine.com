import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { superthreadHead } from '../seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FleetRail } from '@/components/superthread/ui/fleet-rail'
import { SidebarTrigger } from '@/components/ui/sidebar'

export const Route = createFileRoute('/superthread')({ head: superthreadHead, component: SuperthreadPage })

function SuperthreadPage() {
  const [mode, setMode] = useState<'paper' | 'void'>('paper')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'void')
  }, [mode])

  return <TooltipProvider><div className="st-specimen">
    <div className="st-shell">
      <header className="st-hero">
        <p className="st-meta">maurice kleine / design system</p>
        <h1>superthread</h1>
        <p>one thread through the things i build. stock shadcn components, in the void and on paper.</p>
        <div className="st-mode-picker" aria-label="theme mode">
          <Button variant={mode === 'paper' ? 'default' : 'outline'} onClick={() => setMode('paper')}>paper</Button>
          <Button variant={mode === 'void' ? 'default' : 'outline'} onClick={() => setMode('void')}>void</Button>
        </div>
      </header>

      <section aria-labelledby="components"><h2 id="components">components</h2>
        <p>the theme changes the variables. each component stays as shadcn ships it.</p>
        <div className="st-row"><Button>continue</Button><Button variant="secondary">secondary</Button><Button variant="outline">outline</Button><Button variant="ghost">ghost</Button><Button variant="destructive">remove</Button><Button disabled>disabled</Button></div>
        <div className="st-row"><Input aria-label="ship name" placeholder="ship name" /><Badge>active</Badge><Badge variant="secondary">waiting</Badge><Badge variant="outline">draft</Badge></div>
        <div className="st-grid">
          <Card><CardHeader><CardTitle>one small thing</CardTitle><CardDescription>work in motion.</CardDescription></CardHeader><CardContent><Badge>in progress</Badge></CardContent></Card>
          <Tabs defaultValue="living"><TabsList><TabsTrigger value="living">living</TabsTrigger><TabsTrigger value="dormant">dormant</TabsTrigger></TabsList><TabsContent value="living">work that is still moving.</TabsContent><TabsContent value="dormant">experiments at rest.</TabsContent></Tabs>
        </div>
        <div className="st-row">
          <Dialog><DialogTrigger render={<Button variant="outline" />}>open dialog</DialogTrigger><DialogContent><DialogHeader><DialogTitle>one focused thing</DialogTitle><DialogDescription>a short decision belongs here.</DialogDescription></DialogHeader></DialogContent></Dialog>
          <Tooltip><TooltipTrigger render={<Button variant="outline" />}>hover for a note</TooltipTrigger><TooltipContent>one accent for the next action.</TooltipContent></Tooltip>
        </div>
      </section>

      <section aria-labelledby="fleet"><h2 id="fleet">fleet</h2><p>one mark per app, docked to the left edge.</p>
        <div className="st-rail-preview">
          <FleetRail current="orbit"><div className="st-rail-stage"><SidebarTrigger className="md:hidden" /><p>orbit</p><span>the app keeps its own navigation.</span></div></FleetRail>
        </div>
      </section>

      <section aria-labelledby="type"><h2 id="type">type</h2>
        <p className="st-sans">supreme / body</p><p className="st-serif">erode / reading</p><p className="st-mono">fragment mono / meta</p><p className="st-display">panchang / display</p>
      </section>
      <footer><a href="https://github.com/mauricekleine/mauricekleine.com/tree/main/packages/superthread">source and setup</a></footer>
    </div>
  </div></TooltipProvider>
}
