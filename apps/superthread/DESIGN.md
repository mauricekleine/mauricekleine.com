---
name: superthread
description: the superthread site prints the design system it documents. its tokens, rules and components live in the package.
---

# Design System: superthread

This app is superthread's own site, and it uses the system without a design of its own. The system's DESIGN.md is [`packages/superthread/DESIGN.md`](../../packages/superthread/DESIGN.md), with its sidecar at [`packages/superthread/.impeccable/design.json`](../../packages/superthread/.impeccable/design.json). Read those for every colour, type step, space, elevation, texture place and component rule. The site's own breakpoints (`src/site/layout.ts`) and its page briefs (`.impeccable/surfaces/`) sit on top of them.

## the opener

The overview, foundations and install open full bleed. The masthead, title and lede sit on key on a light page and deep ground on a dark page. Span prints in dark inks below the copy. The page's stock fills the solid up to the plum thread, and the body columns start with their side rules at the foot of the band. The overview runs the band at the www home heights and keeps the install line below it. Foundations and install take a slim still. Component, composition and mock pages open with their own content.

The overview plays one 14-second loop. The plum knot follows the rise from left to right as its light moves across the screen. The field pauses offscreen and when the tab hides, and prints frame zero under reduced motion and in print. The desktop and phone frame-zero plates print before hydration, with 1× and 2× samples in both page modes. They fit the band; the live field samples the dots at a 4 css px pitch at the window's size.

`src/site/span.ts` holds the specs and the mask. Run `bun apps/superthread/tools/render-span.ts` from the repo root to render the plates into `public/opener/`.
