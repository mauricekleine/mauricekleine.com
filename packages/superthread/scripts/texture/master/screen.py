"""The 4 x 4 Bayer screen. Fields use 2 px cells; component tiles use 1 px."""

GRAIN = 2
SPOT_PHASE = 2

BAYER4 = [[0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5]]


def bayer(x, y):
    return (BAYER4[y % 4][x % 4] + 0.5) / 16


def screen_field(w, h, tone, phase=0):
    """Sample tone at each cell's centre and repeat the decision across its pixels."""
    rows = []
    for y in range(0, h, GRAIN):
        row = []
        for x in range(0, w, GRAIN):
            threshold = bayer(x // GRAIN + phase, y // GRAIN + phase)
            ink = int(tone(min(x + GRAIN // 2, w - 1), min(y + GRAIN // 2, h - 1)) > threshold)
            row.extend([ink] * min(GRAIN, w - x))
        rows.extend([row] * min(GRAIN, h - y))
    return rows


def bayer_tile(level):
    """The 4 x 4 cells inked at a coverage of level/16."""
    return [(x, y) for y in range(4) for x in range(4) if BAYER4[y][x] < level]


FAILED_TILE = [(0, 0), (1, 1), (2, 2), (3, 3), (3, 0), (2, 1), (1, 2), (0, 3)]  # an x lattice, 50 percent, never a bayer level
