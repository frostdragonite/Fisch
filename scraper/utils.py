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


def rarity_from_row(row) -> str | None:
    """Read rarity-* class from a wiki table row."""
    if not row:
        return None
    for cls in row.get("class", []):
        if cls.startswith("rarity-"):
            slug = cls.removeprefix("rarity-")
            if slug == "mythic":
                return "mythical"
            if slug == "event":
                return "limited"
            return slug
    return None


def image_url_from_item_cell(cell, size: int = 64) -> str | None:
    """Extract icon URL from a wiki item table cell."""
    if not cell:
        return None
    img = cell.select_one(".item-icon img") or cell.find("img")
    if not img:
        return None
    src = img.get("src")
    return upscale_thumb_url(src, size)
