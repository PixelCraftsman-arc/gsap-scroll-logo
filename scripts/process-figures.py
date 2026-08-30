#!/usr/bin/env python3
"""
Reprocess figure PNGs from img/original/ → img/

Preserves anti-aliased edge pixels (alpha 1–254). Only fills interior
voids (transparent pockets fully enclosed by line art) with stage bg so
type cannot show through gaps — without the hard flattening that removed
semi-transparent fringe pixels.

Usage: python3 scripts/process-figures.py
"""
from PIL import Image
from collections import deque
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "img", "original")
OUT = os.path.join(ROOT, "img")
BG = (245, 245, 245, 255)
ALPHA_VOID = 24


def fill_interior_holes(src_path, out_path):
    im = Image.open(src_path).convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_void(x, y):
        return px[x, y][3] < ALPHA_VOID

    exterior = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_void(x, y) and not exterior[y][x]:
                exterior[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_void(x, y) and not exterior[y][x]:
                exterior[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not exterior[ny][nx] and is_void(nx, ny):
                exterior[ny][nx] = True
                q.append((nx, ny))

    out = im.copy()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] < ALPHA_VOID and not exterior[y][x]:
                opx[x, y] = BG
    out.save(out_path, optimize=True)


if __name__ == "__main__":
    for name in sorted(os.listdir(SRC)):
        if name.endswith(".png"):
            fill_interior_holes(os.path.join(SRC, name), os.path.join(OUT, name))
            print("wrote", name)
