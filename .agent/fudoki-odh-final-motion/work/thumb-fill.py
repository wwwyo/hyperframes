import sys, os
from PIL import Image, ImageOps, ImageStat
src, out = sys.argv[1], sys.argv[2]
W, H = 256, 360  # 2x of 128x180 tile
os.makedirs(out, exist_ok=True)
res = []
for f in sorted(os.listdir(src)):
    im = Image.open(os.path.join(src, f)).convert("L")
    inv = ImageOps.invert(im).point(lambda v: 255 if v > 40 else 0)
    bb = inv.getbbox()
    if not bb: continue
    c = im.crop(bb)
    # scale so height fills H (cover)
    s = max(H / c.height, W / c.width)
    c = c.resize((max(W, round(c.width * s)), max(H, round(c.height * s))), Image.LANCZOS)
    best = None
    for x in range(0, c.width - W + 1, 8):
        for y in range(0, c.height - H + 1, 8):
            win = c.crop((x, y, x + W, y + H))
            bl = sorted(255 - ImageStat.Stat(win.crop((bx*W//3, by*H//4, (bx+1)*W//3, (by+1)*H//4))).mean[0] for bx in range(3) for by in range(4))
            ink = sum(bl[:4]) / 4
            if best is None or ink > best[0]: best = (ink, x, y)
    ink, x, y = best
    c.crop((x, y, x + W, y + H)).convert("RGB").save(os.path.join(out, f))
    res.append((ink, f, s))
res.sort(reverse=True)
for ink, f, s in res: print(f"{ink:.1f} {s:.2f} {f}")
