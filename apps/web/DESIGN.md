# Design

## Theme

The site prints on Superthread v2. Its values, type and rules live in `packages/superthread/DESIGN.md`. Each page opens on a full-bleed dark island in both modes. The island uses key on a light page and deep ground on a dark page. The page body uses the selected stock. The night sky over Amsterdam is the one live screen. Its band meets both sides of the window and ends at the edge of the island.

## Frame

`src/shell.tsx` puts the masthead and opener in the same dark scope, above the boxed nav, page and aside.

- The masthead holds the wordmark, crumb and status block in a 77 px row. It sticks at the top on desktop, where the island supplies its inks without enclosing its sticky box.
- The home island fills at least `100svh`. The title and lede sit on solid stock above the sky. The "currently" link jumps to the first section. Inner pages put their title and context above a slim band.
- The body has three columns divided by 1 px rules. The 264 px boxed nav holds the mode control at its foot. The page runs to 696 px in a column with 56 px gutters. The 368 px aside holds "on this page".
- At 1279 the aside narrows to 312 px and the gutters to 40 px. At 1099 the aside drops out and the status prints in the foot. At 900 the masthead becomes static and carries the compact mode control. A nav row sits under it inside the island and the body becomes one column. At 600 the band and portrait take their phone sizes and the nav and mode targets reach 44 px.
- The lost page uses the stored mode from the head script and ships without a client entry. Its nav links work as plain anchors.

## Type

Superthread's utilities and faces, from `packages/superthread/dist/v2/superthread.css`: fonts load from `superthread.mauricekleine.com/fonts/`.

- The wordmark is Unbounded 400. The home title uses Unbounded 300 at 52 to 120 px and reaches 89 px at 1440 px. Inner display titles use the hero step on desktop and reach 44 px on a phone. Section heads use `type-section`.
- Prose on the home and about pages and in essays is Erode at the read step and a 27.5em measure. Rows are Supreme: `type-subtitle` names over `type-summary` lines.
- Fragment Mono is for meta: crumbs, status, years, essay bylines.
- Chrome is lowercase. Essay titles and bodies keep the casing they were published with.

## Components

Registry items come from `packages/superthread/items` through the `@/components/superthread` alias, so www never carries a copy. `site.css` owns the page blocks.

- The band (`Opener`) holds the full-width `#sky` canvas. On home it takes 36svh between 220 and 440 px, or 24svh between 160 and 240 px on a phone. The slim band takes 120 px, or 96 px on a phone. `public/sky/plate-dark.png` prints the same field before the script runs and for readers without scripts.
- The portrait (`public/portrait/`) is a two-ink Bayer 4 screen of `maurice.png` at 196 and 136 px, on 2 px cells. Both page modes use the dark files inside the island. Home shows the full square. About shows the face in the slim band at native scale.
- **Side quests** (`SideQuests`): a constellation tile (1:1 SVG, 4 px stars, 1 px lines), the project name and one line. Its lines take the first ink on hover and focus. No cards.
- **Graveyard**: ledger rows with a `✧`, the name, a `Badge` (`done` for exits, `queued` for the rest) and mono years.
- **Essays**: rows on the home page. On `/essays`, each row holds the cover with a 1 px edge, title, summary and date. The essay page sets its title in `type-page` above the slim band, lists its `h2`s in "on this page" and keeps images at full opacity with a 1 px edge.
- **Subscribe**: registry `Field` and `InputGroup`. Turnstile follows the mode.
- **Elsewhere**: 40 px cells with a 1 px edge and Phosphor icons vendored as inline SVG.

## Motion

Motion lives in `public/sky.js` and two stepped CSS moments. The sky runs at 24 fps on 2 CSS px cells snapped to device pixels, pauses when the band leaves the page or the tab hides, and prints one still frame under `prefers-reduced-motion` and in print. The home opener fits the printed page.

## The sky

The sky resolves its two inks, `--first` and `--primary`, from the canvas's dark scope. Both page modes use the same sky inks.

- **Nebula**: tiled, domain-warped value noise folded into ridges and screened through Superthread's Bayer 4 in plum, drifting slowly. One noise field is built at load.
- **Stars**: square cells and crosses in the first ink, with twinkle as a screen threshold, slow drift and pointer parallax inside the band.
- **Wish**: clicking the band sends a meteor from the click point; the first wish logs to the console. Meteors also fall on their own every 9 to 25 s.
- **Sky traffic**: rare flybys, one at a time: a starlink train (always first, 45 to 90 s in), the ISS and a UFO, drawn as 1-bit sprites with plum lights. Each logs a line on first appearance; `window.sky.traffic('starlink' | 'iss' | 'ufo')` summons one.
- **"dnb"**: typing it pulses the nebula and stars at 174 bpm, fluncle's tempo, for 16 beats.
- **Console**: a star map, the secrets list and the llms.txt pointer.

Beyond the band:

- **Eclipse**: clicking the portrait runs a stepped first-ink moon across it (`.portrait-wrap.eclipsing`).
- **Supernova**: a random graveyard `✧` flares in the first ink every 14 to 32 s, skipped when the tab is hidden.

## Assets

- `maurice.png` (touch icon and portrait source) and `favicon.ico`.
- `og.png` is a 1200 × 630 image of the home title, lede, portrait and sky, rendered from the opener in light mode with the sky held still.
- `public/fonts/` serves the frozen v1 theme's copies; www itself loads its fonts from the superthread host.
- Simple Analytics (`https://api.mauricekleine.com/latest.js`) at the end of the body.
