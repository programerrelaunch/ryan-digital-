"""Fetch and parse portfolio items from shanewebguy.com/portfolio/"""
import json
import os
import re
import urllib.request
from html import unescape

BASE = os.path.dirname(os.path.abspath(__file__))
PAGES = [
    "https://shanewebguy.com/portfolio/",
    "https://shanewebguy.com/portfolio/page/2/",
    "https://shanewebguy.com/portfolio/page/3/",
]

pattern = re.compile(
    r'href="(https://shanewebguy\.com/wp-content/uploads/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"[^>]*'
    r'data-toggle="lightbox"[^>]*title="([^"]*)"[^>]*data-footer="([^"]*)"',
    re.I,
)


def fetch(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def main() -> None:
    items = []
    seen = set()

    for url in PAGES:
        print(f"Fetching {url}...")
        html = fetch(url)
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

    json_path = os.path.join(BASE, "portfolio-data.json")
    js_path = os.path.join(BASE, "portfolio-data.js")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
        f.write("\n")

    with open(js_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("window.PORTFOLIO_DATA = ")
        json.dump(items, f, ensure_ascii=False)
        f.write(";\n")

    print(f"Saved {len(items)} projects")
    print(f"  {json_path}")
    print(f"  {js_path}")


if __name__ == "__main__":
    main()
