# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Maurice, every day.** He runs his own fleet of apps on his laptop and phone: orbit (tasks, direction and the board of his agents' work), quanta (learning chapters), trisys (essays and decks), constellation, the artifacts library, soliton (the server they run on) and www. Many tabs stay open at once, in light and dark browser chrome, so each app must be findable from its tab icon alone.
- **Agents building for him.** Coding agents create and change these apps. They install superthread from the registry and load the `superthread-design` skill; the system has to make the right result the default for them.
- **Visitors to the public surfaces.** People reading www, superthread.mauricekleine.com, a public app or a shared artifact. They see the identity without knowing the fleet behind it.

## Product Purpose

Superthread is the identity and component foundation for every surface Maurice ships under his own name. It provides the tokens, the type, a mark for each ship, branded shadcn components and the fleet rail, installable into any app with one shadcn command from the `@mk` registry. Success: the fleet reads as one family, each app is recognisable at 16px in a browser tab, a new app starts fully branded, and Maurice would show the site to a designer he respects.

## Positioning

A single operator's fleet identity that agents build and maintain. Values live in one source, are generated and versioned, and install with one command; every installed file names its item and version. A generic shadcn theme gives colours; superthread also carries the marks, the rail, the component craft and the agent skill.

## Operating Context

- Surfaces span three kinds of use: working tools (orbit and its board, constellation, the artifacts library), reading (quanta chapters, essays, artifact reports and their PDF renders) and public pages (www, superthread.mauricekleine.com).
- Private apps run on Maurice's own server, reachable only on his private network; public ones run on Cloudflare Workers. Published artifacts load in an opaque-origin sandbox, and PDFs render from local files.
- Each app takes the theme from the registry. superthread.mauricekleine.com is the design system's own site: the foundations, a page for every item with its install line, three mock app pages composed only from the items, and the install guide. It renders every registry item from the files the registry serves, serves the registry itself, and is where a change to the visual world proves itself first.

## Capabilities and Constraints

- shadcn on Base UI with Tailwind v4; apps are TanStack Start apps. One registry, `@mk`, with one version for all its items.
- Components are branded skins: every primitive keeps shadcn's API, and the craft lives in its classes and behaviour. Apps rebrand with no call-site edits.
- The visual world lives in `tokens/master.json`, vendored from the master world, and `DESIGN.md` documents it: key ink on white stock; one plum fill per viewport, on paper only, in the deep value; five statuses at badge scale with a glyph and a word; one bright spot per ship in its mark and chart series; four faces with one job each; square corners and 1 px edges; and 1-bit screens in five places plus one small detail per component.
- Fonts load from one host. Unbounded and Fragment Mono load on any origin; Supreme and Erode load only on Maurice's own origins and localhost, and other origins print those two in system fonts. Every face is licensed for the way it is delivered.
- Marks read at 16px on light and dark browser chrome and in the rail.

## Brand Commitments

- The name **superthread** is fixed.
- The faces are Unbounded, Supreme, Erode and Fragment Mono.
- The register is quiet and exact. A working page is for operating and a reading page is for reading; neither performs. Flat where you read, screened where you look.
- Words follow Maurice's voice: lowercase, understated, no em dashes.
- Consistency is paramount: one system, applied the same way on every surface, with no per-surface exceptions.

## Anti-references

- Generic shadcn or SaaS: a well-made shadcn app with a colour swapped in.
- The AI-tool ivory: warm cream ground, serif display, terracotta accent.
- Neon dev-tool dark: near-black with one glowing accent, terminal costume.
- Atmosphere on working screens: stars, grain and glow where the job is getting things done.

## Evidence on Hand

- The system: `tokens/master.json` and `DESIGN.md` beside this file, the generated `dist/v2/`, the items in `items/`, and the site in `apps/superthread/`, with the marks in `apps/superthread/public/marks/`.
- the frozen v1 CSS at `dist/superthread.css`, for installs that still carry it.
- The fleet manifest in `apps/web/src/projects.ts`.
- Screenshot, accessibility and route baselines of every app (kept outside the repo; they show private data).
- No customers, testimonials or usage numbers exist; nothing may claim them.

## Product Principles

1. **One system, no carve-outs.** What helps one ship's UI goes into Superthread for every ship. Ships differ only through the system's own parameters, such as a ship's mark, never through local exceptions: a ship owns its data, routes and composition, and anything that changes how an item looks (colour, type, border, case) changes Superthread.
2. **Recognisable at 16px.** Every ship is identifiable from its tab icon, and the fleet still reads as one family.
3. **One source, generated.** Values live in one place and reach apps through the registry; no app copies them by hand.
4. **Craft lives in the components.** Quality comes from what every app gets for free, not from per-app polish.
5. **Agents are first-class builders.** The registry, the site and the skill make the right result the default.

## Accessibility & Inclusion

WCAG 2.2 AA contrast in every mode, visible keyboard focus, full keyboard operation, and reduced motion respected everywhere. A state never rests on colour alone: each status carries its glyph and its word.
