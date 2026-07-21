from rembg import remove
from PIL import Image, ImageEnhance, ImageFilter
import io
import sys

src = sys.argv[1]
out = sys.argv[2]

with open(src, "rb") as f:
    data = f.read()

result = remove(data)
img = Image.open(io.BytesIO(result)).convert("RGBA")

w, h = img.size
scale = 1.35
img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

img = ImageEnhance.Contrast(img).enhance(1.08)
img = ImageEnhance.Sharpness(img).enhance(1.25)
img = ImageEnhance.Color(img).enhance(1.05)
img = ImageEnhance.Brightness(img).enhance(1.02)
img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=2))

img.save(out, format="PNG", optimize=True)
print(f"Saved {out} {img.size}")
