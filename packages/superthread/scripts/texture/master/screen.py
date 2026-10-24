"""Screens for the two-ink proof: rational-tangent halftone and 4 x 4 Bayer dither.

Halftone: each ink sits on an integer lattice (p, q), so every cell holds the
same p*p + q*q pixel offsets. The offsets are ranked by distance from the cell
centre (a round dot that grows outwards), and a pixel takes ink when the tone
there exceeds its rank. Coverage is therefore exact in whole pixels, the screen
is periodic and nothing is anti-aliased.
"""
import math

# 45 degrees for key, 75 degrees for spot, rational tangents of a ~7 px ruling
OPENER_KEY = (5, 5)    # pitch 7.071 px at 45.00 degrees, 50 px per cell
OPENER_SPOT = (2, 7)   # pitch 7.280 px at 74.05 degrees, 53 px per cell
# figures are smaller subjects, so they take a finer pair and the subject outweighs the screen
FIGURE_KEY = (4, 4)    # pitch 5.657 px at 45.00 degrees, 32 px per cell
FIGURE_SPOT = (5, 1)   # pitch 5.099 px at 11.31 degrees, 26 px per cell: 11 degrees off the vertical fringes, so edges barely lean

BAYER4 = [[0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5]]


def lattice_info(lat):
    p, q = lat
    return {"vector": [p, q], "pitch_px": round(math.hypot(p, q), 3),
            "angle_deg": round(math.degrees(math.atan2(q, p)), 2), "pixels_per_cell": p * p + q * q}


def threshold_map(lat):
    """Return f(x, y) -> threshold in (0, 1) for a round dot on lattice lat."""
    p, q = lat
    n = p * p + q * q

    def frac(x, y):
        # coordinates of the pixel centre in lattice units, as exact fractions of n
        u = ((2 * x + 1) * p + (2 * y + 1) * q) % (2 * n)
        v = (-(2 * x + 1) * q + (2 * y + 1) * p) % (2 * n)
        return u, v

    offsets = {}
    for y in range(2 * n):
        for x in range(2 * n):
            offsets.setdefault(frac(x, y), None)
    def dist(o):
        du = o[0] / (2 * n) - 0.5
        dv = o[1] / (2 * n) - 0.5
        return (du * du + dv * dv, math.atan2(dv, du))
    ranked = sorted(offsets, key=dist)
    rank = {o: (i + 0.5) / len(ranked) for i, o in enumerate(ranked)}
    return lambda x, y: rank[frac(x, y)]


def halftone(w, h, tone, lat):
    """tone(x, y) -> coverage 0..1. Returns rows of 0/1."""
    th = threshold_map(lat)
    return [[1 if tone(x, y) > th(x, y) else 0 for x in range(w)] for y in range(h)]


def bayer(x, y):
    return (BAYER4[y % 4][x % 4] + 0.5) / 16


def dither(w, h, tone):
    return [[1 if tone(x, y) > bayer(x, y) else 0 for x in range(w)] for y in range(h)]


def bayer_tile(level):
    """The 4 x 4 cells inked at a coverage of level/16."""
    return [(x, y) for y in range(4) for x in range(4) if BAYER4[y][x] < level]


FAILED_TILE = [(0, 0), (1, 1), (2, 2), (3, 3), (3, 0), (2, 1), (1, 2), (0, 3)]  # an x lattice, 50 percent, never a bayer level
