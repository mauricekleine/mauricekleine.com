---
name: superthread-design
description: Superthread, the design system for Maurice's fleet (orbit, quanta, trisys, constellation, artifacts, soliton, mauricekleine.com and every new surface), served as the @mk shadcn registry. Use when designing, building, restyling or critiquing UI for a fleet surface; installing or updating @mk items in an app; drawing a mark or icon for a ship; choosing colours, fonts, texture or motion for anything Maurice-branded; or bootstrapping a new surface. Pairs with impeccable (method) and mk-copywriting (words); this skill owns the brand facts. Not for fluncle or nonobench (own brands) or client work.
---

# superthread-design

Superthread is the design system Maurice's fleet shares. v2 (`2.0.0`) is `@mk`, a shadcn registry of Base UI items on one set of tokens, served with its reference site at https://superthread.mauricekleine.com. The site renders every item from its source, in light and dark, beside the foundations and three mock app pages. When this skill and the site disagree, the site is right and this skill needs a fix.

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
- **One house ink.** Plum (`#aa337a`, dark `#c074a1`) is the only control colour: primary actions, links, focus rings, the current item, selection and accent tints, the progress fill. A ship never sets a control colour.
- **Five statuses**, at badge scale only, each with its glyph and its word: done, running, waiting, failed, queued. Failed is the one solid badge. Destructive is the key ink with the trash glyph and the word.
- **Ship spots.** A ship's bright spot lives in its mark (so its rail cell and fleet row) and in its chart series. A large area of spot or status colour breaks the system. Detail: [marks](references/marks.md).
- **Four faces, one job each.** Unbounded for display, Supreme for the interface, Erode for reading, Fragment Mono for ids, numbers, code and caps legends. Chrome is lowercase. Detail: [type and layout](references/type-and-layout.md).
- **Square and ruled.** Radius 0, 1 px edges, and horizontal rules that reach both edges of the window.
- **Focus.** A control takes a 2 px plum ring at a 2 px offset. A field's box draws a 2 px edge inside itself. Every focusable element shows one of the two.
- **Screens.** 1-bit texture prints in five places and as at most one small detail per component, always beside words, numbers, data and code. Everything else stays flat, with no grain, noise or glow, and no screen moves. Detail: [texture](references/texture.md).
- **Motion.** Three durations (120, 180 and 240 ms) share one ease, `--ease-brand`. Reduced motion makes every duration zero.
- **Two surfaces.** Docs and public pages print on stock. A ship surface prints on the deep ground: the fleet rail and the ship's nav flat on it, the working panel raised on it.

## Build or restyle a fleet surface

1. **Install.** In a TanStack Start app on Tailwind 4, run:

   ```sh
   bunx --bun shadcn@latest init https://superthread.mauricekleine.com/r/init.json --base base -y
   bunx --bun shadcn@latest add @mk/tokens @mk/button
   ```

   Done when `components.json` maps `@mk` and the CSS entry imports `superthread.css` after Tailwind. Other layouts, version pins and plain CSS: [registry](references/registry.md).

2. **Set the mode on `<html>`.** `.dark` on `<html>` is dark mode; raised layers portal to `<body>` and take the document's mode. An inline script, first in `<head>`, sets the class before anything paints, so the mode never flashes.
3. **Compose from items.** Open the item's page on the site, then run `bunx --bun shadcn@latest add @mk/<item>`. For a page shell, a header, a list, cards, a table, a form or a loading, failed or empty state, start from the matching block (`@mk/app-shell`, `@mk/list-rows`, `@mk/states` and the rest in [registry](references/registry.md)). Style app code with the token roles (`bg-primary`, `text-muted-foreground`, `border-border`) and utilities (`type-<step>`, `shadow-<lift>`, `texture-<detail>`), so the mode and the house ink reach everything. Values come from the tokens, and the mode comes from the `.dark` class: no hex values and no `dark:` classes in app code. A component the registry lacks is built on Base UI from the tokens, held to these rules, and proposed for the registry.
4. **Frame a ship.** Wrap the app in `FleetRail` with `current` set to the ship's id, `hrefs` for home and each ship the app links to, and the ship's nav as `sidebar`. The working panel sits beside it on the deep ground.
5. **Fix items at the source.** When an item is wrong, change it in `packages/superthread/items/` in the mauricekleine.com repo and ship a new version. In the app, `add @mk/<item> --diff` shows the change and `add @mk/<item> --overwrite` takes it. Installed files stay as the registry writes them, so every app runs the same item.
6. **Check.** Compare each screen with the matching pages on the site, in light and dark, at 1440 and 390 px wide, then run impeccable's critique. Done when every control colour is plum or key, every state shows its glyph and its word, every focusable element shows its ring or edge, and every screen sits beside words rather than behind them.

## Words for things

- **fleet**: every surface Maurice ships under his own name. **ship**: one app in it, with a mark and a spot.
- **fleet rail**: the column of ship marks down the left of a ship surface; a 48 px bar at 900 px and below.
- **key**, **stock**: the first ink and the paper it prints on. **wedge**: the eleven tint steps from one to the other.
- **house ink**: plum, the one control colour. **spot**: a ship's own bright colour.
- **deep ground**: the dark field a ship surface prints on, in both modes.
- **screen**: a 1-bit pattern standing in for a tint. **plate**: one ink's 1-bit image. **crop marks**: the corner ticks around a screened field.

## v1 surfaces

v1 is frozen. A surface that imports `packages/superthread/dist/superthread.css` or installs from www's `/r` (`superthread.json`, `fleet-rail.json`) is on v1 and keeps it until its own migration change, which moves the whole surface to v2 at once. Until then, work on a v1 surface stays in v1's values. A new surface starts on v2.

## References

- [colour](references/colour.md): the wedge, every role, the house ink's states, the statuses, the ship spots, the deep ground and the code patch. Read it before choosing or checking any colour.
- [type and layout](references/type-and-layout.md): faces, type steps, space, rows, breakpoints, focus, elevation and motion.
- [texture](references/texture.md): the five places, the six component details, levels, line screens, crop marks and plates.
- [marks](references/marks.md): how a mark is drawn, its files and URLs, the home mark, icons, and adding a ship.
- [registry](references/registry.md): items and tiers, install, the CSS entry, pinning, plain CSS, fonts and origins, and updating.
- [interaction craft](references/interaction-craft.md): overlays, gestures, hover feedback and continuous updates.
- [data display](references/data-display.md): zero, missing values, comparisons and chart legends.
