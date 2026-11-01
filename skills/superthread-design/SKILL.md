---
name: superthread-design
description: Superthread, the design system for Maurice's fleet (orbit, quanta, trisys, constellation, artifacts, soliton, mauricekleine.com and every new surface), served as the @mk shadcn registry. Use when designing, building, restyling or critiquing UI for a fleet surface; installing or updating @mk items in an app; drawing a mark or icon for a ship; choosing colours, fonts, texture or motion for anything Maurice-branded; or bootstrapping a new surface. Pairs with impeccable (method) and mk-copywriting (words); this skill owns the brand facts. Not for fluncle or nonobench (own brands) or client work.
---

# superthread-design

Superthread is the design system Maurice's fleet shares. v2 is `@mk`, a shadcn registry of Base UI items on one set of tokens, served with its reference site at https://superthread.mauricekleine.com. The site renders every item from its source, in light and dark, beside the foundations and three mock app pages. When this skill and the site disagree, the site is right and this skill needs a fix.

The sources, in the mauricekleine.com repo:

- `packages/superthread/tokens/master.json`: every value, vendored from the master world and never hand-edited.
- `packages/superthread/DESIGN.md`: the values and rules as a design doc.
- `packages/superthread/PRODUCT.md`: who superthread serves and its register.
- `packages/superthread/README.md`: install, pinning, scripts and versions.
- `packages/superthread/items/`: the item sources. `apps/superthread/` is the site.

Inside an app, the installed `components/superthread/styles/superthread.css` holds the values that app runs on.

## Division of work

- **impeccable** owns the method: shaping, critique, audit, hierarchy and polish. Load it for any serious UI work. When it proposes a value, a face or an effect, hold the proposal to this skill: the brand facts here win.
- **mk-copywriting** owns every word a person reads. Chrome is lowercase, plain and understated, with no em dashes.
- **This skill** owns the values, the rules, the items and the marks.

## The system

The thesis is flat where you read, screened where you look. Each rule below follows from it.

- **Two inks.** Key `#16181d` on white stock `#ffffff`; dark mode prints white on key. Every neutral is a tint of the first ink, mixed in linear light. Detail: [colour](references/colour.md).
- **One house ink.** Plum (`#aa337a`, dark `#c074a1`): one fill per viewport, on paper only, in the deep value. As ink it prints only in the focus signal, the rail's corner mark and home cell, the plates, the code accent and a ship's mark. The focus signal is the ring, a field's focus edge and its caret, and it doesn't count against the fill. A ship never sets a control colour.
- **A current item is neutral.** In a nav, wherever it is drawn, it prints the word, a 1 px edge and an 8 px square in the `selected` role, with no fill. The rail's current cell is neutral too, with its 8 px plum corner mark.
- **Five statuses**, at badge scale only, each with its glyph and its word: done, running, waiting, failed, queued. Failed is the one solid badge. Destructive is the key ink with the trash glyph and the word.
- **Ship spots.** A ship's bright spot lives in its mark (so its rail cell and fleet row) and in its chart series. A large area of spot or status colour breaks the system. Detail: [marks](references/marks.md).
- **Four faces, one job each.** Unbounded for display, Supreme for the interface, Erode for reading, Fragment Mono for ids, times, figures that hold a column, code and caps legends. Chrome is lowercase. Detail: [type and layout](references/type-and-layout.md).
- **Square and ruled.** Radius 0, 1 px edges, and horizontal rules that reach both edges of the window.
- **Focus.** A control takes a 2 px plum ring at a 2 px offset. A field's box draws a 2 px edge inside itself. Every focusable element shows one of the two.
- **Screens.** 1-bit texture prints in five places and as at most one small detail per component, always beside words, numbers, data and code. Everything else stays flat, with no grain, noise or glow, and no screen moves. Detail: [texture](references/texture.md).
- **Motion.** Three durations (120, 180 and 240 ms) share one ease, `--ease-brand`. Reduced motion makes every duration zero.
- **Two surfaces.** Docs and public pages print on stock. A ship surface prints on the deep ground: the fleet rail and the ship's nav flat on it, the working panel raised on it.

## Rows, behaviour and words

Every ship holds these. `DESIGN.md` carries each as a named rule.

- **Links.** A link prints in foreground, with a 1 px underline at rest in running text and on hover in chrome. `link-quiet` is the one second form.
- **Outward actions.** An action that leaves the app, such as a send, a publish or a share, prints `key`, never plum. A block that holds one is a key block, and its focus ring prints in the first ink.
- **Rows.** A status on a row is a fact the row is about: it prints through `Badge`, and only where the list exists to show status, such as a run or board table. A personal list prints none. A label prints as muted text, never as a badge. Age prints neutral and uncoloured, `since friday`, from `@mk/time-words`.
- **Numbers.** A page prints no number the app can't vouch for: no estimated total, no finish time, no streak and no missed count. A count in a nav never asks for attention: only decisions waiting may print as a backlog, and a library's item counts stay muted reference.
- **Behaviour.** A click never moves anything: slots stay reserved, a button holds its width when its word changes, a tick keeps its space, and a panel keeps its height when its content shortens. A button says what happens, and the primary names the step: `open the mail`, `read the draft`. `start` prints only when there is no source to open. A page has one primary action.
- **Reads.** Clear prints only after a complete read: a failed or loading read isn't zero, and a stale read prints when it was last read. A refresh never moves a target: a newer version prints a quiet line and never swaps the body, a re-rank waits behind one line, and nothing re-picks on focus, because the click that focuses can land on the button.
- **Type.** Times and any figure that must hold a column set in Fragment Mono, because Supreme and Erode have no tabular figures. The meta step holds legends and the group labels inside a list, so a page prints no stack of caps labels. A keycap sits beside a control or in a tooltip, never inside a button. A title in the display face prints in the first ink.
- **Frame.** At 900 px and below the frame scrolls with the page, and no ship re-sticks it. Every target on a phone is 44 px, through its box or a hit area.
- **Words.** No word says someone is behind: overdue, late and missed print nowhere. A confirm's title names the action and its reach, its action repeats the verb, and its cancel stays plain: `publish to everyone?`, `publish`, `cancel`. An aria label is a lowercase verb plus the authored title, which keeps its casing: `mark done: <title>`. A schedule prints in plain words, `every day at 07:00` or `when mail arrives`: no cron, and a timezone only when it differs. A page prints one sentence saying what it is, only if that sentence changes what the reader does there.

