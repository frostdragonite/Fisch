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
    normalize_rarity_slug,
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
    "Admin-Exclusive Fish",
]

# Wiki section titles → display names used in the app.
LOCATION_DISPLAY_NAMES = {
    "Depths": "The Depths",
}


def _optional_field(value: str | None) -> str | None:
    cleaned = clean_text(value or "")
    if not cleaned or cleaned.lower() == "none":
        return None
    return cleaned


def _normalize_location(raw: str | None) -> str | None:
    cleaned = _optional_field(raw)
    if not cleaned:
        return None
    return LOCATION_DISPLAY_NAMES.get(cleaned, cleaned)


def _display_source(methods: list[str]) -> str | None:
    """Return non-Fishing-Rod sources for display, or None if rod-only."""
    non_rod = [method for method in methods if method != "Fishing Rod"]
    if not non_rod:
        return None
    return ", ".join(non_rod)


def _parse_sources_from_infobox(content) -> list[str]:
    """Read catch-method names from the Sources infobox row."""
    methods: list[str] = []
    for link in content.find_all("a"):
        title = clean_text(link.get("title", "") or link.get_text())
        if not title or title in methods:
            continue
        methods.append(title)
    return methods


def _parse_fish_infobox(html: str, bait_catalog: dict[str, dict[str, str]]) -> dict:
    """Extract fish metadata from the wiki infobox (authoritative per-fish page data)."""
    soup = BeautifulSoup(html, "lxml")
    box = soup.find(class_="infobox")
    if not box:
        return {}

    rows: dict[str, object] = {}
    for row in box.find_all(class_="infobox-datarow"):
        heading = row.find(class_="data-heading")
        content = row.find(class_="data-content")
        if heading and content:
            rows[clean_text(heading.get_text())] = content

    result: dict = {}

    rarity_content = rows.get("Rarity")
    if rarity_content:
        rarity_el = rarity_content.find(class_=re.compile(r"rarity-(?!link)"))
        if rarity_el:
            for cls in rarity_el.get("class", []):
                if cls.startswith("rarity-") and cls != "rarity-link":
                    result["rarity"] = normalize_rarity_slug(cls.removeprefix("rarity-"))
                    break

    location_content = rows.get("Location")
    if location_content:
        raw = clean_text(location_content.get_text())
        if raw:
            result["bestiary_location"] = LOCATION_DISPLAY_NAMES.get(raw, raw)

    for field, key in (
        ("Weather", "weather"),
        ("Time", "time"),
        ("Season", "season"),
        ("Bait", "bait"),
    ):
        content = rows.get(field)
        if content is None:
            continue
        value = clean_text(content.get_text())
        result[key] = "" if value in ("", "None") else value

    sources_content = rows.get("Sources")
    if sources_content:
        source = _display_source(_parse_sources_from_infobox(sources_content))
        if source:
            result["source"] = source

    bait_text = result.get("bait", "")
    if bait_text:
        bait_items = _parse_bait_items(bait_text, bait_catalog)
        if bait_items:
            result["bait_items"] = bait_items

    return result


def _load_fish_page_details(
    fish_names: list[str], bait_catalog: dict[str, dict[str, str]]
) -> dict[str, dict]:
    """Fetch each fish wiki page and map name -> infobox metadata."""
    details: dict[str, dict] = {}
    total = len(fish_names)

    for index, name in enumerate(fish_names, start=1):
        if index % 50 == 0 or index == total:
            print(f"  Fish pages: {index}/{total}", flush=True)
        html = fetch_parse_html(name)
        details[name] = _parse_fish_infobox(html, bait_catalog)

    return details


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


def _parse_all_fish_table(html: str, bait_catalog: dict[str, dict[str, str]]) -> list[dict]:
    """Parse the master fish list from the All Fish wiki page."""
    soup = BeautifulSoup(html, "lxml")
    fish_list: list[dict] = []

    table = soup.find("table", class_="fish-table")
    if not table:
        return fish_list

    for row in table.find_all("tr"):
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
        location_cell = row.find("td", class_="fish-loc")
        radar_cell = row.find("td", class_="fish-radar")

        bait_text = clean_text(bait_cell.get_text()) if bait_cell else ""
        bait_items = _parse_bait_items(bait_text, bait_catalog)
        table_location = (
            _normalize_location(location_cell.get_text()) if location_cell else None
        )
        gps = (
            _optional_field(radar_cell.get_text()) if radar_cell else None
        )

        fish: dict = {
            "name": name,
            "bestiary_location": table_location or "",
            "weather": clean_text(weather_cell.get_text()) if weather_cell else "",
            "time": clean_text(time_cell.get_text()) if time_cell else "",
            "season": clean_text(season_cell.get_text()) if season_cell else "",
            "bait": bait_text,
            "wiki_url": wiki_url(name),
        }
        if table_location:
            fish["table_location"] = table_location
        if gps:
            fish["gps"] = gps
        if bait_items:
            fish["bait_items"] = bait_items
        rarity = rarity_from_row(row)
        if rarity:
            fish["rarity"] = rarity

        fish_list.append(fish)

    return fish_list


def scrape_fish() -> dict:
    bait_catalog = _load_bait_catalog()
    html = fetch_parse_html("All_Fish")
    all_fish = _parse_all_fish_table(html, bait_catalog)
    excluded = _load_excluded_fish()

    seen_names: set[str] = set()
    required_candidates: list[dict] = []
    excluded_count = 0

    for fish in all_fish:
        if fish["name"] in seen_names:
            continue
        seen_names.add(fish["name"])
        if fish["name"] in excluded:
            excluded_count += 1
            continue
        required_candidates.append(fish)

    fish_names = [f["name"] for f in required_candidates]
    thumbnails = fetch_page_thumbnails(fish_names)
    print("Fetching fish details from wiki pages...", flush=True)
    page_details = _load_fish_page_details(fish_names, bait_catalog)

    required: list[dict] = []
    for fish in required_candidates:
        details = page_details.get(fish["name"], {})
        if details.get("rarity") == "extinct":
            excluded_count += 1
            continue

        location = (
            details.get("bestiary_location")
            or fish.get("table_location")
            or fish["bestiary_location"]
        )
        weather = details.get("weather", fish["weather"])
        time = details.get("time", fish["time"])
        season = details.get("season", fish["season"])
        bait = details.get("bait", fish["bait"])
        gps = fish.get("gps")

        entry: dict = {
            "id": slugify(fish["name"]),
            "name": fish["name"],
            "bestiary_location": location,
            "weather": weather or None,
            "time": time or None,
            "season": season or None,
            "bait": bait or None,
            "wiki_url": fish["wiki_url"],
            "image_url": thumbnails.get(fish["name"]),
        }
        if gps:
            entry["gps"] = gps
        rarity = details.get("rarity") or fish.get("rarity")
        if rarity:
            entry["rarity"] = rarity
        bait_items = details.get("bait_items") or fish.get("bait_items")
        if bait_items:
            entry["bait_items"] = bait_items
        source = details.get("source")
        if source:
            entry["source"] = source
        required.append(entry)

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
