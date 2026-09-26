import { createFileRoute } from '@tanstack/react-router'
import { superthreadHead } from '../seo'
import { colorModes, scales } from '../superthread-data'
import { Button } from '../../../../packages/superthread/registry/ui/button'
import { Input } from '../../../../packages/superthread/registry/ui/input'
import { Card, CardTitle, CardDescription } from '../../../../packages/superthread/registry/ui/card'
import { Badge } from '../../../../packages/superthread/registry/ui/badge'
import { Chip } from '../../../../packages/superthread/registry/ui/chip'
import { Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogDescription, DialogClose } from '../../../../packages/superthread/registry/ui/dialog'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipPortal, TooltipPositioner, TooltipPopup } from '../../../../packages/superthread/registry/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../packages/superthread/registry/ui/tabs'
import { AppSwitcher } from '../../../../packages/superthread/registry/ui/app-switcher'

export const Route = createFileRoute('/superthread')({ head: superthreadHead, component: SuperthreadPage })

const marks = [
  ['soliton', '/superthread/soliton-mark.png'],
  ['orbit', '/superthread/orbit-mark.png'],
  ['quanta', '/superthread/quanta-mark-void.png'],
  ['hyperspeed', '/superthread/hyperspeed-mark.png'],
] as const

function Colors() {
  return <div className="st-mode-grid">{colorModes.map(({ mode, colors }) => <div key={mode} className="st-mode" data-mode={mode === 'paper' ? 'paper' : undefined}>
    <h3>{mode}</h3>
    <div className="st-swatch-list">{colors.map((color) => <div className="st-swatch" key={color.role}>
      <span className="st-swatch-color" style={{ background: `var(--${color.role})` }} aria-hidden="true" />
      <span><span className="st-swatch-role">{color.role}</span>{color.proposed && <span className="st-proposed st-meta">proposed</span>}<span className="st-swatch-name" style={{ display: 'block' }}>{color.name}</span></span>
      <span className="st-swatch-value">{color.value}<br />{color.contrast}:1 vs ground</span>
    </div>)}</div>
  </div>)}</div>
}

function Gallery({ mode }: { mode: 'void' | 'paper' }) {
  return <div className="st-mode" data-mode={mode === 'paper' ? 'paper' : undefined}>
    <h3>{mode}</h3>
    <div className="st-gallery-row"><span className="st-gallery-label">buttons</span>
      <Button>continue</Button><Button variant="secondary">secondary</Button><Button variant="ghost">quiet</Button><Button variant="danger">remove</Button><Button size="compact">compact</Button><Button size="icon" aria-label="add">+</Button><Button disabled>disabled</Button>
    </div>
    <div className="st-gallery-row"><span className="st-gallery-label">input</span><label className="w-full max-w-72 text-sm text-ink-muted">ship name<Input placeholder="name a ship" aria-label="ship name" /></label></div>
    <div className="st-gallery-row"><span className="st-gallery-label">state + data</span><Badge>idle</Badge><Badge state="attention">needs attention</Badge><Badge state="danger">exceeded</Badge><Chip>fleet/004</Chip></div>
    <div className="st-gallery-row"><span className="st-gallery-label">instrument card</span><Card className="w-full max-w-72"><CardTitle>one small thing</CardTitle><CardDescription>an instrument surface for work in motion.</CardDescription><div className="mt-md"><Badge state="attention">in progress</Badge></div></Card></div>
    <div className="st-gallery-row"><span className="st-gallery-label">tabs</span><Tabs defaultValue="live" className="w-full max-w-72"><TabsList><TabsTrigger value="live">living</TabsTrigger><TabsTrigger value="dormant">dormant</TabsTrigger></TabsList><TabsContent value="live">✦ work that is still moving.</TabsContent><TabsContent value="dormant">✧ experiments at rest.</TabsContent></Tabs></div>
    <div className="st-gallery-row"><span className="st-gallery-label">overlays + fleet</span>
      <Dialog><DialogTrigger className="rounded-sm border border-line-strong bg-surface px-md py-sm text-ink">open dialog</DialogTrigger><DialogPortal><DialogBackdrop /><DialogPopup><DialogTitle>one focused thing</DialogTitle><DialogDescription>a short decision belongs here. the next action stays clear.</DialogDescription><div className="mt-xl"><DialogClose className="rounded-sm bg-thread px-lg py-sm font-semibold text-thread-ink">close</DialogClose></div></DialogPopup></DialogPortal></Dialog>
      <TooltipProvider><Tooltip><TooltipTrigger aria-label="about the thread" className="rounded-sm border border-line-strong bg-surface px-md py-sm text-ink">hover for a note</TooltipTrigger><TooltipPortal><TooltipPositioner sideOffset={8}><TooltipPopup>one accent for the one thing to act on.</TooltipPopup></TooltipPositioner></TooltipPortal></Tooltip></TooltipProvider>
      <AppSwitcher />
    </div>
  </div>
}

