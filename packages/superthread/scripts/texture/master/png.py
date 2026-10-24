"""Minimal PNG writer and reader, standard library only."""
import base64
import struct
import zlib


def _chunk(kind, data):
    c = struct.pack(">I", len(data)) + kind + data
    return c + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def write_indexed(rows, palette):
    """rows: list of lists of palette indexes; palette: list of '#rrggbb'. Returns PNG bytes."""
    h, w = len(rows), len(rows[0])
    n = len(palette)
    depth = 1 if n <= 2 else 2 if n <= 4 else 4 if n <= 16 else 8
    per = 8 // depth
    raw = bytearray()
    for row in rows:
        raw.append(0)
        for i in range(0, w, per):
            byte = 0
            for j in range(per):
                v = row[i + j] if i + j < w else 0
                byte = (byte << depth) | v
            raw.append(byte)
    plte = b"".join(bytes(int(p[k:k + 2], 16) for k in (1, 3, 5)) for p in palette)
    return (b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, depth, 3, 0, 0, 0))
            + _chunk(b"PLTE", plte) + _chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + _chunk(b"IEND", b""))


def write_rgb(pixels, w, h):
    """pixels: flat list of (r, g, b) tuples, row major."""
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw.extend(pixels[y * w + x])
    return (b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
            + _chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + _chunk(b"IEND", b""))


def data_url(png):
    return "data:image/png;base64," + base64.b64encode(png).decode()


def read_rgb(path):
    """Decode an 8-bit RGB or RGBA non-interlaced PNG to (w, h, rows of bytes as RGB)."""
    data = open(path, "rb").read()
    pos, idat, w = 8, b"", None
    while pos < len(data):
        n = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + n]
        if kind == b"IHDR":
            w, h, depth, ctype = struct.unpack(">IIBB", body[:10])
            assert depth == 8 and ctype in (2, 6), (depth, ctype)
            bpp = 3 if ctype == 2 else 4
        elif kind == b"IDAT":
            idat += body
        pos += 12 + n
    raw = zlib.decompress(idat)
    stride = w * bpp
    rows, prev = [], bytearray(stride)
    for y in range(h):
        f = raw[y * (stride + 1)]
        line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            b = prev[i]
            c = prev[i - bpp] if i >= bpp else 0
            if f == 1:
                line[i] = (line[i] + a) & 255
            elif f == 2:
                line[i] = (line[i] + b) & 255
            elif f == 3:
                line[i] = (line[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        prev = line
        if bpp == 4:
            line = bytearray(v for i, v in enumerate(line) if i % 4 != 3)
        rows.append(bytes(line))
    return w, h, rows


def crop_scale(src, dst, box, k):
    """Crop box=(x, y, w, h) from an RGB(A) PNG and enlarge it k times, nearest neighbour."""
    w, h, rows = read_rgb(src)
    x0, y0, cw, ch = box
    out = []
    for y in range(ch):
        row = rows[y0 + y]
        line = []
        for x in range(cw):
            px = tuple(row[(x0 + x) * 3:(x0 + x) * 3 + 3])
            line.extend([px] * k)
        for _ in range(k):
            out.extend(line)
    open(dst, "wb").write(write_rgb(out, cw * k, ch * k))


def crop(src, dst, box):
    crop_scale(src, dst, box, 1)


def write_mask(rows):
    """A 1-bit mask PNG: 1 is opaque black, 0 fully transparent (tRNS). CSS masks with it, so any ink can print the plate."""
    h, w = len(rows), len(rows[0])
    raw = bytearray()
    for row in rows:
        raw.append(0)
        for i in range(0, w, 8):
            byte = 0
            for j in range(8):
                byte = (byte << 1) | (row[i + j] if i + j < w else 0)
            raw.append(byte)
    return (b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 1, 3, 0, 0, 0))
            + _chunk(b"PLTE", b"\x00\x00\x00\x00\x00\x00") + _chunk(b"tRNS", b"\x00\xff")
            + _chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + _chunk(b"IEND", b""))
