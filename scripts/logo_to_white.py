#!/usr/bin/env python3
"""Recolor a logo to a flat white silhouette on a transparent background.

Brightness is treated as "ink": near-black pixels (the logo's dark field and
negative space) become transparent, everything else becomes opaque white, with
a smooth alpha ramp across edges so the mark stays crisp at small sizes.
Transparent margins are trimmed so the result fills its container.

Pure Pillow (no numpy).

Usage:
    python3 scripts/logo_to_white.py <input> <output.png> [lo] [hi] [--circle]

  lo / hi    brightness (0-255) mapping to fully transparent / fully white.
             Defaults 45 / 130 keep dark fields out and bring mid-tone reds and
             whites up to solid white.
  --circle   keep only the inscribed circle (for round emblems whose marks are
             knocked out of a dark disk on a light field) so the corners and the
             disk's anti-aliased rim are dropped.
"""
import sys

from PIL import Image, ImageChops, ImageDraw


def smoothstep_lut(lo: float, hi: float) -> list[int]:
    lut = []
    for v in range(256):
        if v <= lo:
            a = 0.0
        elif v >= hi:
            a = 1.0
        else:
            t = (v - lo) / (hi - lo)
            a = t * t * (3 - 2 * t)  # smoothstep
        lut.append(round(a * 255))
    return lut


def main() -> None:
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    pos = [a for a in sys.argv[1:] if not a.startswith("--")]
    src, dst = pos[0], pos[1]
    lo = float(pos[2]) if len(pos) > 2 else 45.0
    hi = float(pos[3]) if len(pos) > 3 else 130.0

    img = Image.open(src).convert("RGBA")
    r, g, b, _ = img.split()
    ink = ImageChops.lighter(ImageChops.lighter(r, g), b)  # per-pixel max channel
    alpha = ink.point(smoothstep_lut(lo, hi))

    if "--circle" in flags:  # keep only the inscribed disk
        mask = Image.new("L", img.size, 0)
        inset = round(min(img.size) * 0.03)
        ImageDraw.Draw(mask).ellipse(
            [inset, inset, img.width - 1 - inset, img.height - 1 - inset], fill=255
        )
        alpha = ImageChops.multiply(alpha, mask)

    out = Image.new("RGBA", img.size, (255, 255, 255, 0))  # all white...
    out.putalpha(alpha)                                    # ...with the ramped alpha

    bbox = alpha.getbbox()                                 # trim transparent margins
    if bbox:
        out = out.crop(bbox)
    out.save(dst)
    print(f"wrote {dst} {out.size}")


if __name__ == "__main__":
    main()