function SuperthreadPage() {
  return <div className="st-specimen">
    <div className="st-shell">
      <header className="st-hero">
        <p className="st-meta">maurice kleine / design system / alpha</p>
        <h1 className="st-title">superthread</h1>
        <p className="st-lede">one thread through the things i build. the same type, tokens, marks, and small interface parts travel between ships. some live in the void; some read better on paper.</p>
      </header>

      <section className="st-section" aria-labelledby="colors"><div className="st-section-head"><h2 id="colors">✦ colors</h2><p className="st-note">role names stay fixed as the ground changes. ratios compare each swatch with its mode's ground.</p></div><Colors /></section>

      <section className="st-section" aria-labelledby="type"><div className="st-section-head"><h2 id="type">✦ type</h2><p className="st-note">panchang speaks first. supreme does the reading. fragment mono keeps the coordinates.</p></div>
        <div className="st-scale">{Object.entries(scales.typography).map(([name, value]) => <div className="st-type-row" key={name}><span className="st-meta">{name}<br />{value.fontFamily} / {value.fontSize}</span><span style={{ fontFamily: `var(--font-${name})`, fontSize: `var(--text-${name})`, fontWeight: value.fontWeight, lineHeight: value.lineHeight, letterSpacing: 'letterSpacing' in value ? value.letterSpacing : undefined }}>small internet things keep moving.</span></div>)}</div>
      </section>

      <section className="st-section" aria-labelledby="measure"><div className="st-section-head"><h2 id="measure">✦ measure</h2><p className="st-note">a small scale for dense work, with room for reading.</p></div>
        <p className="st-meta" style={{ marginBottom: 16 }}>spacing</p><div className="st-token-row">{Object.entries(scales.spacing).filter(([name]) => name !== 'measure').map(([name, value]) => <div className="st-token" key={name}><b style={{ width: `var(--space-${name})`, height: 12 }} />{name} · {value}</div>)}</div><p className="st-note" style={{ marginTop: 18 }}>reading measure: {scales.spacing.measure}</p>
        <p className="st-meta" style={{ margin: '32px 0 16px' }}>radius</p><div className="st-token-row">{Object.entries(scales.rounded).map(([name, value]) => <div className="st-token" key={name}><b style={{ width: 32, height: 24, borderRadius: `var(--radius-${name})` }} />{name} · {value}</div>)}</div>
      </section>

      <section className="st-section" aria-labelledby="motion"><div className="st-section-head"><h2 id="motion">✦ motion</h2><p className="st-note">hover or focus the tracks. reduced motion keeps them still.</p></div><div className="st-motion"><div className="st-motion-track" data-ease="drift" tabIndex={0}><span className="st-meta">ease-drift / ambient</span><div className="st-motion-dot" /></div><div className="st-motion-track" data-ease="snap" tabIndex={0}><span className="st-meta">ease-snap / instruments</span><div className="st-motion-dot" /></div></div></section>

      <section className="st-section" aria-labelledby="components"><div className="st-section-head"><h2 id="components">✦ components</h2><p className="st-note">small working parts. try focus, hover, tabs, and the fleet menu.</p></div><div className="st-gallery"><Gallery mode="void" /><Gallery mode="paper" /></div></section>

      <section className="st-section" aria-labelledby="marks"><div className="st-section-head"><h2 id="marks">✦ ship marks</h2><p className="st-note">ships get ink marks. maurice gets a wordmark.</p></div><div className="st-marks">{marks.map(([name, src]) => <figure className="st-mark" key={name}><img src={src} alt={`${name} ship mark`} loading="lazy" /><figcaption>{name}</figcaption></figure>)}</div><p className="st-note" style={{ marginTop: 36 }}>✦ living projects. ✧ dormant ones. one glyph per heading, never confetti.</p></section>

      <section className="st-section" aria-labelledby="use"><div className="st-section-head"><h2 id="use">✦ use it</h2><p className="st-note">install the foundation, then take the parts you need. import the installed stylesheet once in your app.</p></div><code className="st-code">npx shadcn@latest add https://www.mauricekleine.com/r/superthread.json<br />npx shadcn@latest add https://www.mauricekleine.com/r/button.json</code><p className="st-note" style={{ marginTop: 20 }}>the registry serves button, input, card, badge, chip, dialog, tooltip, tabs, and app-switcher. <a href="https://github.com/mauricekleine/mauricekleine.com/tree/main/packages/superthread">source and setup notes</a>.</p></section>
      <footer className="st-meta" style={{ padding: '32px 0 64px' }}>superthread / alpha · <a href="/">mauricekleine.com</a></footer>
    </div>
  </div>
}
