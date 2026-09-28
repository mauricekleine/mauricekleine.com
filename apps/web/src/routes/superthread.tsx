import { useEffect, useRef, useState } from 'react'
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
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'


export const Route = createFileRoute('/superthread')({ head: superthreadHead, component: SuperthreadPage })

function SuperthreadPage() {
  const [mode, setMode] = useState<'paper' | 'void'>('paper')
  const focusField = useRef<HTMLInputElement>(null)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'void')
  }, [mode])

  return <TooltipProvider><div className="st-specimen">
    <div className="st-shell">
      <header className="st-hero">
        <p className="st-meta">maurice kleine / design system</p>
        <h1>superthread</h1>
        <p>one thread through the things i build. stock shadcn components, in the void and on paper.</p>
        <div className="st-mode-picker">
          <ToggleGroup aria-label="theme mode" value={[mode]} onValueChange={(value) => value[0] && setMode(value[0] as 'paper' | 'void')}>
            <ToggleGroupItem value="paper">paper</ToggleGroupItem>
            <ToggleGroupItem value="void">void</ToggleGroupItem>
          </ToggleGroup>
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

      <section aria-labelledby="states"><h2 id="states">states</h2>
        <p>the next action, a field that needs work, and choices at rest.</p>
        <div className="st-row"><Button onClick={() => focusField.current?.focus()}>focus ship name</Button>
          <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}>open menu</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>view details</DropdownMenuItem><DropdownMenuItem>archive draft</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          <Button disabled>unavailable</Button></div>
        <div className="st-state-grid">
          <div className="st-field"><label htmlFor="focused-ship">focused field</label><Input ref={focusField} id="focused-ship" placeholder="ship name" /></div>
          <div className="st-field"><label htmlFor="invalid-ship">error</label><Input id="invalid-ship" aria-invalid="true" aria-describedby="ship-error" placeholder="ship name" /><span id="ship-error" className="st-error">add a ship name to continue.</span></div>
          <div className="st-field"><label htmlFor="disabled-ship">disabled</label><Input id="disabled-ship" disabled value="waiting for a name" /></div>
        </div>
        <div className="st-row"><Badge>current</Badge><Badge variant="secondary">settled</Badge><Badge variant="destructive">needs attention</Badge><Badge variant="outline">draft</Badge></div>
      </section>


      <section aria-labelledby="fleet"><h2 id="fleet">fleet</h2><p>one mark per app, docked to the left edge.</p>
        <div className="st-rail-preview">
          <FleetRail current="orbit"><div className="st-rail-stage"><SidebarTrigger className="md:hidden" /><p>orbit</p><span>current destination</span><a href="#states" className="st-data-row"><span>review next orbit</span><Badge>current</Badge></a></div></FleetRail>
        </div>
        <p>fleet rail with app navigation.</p>
        <div className="st-rail-preview">
          <FleetRail current="hyperspeed" sidebar={<>
            <SidebarHeader>hyperspeed</SidebarHeader>
            <SidebarContent><SidebarGroup><SidebarGroupLabel>workspace</SidebarGroupLabel><SidebarMenu>
              {['board', 'needs you', 'goals', 'usage'].map((item) => <SidebarMenuItem key={item}>
                <SidebarMenuButton isActive={item === 'board'}>{item}</SidebarMenuButton>
              </SidebarMenuItem>)}
            </SidebarMenu></SidebarGroup></SidebarContent>
          </>}><div className="st-rail-stage"><SidebarTrigger /><p>board</p><span>app navigation inside the shared sidebar.</span><a href="#states" className="st-data-row"><span>one goal in motion</span><Badge>current</Badge></a></div></FleetRail>
        </div>
      </section>

      <section aria-labelledby="type"><h2 id="type">type</h2>
        <div className="st-type-grid">
          <div><span className="st-type-label">12 / metadata</span><p className="st-mono">orbit · 09:42 · 3 active</p></div>
          <div><span className="st-type-label">14 / instrument</span><p className="st-instrument">one small thing is moving.</p></div>
          <div><span className="st-type-label">16 / ui</span><p className="st-ui">a clear next step.</p></div>
          <div><span className="st-type-label">18 / reading</span><p className="st-serif">a small experiment can still teach you something. keep the useful part and move on.</p></div>
          <div><span className="st-type-label">24 / section</span><p className="st-section-type">the work</p></div>
          <div><span className="st-type-label">32 / page</span><p className="st-page-type">current work</p></div>
          <div><span className="st-type-label">48 / short hero</span><p className="st-hero-type">keep building</p></div>
          <div><span className="st-type-label">64 / display</span><p className="st-display-type">superthread</p></div>
        </div>
      </section>
      <section aria-labelledby="density"><h2 id="density">density</h2>
        <p>reading gets room. operating rows stay close to the work.</p>
        <div className="st-density-grid">
          <div><span className="st-type-label">read / 48–56px rows</span><a className="st-reading-row" href="#type">one useful note <span>read</span></a><a className="st-reading-row" href="#type">another small experiment <span>read</span></a></div>
          <div><span className="st-type-label">operate / 44–48px rows</span><a className="st-data-row" href="#states"><span>review next orbit</span><span className="st-mono">09:42</span></a><a className="st-data-row" href="#states"><span>archive draft</span><span className="st-mono">03</span></a></div>
        </div>
      </section>
      <footer><a href="https://github.com/mauricekleine/mauricekleine.com/tree/main/packages/superthread">source and setup</a></footer>
    </div>
  </div></TooltipProvider>
}

