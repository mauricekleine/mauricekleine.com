"""The ink drawer for the master: one key, white stock, one house ink, six ship spots and five status inks.

Every ink is set in oklch by hue, lightness and a share of the most chroma sRGB allows there, then reported as hex.
The house ink is the one primary on every surface (docs, every app's working page, every reading page): primary
actions, links, focus rings, the current item, selection and accent tints. It is one parameter with five candidates,
each tuned to pass every primary check in both modes. A ship keeps its identity in one bright value per mode:
  spot      the mark's dithered region (so the rail cell and the fleet row), and its series in a chart. it prints
            beside key, never under text and never on a control.
The retired alternative gave each ship a second, text-safe spot-ink as its own primary inside its surfaces
(SHIP_PRIMARY = "spot-ink"); its values stay in SHIPS_SPEC so that one change restores it.
"""

from ink import oklch_hex, oklch_to_lin, in_gamut, ratio, spot_at, hex_to_lin, lin_to_oklch

KEY = "#16181d"     # cool near-black, oklch(0.209 0.010 268): the first ink in light, the stock in dark
PAPER = "#ffffff"   # white stock, never cream: the stock in light, the first ink (paper-white) in dark


def at_L(L, h, share):
    """The ink of hue h at oklch lightness L with a share of the most chroma sRGB allows there."""
    lo, hi = 0.0, 0.4
    for _ in range(50):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if in_gamut(oklch_to_lin(L, m, h)) else (lo, m)
    return oklch_hex(L, lo * share, h)


def oklch_of(h):
    L, C, hue = lin_to_oklch(hex_to_lin(h))
    return f"oklch({L:.3f} {C:.3f} {hue:.1f})"


def max_chroma(L, h):
    lo, hi = 0.0, 0.4
    for _ in range(50):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if in_gamut(oklch_to_lin(L, m, h)) else (lo, m)
    return lo


def lch(L, C, h):
    """The ink at oklch (L, C, h), its chroma held inside sRGB."""
    return oklch_hex(L, min(C, max_chroma(L, h)), h)


# the house ink: plum, maurice's choice after steer 3. the switch keeps four more candidates as the record of the round
# (tachyon teal, thread violet, vermilion, ember); they pass every primary check in both modes as built, but nothing
# else is tuned for them any more: where a status or a ship spot sits near one, that is its named cost. dark plum is the
# exposure record's #d776aa calmed (less chroma, a little deeper, two degrees toward violet), so a primary button in
# dark reads as plum, not bubblegum. tachyon teal is hyperspeed's spot, free since hyperspeed left the fleet.
HOUSE = {
    "plum": {"name": "plum", "from": "the exposure record's filter", "light": "#aa337a", "dark": lch(0.655, 0.110, 344)},
    "teal": {"name": "tachyon teal", "from": "hyperspeed's spot, freed when hyperspeed left the fleet", "light": lch(0.510, 0.087, 195), "dark": lch(0.680, 0.085, 195)},
    "violet": {"name": "thread violet", "from": "the two-ink proof's house spot", "light": "#7235cc", "dark": "#9b7ae6"},
    "vermilion": {"name": "vermilion", "from": "the quarterly's primary", "light": "#d33a15", "dark": at_L(0.700, 36, 0.86)},
    "ember": {"name": "ember", "from": "today's thread, oklch(55% 0.13 55)", "light": oklch_hex(0.55, 0.13, 55), "dark": oklch_hex(0.72, 0.13, 55)},
}
HOUSE_DEFAULT = "plum"
HOUSE_LEADS = ("plum",)   # the house ink every floor in check.py is held against; the others are the record of the round

# who prints a ship's primary. "house": the house ink inside every ship, so every working page is a true two-ink page
# (key plus the house ink) and the switch re-inks the board and the reading page too. "spot-ink": the retired
# alternative, each ship's own text-safe ink as its primary, links and ring inside its surfaces (SHIPS_SPEC's last two
# columns, held by the floors check.py runs only then). set it here and rebuild to restore that.
SHIP_PRIMARY = "house"

