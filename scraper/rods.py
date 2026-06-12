"""Scrape and filter fishing rods for Masterline Rod Journal requirements."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone

from bs4 import BeautifulSoup

from api import fetch_category_members, fetch_parse_html
from utils import (
    clean_text,
    image_url_from_item_cell,
    item_slug_from_cell,
    parse_item_colors,
    slugify,
    wiki_url,
)

EXCLUDED_BY_NAME = frozenset(
    {"Brick Rod", "Crew Rod", "Dave Rod", "Masterline Rod"}
)

JOURNAL_CATEGORY_ORDER = [
    "Regionless",
    "Abyssal Zenith",
    "Ancient Archives",
    "Ancient Isle",
    "Apollo's Song of Light",
    "Atlantis",
    "Bellona's Frenzy of War",
    "Boreal Pines",
    "Brine Pool",
    "Calm Zone",
    "Carrot Garden",
    "Castaway Cliffs",
    "Challenger's Deep",
    "Coral Bastion",
    "Crimson Cavern",
    "Cryogenic Canal",
    "Crystal Cove",
    "Cultist Lair",
    "Cursed Isle",
    "Desolate Deep",
    "Everturn Forest",
    "Forsaken Shores",
    "Frigid Cavern",
    "Glacial Grotto",
    "Hades' Underworld of Indefinite",
    "Keepers Altar",
    "Living Garden",
    "Lost Jungle",
    "Luminescent Cavern",
    "Mineshaft",
    "Moosewood",
    "Mushgrove Swamp",
    "Nectar Den",
    "Ocean",
    "Olympian Fissure",
    "Overgrowth Caves",
    "Poseidon's Storm of Floods",
    "Roslit Bay",
    "Roslit Volcano",
    "Scoria Reach",
    "Sunken Reliquary",
    "Sunstone Island",
    "Terrapin Island",
    "The Depths",
    "Tidefall",
    "Toxic Grove",
    "Treasure Island",
    "Veil of the Forsaken",
    "Vertigo",
    "Volcanic Vents",
    "Zeus's Thunder of Chaos",
    "Northern Summit",
    "The Shady Bazaar",
    "Removed",
    "Limited",
    "Other",
]


def _cell_by_class(row, class_name: str):
    return row.find("td", class_=class_name)


def _parse_rods_table(html: str, item_colors: dict[str, str]) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    best_table = None
    best_count = 0

    for table in soup.find_all("table"):
        if not table.find("td", class_="name"):
            continue
        row_count = len(table.find_all("tr"))
        if row_count > best_count:
            best_count = row_count
            best_table = table

    if not best_table:
        return []

    rods: list[dict] = []
    for row in best_table.find_all("tr"):
        name_cell = _cell_by_class(row, "name")
        loc_cell = _cell_by_class(row, "location")
        source_cell = _cell_by_class(row, "source")
        stage_cell = _cell_by_class(row, "stage")
        if not name_cell or not loc_cell or not source_cell:
            continue

        text_link = name_cell.select_one(".item-text a") or name_cell.find("a", title=True)
        if not text_link:
            continue

        name = clean_text(text_link.get_text()) or clean_text(text_link.get("title", ""))
        if not name:
            continue

        location = clean_text(loc_cell.get_text())
        source = clean_text(source_cell.get_text())
        stage = None
        if stage_cell:
            try:
                stage = int(clean_text(stage_cell.get_text()))
            except ValueError:
                stage = None

        rod: dict = {
            "name": name,
            "journal_category": location or "Other",
            "obtainment": source,
            "stage": stage,
            "wiki_url": wiki_url(name),
            "image_url": image_url_from_item_cell(name_cell),
        }
        slug = item_slug_from_cell(name_cell)
        if slug and slug in item_colors:
            rod["color"] = item_colors[slug]

        rods.append(rod)

    return rods


def _is_required(
    rod: dict,
    event_rods: set[str],
) -> tuple[bool, str | None]:
    name = rod["name"]
    if name in EXCLUDED_BY_NAME:
        return False, "excluded_by_name"
    if name in event_rods:
        return False, "event_fishing_rod"
    if rod["journal_category"] == "Removed":
        return False, "removed"
    return True, None


def scrape_rods() -> dict:
    html = fetch_parse_html("Fishing_Rods")
    item_colors = parse_item_colors(html)
    all_rods = _parse_rods_table(html, item_colors)
    event_rods = fetch_category_members("Event Fishing Rods")

    required: list[dict] = []
    excluded_count = 0

    for rod in all_rods:
        ok, _reason = _is_required(rod, event_rods)
        if ok:
            required.append(
                {
                    "id": slugify(rod["name"]),
                    "name": rod["name"],
                    "journal_category": rod["journal_category"],
                    "obtainment": rod["obtainment"],
                    "stage": rod["stage"],
                    "wiki_url": rod["wiki_url"],
                    "image_url": rod.get("image_url"),
                    **({"color": rod["color"]} if rod.get("color") else {}),
                }
            )
        else:
            excluded_count += 1

    by_category: dict[str, list[dict]] = defaultdict(list)
    for rod in required:
        by_category[rod["journal_category"]].append(rod)

    categories = []
    seen = set()
    for cat_name in JOURNAL_CATEGORY_ORDER:
        if cat_name in by_category:
            categories.append({"name": cat_name, "rods": by_category[cat_name]})
            seen.add(cat_name)

    for cat_name in sorted(by_category.keys()):
        if cat_name not in seen:
            categories.append({"name": cat_name, "rods": by_category[cat_name]})

    return {
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "wiki_version_note": f"{len(all_rods)} total rods scraped",
        "categories": categories,
        "meta": {
            "total_required": len(required),
            "total_excluded": excluded_count,
            "total_scraped": len(all_rods),
        },
    }
