# colour

Every value here comes from `packages/superthread/tokens/master.json`, and the installed `superthread.css` carries each one as a CSS variable. App code names the role (`bg-primary`, `text-muted-foreground`, `border-input`); the hex values are here for checking a screen against the system.

## the wedge

Each neutral is a tint of the first ink over the stock, mixed in linear light (`color-mix(in srgb-linear, ...)`), so a flat tint equals the average of the screen that stands in for it.

| mode  | first ink         | steps, in percent                    |
| ----- | ----------------- | ------------------------------------ |
| light | key over white    | 100 98 88 78 64 48 32 20 12 5 0      |
| dark  | white over key    | 80 60 44 24 16 10 6 4 3 1 0          |

Each neutral role names its step: in light, `muted-foreground` is key 88, `input` key 78, `border` key 20, `secondary` key 12 and `muted` key 5.

## roles

| role                  | light     | dark      | note                                       |
| --------------------- | --------- | --------- | ------------------------------------------ |
| `background`          | `#ffffff` | `#16181d` | the stock                                  |
| `foreground`          | `#16181d` | `#e7e7e7` | the first ink                              |
| `card`, `popover`     | `#ffffff` | `#242629` |                                            |
| `primary`, `ring`     | `#aa337a` | `#c074a1` | the house ink                              |
| `primary-foreground`  | `#ffffff` | `#16181d` |                                            |
| `secondary`           | `#f1f1f1` | `#3e3e40` |                                            |
| `muted`               | `#f9f9f9` | `#242629` |                                            |
| `faint`               | `#f9f9f9` | `#2e2f32` | a disabled control's fill                  |
| `muted-foreground`    | `#646465` | `#b2b2b2` |                                            |
| `accent`              | `#f7f2f4` | `#503246` | a house tint                               |
| `selection`           | `#eee3e8` | `#71455f` | a house tint                               |
| `destructive`         | `#16181d` | `#e7e7e7` | the key ink, with the trash glyph and word |
| `border`              | `#e7e7e7` | `#37373a` |                                            |
| `input`               | `#838384` | `#888889` | a field's edge                             |
| `rule`                | `#16181d` | `#727273` | full-bleed rules and table heads           |
| `disabled`            | `#bfc0c0` | `#5c5c5e` |                                            |
| `ground`              | `#2e2f32` | `#0d0f12` | the deep ground                            |
| `ground-foreground`   | `#ffffff` | `#e7e7e7` | words flat on the deep ground              |
| `code`                | `#16181d` | `#0d0f12` | the code patch                             |

Two names differ from shadcn's habits. `--destructive` is the key ink. A status role's `-foreground` (`--success-foreground`) is that status's word ink, for words on its own fill.

## the house ink

Plum is the one control colour on every surface: primary actions, links, focus rings, the current item (nav, contents, the rail cell's outline), selection and accent tints, the progress fill, the second plate of the opener and figures, and the rail's home cell. A ship never sets a control colour, so every working page prints in two inks: key and plum.

| state   | light     | dark      |
| ------- | --------- | --------- |
| rest    | `#aa337a` | `#c074a1` |
| hover   | `#9a2f6f` | `#cd80ad` |
| pressed | `#8b2b65` | `#d88eb9` |

The label on plum clears 6.06:1 in light and 5.29:1 in dark. The other control states are key tints, carried as `--secondary-hover`, `--control-hover`, `--raised-hover` and `--destructive-hover`, each with a `-press` partner. A disabled control prints a faint fill and a disabled label.

The current item is boxed: a house tint fill, a 1 px house edge and an 8 px house square at its corner. Words inside accent and selection fills print in `foreground` or `muted-foreground`. Words in the house ink or a status ink sit on `background`, `card`, `muted`, `popover` or their own badge fill.

## statuses

Five states, at badge scale only. Each badge has a fill near the stock, a 1 px edge at about half strength, a 14 px glyph square and the word. The states part by glyph, word and square, never by colour alone.

| state   | role      | glyph   | light glyph / word    | dark glyph / word     |
| ------- | --------- | ------- | --------------------- | --------------------- |
| done    | `success` | tick    | `#5e6e42` / `#4c5a34` | `#95a67b` / `#95a67b` |
| running | `info`    | i       | `#405d7b` / `#3a5571` | `#94b0cd` / `#94b0cd` |
| waiting | `warning` | pause   | `#a48551` / `#6f562a` | `#e6c99a` / `#e6c99a` |
| failed  | `error`   | cross   | `#813933` / `#7c3832` | `#dca59a` / `#dca59a` |
| queued  | `neutral` | dash    | `#7d7e7e` / `#646465` | `#888889` / `#9f9f9f` |

- Each role has `-glyph`, `-foreground` (the word), `-wash` (the fill) and `-edge` variables. `Badge` takes the state as its variant (`<Badge variant="failed" />`) and prints the glyph and the word.
- Failed is the one solid badge, in madder: `--error-solid` `#843c36` in light, `#a55b4e` in dark, with `--error-solid-foreground` for its word. Its form makes it the most urgent state, so it never needs a louder ink.
- Failed is the fleet's one red. Error text and an invalid field's edge follow it, and a field's error message leads with the `bang` glyph (`FieldErrorGlyph`).
- Destructive actions print in the key ink with the trash glyph and the word.
- Glyphs clear 3:1 and words 4.5:1 on their fill.

## ship spots

Each ship has one bright spot. It prints in the ship's mark (so its rail cell and its fleet row) and in its chart series, and nowhere else: never on a control, never for a state.

| ship          | spot         | light     | dark      | line screen angle |
| ------------- | ------------ | --------- | --------- | ----------------- |
| orbit         | comet blue   | `#2d9ff2` | `#55acf3` | 45                |
| quanta        | quark green  | `#39b357` | `#4ec769` | 90                |
| trisys        | flare orange | `#e9772a` | `#f38745` | 27                |
| constellation | nova violet  | `#a970f0` | `#b085ec` | 63                |
| artifacts     | manila gold  | `#e3ae34` | `#e7b546` | 135               |
| telemetry     | tachyon teal | `#14b8a6` | `#2dd4bf` | 153               |
| soliton       | canal indigo | `#6272e9` | `#6a7be5` | 117               |

- The variables are `--ship-<id>`. Charts take `--chart-1` to `--chart-5`: orbit, constellation, quanta, artifacts, trisys.
- Every spot stays at least 10 from plum (oklab delta E x 100), and its dithered region clears 3:1 on its mark's tile.
- A large area of spot or status colour breaks the system. A ship is told apart by its mark.

## the deep ground

A ship surface prints on the deep ground, which is dark in both modes. Words flat on it (the ship's nav, a legend, a reading page's contents) print in `ground-foreground`. The rest of what prints flat on it takes the dark tokens in both modes, so plum prints as its dark value there. The working panel raised on it (the board, the reading sheet) takes the page's own mode. `FleetRail` sets this scope for the rail and the sidebar.

## the code patch

A code block or install line prints on a dark patch in both modes: key in light, the deep ground in dark. Its words are paper, package names and the copy link's focus ring print in plum's dark value `#c074a1`, and the ring sits 4 px inside the link (`--code-ring-offset: -4px`).
