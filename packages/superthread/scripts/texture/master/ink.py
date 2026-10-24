"""Colour maths for the two-ink proof: oklch to sRGB, Murray-Davies tints, WCAG contrast.

Every role is a tint: a dot area of one ink over the stock. A screen of dots that
covers t of the stock reflects (1 - t) * stock + t * ink in linear light
(Murray-Davies), so a flat tint is computed the same way and equals the average
of its screened version exactly.
"""
import math


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def linear_to_srgb(c):
    c = min(1.0, max(0.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#" + "".join(f"{v:02x}" for v in rgb)


def hex_to_lin(h):
    return tuple(srgb_to_linear(v / 255) for v in hex_to_rgb(h))


def lin_to_hex(lin):
    return rgb_to_hex(tuple(round(linear_to_srgb(v) * 255) for v in lin))


def oklch_to_lin(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    return (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)


def lin_to_oklch(lin):
    r, g, b = lin
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (math.copysign(abs(v) ** (1 / 3), v) for v in (l, m, s))
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360


def in_gamut(lin, eps=1e-6):
    return all(-eps <= v <= 1 + eps for v in lin)


def oklch_hex(L, C, h):
    return lin_to_hex(oklch_to_lin(L, C, h))


def lum(h):
    r, g, b = hex_to_lin(h)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def tint(ink, stock, t):
    """t of `ink` over `stock` (0..1), Murray-Davies in linear light."""
    i, s = hex_to_lin(ink), hex_to_lin(stock)
    return lin_to_hex(tuple(sv * (1 - t) + iv * t for iv, sv in zip(i, s)))


def overprint(a, b):
    """Two transparent inks on top of each other multiply their reflectance."""
    return lin_to_hex(tuple(x * y for x, y in zip(hex_to_lin(a), hex_to_lin(b))))


def spot_at(h, Y, chroma_share):
    """The ink of hue h whose relative luminance is Y, at a share of the most chroma sRGB allows there."""
    def L_for(C):
        lo, hi = 0.0, 1.0
        for _ in range(60):
            mid = (lo + hi) / 2
            r, g, b = oklch_to_lin(mid, C, h)
            y = 0.2126 * r + 0.7152 * g + 0.0722 * b
            lo, hi = (mid, hi) if y < Y else (lo, mid)
        return (lo + hi) / 2
    lo, hi = 0.0, 0.4
    for _ in range(50):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if in_gamut(oklch_to_lin(L_for(mid), mid, h)) else (lo, mid)
    cmax = lo
    C = cmax * chroma_share
    L = L_for(C)
    return oklch_hex(L, C, h), (round(L, 3), round(C, 3), h), round(cmax, 3)
