---
name: superthread-design
description: The Superthread design system - the shared visual foundation for Maurice's fleet of surfaces (mauricekleine.com, orbit, quanta, the soliton launchpad, and every future ship). Use this whenever designing, building, restyling, or critiquing UI for any fleet surface, creating logos/insignia/icons/avatars for a ship or service, picking colors/fonts/motion for anything Maurice-branded, or bootstrapping a brand-new surface. Pairs with impeccable (method) and copywriting-maurice (words); this skill owns the brand facts. Not for fluncle (own brand) or client work (Waimakers etc.).
---

# superthread-design

Superthread is the thread that runs through every surface Maurice ships under his own
name. The name is the holding company's, repurposed: above the strings. One thread,
two papers: surfaces live either in the **void** (dark, night-sky: the website, orbit,
the launchpad) or on **paper** (warm light, for long reading: quanta). The thread
itself never changes.

The mother dialect is mauricekleine.com's "Night Garden" (the site's own design and
product brief live in `apps/web/DESIGN.md` + `apps/web/PRODUCT.md` in the
mauricekleine.com repo); this skill is the canon for the whole fleet.

**Theme source:** `packages/superthread/DESIGN.md` in the mauricekleine.com repo.
`bun run registry` generates `dist/superthread.css`: paper at `:root`, void at
`.dark`, with shadcn color roles and Tailwind font keys. Install stock shadcn
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
- **Fixed type roles.** Panchang for display, Supreme for body, Fragment Mono for
  meta, labels, stamps, coordinates. No other face on void surfaces. (Paper-mode
  long-form body in Erode is the one sanctioned exception, below.)
- **Lowercase headings.** Everywhere. It's the voice in type form.
- **Glyph grammar:** `✦` marks the living (active projects, section markers),
  `✧` the dormant (graveyard, archived). Sparkles are punctuation, not decoration:
  one per heading, not confetti.
- **Ships get ink marks; people get wordmarks.** Hand-drawn insignia for services
  (soliton, quanta, orbit); Maurice himself is only ever the wordmark in
  Panchang 800. Full pipeline below.
- **Space vocabulary,** used precisely: the fleet (all surfaces), the mothership
  (Soliton), ships (services), waypoints (projects), the graveyard (ended things),
  droids (coding agents), the bridge/launchpad (the future front door). Don't
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

Icon renderings take the ship's atmosphere as tint (see insignia pipeline).

## Void mode

Void uses `.dark`. The shadcn roles carry the brand: `background` is night,
`foreground` is starlight, `card` and `popover` are panel, `primary` is ember,
and `ring` is ember-bright. `accent` is a quiet ember tint for hover surfaces.
Stock shadcn components own their sizes, variants and focus behavior.

Starfields, grain and ship atmospheres belong to the surrounding brand surface,
not to shared component source.

## Paper mode (light surfaces: quanta, future reading surfaces)

Same roles, warm light values: paper `#fbfaf7` ground (never clinical white), near-black
ink `#1a1a1a` (never `#000`), and the thread darkened to ember-paper
`oklch(55% 0.13 55)` so it holds on a light ground. Paper is `:root` by default.

- Long-form body text on paper uses **Erode** (Fontshare) —
  the sanctioned reading serif, same foundry as Panchang/Supreme, earned by
  read-in-bed legibility. Wordmarks and headings use Panchang; meta stays
  Fragment Mono.
- Layout: one column, 40-42rem measure, ≥18px body, generous line-height (~1.65).
- Illustrations carry the hand-drawn energy (see insignia/art pipeline); the
  typography stays disciplined. Feels like a well-typeset zine, not a SaaS app.
- Quiz/correct states and links use `--primary`; wrong/muted states stay in
  gray-ink territory. Same one-accent law as void.

## Type roles (both modes)

Ratified 2026-07-30 in the bridge font lab (texture-era refresh; supersedes the
Bricolage-era stack — migrate each surface on next touch, see Drift ledger):

- **Panchang** — display: wordmarks, h1/h2, ship names. 800 on brand surfaces,
  600 in dense UI. Squared, techy, in-your-face; the voice of the fleet.
  Self-hosted on mauricekleine.com.
- **Supreme** — body. 400 (500 for emphasis). Warm, round, legible; reports to
  Panchang without competing.
  Self-hosted on mauricekleine.com.
- **Fragment Mono** — meta, labels, stamps, coordinates (unchanged). On
  instruments: 11px, uppercase, `letter-spacing: 0.14em`, `--muted-foreground`.
  Self-hosted on mauricekleine.com. Mono is seasoning: small doses, never paragraphs.
- Display sizing: `clamp()` fluid, tight letter-spacing (-0.02em),
  `text-wrap: balance`. Body ≥17px, line-height ~1.65-1.7.
- Paper-mode long-form body: **Erode** (Fontshare, 400/500) — the ITF reading serif completing the family. The quanta exception, now with a name.
- Bricolage Grotesque is RETIRED from new work; it survives only on surfaces
  not yet migrated (listed in the Drift ledger).

## Motion