## Build or restyle a fleet surface

1. **Install.** In a TanStack Start app on Tailwind 4, run:

   ```sh
   bunx --bun shadcn@latest init https://superthread.mauricekleine.com/r/init.json --base base -y
   bunx --bun shadcn@latest add @mk/tokens @mk/button
   ```

   Done when `components.json` maps `@mk` and the CSS entry imports `superthread.css` after Tailwind. Other layouts, version pins and plain CSS: [registry](references/registry.md).

2. **Set the mode on `<html>`.** `.dark` on `<html>` is dark mode; raised layers portal to `<body>` and take the document's mode. `themeScript` from `@mk/theme`, first in `<head>`, sets the class before anything paints, so the mode never flashes. The fleet shares one choice and `FleetRail`'s mode cell sets it, so a ship adds no toggle of its own.
3. **Compose from items.** Open the item's page on the site, then run `bunx --bun shadcn@latest add @mk/<item>`. For a page shell, a header, a list, cards, a table, a form or a loading, failed or empty state, start from the matching block (`@mk/app-shell`, `@mk/list-rows`, `@mk/states` and the rest in [registry](references/registry.md)). Style app code with the token roles (`bg-primary`, `text-muted-foreground`, `border-border`) and utilities (`type-<step>`, `shadow-<lift>`, `texture-<detail>`), so the mode and the house ink reach everything. Values come from the tokens, and the mode comes from the `.dark` class: no hex values and no `dark:` classes in app code. A component the registry lacks is built on Base UI from the tokens, held to these rules, and proposed for the registry.
4. **Frame a ship.** Wrap the app in `FleetRail` with `current` set to the ship's id, `hrefs` only where a link differs from the fleet's (`"/"` for the app's own ship; every other ship and home default to their fleet urls), and the ship's nav as `sidebar`. The working panel sits beside it on the deep ground. The rail brings the skip link and `AppShellGround` is its `#main`; `html`'s ground, scrollbar, caret and tap highlight come from the tokens' base layer, so a ship writes none of them.
5. **Fix items at the source.** When an item is wrong, change it in `packages/superthread/items/` in the mauricekleine.com repo and ship a new version. In the app, `add @mk/<item> --diff` shows the change and `add @mk/<item> --overwrite` takes it. Installed files stay as the registry writes them, so every app runs the same item. A ship never restyles an item from outside: no `[data-slot]` rule and no look class at a call site, since anything that changes how an item looks (colour, type, border, case) changes Superthread. Margins, widths and grid placement stay composition.
6. **Check.** Compare each screen with the matching pages on the site, in light and dark, at 1440 and 390 px wide, then run impeccable's critique. Done when a viewport holds at most one plum fill, on paper, every other control prints in foreground or key, every state shows its glyph and its word, every focusable element shows its ring or edge, and every screen sits beside words rather than behind them.

## Words for things

- **fleet**: every surface Maurice ships under his own name. **ship**: one app in it, with a mark and a spot.
- **fleet rail**: the column of ship marks down the left of a ship surface; a 48 px bar at 900 px and below.
- **selected**: the role a current item in a nav prints in; `foreground` on paper, the words beside it on the frame and the ground.
- **key**, **stock**: the first ink and the paper it prints on. **wedge**: the eleven tint steps from one to the other.
- **house ink**: plum, the one chromatic ink a control takes. **spot**: a ship's own bright colour.
- **off paper**: inside a dark scope, which is every surface of a dark page and the frame on any page.
- **key block**: a block that holds an action leaving the app. It sets `--ring` to `--first`.
- **deep ground**: the dark field a ship surface prints on, in both modes.
- **screen**: a 1-bit pattern standing in for a tint. **plate**: one ink's 1-bit image. **crop marks**: the corner ticks around a screened field.

## v1 surfaces

v1 is frozen. A surface that imports `packages/superthread/dist/superthread.css` is on v1 and keeps it until its own migration change, which moves the whole surface to v2 at once. Until then, work on a v1 surface stays in v1's values. A new surface starts on v2.

## References

- [colour](references/colour.md): the wedge, every role, the house ink's states, the statuses, the ship spots, the deep ground and the code patch. Read it before choosing or checking any colour.
- [type and layout](references/type-and-layout.md): faces, type steps, space, rows, breakpoints, focus, elevation and motion.
- [texture](references/texture.md): the five places, the six component details, levels, line screens, crop marks and plates.
- [marks](references/marks.md): how a mark is drawn, its files and URLs, the home mark, icons, and adding a ship.
- [registry](references/registry.md): items and tiers, install, the CSS entry, pinning, plain CSS, fonts and origins, and updating.
- [interaction craft](references/interaction-craft.md): overlays, gestures, hover feedback and continuous updates.
- [data display](references/data-display.md): zero, missing values, comparisons and chart legends.
