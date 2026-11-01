# type and layout

## faces

Four faces, each with one job. The tokens load them; app code picks a face through a type step or the font roles (`font-display`, `font-sans`, `font-serif`, `font-mono`).

| face          | weights                 | job                                                              |
| ------------- | ----------------------- | ---------------------------------------------------------------- |
| Unbounded     | 300; 400 for the wordmark | titles, section heads, the board                                |
| Supreme       | 400, 500                | controls, tables, notes, dialog titles and the body of docs pages |
| Erode         | 400, 400 italic, 500, 600 | the reading page, ledes and page titles                       |
| Fragment Mono | 400                     | ids, numbers, code and the caps legends                          |

Chrome (nav, labels, headings, buttons) is lowercase. Authored titles keep their own casing. Numbers are tabular everywhere, from the body rule.

## type steps

Each step is a `type-<step>` utility that sets face, size, line, tracking and weight together. Steps marked phone change at 600 px and below.

| step         | size / line | face                                   | use                         |
| ------------ | ----------- | -------------------------------------- | --------------------------- |
| `meta`       | 11 / 14     | Fragment Mono, caps, .14em              | legends                     |
| `instrument` | 13 / 20     | Supreme 400                            | notes, badges, table heads  |
| `ui`         | 14 / 21     | Supreme 400                            | the interface's body        |
| `summary`    | 15 / 24     | Supreme 400                            | the text under a form title |
| `subtitle`   | 18 / 24     | Supreme 500                            | dialog titles               |
| `read`       | 19 / 32     | Erode 400 (phone 18 / 30)              | the reading page            |
| `lede`       | 21 / 33     | Erode 400 (phone 19 / 31)              | ledes                       |
| `title`      | 22 / 28     | Unbounded 300, -0.02em                 | card and board titles       |
| `section`    | 30 / 34     | Unbounded 300, -0.03em                 | section heads               |
| `page`       | 34 / 40     | Erode 600 (phone 28 / 34)              | a reading sheet's heading   |
| `hero`       | 64 / 68     | Unbounded 300 (phone 52 / 56)          | a page head's title         |
| `display`    | 76 / 80     | Unbounded 300                          | the overview wordmark       |

The reading page sets Erode at 19 px on 32 px with a 27.5em measure (about 66 characters) on a 672 px sheet.

The base layer sets `code` and `time` in Fragment Mono. A `time` inside a `p` or an `li` reads with its words; `ListRowAside` prints in mono, so a time there holds its column.

Links print in foreground, 4 px above their underline. A link in running text keeps a 1 px underline at rest, and inside `AppShellPanel` the base layer prints any anchor no item owns that way. A chrome link, such as a row title, a nav word or a door, underlines on hover. `link-quiet` is the one second form: a muted word that turns foreground on hover.

## space and layout

- Space runs on a 4 px base: 4, 8, 12, 16, 24, 32, 48, 64 and 96.
- Rows: 56 px on the board, 48 px in a table, 32 px for a nav item (`--spacing-row-board`, `-table`, `-nav`).
- A section head sits inside its full-bleed rule, 64 px below the section before it and 44 px above its content.
- On a ship surface the working panel is at most 880 px wide and the reading sheet 672 px, both beside the fleet rail and the ship's nav. No ship widens the panel and there is no wide setting, so main content holds its place between pages. The reading page keeps a 264 px margin on the ground for its contents and progress.
- `AppShellPanel` is a size container, and text in it wraps anywhere, except inside a table's cells.
- At 900 px and below the fleet rail becomes a 48 px bar above the panel, with 12 px of ground on each side of it. At 600 px and below the phone type steps apply.
- At 600 px and below every target reaches 44 px. A field or a tab grows to 44 px. A button, a toggle, a link part or a nav item keeps its box and takes the `hit-area` utility, which needs a positioned host. A row of nav items wraps on a 44 px pitch, and rail cells at 36 px carry a hit area.

## shape

- Radius 0 everywhere.
- Edges are 1 px.
- Horizontal rules belong to the page: they run to both window edges, past every column.

## focus

- **Controls** (buttons, tabs, links, rail cells) take a 2 px plum ring at a 2 px offset. The tokens' base layer draws it on `:focus-visible` for every control role and anything else in the tab order. Inside the ship's nav the ring prints in `sidebar-foreground`, so the nav holds no plum.
- **Fields** (input, textarea, input group, the select trigger) own their focus. While the text control holds focus, the box's 1 px edge becomes a 2 px edge drawn inside it (`outline: 2px` at `-2px` offset, in `--fx`) and the caret takes the same ink. `--fx` is plum, or the error ink when the field is invalid. The text never moves, and a disabled field takes no focus.
- **A button inside a field** (clear, reveal, a toggle) keeps its own 2 px ring, drawn inside itself, and the box stays at 1 px.
- **The code patch's copy link** draws its ring 4 px inside itself, in plum's dark value.

Every focusable element shows its ring or its edge. `outline-none` and `outline-hidden` stay out of the code: in Tailwind 4 both remove the ring.

## elevation

One light from the upper left: shadows fall right and down at 3:2 and grow with the lift.

| lift     | shadow              | where                                       |
| -------- | ------------------- | ------------------------------------------- |
| `slip`   | 6px 4px 6px -2px    | the lowest lift; no item uses it yet        |
| `leaf`   | 12px 8px 14px -4px  | select list, toast, a floating sidebar     |
| `sheet`  | 27px 18px 26px -6px | dialog, the board panel, the reading sheet  |
| `lifted` | 39px 26px 36px -8px | the highest lift; no item uses it yet       |

The utilities are `shadow-slip`, `shadow-leaf`, `shadow-sheet` and `shadow-lifted`. In light, a raised layer on stock prints its contact edge as a 50 percent screen 3 px right of the layer and 2 px below it. An app's own raised layer gets it the way the items do: `texture-contact` with `[--contact-lift:var(--elevation-<lift>-rake)]`, beside its `shadow-<lift>`. In dark the contact stays soft and the raised surface draws a 1 px lighter edge, because the dark ground is too near black for a shadow to show. The board and the reading sheet on the deep ground keep the soft shadow alone.

## motion

| duration           | ms  |
| ------------------ | --- |
| `--duration-instant` | 120 |
| `--duration-quick`   | 180 |
| `--duration-travel`  | 240 |

Every transition uses `--ease-brand`, `cubic-bezier(0.22, 1, 0.36, 1)`: changes start fast and ease into place. Motion follows an action; nothing moves on its own, and no screen ever moves. Reduced motion makes every duration zero, and state changes still show. For overlays, gestures and continuous updates, read [interaction craft](interaction-craft.md).