# ships: hue, the bright spot per mode (L, share of the most chroma sRGB allows) and, for the retired alternative only,
# the spot-ink per mode (a luminance target for spot_at, or an explicit (L, C, h)). the bright spots sit between the
# proof's muted inks and the draft book's pastels, kept as built in steer 2 except soliton's, which moved from a deep
# gamut-edge indigo (L 0.50, C 0.215) up to the others' lightness. no spot sits within 10 OKLab of plum.
# the spot-ink columns are what SHIP_PRIMARY = "spot-ink" prints: round 2's text-safe inks, 10 from done, running and
# waiting bar the light clashes in SHIP_STATUS_CLASH, 3 from any stock tailwind colour, chroma 0.125 or less in dark.
SHIPS_SPEC = [
    # ship, ink name, hue, spot light, spot dark, ink light, ink dark
    ("orbit", "comet blue", 246, (0.680, 0.90), (0.720, 0.86), (0.360, 0.092, 246), (0.650, 0.125, 246)),
    ("quanta", "quark green", 148, (0.680, 0.86), (0.740, 0.80), (0.344, 0.100, 148), (0.640, 0.125, 146)),
    ("trisys", "flare orange", 50, (0.690, 0.90), (0.730, 0.84), 0.150, (0.710, 0.125, 50)),
    ("constellation", "nova violet", 302, (0.660, 0.86), (0.700, 0.80), (0.480, 0.150, 308), (0.740, 0.125, 314)),
    ("artifacts", "manila gold", 84, (0.780, 0.90), (0.800, 0.84), 0.140, (0.710, 0.125, 82)),
    ("soliton", "canal indigo", 274, (0.600, 0.180), (0.620, 0.160), (0.480, 0.150, 280), (0.650, 0.119, 274)),
]
SHIP_INK_CMAX = {"dark": 0.125}
# the alternative only: the light spot-inks that sit inside the 10 floor from a chromatic status, the states they sit
# near, and the nearest ink that clears it. each would cost the hue (warm inks turn brown, indigo turns navy).
SHIP_STATUS_CLASH = {
    ("trisys", "light"): (("waiting",), "#702901, a brown"),
    ("artifacts", "light"): (("waiting", "done"), "#4b4836, an olive grey"),
    ("soliton", "light"): (("running",), "#724aab, constellation's violet, or #402d8c, a navy"),
}

