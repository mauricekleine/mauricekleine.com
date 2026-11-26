---
name: superthread
description: The Superthread site prints the design system it documents. Its tokens, rules and components live in the package.
---

# Design System: Superthread

This app is Superthread's own site, and it uses the system without a design of its own. The system's DESIGN.md is [`packages/superthread/DESIGN.md`](../../packages/superthread/DESIGN.md), with its sidecar at [`packages/superthread/.impeccable/design.json`](../../packages/superthread/.impeccable/design.json). Read those for every colour, type step, space, elevation, texture place and component rule. The site's own breakpoints (`src/site/layout.ts`) and its page briefs (`.impeccable/surfaces/`) sit on top of them.

## The opener

The overview, foundations and install open with a stock-first framed split opener (`src/site/Opener.tsx` and `src/styles/opener.css`). Both the masthead and the opener adapt to the active light or dark stock with uniform `1px solid var(--border)` hairlines across the top, vertical split divider and bottom edge.

The left column (`1.15fr`) sets flat typography on stock: an `8px` plum square beside the uppercase `Fragment Mono` kicker, the `Unbounded` display title and the `Erode` lede. The right column (`0.85fr`) frames a live `@mk/plate` (`@/components/superthread/ui/plate`) rendered in a 3.5 px two-ink proof halftone (`45°` key and `15°` plum) with `vivid` light breath and per-page `planes` or `grid` geometry. On screens 900 px and below, the split collapses cleanly to a single column. Reduced motion and print hold frame zero. Component, composition and mock pages open directly with their own `PageHead` or app frame.
