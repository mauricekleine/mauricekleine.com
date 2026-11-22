# Design

## Theme

The site prints on Superthread v2. Its values, type and rules live in `packages/superthread/DESIGN.md`. Each page opens on a full-bleed dark island in both modes. The island uses key on a light page and deep ground on a dark page. The page body uses the selected stock. The night sky over Amsterdam is the one live screen. Its band meets both sides of the window, and the page stock rises to the plum thread.

## Frame

`src/shell.tsx` puts the masthead and opener in the same dark scope, above the boxed nav, page and aside. The opener's words sit on the page column's edges, so the title, the lede and the body share one left edge, and the portrait ends where the page does.

- The masthead holds the wordmark, crumb and status block in a 77 px row. It sticks at the top on desktop, where the island supplies its inks without enclosing its sticky box.
- The home island fills at least `100svh`. The title and lede sit on solid stock above the sky, with the portrait beside the title, top to top. The "keep reading" link jumps to the first section. Inner pages put their title and context above a slim band.
- The body has three columns divided by 1 px rules. The 264 px boxed nav holds the mode control at its foot. The page runs to 696 px in a column with 56 px gutters. The 368 px aside holds "on this page". The column rules rise to the thread: wherever the band prints page stock in a rule's column, `src/sky.js` prints the rule, and the first section starts with an open top.
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

- The band (`Opener`) holds the full-width `#sky` canvas. On home it takes 36svh between 220 and 440 px, or 24svh between 160 and 240 px on a phone. The slim band takes 120 px, or 96 px on a phone. `public/sky/` holds frame-zero plates for the home and slim bands at desktop and phone widths. Each mode has its own fallback plates. They leave the island stock open above the thread and carry the page stock below it. They print at 2×, centred at the foot of the band at native CSS size.
- The portrait (`public/portrait/`) prints `maurice.png` through the sky’s 4 CSS px dot screen at 196 and 136 px. The first ink runs at 45° and plum at 15°. Both page modes use the same transparent plates at 1×, 2× and 3×, with each pixel printed in one ink or left open to the island stock. Home sets the full square beside the title and ends it where the page column ends; the title gives way before it reaches the portrait. On a phone the portrait keeps to the title's row and the lede runs across under both. About crops around the face at native scale above the thread.
- **Side quests** (`SideQuests`): a constellation tile (1:1 SVG, 4 px stars, 1 px lines), the project name and one line. Its lines take the first ink on hover and focus. No cards.
- **Graveyard**: ledger rows with a `✧`, the name, a `Badge` (`done` for exits, `queued` for the rest) and mono years.
- **Essays**: rows on the home page. On `/essays`, each row holds the cover with a 1 px edge, title, summary and date. The essay page sets its title in `type-page` above the slim band, lists its `h2`s in "on this page" and keeps images at full opacity with a 1 px edge.
- **Subscribe**: registry `Field` and `InputGroup`. Turnstile follows the mode.
- **Elsewhere**: 40 px cells with a 1 px edge and Phosphor icons vendored as inline SVG.

## Motion

Motion lives in `src/sky.js` and one stepped CSS moment. Bun bundles the sky into `public/sky.js` for every page. The sky runs at 24 fps with a 4 CSS px dot pitch sampled at device resolution, pauses when the band leaves the page or the tab hides, and prints one still frame under `prefers-reduced-motion` and in print. The home opener fits the printed page.

## The sky

The sky takes its inks from the canvas's dark scope. The field screens the foreground and threads plum through it. Stars print in the first ink. Open cells take `--island-stock`. The field's solid takes `--page-stock` from the page.

- **The night over Amsterdam** uses `@mk/field-art`. Desktop and phone each have a spec line that also fits the slim band. A held ramp rises into fine filaments above the plum thread. The filaments drift on a 22 s loop while the upper strip and portrait surround stay quiet. Stars and sky events print over the field in the same canvas.
- **Stars**: square cells and crosses in the first ink, with twinkle as a screen threshold, slow drift and pointer parallax inside the band. They print in open cells above the field’s edge and thin out through the ramp.
- **Wish**: clicking the band sends a meteor from the click point; the first wish logs to the console. Meteors also fall on their own every 9 to 25 s.
- **Sky traffic**: rare flybys, one at a time: a starlink train (always first, 45 to 90 s in), the ISS and a UFO, drawn as 1-bit sprites with plum lights. Each logs a line on first appearance; `window.sky.traffic('starlink' | 'iss' | 'ufo')` summons one.
- **"dnb"**: typing it swells the stars at 174 bpm, fluncle's tempo, for 16 beats.
- **Console**: a star map, the secrets list and the llms.txt pointer.

Beyond the band:

- **Supernova**: a random graveyard `✧` flares in the first ink every 14 to 32 s, skipped when the tab is hidden.

## Assets

- `maurice.png` (touch icon and portrait source) and `favicon.ico`.
- `og.png` is a 1200 × 630 image of the home title, lede, portrait and sky, with the sky held still. Run `bun tools/render-sky.ts` in `apps/web` to print the eight sky fallback plates and the six portrait plates, then compose the band and portrait into the social card.
- `public/fonts/` serves the frozen v1 theme's copies; www itself loads its fonts from the superthread host.
- Simple Analytics (`https://api.mauricekleine.com/latest.js`) at the end of the body.
