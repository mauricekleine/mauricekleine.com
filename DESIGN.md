# Design

## Theme

"Night Garden": a calm night sky over Amsterdam. A full-viewport canvas star field (slow drift, faint twinkle, subtle cursor parallax) sits behind a single centered column of content. Projects are waypoints in the sky; ended projects are burnt-out stars. Sibling energy to Fluncle's cosmos (warm ember on deep dark) but quieter and personal. Descended from a 2022 note: "Foals / Sleeping Giants star particles effect".

## Colors

OKLCH throughout. Strategy: Committed dark, one warm accent.

- `--night`: oklch(17% 0.035 275) — page background, deep space indigo (not pure black)
- `--night-deep`: oklch(13% 0.03 280) — gradient floor
- `--starlight`: oklch(94% 0.01 85) — primary text, warm off-white
- `--muted`: oklch(74% 0.02 275) — secondary text
- `--dim`: oklch(64% 0.015 275) — meta/labels only (large or bold)
- `--ember`: oklch(75% 0.13 55) — links, accents; the old site's #c65d07 orange, brightened for dark bg
- `--ember-bright`: oklch(84% 0.12 65) — link hover, star glints
- `--nebula`: oklch(45% 0.09 300) — violet glow tints, low alpha only

Contrast: body text on --night ≥ 10:1; --muted ≥ 6:1; --dim reserved for ≥bold/large meta.

## Typography

- Display + body: **Bricolage Grotesque** (Google Fonts, variable). Quirky humanist grotesque with ink traps; homemade-planetarium-booklet warmth. Weights: 800 display, 600 headings, 400 body.
- Mono accent: **Fragment Mono** — log IDs, status stamps, footer meta. Small doses only.
- Headings lowercase (brand voice). Scale ratio ≥1.3, fluid clamp() on the display line, `text-wrap: balance` on headings.

## Components

- **Waypoint list** (side quests): star glyph + project name (link) + one-liner in Maurice's voice. No cards. Hover: glyph glints ember.
- **Graveyard entries**: dimmed waypoints with a mono status stamp (`sold`, `dissolved`, `discontinued`, `spun down`) and years. Slightly reduced opacity, never illegible.
- **Icon row**: Phosphor icons (inline SVG) for GitHub, LinkedIn, X, Reddit, email. 1.5rem, --muted, hover --ember-bright.
- **Portrait**: existing maurice.png, circular, faint ember glow ring.

## Layout

Single centered column, max-width 42rem, generous vertical rhythm (clamp-based section spacing). Star canvas is `position: fixed`, z-index below content, pointer-events none. One-pager: hero → currently → side quests → graveyard → links → footer.

## Motion

- Canvas stars: ~140 stars, slow drift + twinkle, cursor parallax (2 depth layers). rAF, DPR-aware, paused when tab hidden.
- `prefers-reduced-motion: reduce`: canvas renders one static frame, no animation, no parallax.
- Content: single soft fade-up on load for the hero only; sections are visible by default (no scroll-gated reveals).

## Texture

Paper.design-inspired, hand-written (a nod to fluncle's video pipeline):

- **Dithered neuro nebula** (`texture.js`): a single WebGL fragment shader behind the stars — domain-warped fbm ridges quantized through a Bayer 4 matrix (ordered dither), tinted nebula-violet drifting into ember. Rendered at ~quarter res with `image-rendering: pixelated` so the dither stays chunky. 30fps cap, additive blend at alpha ≤0.16, intensity dimmed in the reading column, paused when hidden, single static frame under reduced motion, skipped entirely without WebGL.
- **Film grain** (`style.css` `body::after`): SVG feTurbulence tile at 4.5% opacity, `mix-blend-mode: overlay`, jittered with a `steps(6)` animation; static under reduced motion. Also baked into og.png via og-template.html.

## Delight systems

Deliberately overengineered details, all reduced-motion safe and zero-dependency:

- **Constellations**: each side quest owns a shape in the side sky (mockly: chat bubble, fluncle: waveform, hackadam: clubhouse, nonobench: nonogram grid). Idle at alpha 0.14; hover/focus on a `[data-constellation]` waypoint reveals lines + a Fragment Mono label. Auto-disabled when the side margin is under ~150px.
- **Wish mechanic**: clicking empty sky spawns a meteor from the click point; first wish logs to console.
- **Portrait eclipse**: clicking the portrait runs a 1.5s moon transit + corona flare (`.portrait-wrap.eclipsing`).
- **Graveyard afterlife**: dead ✧ glyphs reignite ember on hover; an ambient supernova flares a random glyph every 14–32s (skipped when tab hidden).
- **"dnb" easter egg**: typing it pulses all stars at 174bpm (fluncle's tempo) for 16 beats.
- **Console + view-source easter eggs**: styled ASCII star map, secrets list, llms.txt pointer; HTML comment greets view-source readers.
- **Footer status line**: blinking ember dot + `status: operational · sleep: degraded · ideas: backlogged`.
- **404.html**: "lost in space" page on the same system, noindex.
- **Sky traffic** (`stars.js`): rare ambient flybys, one at a time, none under reduced motion. A starlink train (procedural dot chain on a shallow arc, always the first visitor, 45–90s in), the ISS (code-drawn pixel sprite with a solar glint mid-pass), and a UFO (pixel sprite that drifts in, hovers with blinking ember lights, then bolts). Each logs a one-liner to the console on first appearance; `window.sky.traffic('starlink' | 'iss' | 'ufo')` summons them. The ISS and UFO use Nano-Banana-rendered pixel-art PNGs in `sprites/` (gemini-3.1-flash-image, fluncle's `docs/galaxy-sprites.md` workflow: pixel-art prompt on pure black → `magick -trim` → `-transparent black` → `-sample` downscale); the code-drawn `makeSprite()` pixels remain as the fallback while the PNGs load. To regenerate, prompt for "8-bit NES-era pixel art sprite ... solid pure black background, no text, no shadow, no grain" with the palette hexes from this file, then repeat the magick steps.

## Assets

- `maurice.png` portrait, `favicon.ico` (keep).
- Phosphor icons vendored as inline SVG in the HTML (no icon font, no CDN).
- Simple Analytics script (`https://api.mauricekleine.com/latest.js`) preserved at end of body.
