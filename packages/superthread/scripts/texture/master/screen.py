"""A shared dot screen for fields and a one-pixel Bayer tile for details."""
from functools import lru_cache
from pathlib import Path
import os
import subprocess

GRAIN = 1
DOT_PITCH = 4
KEY_ANGLE = 45
PLUM_ANGLE = 15
PLATE_DPR = 2

BAYER4 = [[0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5]]


def bayer(x, y):
    return (BAYER4[y % 4][x % 4] + 0.5) / 16


def screen_field(w, h, tone):
    """Print a Bayer component detail at its final CSS dimensions."""
    return [[int(tone(x, y) > bayer(x, y)) for x in range(w)] for y in range(h)]


@lru_cache(maxsize=4)
def dot_planes(w, h):
    script = os.environ.get("SUPERTHREAD_DOTS", str(Path(__file__).resolve().parents[1] / "dots.ts"))
    data = subprocess.check_output(["bun", script, str(w * PLATE_DPR), str(h * PLATE_DPR), str(PLATE_DPR)])
    size = w * h * PLATE_DPR ** 2
    assert len(data) == 2 * size
    return data[:size], data[size:]


def print_dots(w, h, tones):
    """Read the two dot angles from the item's screen at 2 device pixels per CSS pixel."""
    key, spot = dot_planes(w, h)
    width = w * PLATE_DPR
    rows = []
    for y in range(h * PLATE_DPR):
        row = []
        for x in range(width):
            a, b = tones((x + 0.5) / PLATE_DPR, (y + 0.5) / PLATE_DPR)
            i = y * width + x
            row.append(int(a * 256 > key[i] + 0.5) + 2 * int(b * 256 > spot[i] + 0.5))
        rows.append(row)
    return rows


def bayer_tile(level):
    """The 4 x 4 cells inked at a coverage of level/16."""
    return [(x, y) for y in range(4) for x in range(4) if BAYER4[y][x] < level]


FAILED_TILE = [(0, 0), (1, 1), (2, 2), (3, 3), (3, 0), (2, 1), (1, 2), (0, 3)]  # an x lattice, 50 percent, never a bayer level
