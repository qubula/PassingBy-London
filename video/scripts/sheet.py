# Contact sheet of out/stills for a quick look: python3 scripts/sheet.py ID f1 f2 ...
import sys
from PIL import Image
idn, frames = sys.argv[1], sys.argv[2:]
cols = 4 if len(frames) > 9 else 3
ims = [Image.open(f'out/stills/{idn}-{f}.png').convert('RGB') for f in frames]
w, h = ims[0].size
s = 420 / h if w < h else 300 / h
ims = [im.resize((int(w * s), int(h * s))) for im in ims]

W = Image.new('RGB', (cols * ims[0].width + (cols - 1) * 8, ((len(ims) + cols - 1) // cols) * (ims[0].height + 8)), 'white')
for i, im in enumerate(ims): W.paste(im, ((i % cols) * (im.width + 8), (i // cols) * (im.height + 8)))
W.save(f'out/sheet-{idn}.jpg', quality=85)
