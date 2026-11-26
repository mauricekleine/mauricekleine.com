# Interaction craft

Apply this guidance when configuring the items' Base UI primitives or building app-authored interactions. Use the primitive's behavior first. Motion stays on Superthread's three durations (120, 180 and 240 ms) and `--ease-brand`, every duration drops to zero under reduced motion, and focus follows the ring and field rules in [type and layout](type-and-layout.md).

## Core rules

1. **Grouped tooltips (F1).** Keep the initial tooltip delay to avoid accidental activation. Once one tooltip is open, adjacent tooltips in the same group appear without a new delay or entrance. Use the primitive's group behavior.
2. **Anchored overlays (F2).** An app-authored menu, popover or tooltip opens from its trigger. Use the origin supplied by the positioning primitive, including after a side flip. A centered dialog keeps a centered origin.
3. **Rapid state changes (F3).** Retarget from the current visible state. Use a CSS transition for a simple toggle or stack adjustment; use the existing motion runtime when the interaction needs velocity or more control.
4. **Interruption (F4).** When a gesture interrupts motion, continue from the on-screen position and velocity. A target stored in state is not the starting position. Keep input available while the surface moves.
5. **Direct manipulation (F5).** While dragging within the gesture's bounds, the surface follows the pointer one to one and preserves where it was grabbed. Capture the active pointer so crossing the surface edge does not break the drag.
6. **Release (F6).** Use recent signed release velocity when a custom gesture settles or dismisses. Continue that velocity into the existing spring using the runtime's velocity units. A short flick and a slow drag need not travel the same distance; keep the component's established thresholds.

## Hover feedback

Hover keeps a label's width: its font metrics stay the same through hover and selection. Feedback comes from the control's own hover role (`--primary-hover`, `--control-hover` and the rest), the tabs' screened hover bar, the table's row edge or the fleet rail's inverted cell. A transition carries the fill, edge and label colours only, so the focus ring appears at once.

## When a custom gesture reaches a boundary (F7)

Preserve the gesture primitive's resistance and settling at boundaries. An app-authored surface stays responsive at the edge, then returns or dismisses along a path consistent with where it came from. This guidance preserves existing gesture behavior; it does not require adding bounce or building a gesture.

## When related surfaces share hover state (F8)

Keep a continuous hit area. Crossing a visual gap in a toast stack or moving from a trigger into its content must not briefly collapse the interaction. Use the library's existing handling first.

## When drag or scroll values update continuously (F13)

Keep continuous values outside React's render cycle. Update the moving element or the existing motion value directly; avoid changing an inherited variable on a large parent every frame. Keep semantic theme values in the theme, and keep component textures still: only a proof plate's light breath or a progress fill moves.
