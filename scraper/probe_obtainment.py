"""One-off probe: sample fish wiki pages for Obtainment / catch methods."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parent))

from api import fetch_parse_html
from utils import clean_text


def parse_obtainment(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    anchor = soup.find("span", id="Obtainment")
    heading = anchor.find_parent(["h2", "h3"]) if anchor else None
    if not heading:
        for h in soup.find_all(["h2", "h3"]):
            if "obtainment" in h.get_text().lower():
                heading = h
                break
    if not heading:
        return ""

    parts: list[str] = []
    for sib in heading.find_next_siblings():
        if sib.name in ("h2", "h3"):
            break
        parts.append(clean_text(sib.get_text()))
    return " ".join(parts)


def main() -> None:
    fish_json = Path(__file__).resolve().parents[1] / "frontend/src/assets/data/fish.json"
    with fish_json.open(encoding="utf-8") as f:
        data = json.load(f)

    names = sorted({fish["name"] for cat in data["categories"] for fish in cat["fish"]})
    special = ["Crab", "Lobster", "Shrimp", "Clownfish", "Ancient Depth Serpent", "Colossal Squid"]
    step = max(1, len(names) // 30)
    sample = sorted(set(special) | {names[i] for i in range(0, len(names), step)})[:40]

    keywords: dict[str, list[str]] = {}
    for name in sample:
        text = parse_obtainment(fetch_parse_html(name))
        print(f"--- {name} ---")
        print(text or "(empty)")
        print()
        lower = text.lower()
        for kw in (
            "fishing rod",
            "cage fishing",
            "crab cage",
            "net",
            "spear",
            "diving",
            "craft",
            "purchase",
            "quest",
            "event",
            "trident",
            "harpoon",
        ):
            if kw in lower:
                keywords.setdefault(kw, []).append(name)

    print("=== KEYWORD HITS ===")
    for kw, hits in sorted(keywords.items()):
        print(f"{kw}: {len(hits)} — e.g. {', '.join(hits[:3])}")


if __name__ == "__main__":
    main()
