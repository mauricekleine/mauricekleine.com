# Design

## Theme

The site prints on Superthread v2. Its values, type and rules live in `packages/superthread/DESIGN.md`. Every page is stock-first in both modes (`#ffffff` in light mode, `#16181d` in dark mode) with square `0 px` corners and uniform `1 px solid var(--border)` hairlines across the masthead, opener, columns and sections. Plum (`--primary`) appears sparingly: the 8 px square beside the home kicker, primary actions, focus rings and the second screen ink inside the proof halftone portrait.

## Frame

`src/shell.tsx` puts the sticky masthead and stock-first opener above the boxed nav, page and aside.

- The masthead holds the wordmark, crumb and status block in a 77 px row divided by `1 px solid var(--border)` hairlines. It sticks at the top on desktop.
- The home opener is a stock-first framed split grid (`1.15fr` copy on the left, `0.85fr` portrait plate on the right), separated by a `1 px solid var(--border)` vertical hairline and closed by a `1 px solid var(--border)` bottom rule. The left column carries an 8 px plum square beside the uppercase Fragment Mono kicker (`AMSTERDAM, NL`), the Unbounded display heading (`Maurice Kleine`), the Erode lede, and the "Keep reading ↓" link. The right column renders `maurice.png` through `@mk/plate` in `3.5 px` two-ink proof halftone with vivid light breath, sized at a near-square `50 / 47` aspect ratio so centered cover never clips his face or hair.
- Inner pages (`/about`, `/essays`, `/essays/$slug`, `/404`, and no-JS subscribe responses) open with a flat stock-first `sheet-head`: uppercase mono kicker, display or serif title, lede or byline, and a `1 px solid var(--border)` bottom hairline. Their left edge aligns directly with the page column below (`calc(264px + 56px)` on desktop).
- The body has three columns divided by `1 px solid var(--border)` hairlines. The 264 px boxed nav holds the Light / Dark / Auto control at its foot. The page runs to 696 px in a column with 56 px gutters. The 368 px aside holds "On this page".
- At 1279 the aside narrows to 312 px and the gutters to 40 px. At 1099 the aside drops out and the status prints in the foot. At 900 the masthead becomes static and carries the compact mode control, a nav row sits under it, the home split opener stacks into one column with the portrait plate below the copy, and the body becomes one column. At 600 the titles tighten and all nav, mode and link targets reach 44 px.
- The lost page uses the stored mode from the head script and ships without a client entry. Its nav links work as plain anchors.

## Type

Superthread's utilities and faces, from `packages/superthread/dist/v2/superthread.css`: fonts load from `superthread.mauricekleine.com/fonts/`.

- The wordmark is Unbounded 400. The home title uses Unbounded 300 at `clamp(44px, 5vw, 76px)` on desktop and `clamp(36px, 10vw, 48px)` on a phone. Inner display titles use Unbounded 300 at `clamp(34px, 3.8vw, 56px)`. Section heads use `type-section`.
- Prose on the home and about pages and in essays is Erode at the read step and a 27.5em measure. Rows are Supreme: `type-subtitle` names over `type-summary` lines.
- Fragment Mono is for meta: kickers, crumbs, status, years, essay bylines.
- Copy uses natural sentence case throughout, with uppercase Fragment Mono reserved for metadata kickers and labels. Essay titles and bodies keep the casing they were published with.

## Components

Registry items come from `packages/superthread/items` through the `@/components/superthread` alias, so www never carries a copy. `site.css` owns the page blocks.

- **Opener** (`Opener`): stock-first framed split opener on home using `@mk/plate` (`src="/maurice.png"`, `breath="vivid"`), and flat `sheet-head` opener on inner pages.
- **Side quests** (`SideQuests`): a constellation tile (1:1 SVG, 4 px stars, 1 px lines), the project name and one line. Its lines take the first ink on hover and focus. No cards.
- **Graveyard** (`Graveyard` / `GraveyardItem`): ledger rows with a `✧`, the name, a `Badge` (`done` for exits, `queued` for the rest) and mono years.
- **Essays**: rows on the home page. On `/essays`, each row holds the cover with a 1 px edge, title, summary and date. The essay page sets its title in `type-page`, lists its `h2`s in "On this page" and keeps images at full opacity with a 1 px edge.
- **Subscribe**: registry `Field` and `InputGroup`. Turnstile follows the mode.
- **Elsewhere**: 40 px cells with a 1 px edge and Phosphor icons vendored as inline SVG.

## Motion

- **Proof halftone light breath**: `@mk/plate` animates a vivid light wave across the `3.5 px` two-ink (`45°` key + `15°` plum) halftone portrait on the home page, pausing when off-screen, hidden, printing, or under `prefers-reduced-motion`.
- **Supernova**: a random graveyard `✧` flares in the first ink every 14 to 32 s in `Graveyard`, skipped when the tab is hidden, printing, or under `prefers-reduced-motion`.

## Assets

- `maurice.png` (touch icon and portrait plate source) and `favicon.ico`.
- `og.png` is the 1200 × 630 social card.
- `public/fonts/` serves the frozen v1 theme's copies; www itself loads its fonts from the superthread host.
- Simple Analytics (`https://api.mauricekleine.com/latest.js`) at the end of the body.
