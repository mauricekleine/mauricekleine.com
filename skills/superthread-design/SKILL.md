---
name: superthread-design
description: The Superthread design system - the shared visual foundation for Maurice's fleet of surfaces (mauricekleine.com, orbit, quanta, hyperspeed, trisys, constellation, and every future ship). Use this whenever designing, building, restyling, or critiquing UI for any fleet surface, creating logos/insignia/icons/avatars for a ship or service, picking colors/fonts/motion for anything Maurice-branded, or bootstrapping a brand-new surface. Pairs with impeccable (method) and copywriting-maurice (words); this skill owns the brand facts. Not for fluncle (own brand) or client work (Waimakers etc.).
---

# superthread-design

Superthread is the thread that runs through every surface Maurice ships under his own
name. The name is the holding company's, repurposed: above the strings. One thread,
two papers: surfaces live either in the **void** (dark, night-sky: the website, orbit,
the hyperspeed board) or on **paper** (warm light, for long reading: quanta). The thread
itself never changes.

The mother dialect is mauricekleine.com's "Night Garden" (the site's own design and
product brief live in `apps/web/DESIGN.md` + `apps/web/PRODUCT.md` in the
mauricekleine.com repo); this skill is the canon for the whole fleet.

**Theme source and rules:** `packages/superthread/DESIGN.md` in the mauricekleine.com repo.
Read it for type, density, spacing, shape, accent, focus, motion and elevation.
`bun run registry` generates versioned `dist/superthread.css`: paper at `:root`, void at
`.dark`, with shadcn color roles, Tailwind font keys and radius. Keep scene colors
in each app's stylesheet. Install stock shadcn
Base UI components and import the generated CSS. Never copy theme values into
an app or edit a stock component to apply the brand.

Division of labor: **impeccable** owns design method (critique, hierarchy, polish
passes) — load it for any serious UI work. **copywriting-maurice** owns every word.
This skill owns the tokens, the moods, and the marks.

## The thread (invariant across modes)

- **One accent: ember.** The orange thread is the brand. Void: `--primary`
  `oklch(75% 0.13 55)`. Paper: `--primary` `oklch(55% 0.13 55)` (same hue,
  darkened for light ground). Nothing else gets accent duty; if a second accent
  feels needed, the hierarchy is wrong (impeccable will agree).
- **Fixed type roles.** Unbounded for display, Supreme for body, Fragment Mono for
  meta, labels, stamps, coordinates. No other face on void surfaces. (Paper-mode
  long-form body in Erode is the one sanctioned exception, below.)
- **Lowercase chrome headings.** Authored essays and chapters keep their casing.
- **Glyph grammar:** `✦` marks the living (active projects, section markers),
  `✧` the dormant (graveyard, archived). Sparkles are punctuation, not decoration:
  one per heading, not confetti.
- **Ships get marks; people get wordmarks.** Each fleet app has one
  single-stroke mark; Maurice himself is only ever the wordmark in
  Unbounded 800. See Marks below.
- **Space vocabulary,** used precisely: the fleet (all surfaces), the mothership
  (Soliton), ships (services), waypoints (projects), the graveyard (ended things),
  droids (coding agents), the fleet rail (the way between ships). Don't
  invent synonyms; a metaphor is a namespace.
- **Texture over flatness:** void surfaces carry film grain and (where the delight
  budget allows) the starfield. Paper surfaces are honest paper: no grain overlay,
  the warmth is in the color.
- **Motion is earned.** House rule: motion tied to moments, never page-load
  decoration. Every animation respects `prefers-reduced-motion`.

## Ship atmospheres (per-surface identity color)

Ember remains the ONLY interactive accent everywhere (links, actions, focus).
What varies per ship is the ATMOSPHERE: the color the room is lit with —
backgrounds, shader layers, glows, icon tinting. Ratified 2026-07-30 from the
texture lab:

| ship | atmosphere | tokens |
| --- | --- | --- |
| soliton | nebula violet | `oklch(45-62% 0.09-0.12 300)` family (`#7e5ab0` mid) |
| orbit | comet blue | `oklch(60% 0.10 260)` family (`#6b7fd4` mid) — the starfield's faint-blue star, promoted |
| quanta | warm paper daylight | paper mode as-is; no dark atmosphere |
| mauricekleine.com | ember-forward Night Garden | the classic; atmosphere IS the thread |
| hyperspeed | tachyon teal (ratified 2026-08-02) | `oklch(65% 0.10 200)` family (`#4aa5ad` mid) — faster than light, cooler than comet blue |

A ship's mark takes its atmosphere as its colour (see Marks).

## Void mode

Void uses `.dark`. The shadcn roles carry the brand: `background` is night,
`foreground` is starlight, `card` and `popover` are panel, `primary` is ember,
and `ring` is ember-bright. `accent` is a quiet ember tint for hover surfaces.
Stock shadcn components own their sizes, variants and focus behavior.

