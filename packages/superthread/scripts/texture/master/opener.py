"""The opener and the figures: duotones of one subject, screened in two inks.

A greyscale 'photograph' is computed first (a two-ply cord lying across the
stock for the opener; a two-slit fringe pattern for the reading figure);
duotone curves split it into two plates, each screened at its own angle.
Light mode prints key (shadows) and spot (midtones) on paper; the cord's
crests and the ground stay paper. Dark mode prints paper-white (highlights)
and spot (midtones) on key stock, so the cord is lit the same way on both.
"""
import math
from screen import halftone, OPENER_KEY, OPENER_SPOT


def catmull(points):
    """Smooth y(u) through (u, v) points, u ascending in 0..1."""
    pts = [points[0]] + points + [points[-1]]

    def y(u):
        for i in range(1, len(pts) - 2):
            if u <= pts[i + 1][0] or i == len(pts) - 3:
                p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
                t = (u - p1[0]) / max(1e-9, p2[0] - p1[0])
                t = max(-0.5, min(1.5, t))
                return 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t
                              + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t * t
                              + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t * t * t)
        return pts[-1][1]
    return y


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def rope_field(w, h, path, width=64, pitch=1.45):
    """field(x, y) -> (inside, grey, shadow). A two-ply cord lying on the stock, lit from the upper left.

    grey runs 0 black .. 1 white over the cord: each ply's crest catches the light and reaches paper, the
    crease between plies and the underside fall into the core shadow. Off the cord the ground is paper, with
    a soft cast shadow below and to the right (shadow 0..1)."""
    hw = width / 2
    yu = catmull(path)

    def f(x):
        return h * yu(x / w)

    def fp(x):
        return f(x + 0.5) - f(x - 0.5)

    arc = [0.0]
    for x in range(1, w + 80):
        arc.append(arc[-1] + math.hypot(1, fp(x)))

    lx, lz = -0.62, 0.78

    def field(x, y):
        d = (y - f(x)) / math.hypot(1, fp(x))
        if abs(d) < hw:
            c = d / hw
            z = math.sqrt(max(0.0, 1 - c * c))
            diffuse = max(0.0, lx * c + lz * z)
            s = arc[min(len(arc) - 1, max(0, x))]
            phase = s / (width * pitch) - math.asin(max(-1, min(1, c))) / math.pi
            psi = (2 * phase) % 1.0                                       # across one ply: 0 and 1 are creases
            ply = math.sin(math.pi * psi) ** 0.55
            lean = 0.5 + 0.5 * math.cos(2 * math.pi * (psi - 0.38))      # the flank facing the light is brighter
            g = diffuse ** 1.1 * (0.12 + 0.88 * ply) * (0.55 + 0.45 * lean)
            g += 0.65 * math.exp(-((c + 0.42) / 0.30) ** 2) * math.exp(-((psi - 0.40) / 0.13) ** 2)  # crest highlight
            g *= 1 - 0.62 * smooth(0.70, 1.0, c)                          # the underside turns into the core shadow
            g *= 1 - 0.35 * smooth(0.80, 1.0, -c)                         # a thin rim on the lit edge
            return True, min(1.0, max(0.0, g)), 0.0
        ds = (y - f(x - 9) - 14) / math.hypot(1, fp(x - 9))
        sh = max(0.0, 1 - (abs(ds) / (hw * 1.05)) ** 2) if abs(ds) < hw * 1.05 else 0.0
        return False, 1.0, sh

    return field


def rope_light(inside, g, sh):
    """Key and spot coverage on paper: key holds the shadows, spot the midtones, the crests stay paper."""
    if not inside:
        return 0.0, 0.22 * sh ** 1.5                                      # the cast shadow, spot only, fading to paper
    k = 0.92 * max(0.0, min(1.0, (0.37 - g) / 0.37)) ** 1.15
    s = 0.80 * smooth(0.96, 0.42, g) - 0.30 * smooth(0.30, 0.0, g)       # spot thins in the deepest shadow so key dots show
    return k, max(0.0, s)


OPENER_PAPER_CAP = 0.78   # the opener's paper-white plate never prints solid either


def rope_dark(inside, g, sh):
    """Paper-white and spot on key stock: white holds the crests, spot the midtones, the stock is the shadow."""
    if not inside:
        return 0.0, 0.0
    wt = OPENER_PAPER_CAP * max(0.0, min(1.0, (g - 0.52) / 0.45)) ** 1.1
    s = 0.82 * smooth(0.0, 0.48, g) * (1 - 0.5 * smooth(0.75, 1.0, g))
    return wt, max(0.0, s)


def render_rope(w, h, path, mode, width=64):
    """Rows of palette indexes for the opener: 0 stock, 1 first ink (key, or paper-white in dark), 2 spot, 3 both."""
    fld = rope_field(w, h, path, width)
    curve = rope_light if mode == "light" else rope_dark
    C = [[curve(*fld(x, y)) for x in range(w)] for y in range(h)]
    K = halftone(w, h, lambda x, y: C[y][x][0], OPENER_KEY)
    S = halftone(w, h, lambda x, y: C[y][x][1], OPENER_SPOT)
    return [[K[y][x] + 2 * S[y][x] for x in range(w)] for y in range(h)]


def fringe_field(w, h):
    """grey(x, y) for the reading figure: two-slit fringes under a single-slit envelope, on a light stock."""
    cx = w / 2

    def grey(x, y):
        u = (x - cx) / w
        env = (math.sin(9.0 * u) / (9.0 * u)) ** 2 if abs(u) > 1e-6 else 1.0
        fr = math.cos(math.pi * u * 13.0) ** 2
        v = abs(y - h / 2) / (h / 2)
        vert = max(0.0, 1 - v ** 6)
        intensity = env * fr * vert
        return 1 - intensity  # bright fringes print as ink, like a photographic negative read as tone
    return grey


# white on key spreads (irradiation), so in dark the paper-white plate stops short of solid: the brightest
# fringe cores keep visible dots and read as a printed screen, never as a lit tube.
PAPER_CAP = 0.72


def key_curve(g):
    return max(0.0, min(1.0, (0.46 - g) / 0.46)) ** 1.0


def spot_curve(g):
    return max(0.0, min(1.0, 1.1 * (1 - g) ** 0.6))


def split(grey, w, h, mode, ground=(0.03, 0.16)):
    """Coverage functions for the two inks from a greyscale field."""
    G = [[grey(x, y) for x in range(w)] for y in range(h)]
    lo, hi = ground

    def fountain(x):
        return lo + (hi - lo) * (x / max(1, w - 1))

    if mode == "light":
        def kt(x, y):
            return key_curve(G[y][x])

        def st(x, y):
            g = G[y][x]
            return fountain(x) if g >= 0.999 else max(fountain(x), spot_curve(g))
    else:  # the same plates; paper-white prints the key's plate on key stock, capped below solid
        def kt(x, y):
            return PAPER_CAP * key_curve(G[y][x])

        def st(x, y):
            g = G[y][x]
            return fountain(x) * 0.5 if g >= 0.999 else max(fountain(x) * 0.5, spot_curve(g))
    return kt, st


def render(w, h, grey, mode="light", lats=(OPENER_KEY, OPENER_SPOT), ground=(0.03, 0.16)):
    """Rows of palette indexes: 0 stock, 1 first ink (key, or paper-white in dark), 2 spot, 3 both."""
    kt, st = split(grey, w, h, mode, ground)
    K = halftone(w, h, kt, lats[0])
    S = halftone(w, h, st, lats[1])
    return [[K[y][x] + 2 * S[y][x] for x in range(w)] for y in range(h)]
