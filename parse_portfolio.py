import re
import json
import os
from html import unescape

BASE = os.path.dirname(os.path.abspath(__file__))
FILES = [
    os.path.join(BASE, "shanewebguy-portfolio.html"),
    os.path.join(BASE, "shanewebguy-portfolio-p2.html"),
    os.path.join(BASE, "shanewebguy-portfolio-p3.html"),
]

pattern = re.compile(
    r'href="(https://shanewebguy\.com/wp-content/uploads/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"[^>]*'
    r'data-toggle="lightbox"[^>]*title="([^"]*)"[^>]*data-footer="([^"]*)"',
    re.I,
)

items = []
seen = set()

for path in FILES:
    if not os.path.exists(path):
        continue
    html = open(path, encoding="utf-8", errors="ignore").read()
    for img, title, link in pattern.findall(html):
        title = unescape(title.strip())
        key = title.lower()
        if key in seen:
            continue
        seen.add(key)
        items.append({
            "title": title,
            "image": img.split("?")[0],
            "url": link.strip(),
        })

out = os.path.join(BASE, "portfolio-data.json")
js_out = os.path.join(BASE, "portfolio-data.js")
with open(out, "w", encoding="utf-8") as f:
    json.dump(items, f, indent=2, ensure_ascii=False)
    f.write("\n")

with open(js_out, "w", encoding="utf-8", newline="\n") as f:
    f.write("window.PORTFOLIO_DATA = ")
    json.dump(items, f, ensure_ascii=False)
    f.write(";\n")

print(f"Saved {len(items)} projects to {out}")