# status: the sanctioned exception to one colour, at badge scale only. each state has a glyph colour (the square: 3:1
# on the page and on its own fill), a word colour (4.5:1 on its fill), a fill and an edge (the glyph over the stock at
# EDGE in linear light: the square carries the colour, the edge draws the box). failed is the one solid badge, so it is
# the most urgent state by its form, not by its ink. one red serves every house ink: the switch's other candidates pay
# a named cost where it sits near them. queued is a key tint.
#
# three levels, one constant apart (STATUS_LEVEL). each: the three chromatic states as (state, role, glyph, hue, light
# glyph (L, C), light word (L, C), dark glyph and word (L, C)); failed's glyph, word and solid per mode as (L, C, hue);
# the light fill (L, C) in each state's hue; the dark fill as the glyph's share over key; the edge share per mode; queued
# as key (paper in dark) shares for glyph, word and fill; and the chroma ceilings check.py holds. queued's dark word
# sits at 0.34 from steer 3 on, level with done's, so the inactive state never outshines an active one in dark.
#   steer 2   as built before steer 3 (snapshots/master-judge-fixed): chroma 0.10 to 0.12, failed brick at 0.15, pale
#             tinted fills. kept to print the ladder's first column; check.py proves it still matches the snapshot.
#   steer 3   the default. dusty printing inks in plum's register: done, running and waiting glyphs at chroma 0.052 to
#             0.079 and a little deeper (failed's glyph and solid at 0.10),
#             light fills at the stock (chroma 0.010), dark fills a 6 percent tint, failed a deep madder at chroma 0.10.
#             sage-olive done (125), slate running (250), ochre waiting (80); lightness staggered (light: failed 0.44,
#             running 0.47, done 0.515, queued 0.59, waiting 0.635; dark: queued 0.63, done 0.70, running 0.745,
#             failed 0.77, waiting 0.85) so the states part under deuteranopia and protanopia by value as well as by glyph.
#   calmer    one step calmer still, the alternative: chroma down about a third again, the light fill on the stock
#             (chroma 0.005), a 4 percent dark fill and failed at chroma 0.085. it lowers chroma only: same hues and
#             lightnesses, so dark waiting keeps L 0.85 and stays the brightest square.
STATUS_LEVELS = {
    "steer 2": {
        "spec": [("done", "success", "tick", 130, (0.560, 0.120), (0.450, 0.110), (0.740, 0.110)),
                 ("running", "info", "i", 262, (0.540, 0.120), (0.460, 0.110), (0.750, 0.100)),
                 ("waiting", "warning", "pause", 70, (0.520, 0.110), (0.470, 0.095), (0.840, 0.100))],
        "failed": {"name": "brick",
                   "light": {"glyph": (0.440, 0.150, 33), "text": (0.470, 0.140, 33), "solid": (0.500, 0.150, 33)},
                   "dark": {"glyph": (0.600, 0.135, 37), "text": (0.780, 0.085, 38), "solid": (0.560, 0.140, 33)}},
        "light fill": (0.950, 0.025), "dark fill": 0.10, "edge": {"light": 0.60, "dark": 0.40},
        "queued": {"light": (0.78, 0.88, 0.05), "dark": (0.30, 0.50, 0.02)},
        "cmax": {"glyph": 0.120, "failed": 0.150, "light fill": 0.025},
    },
    "steer 3": {
        "spec": [("done", "success", "tick", 125, (0.515, 0.068), (0.445, 0.060), (0.700, 0.062)),
                 ("running", "info", "i", 250, (0.470, 0.060), (0.440, 0.056), (0.745, 0.052)),
                 ("waiting", "warning", "pause", 80, (0.635, 0.080), (0.470, 0.070), (0.850, 0.070))],
        "failed": {"name": "madder",
                   "light": {"glyph": (0.440, 0.100, 27), "text": (0.430, 0.095, 27), "solid": (0.450, 0.100, 27)},
                   "dark": {"glyph": (0.770, 0.068, 31), "text": (0.770, 0.068, 31), "solid": (0.555, 0.100, 31)}},
        "light fill": (0.975, 0.010), "dark fill": 0.06, "edge": {"light": 0.60, "dark": 0.40},
        "queued": {"light": (0.80, 0.88, 0.04), "dark": (0.24, 0.34, 0.02)},
        "cmax": {"glyph": 0.080, "failed": 0.110, "light fill": 0.012},
    },
    "calmer": {
        "spec": [("done", "success", "tick", 125, (0.515, 0.046), (0.445, 0.040), (0.700, 0.042)),
                 ("running", "info", "i", 250, (0.470, 0.042), (0.440, 0.040), (0.745, 0.036)),
                 ("waiting", "warning", "pause", 80, (0.635, 0.056), (0.470, 0.048), (0.850, 0.048))],
        "failed": {"name": "madder",
                   "light": {"glyph": (0.440, 0.085, 27), "text": (0.430, 0.080, 27), "solid": (0.450, 0.085, 27)},
                   "dark": {"glyph": (0.770, 0.050, 31), "text": (0.770, 0.050, 31), "solid": (0.555, 0.085, 31)}},
        "light fill": (0.982, 0.005), "dark fill": 0.04, "edge": {"light": 0.60, "dark": 0.40},
        "queued": {"light": (0.80, 0.88, 0.03), "dark": (0.24, 0.34, 0.02)},
        "cmax": {"glyph": 0.056, "failed": 0.085, "light fill": 0.006},
    },
}
STATUS_LEVEL = "steer 3"      # the alternative, one step calmer: "calmer"
LADDER = ("steer 2", "steer 3", "calmer")
STATUS_SPEC = STATUS_LEVELS[STATUS_LEVEL]["spec"]
FAILED = STATUS_LEVELS[STATUS_LEVEL]["failed"]
FAILED_CMAX = STATUS_LEVELS[STATUS_LEVEL]["cmax"]["failed"]
LIGHT_FILL = STATUS_LEVELS[STATUS_LEVEL]["light fill"]
EDGE = STATUS_LEVELS[STATUS_LEVEL]["edge"]
HOUSE_NOTE = {"ember": "with erode heads on white it carries two of ivory's three traits",
              "teal": "on key in dark it is one cool accent on near-black, so it stays at chroma 0.085 to print as an ink, not a glow"}
