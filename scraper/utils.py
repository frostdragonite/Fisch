"""Shared utilities for scraper."""

import re
import unicodedata


def slugify(name: str) -> str:
    """Convert item name to URL-safe id slug."""
    s = name.lower().strip()
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def wiki_url(title: str) -> str:
    from urllib.parse import quote

    return f"https://fischipedia.org/wiki/{quote(title.replace(' ', '_'))}"


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def normalize_image_url(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if url.startswith("//"):
        return f"https:{url}"
    return url


def upscale_thumb_url(url: str | None, size: int = 64) -> str | None:
    """Bump MediaWiki thumb URL to a larger display size."""
    url = normalize_image_url(url)
    if not url:
        return None
    return re.sub(r"/\d+px-", f"/{size}px-", url)


def parse_item_colors(html: str) -> dict[str, str]:
    """Parse --item-color values from wiki inline item styles."""
    pattern = re.compile(
        r"\.item-([a-z0-9-]+)\{--item-color:([^;]+);--item-bg-color:[^}]+\}"
    )
    return {slug: color.strip() for slug, color in pattern.findall(html)}


def item_slug_from_cell(cell) -> str | None:
    """Extract item-{slug} class from a wiki item table cell."""
    if not cell:
        return None
    item = cell.find("span", class_="item")
    if not item:
        return None
    for cls in item.get("class", []):
        if cls.startswith("item-") and cls != "item":
            return cls.removeprefix("item-")
    return None


def normalize_rarity_slug(slug: str) -> str:
    if slug == "mythic":
        return "mythical"
    if slug == "event":
        return "limited"
    return slug


def rarity_from_row(row) -> str | None:
    """Read rarity-* class from a wiki table row."""
    if not row:
        return None
    for cls in row.get("class", []):
        if cls.startswith("rarity-"):
            return normalize_rarity_slug(cls.removeprefix("rarity-"))
    return None


def rarity_from_bait_row(row) -> str | None:
    """Read bait rarity from the List of Baits table row."""
    if not row:
        return None

    rarity = rarity_from_row(row)
    if rarity:
        return rarity

    rarity_cell = row.find("td", class_="rarity")
    if not rarity_cell:
        return None

    link = rarity_cell.find("a", title=True) or rarity_cell.find("a")
    if not link:
        return None

    text = clean_text(link.get("title", "") or link.get_text())
    if not text:
        return None

    return normalize_rarity_slug(text.lower().replace(" ", "-"))


def wiki_url_from_cell(cell) -> str | None:
    """Build fischipedia URL from a wiki item/name cell."""
    if not cell:
        return None
    link = cell.select_one(".item-text a") or cell.find("a", title=True)
    if not link:
        return None
    title = clean_text(link.get("title", "")) or clean_text(link.get_text())
    if title:
        return wiki_url(title)
    return None


def item_name_from_cell(cell) -> str | None:
    """Read display name from a wiki item table cell."""
    if not cell:
        return None
    text_link = cell.select_one(".item-text a") or cell.find("a", title=True)
    if text_link:
        name = clean_text(text_link.get_text()) or clean_text(text_link.get("title", ""))
        if name:
            return name
    return clean_text(cell.get_text()) or None


def image_url_from_item_cell(cell, size: int = 64) -> str | None:
    """Extract icon URL from a wiki item table cell."""
    if not cell:
        return None
    img = cell.select_one(".item-icon img") or cell.find("img")
    if not img:
        return None
    src = img.get("src")
    return upscale_thumb_url(src, size)
