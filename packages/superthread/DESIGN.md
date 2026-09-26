---
version: alpha
name: superthread
description: maurice kleine's design system. one thread (ember) through every surface, two modes (void and paper).
colors:
  primary: "oklch(75% 0.13 55)" # ember, same as void-thread. the one accent agents should reach for
  # void: the night sky. default mode for the site, instruments and the launchpad
  void-ground: "oklch(17% 0.035 275)" # night. page background, never pure black
  void-ground-deep: "oklch(13% 0.03 280)" # night-deep. gradient floor, html background
  void-surface: "oklch(20% 0.035 278)" # panel. instrument surfaces: cards, inputs
  void-line: "oklch(30% 0.03 278)" # hairline borders
  void-line-strong: "oklch(40% 0.03 278)" # chip and hairline borders that must clear 3:1
  void-ink: "oklch(94% 0.01 85)" # starlight. primary text, warm, not white
  void-ink-muted: "oklch(76% 0.02 275)" # muted. secondary text
  void-ink-dim: "oklch(66% 0.015 275)" # dim. meta and labels on prose surfaces
  void-ink-dim-ui: "oklch(64% 0.02 275)" # dim-ui. meta on dense instruments (AA at 10-11px)
  void-thread: "oklch(75% 0.13 55)" # ember. links, accents, primary actions
  void-thread-bright: "oklch(84% 0.12 65)" # ember-bright. hover, glints, focus
  void-thread-ink: "oklch(13% 0.03 280)" # text on an ember fill (night-deep)
  void-thread-soft: "oklch(75% 0.13 55 / 0.13)" # ember tint for pill and badge backgrounds (canon: ~0.13 alpha)
  void-atmosphere-wash: "oklch(45% 0.09 300)" # nebula-wash. backgrounds only, low alpha
  void-atmosphere: "oklch(62% 0.12 300)" # nebula-bright. violet as a foreground accent
  void-danger: "oklch(64% 0.19 25)" # overdue. urgency and errors
  void-danger-soft: "oklch(64% 0.19 25 / 0.13)" # danger tint for pill backgrounds (canon: ~0.13 alpha)
  # paper: warm light for long reading (quanta and future reading surfaces)
  paper-ground: "#fbfaf7" # paper. warm, never clinical white
  paper-ground-deep: "#fbfaf7" # same as ground: paper has no gradient floor, so gradients stay flat
  paper-surface: "#f4f2ed" # PROPOSED 2026-09-26, not yet ratified: raised surfaces on paper
  paper-line: "#d9d5cc" # rule (from quanta)
  paper-line-strong: "#bdb7aa" # PROPOSED 2026-09-26, not yet ratified: chip borders that must clear 3:1
  paper-ink: "#1a1a1a" # ink. near-black, never #000
  paper-ink-muted: "#55524c" # ink-muted (quanta ink-soft)
  paper-ink-dim: "#6f6a62" # PROPOSED 2026-09-26, not yet ratified: meta and labels on paper
  paper-ink-dim-ui: "#6f6a62" # PROPOSED 2026-09-26, not yet ratified: same as ink-dim until paper gets dense instruments
  paper-thread: "oklch(55% 0.13 55)" # ember-paper. the thread, darkened for a light ground
  paper-thread-bright: "oklch(48% 0.14 52)" # PROPOSED 2026-09-26, not yet ratified: hover and focus on paper (darker, not lighter)
  paper-thread-soft: "oklch(94% 0.035 60)" # accent-soft (from quanta). tinted backgrounds
  paper-thread-ink: "#fbfaf7" # text on an ember fill
  paper-danger: "#8e7a76" # wrong (from quanta). muted, stays in gray-ink territory
  paper-danger-soft: "#efe9e7" # wrong-soft (from quanta)
  # ship atmospheres: which color lights the room. never on primary actions
  atmosphere-soliton: "oklch(55% 0.11 300)" # nebula violet
  atmosphere-orbit: "oklch(60% 0.10 260)" # comet blue
  atmosphere-hyperspeed: "oklch(65% 0.10 200)" # tachyon teal
typography:
  display-xl:
    fontFamily: Panchang
    fontSize: 2.9rem # fluid: the generator emits clamp(1.85rem, 4.5vw + 0.85rem, 2.9rem)
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: Panchang
    fontSize: 1.2rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  display-ui:
    fontFamily: Panchang
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: Supreme
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.65
  body-strong:
    fontFamily: Supreme
    fontSize: 1.0625rem
    fontWeight: 500
    lineHeight: 1.65
  reading:
    fontFamily: Erode
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
  meta:
    fontFamily: Fragment Mono
    fontSize: 0.8rem
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: Fragment Mono
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.14em"
rounded:
  xs: 6px # data chips, ship marks
  sm: 8px # cards
  md: 12px # dialogs, the top of the instrument scale
  pill: 20px # state pills
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
  measure: 42rem # paper reading column
