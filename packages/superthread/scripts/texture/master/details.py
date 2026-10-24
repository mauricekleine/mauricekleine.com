"""The screens in the components (steer 4): the details where a component carries the world's dither at its edges,
tracks, shadows and states, and the 1-bit masks that print them.

Every detail is the 4 x 4 bayer matrix from screen.py at a whole step, shipped as an svg mask of integer squares, so it
stays on whole css pixels at whole device-pixel ratios (each css pixel becomes a 2 x 2 block at 2x, never a blur). css
prints the mask in an ink (the house ink, the input edge, the shadow ink), so the house-ink switch and the mode re-ink
it. nothing here moves: the details are static in every motion setting. coverage is named in percent everywhere, as in
the rest of the world's dither: a 4 x 4 matrix prints steps of 6.25 percent, so 50 percent is 8 of its 16 cells.

The rule: never behind words, numbers, data or code; at most one detail per component; 50 percent (the half) is the
in-between state (a hover that previews the solid current bar or strip, the mixed checkbox, a control screened back
while disabled), solid is the settled one. a raised layer's screen is an edge, never a field.
"""
import base64

from screen import bayer_tile

LEVELS = {"b50": 50, "b19": 18.75}   # css custom property -> coverage in percent (a whole number of the 16 cells)


def cells(pct):
    """How many of the matrix's 16 cells print at this coverage."""
    n = pct * 16 / 100
    assert n == int(n), f"{pct} percent is not a whole number of the 16 cells"
    return int(n)


def tile_svg(pct):
    """The 4 x 4 bayer tile at pct percent as integer squares."""
    d = "".join(f"M{x} {y}h1v1h-1z" for x, y in bayer_tile(cells(pct)))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4" width="4" height="4" shape-rendering="crispEdges">'
            f'<path d="{d}"/></svg>')


def svg_url(svg):
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


# the contact edge on stock: the quarterly's soft rake lifts every layer at its own size (tokens.SHADOW: slip, leaf, sheet,
# lifted); in light its contact shadow, the short dark band right under the edge, prints as this screen instead of a
# blur: the shadow ink at 50 percent, 3 px right of the layer and 2 px below it at every lift, so the screen is an
# edge, never a field. the soft rake says how high, the screen says where the edge is. in dark the screen would print
# black on key, so dark layers keep the soft contact (reach.css).
CONTACT = {"x": 3, "y": 2, "pct": 50, "on": True}   # "on": False keeps the contact soft too (the alternative)


def tiles_css():
    """The mask custom properties the reach sheet's css reads: --b50, --b19 and the contact screen."""
    tiles = {**LEVELS, "rake-contact": CONTACT["pct"]}
    return ";".join(f'--{k}:url("{svg_url(tile_svg(v))}")' for k, v in tiles.items())


# each detail: the component, the detail, its job (the one-line caption in the reach sheet), the screen, where it shows
DETAILS = [
    {"key": "contact", "component": "raised layers: select list, toast, dialog", "detail": "contact edge",
     "job": "draws where a floating layer meets the page, under its soft lift",
     "screen": "light only: the contact shadow as the shadow ink (the key printed twice) at 50 percent, 3 px right of the layer and 2 px below it at every lift, inside the quarterly's soft rake; an edge, never a field, so no dots fall on the words beyond it. in dark it would print black on key, so dark layers keep the soft contact and lift by their stock and 1 px edge",
     "where": "(c) select, toast, dialog; (d) layers over the board; (h) elevation, on stock"},
    {"key": "mixed", "component": "checkbox", "detail": "mixed",
     "job": "some, not all: the classic half",
     "screen": "the house ink at 50 percent inside the box's house edge",
     "where": "(c) checkbox"},
    {"key": "tabhover", "component": "tabs", "detail": "hover bar",
     "job": "previews the current bar at half",
     "screen": "a 2 px bar of the house ink at 50 percent",
     "where": "(c) tabs, (d) the board's filters"},
    {"key": "rowedge", "component": "table", "detail": "row edge",
     "job": "marks the row under the pointer, beside its cells",
     "screen": "a 4 px strip of the house ink at 50 percent at the row's left edge, inside the first cell's 16 px of left padding, so it sits inside the table's box (a scrolling wrapper cannot clip it) and 12 px clear of the cell's content; solid when the row is selected",
     "where": "(c) table, (d) board"},
    {"key": "disabled", "component": "disabled button and field", "detail": "disabled edge",
     "job": "screened back: there, but not available now",
     "screen": "the input edge ink at 50 percent as the 1 px edge; the fill stays flat and the label plain",
     "where": "(c) button, input"},
    {"key": "skeleton", "component": "skeleton", "detail": "loading rows",
     "job": "the rows take shape before their words arrive",
     "screen": "the first ink at 18.75 percent, the empty wedge's top step, on whole-pixel bars",
     "where": "(c) empty and loading"},
]
BY_KEY = {d["key"]: d for d in DETAILS}

# what was considered and left out, with why (tokens.json texture, notes.md)
REJECTED = {
    "switch track": "the on state must read as settled ink at a glance, and the 18 px of track beside the knob is too short to carry a ramp",
    "slider fill": "no fleet surface has a slider yet, and a thumb marks an exact value: a dithered edge would blur the number it sets. progress stays the one quantity in motion",
    "sideways table fade": "the fade would sit on the cells it cuts, so on data",
    "drop zone": "no fleet surface takes uploads yet, and a screened edge already means disabled",
}


if __name__ == "__main__":
    for k, v in {**LEVELS, "rake-contact": CONTACT["pct"]}.items():
        print(k, v, cells(v), sorted(bayer_tile(cells(v))))
