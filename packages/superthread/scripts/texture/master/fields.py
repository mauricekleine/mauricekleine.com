"""Precomputed screened fields: the openers and the reading figure (as 1-bit plates) and the empty wedge.

An opener or a figure ships as two plates per mode, each a 1-bit mask. CSS prints each plate in its ink (the house ink
for the spot plate), so the house-ink switch re-inks it without new images. Light stacks key over the house; dark stacks
paper-white over the house on key stock. Every working page is so a true two-ink page: key plus the house ink.
"""
import pathlib

from ink import overprint
from opener import render, render_rope, fringe_field
from palette import KEY, PAPER
from png import write_indexed, write_mask, data_url
from screen import dither, FIGURE_KEY, FIGURE_SPOT

BUILD = pathlib.Path(__file__).resolve().parent.parent / "build"
BUILD.mkdir(exist_ok=True)

# the cord runs across the top of the band and dives to the right of the knocked-out title. the sketch's cord holds
# its height until x 557 so its shadow clears the title's knock box (0 inked pixels inside it, 24 px of air above);
# the phone plates (342 px, the band's width at 390) get their own path, so the s-curve survives the narrow band.
SKETCH_PATH = [(0.0, 0.25), (0.22, 0.17), (0.46, 0.2), (0.66, 0.22), (0.8, 0.28), (0.9, 0.62), (1.0, 0.72)]
REACH_PATH = [(0.0, 0.22), (0.2, 0.17), (0.42, 0.24), (0.6, 0.3), (0.74, 0.56), (0.88, 0.66), (1.0, 0.42)]
PHONE_PATH = [(0.0, 0.22), (0.25, 0.15), (0.5, 0.2), (0.66, 0.38), (0.8, 0.66), (0.92, 0.72), (1.0, 0.58)]
PHONE_W, PHONE_H, PHONE_WIDTH = 342, 200, 44


def palette(mode, spot):
    if mode == "light":
        return [PAPER, KEY, spot, overprint(KEY, spot)]
    return [KEY, PAPER, spot, PAPER]   # dark: where both print, the paper-white lies on top


def save(name, png):
    (BUILD / f"{name}.png").write_bytes(png)
    return data_url(png)


def opener_png(name, w, h, mode, spot, path=SKETCH_PATH, width=60):
    """The opener as one indexed image in fixed inks (the sketch, which has no switch)."""
    return save(name, write_indexed(render_rope(w, h, path, mode, width), palette(mode, spot)))


def opener_plates(name, w, h, mode, path=REACH_PATH, width=64):
    """The opener as two masks: 'first' (key in light, paper-white in dark) and 'spot' (the house ink)."""
    rows = render_rope(w, h, path, mode, width)
    first = [[v & 1 for v in r] for r in rows]
    spot = [[(v >> 1) & 1 for v in r] for r in rows]
    return {"first": save(f"{name}-first", write_mask(first)), "spot": save(f"{name}-spot", write_mask(spot))}


def figure_plates(name, w, h, mode):
    """The reading figure as two masks, 'first' and 'spot': two-slit fringes, the fringes counted as ink (key in light,
    paper-white in dark), on the figure's own finer screen pair. The stock is whatever sheet it prints on."""
    rows = render(w, h, fringe_field(w, h), mode, (FIGURE_KEY, FIGURE_SPOT), ground=(0.0, 0.0))
    first = [[v & 1 for v in r] for r in rows]
    spot = [[(v >> 1) & 1 for v in r] for r in rows]
    return {"first": save(f"{name}-first", write_mask(first)), "spot": save(f"{name}-spot", write_mask(spot))}


def wedge(name, w, h, mode, lo=0.035, hi=0.22):
    """An empty or loading place: a light wedge of the first ink in ordered dither, rising left to right."""
    stock, ink = (PAPER, KEY) if mode == "light" else (KEY, PAPER)
    rows = dither(w, h, lambda x, y: lo + (hi - lo) * (x / max(1, w - 1)))
    return save(name, write_indexed(rows, [stock, ink]))
