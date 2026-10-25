# interaction craft

apply this guidance when configuring the items' Base UI primitives or building app-authored
interactions. use the primitive's behavior first. motion stays on superthread's three
durations (120, 180 and 240 ms) and `--ease-brand`, every duration drops to zero under
reduced motion, and focus follows the ring and field rules in
[type and layout](type-and-layout.md).

## core rules

1. **grouped tooltips (F1).** keep the initial tooltip delay to avoid accidental
   activation. once one tooltip is open, adjacent tooltips in the same group
   appear without a new delay or entrance. use the primitive's group behavior.
2. **anchored overlays (F2).** an app-authored menu, popover or tooltip opens from
   its trigger. use the origin supplied by the positioning primitive, including
   after a side flip. a centered dialog keeps a centered origin.
3. **rapid state changes (F3).** retarget from the current visible state. use a
   css transition for a simple toggle or stack adjustment; use the existing
   motion runtime when the interaction needs velocity or more control.
4. **interruption (F4).** when a gesture interrupts motion, continue from the
   on-screen position and velocity. a target stored in state is not the starting
   position. keep input available while the surface moves.
5. **direct manipulation (F5).** while dragging within the gesture's bounds, the
   surface follows the pointer one to one and preserves where it was grabbed.
   capture the active pointer so crossing the surface edge does not break the drag.
6. **release (F6).** use recent signed release velocity when a custom gesture
   settles or dismisses. continue that velocity into the existing spring using
   the runtime's velocity units. a short flick and a slow drag need not travel the
   same distance; keep the component's established thresholds.

## hover feedback

hover keeps a label's width: its font metrics stay the same through hover and
selection. feedback comes from the control's own hover role (`--primary-hover`,
`--control-hover` and the rest), the tabs' screened hover bar, the table's row
edge or the fleet rail's inverted cell. a transition carries the fill, edge and
label colours only, so the focus ring appears at once.

## when a custom gesture reaches a boundary (F7)

preserve the gesture primitive's resistance and settling at boundaries. an
app-authored surface stays responsive at the edge, then returns or dismisses
along a path consistent with where it came from. this guidance preserves existing
gesture behavior; it does not require adding bounce or building a gesture.

## when related surfaces share hover state (F8)

keep a continuous hit area. crossing a visual gap in a toast stack or moving from
a trigger into its content must not briefly collapse the interaction. use the
library's existing handling first.

## when drag or scroll values update continuously (F13)

keep continuous values outside react's render cycle. update the moving element
or the existing motion value directly; avoid changing an inherited variable on a
large parent every frame. keep semantic theme values in the theme, and keep every
screen still: texture never animates.
