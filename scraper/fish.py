"""Scrape and filter fish for Masterline Bestiary requirements."""

from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timezone

from bs4 import BeautifulSoup

from api import fetch_category_members, fetch_page_thumbnails, fetch_parse_html
from utils import clean_text, slugify, wiki_url

FISH_EXCLUSION_CATEGORIES = [
    "Secret Fish",
    "Apex Fish",
    "Divine Secret Fish",
    "Limited Fish",
]

SECTION_RE = re.compile(
    r"There are \d+ Fish in (?:the )?(.+?) Bestiary:",
    re.IGNORECASE,
)


def _load_excluded_fish() -> set[str]:
    excluded: set[str] = set()
    for cat in FISH_EXCLUSION_CATEGORIES:
        excluded |= fetch_category_members(cat)
    return excluded


def _fish_name_from_cell(cell) -> str | None:
    text_link = cell.select_one(".item-text a") or cell.find("a", title=True)
    if text_link:
        name = clean_text(text_link.get_text()) or clean_text(text_link.get("title", ""))
        if name:
            return name
    return clean_text(cell.get_text()) or None


def _parse_fish_tables(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    fish_list: list[dict] = []
    current_location: str | None = None

    for element in soup.find_all(["p", "table"]):
        if element.name == "p":
            text = clean_text(element.get_text())
            match = SECTION_RE.search(text)
            if match:
                current_location = match.group(1).strip()
            continue

        if not current_location:
            continue

        if not element.find("td", class_="fish-name"):
            continue

        for row in element.find_all("tr"):
            name_cell = row.find("td", class_="fish-name")
            if not name_cell:
                continue

            name = _fish_name_from_cell(name_cell)
            if not name or name == "Name":
                continue

            weather_cell = row.find("td", class_="fish-weather")
            time_cell = row.find("td", class_="fish-time")
            season_cell = row.find("td", class_="fish-season")
            bait_cell = row.find("td", class_="fish-bait")

            fish_list.append(
                {
                    "name": name,
                    "bestiary_location": current_location,
                    "weather": clean_text(weather_cell.get_text()) if weather_cell else "",
                    "time": clean_text(time_cell.get_text()) if time_cell else "",
                    "season": clean_text(season_cell.get_text()) if season_cell else "",
                    "bait": clean_text(bait_cell.get_text()) if bait_cell else "",
                    "wiki_url": wiki_url(name),
                }
            )

    return fish_list


def scrape_fish() -> dict:
    html = fetch_parse_html("Fish")
    all_fish = _parse_fish_tables(html)
    excluded = _load_excluded_fish()

    required_candidates: list[dict] = []
    excluded_count = 0

    for fish in all_fish:
        if fish["name"] in excluded:
            excluded_count += 1
            continue
        required_candidates.append(fish)

    thumbnails = fetch_page_thumbnails([f["name"] for f in required_candidates])

    required: list[dict] = []
    for fish in required_candidates:
        required.append(
            {
                "id": slugify(fish["name"]),
                "name": fish["name"],
                "bestiary_location": fish["bestiary_location"],
                "weather": fish["weather"] or None,
                "time": fish["time"] or None,
                "season": fish["season"] or None,
                "bait": fish["bait"] or None,
                "wiki_url": fish["wiki_url"],
                "image_url": thumbnails.get(fish["name"]),
            }
        )

    by_location: dict[str, list[dict]] = defaultdict(list)
    for fish in required:
        by_location[fish["bestiary_location"]].append(fish)

    categories = [
        {"name": loc, "fish": by_location[loc]}
        for loc in sorted(by_location.keys())
    ]

    return {
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "wiki_version_note": f"{len(all_fish)} total fish scraped",
        "categories": categories,
        "meta": {
            "total_required": len(required),
            "total_excluded": excluded_count,
            "total_scraped": len(all_fish),
        },
    }