Starfields, grain and ship atmospheres belong to the surrounding brand surface,
not to shared component source.

## Paper mode (light surfaces: quanta, future reading surfaces)

Same roles, warm light values: paper `#fbfaf7` ground (never clinical white), near-black
ink `#0a0a0a` (never `#000`), and the thread darkened to ember-paper
`oklch(55% 0.13 55)` so it holds on a light ground. Paper is `:root` by default.

- Long-form body text on paper uses **Erode** (Fontshare) —
  the sanctioned reading serif, same foundry as Supreme, earned by
  read-in-bed legibility. Wordmarks and headings use Unbounded; meta stays
  Fragment Mono.
- Layout: one column, 66ch measure, 18px body, 1.65 line-height.
- Illustrations carry the hand-drawn energy; the
  typography stays disciplined. Feels like a well-typeset zine, not a SaaS app.
- Quiz/correct states and links use `--primary`; wrong/muted states stay in
  gray-ink territory. Same one-accent law as void.

## Type roles (both modes)

Ratified 2026-07-30 (texture-era refresh; supersedes the
Bricolage-era stack — migrate each surface on next touch, see Drift ledger):

- **Unbounded:** display for wordmarks, short headings and ship names. 800 on brand surfaces,
  600 in dense UI. Wide and rounded; the voice of the fleet.
  Self-hosted on mauricekleine.com.
- **Supreme** — body. 400 (500 for emphasis). Warm, round, legible; reports to
  Unbounded without competing.
  Self-hosted on mauricekleine.com.
- **Fragment Mono:** meta, labels, stamps, coordinates (unchanged). On
  instruments: 12px, uppercase, `letter-spacing: 0.14em`, `--muted-foreground`.
  Self-hosted on mauricekleine.com. Mono is seasoning: small doses, never paragraphs.
- Display sizing follows `DESIGN.md`; use tight letter-spacing (-0.02em) and
  `text-wrap: balance`.
- Paper-mode long-form body: **Erode** (Fontshare, 400/500) — the ITF reading serif completing the family. The quanta exception, now with a name.
- Bricolage Grotesque is RETIRED from new work; it survives only on surfaces
  not yet migrated (listed in the Drift ledger).

## Motion

- `cubic-bezier(0.16, 1, 0.3, 1)` — ambient/brand surfaces
  (rises, reveals, celestial events).
- `cubic-bezier(0.22, 1, 0.36, 1)` for app-authored instruments;
  use the 120/180/240ms limits in `DESIGN.md`.
- One hero entrance maximum; no scroll-gated reveal choreography.
- Delight moments (supernovas, eclipses, meteor wishes) belong to brand
  surfaces and are always interruptible, rare, and reduced-motion-safe.

## Marks

One simple mark per fleet app, all drawn on the same 32px grid with the same
2.8 stroke and round caps. Each is one gesture in one mid-tone that clears 3:1
on both paper and void: the app's atmosphere where it has one, ember otherwise.
Keep them this simple: a mark must read at 16px in the rail.

The SVGs, with 32px and 180px PNGs for favicons and touch icons, live in
`apps/web/public/superthread/marks/` of the mauricekleine.com repo and are served
from `https://www.mauricekleine.com/superthread/marks/<app>.svg`. The fleet rail
and every app's favicon point there; `preview.html` beside them shows the set.

| app | mark |
| --- | --- |
| orbit | a ring with its moon |
| quanta | a quantised step |
| hyperspeed | chevrons |
| trisys | three stacked systems, the widest at the base (always three parts) |
| constellation | linked points |
| soliton | a solitary wave |

mauricekleine.com uses Maurice's portrait, and nonobench.com and fluncle.com keep
their own brand icons.

## Per-surface flavor sheets

- **mauricekleine.com** — the mother dialect at full delight budget:
  starfield + nebula shader + grain, constellations, easter eggs, no cards, no
  logo (wordmark only). Its `apps/web/DESIGN.md`/`PRODUCT.md` remain authoritative
  for site-specific components; this skill governs where they'd conflict.
- **orbit** — instrument panel. Dense, px-scale, panel/line surfaces, mono
  labels, swift easing, static grain, zero easter eggs: it's for working. Its
  violet due states use orbit-specific atmosphere outside the shared theme.
- **quanta** — paper zine. Reading serif body, ink illustrations, ember-paper
  accents, no grain, no starfield. The hand-drawn art IS its texture.

## Drift ledger (fix on next touch, don't crusade)

As of 2026-09-26:

- Type: every fleet app takes its faces from the superthread theme; nonobench
  is mid-migration.
- quanta: move the accent `#C0392B`-family to ember-paper (same hue as the fleet
  thread).
- Every surface: replace hand-copied component values with the generated
  `dist/superthread.css` from `packages/superthread` and stock shadcn components.
