# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Maurice, every day.** He runs his own fleet of apps on his laptop and phone: the hyperspeed board (his agents' work), orbit (tasks and direction), quanta (learning chapters), trisys (essays and decks), constellation, the artifacts library, and www. Many tabs stay open at once, in light and dark browser chrome, so each app must be findable from its tab icon alone.
- **Agents building for him.** Coding agents create and change these apps. They install superthread from the registry and load the `superthread-design` skill; the system has to make the right result the default for them.
- **Visitors to the public surfaces.** People reading www, the superthread page, a public app or a shared artifact. They see the identity without knowing the fleet behind it.

## Product Purpose

Superthread is the identity and component foundation for every surface Maurice ships under his own name. It provides the tokens, the type, a mark for each app, branded shadcn components and the fleet rail, installable into any app with one shadcn command from the `@mk` registry. Success: the fleet reads as one family, each app is recognisable at 16px in a browser tab, a new app starts fully branded, and Maurice would show the specimen to a designer he respects.

## Positioning

A single operator's fleet identity that agents build and maintain. Values live in one source, are generated and versioned, install with one command and are checked for drift in each app's CI. A generic shadcn theme gives colours; superthread also carries the marks, the rail, the component craft and the agent skill.

## Operating Context

- Surfaces span three kinds of use: working tools (board, orbit, constellation, the artifacts library), reading (quanta chapters, essays, artifact reports and their PDF renders) and public pages (www, the superthread page).
- Private apps run on Maurice's own server behind his tailnet; public ones run on Cloudflare Workers. Published artifacts load in an opaque-origin sandbox, and PDFs render from local files.
- Each app takes the theme from the registry. superthread.mauricekleine.com is the design system's own site: an overview of the foundations and every component, with a few mock pages composed from them, in the manner of atlassian.design but sized for one person's fleet. It renders every registry item from the files the registry serves, and it is where a new visual world proves itself first.

## Capabilities and Constraints

- shadcn on Base UI with Tailwind v4; apps are TanStack Start apps. One registry, `@mk`, with one version for all its items.
- Components are branded skins: every primitive keeps shadcn's API, and the craft lives in its classes and behaviour. Apps rebrand with no call-site edits.
- Fonts load one way on every surface: public sites, tailnet apps, artifacts, PDFs and any app that installs `@mk`. Every face must be licensed for that delivery.
- Marks must read at 16px on light and dark browser chrome and in the rail.
- Undecided: the whole visual world (colour, modes, type roles, marks, texture, motion), chosen in the direction round.

## Brand Commitments

- The name **superthread** is fixed.
- The faces stay the same as today's (Unbounded, Supreme, Erode, Fragment Mono) or close to them.
- Words follow Maurice's voice: lowercase, understated, no em dashes.
- Consistency is paramount: one system applied the same way everywhere, with no per-surface exceptions. Today's exceptions (a reading face only on paper, orbit's own variants, per-surface delight budgets) do not carry over.

## Anti-references

- Generic shadcn or SaaS: a well-made shadcn app with a colour swapped in.
- The AI-tool ivory: warm cream ground, serif display, terracotta accent.
- Neon dev-tool dark: near-black with one glowing accent, terminal costume.
- Atmosphere on working screens: stars, grain and glow where the job is getting things done.

## Evidence on Hand

- The current system: `DESIGN.md` beside this file, the generated `dist/superthread.css`, the marks in `apps/web/public/superthread/marks/` and the `/superthread` specimen in `apps/web`.
- The fleet manifest in `apps/web/src/projects.ts`.
- Screenshot, accessibility and route baselines of every app (kept outside the repo; they show private data).
- No customers, testimonials or usage numbers exist; nothing may claim them.

## Product Principles

1. **One system, no carve-outs.** Ships differ only through the system's own parameters, such as a ship's mark, never through local exceptions.
2. **Recognisable at 16px.** Every ship is identifiable from its tab icon, and the fleet still reads as one family.
3. **One source, generated.** Values live in one place and reach apps through the registry; no app copies them by hand.
4. **Craft lives in the components.** Quality comes from what every app gets for free, not from per-app polish.
5. **Agents are first-class builders.** The registry, the template and the skill make the right result the default.

## Accessibility & Inclusion

WCAG 2.2 AA contrast in every mode, visible keyboard focus, full keyboard operation, and reduced motion respected everywhere.
