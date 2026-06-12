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


def image_url_from_item_cell(cell, size: int = 64) -> str | None:
    """Extract icon URL from a wiki item table cell."""
    if not cell:
        return None
    img = cell.select_one(".item-icon img") or cell.find("img")
    if not img:
        return None
    src = img.get("src")
    return upscale_thumb_url(src, size)
