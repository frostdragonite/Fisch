"""Scrape and filter fish for Masterline Bestiary requirements."""

from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timezone

from bs4 import BeautifulSoup

from api import fetch_category_members, fetch_page_thumbnails, fetch_parse_html
from utils import (
    clean_text,
    item_name_from_cell,
    rarity_from_bait_row,
    rarity_from_row,
    slugify,
    wiki_url,
    wiki_url_from_cell,
)

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
    return item_name_from_cell(cell)


def _load_bait_catalog() -> dict[str, dict[str, str]]:
    """Map bait name -> metadata from the List of Baits table on the Bait wiki page."""
    html = fetch_parse_html("Bait")
    soup = BeautifulSoup(html, "lxml")
    catalog: dict[str, dict[str, str]] = {}

    heading = soup.find(id="List_of_Baits")
    if not heading:
        return catalog

    table = heading.find_all_next("table", class_="fish-table", limit=1)
    if not table:
        return catalog

    for row in table[0].find_all("tr"):
        name_cell = row.find("td", class_="name")
        if not name_cell:
            continue
        name = item_name_from_cell(name_cell)
        if not name or name == "Name":
            continue

        rarity = rarity_from_bait_row(row)
        if not rarity:
            continue

        entry: dict[str, str] = {"rarity": rarity}
        wiki = wiki_url_from_cell(name_cell)
        if wiki:
            entry["wiki_url"] = wiki
        catalog[name] = entry

    return catalog


def _parse_bait_items(text: str, bait_catalog: dict[str, dict[str, str]]) -> list[dict]:
    cleaned = clean_text(text)
    if not cleaned or cleaned in ("None", "NONE!"):
        return []

    items: list[dict] = []
    for name in (part.strip() for part in cleaned.split(",")):
        if not name:
            continue
        info = bait_catalog.get(name, {})
        item: dict = {
            "name": name,
            "wiki_url": info.get("wiki_url") or wiki_url(name),
        }
        if info.get("rarity"):
            item["rarity"] = info["rarity"]
        items.append(item)

    return items


def _parse_fish_tables(html: str, bait_catalog: dict[str, str]) -> list[dict]:
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

            bait_text = clean_text(bait_cell.get_text()) if bait_cell else ""
            bait_items = _parse_bait_items(bait_text, bait_catalog)

            fish: dict = {
                "name": name,
                "bestiary_location": current_location,
                "weather": clean_text(weather_cell.get_text()) if weather_cell else "",
                "time": clean_text(time_cell.get_text()) if time_cell else "",
                "season": clean_text(season_cell.get_text()) if season_cell else "",
                "bait": bait_text,
                "wiki_url": wiki_url(name),
            }
            if bait_items:
                fish["bait_items"] = bait_items
            rarity = rarity_from_row(row)
            if rarity:
                fish["rarity"] = rarity

            fish_list.append(fish)

    return fish_list


def scrape_fish() -> dict:
    bait_catalog = _load_bait_catalog()
    html = fetch_parse_html("Fish")
    all_fish = _parse_fish_tables(html, bait_catalog)
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
                **({"rarity": fish["rarity"]} if fish.get("rarity") else {}),
                **({"bait_items": fish["bait_items"]} if fish.get("bait_items") else {}),
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