components:
  button-primary:
    backgroundColor: "{colors.void-thread}"
    textColor: "{colors.void-thread-ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
  button-primary-hover:
    backgroundColor: "{colors.void-thread-bright}"
  card:
    backgroundColor: "{colors.void-surface}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  chip:
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
  pill:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
---

# superthread

## Overview

One thread, two modes. Every surface maurice ships under his own name wears superthread: the site, nonobench, and the fleet's own apps (orbit, quanta, trisys, hyperspeed). Products with their own audience (mockly, fluncle) keep their own brands.

**Void** is the night sky: dark, textured, a starfield where the delight budget allows. It is the default. **Paper** is warm light for long reading: honest paper, no grain, a disciplined serif. The thread through both is **ember**, the single accent.

Tokens are named by role and prefixed by mode (`void-*`, `paper-*`). Generated CSS maps both onto the same mode-agnostic variables, so a component never knows which mode it is in. Void is `:root`; paper applies under `[data-mode="paper"]`.

The canonical rules and reasoning live in the `superthread-design` skill. This file is the machine-readable token source: CSS variables and the Tailwind theme are generated from it. Never hand-edit generated output.

## Colors

- **Ground, surface, line** build the room. Nothing sits on pure black or pure white. Void backgrounds may gradient `void-ground` to `void-ground-deep`.
- **Ink** has three steps: ink for primary text, muted for secondary, dim for meta. `ink-dim-ui` is the instrument variant that stays AA at 10 to 11px.
- **Thread (ember)** is the only accent: links, primary actions, focus. If a second accent feels needed, the hierarchy is wrong.
- **Atmosphere** is per ship and only lights the room: lane counts, ambient glow, micro-meters. Never primary actions, never alerts.
- **Danger** in void is a true red for urgency. On paper it stays muted, in gray-ink territory.
- Five paper colors are marked PROPOSED: they fill gaps in canon and need ratifying on the specimen page before any app relies on them.

## Typography

- **Panchang**: display. Wordmarks, h1 and h2, ship names. 800 on brand surfaces, 600 in dense UI. Lowercase headings everywhere.
- **Supreme**: body. 400, 500 for emphasis. Body is at least 17px with line height around 1.65.
- **Erode**: long-form reading on paper only.
- **Fragment Mono**: meta, labels, stamps, coordinates. Seasoning, never paragraphs. Instrument labels are 11px uppercase at 0.14em.
- Display sizes use fluid `clamp()`, tight tracking and `text-wrap: balance`.

## Layout

Brand surfaces use rem and clamp fluid sizing, generous vertical rhythm and no cards. Instruments (orbit-class boards) may use px sizing and the tighter 6 to 12px radius scale. Paper reading columns hold a 40 to 42rem measure.

## Elevation & Depth

Depth comes from light, not shadows stacked on everything: the ground gradient, film grain (opacity 0.045 to 0.05, overlay blend) and the starfield on brand surfaces. Instrument cards lift on hover with a translate of -2px, a stronger border and one deep soft shadow.

## Shapes

Radii are small and purposeful: 6px for chips and ship marks, 8px for cards, 12px at most for dialogs, 20px for state pills. Glyph grammar: `✦` marks the living, `✧` the dormant. One glyph per heading, never confetti.

## Components

- **Primary button**: ember fill, dark text, weight 600, focus is a 2px `thread-bright` outline offset 2 to 3px.
- **Card**: surface fill, 1px line border, 8px radius, 11 to 13px padding.
- **State pill** (anything with a temperature): 20px radius, a leading 5px dot, label type, background tinted at about 0.13 alpha. Neutral uses muted, needs-attention uses ember, exceeded uses danger.
- **Data chip** (facts without temperature): label type, 1px strong-line border, 6px radius, 2px by 8px padding.

## Motion

- `--ease-drift: cubic-bezier(0.16, 1, 0.3, 1)` for ambient and brand moments.
- `--ease-snap: cubic-bezier(0.22, 1, 0.36, 1)` for instruments, 0.12 to 0.34s.
- One hero entrance at most, no scroll-gated choreography. Delight moments are rare, interruptible and reduced-motion safe. Every animation respects `prefers-reduced-motion`.

## Do's and Don'ts

- Do use ember for exactly one job per view: the thing to act on.
- Do keep headings lowercase and let Panchang carry the personality.
- Do take the grain recipe and `stars.js` from the site verbatim instead of reimplementing them.
- Don't introduce a third typeface on void surfaces.
- Don't put atmosphere colors on actions or alerts.
- Don't use pure black, pure white, or gray that isn't biased toward the ground's hue.
- Don't hand-edit generated CSS or Tailwind theme files; change this file and regenerate.
