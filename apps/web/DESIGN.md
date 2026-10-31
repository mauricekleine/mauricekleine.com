# Design

## Theme

The site prints on Superthread v2, whose values, type and rules live in `packages/superthread/DESIGN.md`. It is a public page in that system: the stock in both modes, full-bleed rules, a boxed nav and an aside, no fleet rail. Flat where you read, screened where you look. The night sky over Amsterdam survives as the one live screen: a 1-bit field in the opener's band, inside crop marks. Descended from a 2022 note: "Foals / Sleeping Giants star particles effect".

## Frame

`src/shell.tsx` follows the superthread site's measures.

- **Masthead**, 77 px and sticky: the wordmark, the crumb, the status block and the plum swatch.
- **Body**, three columns divided by 1 px rules: the 264 px boxed nav with the mode control at its foot, the page (696 px wide in a column with 56 px gutters) and the 368 px aside with "on this page".
- **Breakpoints**: 1279 narrows the aside to 312 and the gutters to 40. 1099 drops the aside, and the status prints in the foot instead. 900 makes one column, with the nav as a row under a static masthead and the compact mode control in it. 600 takes the wordmark out of the band and sets it under.
- **The lost page** has no client entry, so it prints no mode control and no aside. The head script still applies the stored mode.

## Type

Superthread's utilities and faces, from `packages/superthread/dist/v2/superthread.css`: fonts load from `superthread.mauricekleine.com/fonts/`.

- The wordmark is Unbounded 400. `h1` in the band is `type-hero`; section heads are `type-section`.
- Prose on the home and about pages and in essays is Erode at the read step and a 27.5em measure. Rows are Supreme: `type-subtitle` names over `type-summary` lines.
- Fragment Mono is for meta: crumbs, status, years, essay bylines.
- Chrome is lowercase. Essay titles and bodies keep the casing they were published with.

## Components

Registry items come from `packages/superthread/items` through the `@/components/superthread` alias, so www never carries a copy. `site.css` owns the page blocks.

- **Band** (`Band`): the `#sky` canvas in its crop marks, 696 x 196 and 342 x 136 on a phone; 120 and 96 on inner pages. The title knocks out of the lower left. `public/sky/plate-*.png` is the same field printed, for the moment before the script runs and for readers without scripts.
- **Portrait** (`public/portrait/`): a two-ink Bayer 4 screen of `maurice.png`, at 196 and 136 px, one file per mode because dark has to print on the light of the face. Set `image-rendering: pixelated` at whole pixels. Regenerate both modes together.
- **Side quests** (`SideQuests`): a constellation tile (1:1 SVG, 4 px stars, 1 px lines), the project name and one line. The tile takes plum on hover and focus. No cards.
- **Graveyard**: ledger rows with a `✧`, the name, a `Badge` (`done` for exits, `queued` for the rest) and mono years.
- **Essays**: rows on the home page; on `/essays`, the cover with a 1 px edge, title, summary and date. The essay page sets the title in `type-page` under the slim band, lists its `h2`s in "on this page" and keeps images at full opacity with a 1 px edge.
- **Subscribe**: registry `Field` and `InputGroup`. Turnstile follows the mode.
- **Elsewhere**: 40 px cells with a 1 px edge and Phosphor icons vendored as inline SVG.

## Motion

Motion lives in `public/sky.js` and two stepped CSS moments. The sky runs at 24 fps at CSS pixels, stops when the band leaves the page or the tab hides, and prints one still frame under `prefers-reduced-motion`.

## The sky

Deliberately overengineered, zero-dependency, and always in one of two inks, resolved from `--first` and `--primary` and read again when the mode changes.

- **Nebula**: tiled, domain-warped value noise folded into ridges and screened through Superthread's Bayer 4 in plum, drifting slowly. One noise field is built at load.
- **Stars**: whole pixels and crosses in the first ink, with twinkle as a screen threshold, slow drift and pointer parallax inside the band.
- **Wish**: clicking the band sends a meteor from the click point; the first wish logs to the console. Meteors also fall on their own every 9 to 25 s.
- **Sky traffic**: rare flybys, one at a time: a starlink train (always first, 45 to 90 s in), the ISS and a UFO, drawn as 1-bit sprites with plum lights. Each logs a line on first appearance; `window.sky.traffic('starlink' | 'iss' | 'ufo')` summons one.
- **"dnb"**: typing it pulses the nebula and stars at 174 bpm, fluncle's tempo, for 16 beats.
- **Console**: a star map, the secrets list and the llms.txt pointer.

Beyond the band:

- **Eclipse**: clicking the portrait runs a stepped first-ink moon across it (`.portrait-wrap.eclipsing`).
- **Supernova**: a random graveyard `✧` flares in plum every 14 to 32 s, skipped when the tab is hidden.

## Assets

- `maurice.png` (touch icon and portrait source) and `favicon.ico`.
- `og.png`: the band's world at 1200 x 630, rendered from the live page in light mode.
- `public/fonts/` serves the frozen v1 theme's copies; www itself loads its fonts from the superthread host.
- Simple Analytics (`https://api.mauricekleine.com/latest.js`) at the end of the body.