- `cubic-bezier(0.16, 1, 0.3, 1)` — ambient/brand surfaces
  (rises, reveals, celestial events).
- `cubic-bezier(0.22, 1, 0.36, 1)` — instruments (cards, toasts,
  dialogs), durations 0.12-0.34s.
- One hero entrance maximum; no scroll-gated reveal choreography.
- Delight moments (supernovas, eclipses, meteor wishes) belong to brand
  surfaces and are always interruptible, rare, and reduced-motion-safe.

## Insignia pipeline (ships get marks)

The look: one concept-glyph per ship, hand-drawn wobbly ink, xkcd lineage.

**Void marks are generated, not prompted** (ratified 2026-08-09). They come
from the fleet's insignia generator (a private package in the platform repo), where each mark is a list
of strokes (a centreline, a width profile, a colour) drawn by one shared kit.
An image model cannot hold four marks to the same stroke weight, the same
wobble, or the same framing; a shared constant can. Do not re-prompt a void
mark, change the constant and rebuild.

- **Void ink**: each ship's SVG in the insignia generator is the source of truth;
  the build rasterises PNGs to every consumer (copies of the current marks live in
  `assets/` here). Rasterising is headless
  **Chrome**, not ImageMagick — magick's SVG renderer silently drops gradient
  references and filter primitives, so the grain and the sky vanish without
  erroring.
- **Paper ink**: still the image model: black ink on warm paper, with the house
  STYLE prefix baked into the generator; describe only the scene. The model key is
  authoring-time only: never on a server, never in a repo.

**A mark's accent is its ship's atmosphere, never ember.** Ember is the
interactive accent — links, focus, primary actions — and using it on a mark
makes every ship look like quanta. The generator enforces this and a test
fails if a mark wears another ship's colour.

The family is four different gestures in one hand, so each stays distinct
while the drawing is identical: a radial burst, a tilted sweep, a rising hump,
concentric rings. What makes them a set lives in the `FAMILY` block:

| dial | value | what it controls |
| --- | --- | --- |
| `weight` | 11 | widest a stroke gets, in tile pixels — the one thickness dial |
| `hand` | 3.4 | how far a stroke may drift from its ideal path |
| `fill` | 0.86 | fraction of the tile the drawing spans |
| `accentShare` | 1/3 | share of strokes carrying the ship colour |
| `grain` / `grainBlend` / `grainScale` | 0.35 / color-dodge / 0.5 | film grain (see below) |
| `wash` | 0.18 | how much of its own atmosphere lights a mark's ground |

Composition targets, measured off the marks that worked rather than guessed —
the generator hits all of them by construction, and `marks.test.ts` asserts
containment over every point:

| property | target | why |
| --- | --- | --- |
| edge-touching pixels | **0** | a mark that bleeds off the tile loses its silhouette under iOS rounding |
| ink coverage | 11-17% of the tile | below ~10% the mark looks lost when pinned; above ~20% it turns to mush at 32px |
| drawing bbox | 80-87% of the tile | the breathing room that reads as "designed" |
| gestures | exactly one | two elements plus a glow is the busy-icon failure |

**Grain on a mark is not the page recipe.** `overlay` below 50% luminance
resolves to `2 x backdrop x source`, so on a near-black ground the canon
0.045-0.05/overlay pairing is close to a no-op. Icons use their own trio
(`color-dodge`, 0.35, baseFrequency 0.5) — and note the blend lifts the
strokes too, so measured accents run ~10-15% brighter than the atmosphere
hexes. Coarse noise is what survives the shrink; fine noise averages away the
moment a 512 tile is drawn at 54.

Registry (update when a mark ships):

| ship | gesture | meaning | renderings |
| --- | --- | --- | --- |
| quanta | concentric rings, one stroke aimed at the centre | one excitation, localized: "you are here" | paper (quanta repo, app icon — still hand-generated) + void (`assets/quanta-mark-void.png`) |
| soliton | every stroke lifting through one bell hump | the solitary wave that travels without losing its shape | void (`assets/soliton-mark.png`) |
| orbit | tilted elliptical sweep around a dense focus | a long exposure of one orbit: tasks circling the work | void (`assets/orbit-mark.png`; orbit favicon + apple-touch) |
| hyperspeed | radial burst from an off-centre vanishing point | star streaks at the instant of the jump: work dispatched at speed | void (`assets/hyperspeed-mark.png`; hyperspeed repo `assets/`) |

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
- **the launchpad/bridge** (future) — void mode at high delight: the fleet's
  front door. Starfield yes; each ship listed with its ink mark (void
  rendering) + a Fragment Mono status line. Design it with impeccable when
  phase 3 opens.

## Drift ledger (fix on next touch, don't crusade)

As of 2026-09-26:

- Type: mauricekleine.com, hyperspeed, orbit and quanta are on Panchang +
  Supreme. trisys is still on Bricolage + Literata; nonobench is mid-migration
  from IBM Plex + Inter.
- quanta: move the accent `#C0392B`-family to ember-paper (same hue as the fleet
  thread).
- Every surface: replace hand-copied component values with the generated
  `dist/superthread.css` from `packages/superthread` and stock shadcn components.