QUEUED = {"state": "queued", "role": "neutral", "glyph": "dash"}


def ships():
    out = {}
    def ink(spec, spot, share):
        if spec is None:
            return spot
        if isinstance(spec, tuple):
            return lch(*spec)
        return spot_at(h, spec, share)[0]

    for ship, name, h, sl, sd, il, idk in SHIPS_SPEC:
        # a spot is (L, share of the gamut's chroma) when the share is above 0.5, else (L, C)
        spot_l = at_L(sl[0], h, sl[1]) if sl[1] > 0.5 else lch(sl[0], sl[1], h)
        spot_d = at_L(sd[0], h, sd[1]) if sd[1] > 0.5 else lch(sd[0], sd[1], h)
        ink_l = ink(il, spot_l, 0.80)
        ink_d = ink(idk, spot_d, 0.74)
        assert lin_to_oklch(hex_to_lin(ink_d))[1] <= SHIP_INK_CMAX["dark"] + 0.002, ship
        out[ship] = {"name": name, "hue": h,
                     "spot": {"light": spot_l, "dark": spot_d},
                     "ink": {"light": ink_l, "dark": ink_d}}
    return out


def failed(level=STATUS_LEVEL):
    """failed's inks at one level, both modes: glyph, text, fill, edge and the solid badge fill."""
    from ink import tint
    lv = STATUS_LEVELS[level]
    f = lv["failed"]
    out = {"role": "error", "glyph": "cross", "ink": f["name"], "hue": f["light"]["glyph"][2]}
    for mode in ("light", "dark"):
        v = {k: lch(*f[mode][k]) for k in ("glyph", "text", "solid")}
        v["fill"] = lch(*lv["light fill"], f["light"]["glyph"][2]) if mode == "light" else tint(v["glyph"], KEY, lv["dark fill"])
        v["edge"] = v["solid"]
        out[mode] = v
    return out


def status(level=STATUS_LEVEL):
    """The five states at one level (STATUS_LEVELS): one red for every house ink."""
    from ink import tint
    lv = STATUS_LEVELS[level]
    e = lv["edge"]
    out = {}
    for st, role, glyph, h, gl, tl, gd in lv["spec"]:
        g_l, t_l = lch(*gl, h), lch(*tl, h)
        g_d = lch(*gd, h)
        out[st] = {"role": role, "glyph": glyph, "hue": h,
                   "light": {"glyph": g_l, "text": t_l, "fill": lch(*lv["light fill"], h), "edge": tint(g_l, PAPER, e["light"])},
                   "dark": {"glyph": g_d, "text": g_d, "fill": tint(g_d, KEY, lv["dark fill"]), "edge": tint(g_d, KEY, e["dark"])}}
    out["failed"] = failed(level)
    ql, qd = lv["queued"]["light"], lv["queued"]["dark"]
    q_l, q_d = tint(KEY, PAPER, ql[0]), tint(PAPER, KEY, qd[0])
    out["queued"] = {"role": "neutral", "glyph": "dash", "hue": None,
                     "light": {"glyph": q_l, "text": tint(KEY, PAPER, ql[1]), "fill": tint(KEY, PAPER, ql[2]), "edge": tint(q_l, PAPER, e["light"])},
                     "dark": {"glyph": q_d, "text": tint(PAPER, KEY, qd[1]), "fill": tint(PAPER, KEY, qd[2]), "edge": tint(q_d, KEY, e["dark"])}}
    return {s: out[s] for s in ["done", "running", "waiting", "failed", "queued"]}


ORDER = ["done", "running", "waiting", "failed", "queued"]


if __name__ == "__main__":
    for k, v in HOUSE.items():
        print(f"house {k:10} {v['light']} w{ratio(v['light'], PAPER):.2f}  {v['dark']} k{ratio(v['dark'], KEY):.2f}")
    for k, v in ships().items():
        print(f"{k:14} {v['name']:14} spot {v['spot']['light']} {v['spot']['dark']}  ink {v['ink']['light']} w{ratio(v['ink']['light'], PAPER):.2f} {v['ink']['dark']} k{ratio(v['ink']['dark'], KEY):.2f}")
    for k, v in status().items():
        print(k, v["light"], v["dark"])
