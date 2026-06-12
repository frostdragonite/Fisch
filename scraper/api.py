"""MediaWiki API client for fischipedia.org."""

import time
import urllib.parse
import urllib.request
import json
from typing import Any

BASE_URL = "https://fischipedia.org/w/api.php"
USER_AGENT = "FischMasterlineChecklist/1.0 (personal project)"
RATE_LIMIT_SEC = 1.0
_last_request = 0.0


def _rate_limit() -> None:
    global _last_request
    elapsed = time.monotonic() - _last_request
    if elapsed < RATE_LIMIT_SEC:
        time.sleep(RATE_LIMIT_SEC - elapsed)
    _last_request = time.monotonic()


def _request(params: dict[str, Any]) -> dict[str, Any]:
    _rate_limit()
    params.setdefault("format", "json")
    url = BASE_URL + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_parse_html(page_title: str) -> str:
    data = _request(
        {
            "action": "parse",
            "page": page_title,
            "prop": "text",
        }
    )
    return data["parse"]["text"]["*"]


def fetch_category_members(category: str) -> set[str]:
    """Fetch all page titles in a wiki category (without 'Category:' prefix)."""
    members: set[str] = set()
    cmcontinue: str | None = None
    cmtitle = category if category.startswith("Category:") else f"Category:{category}"

    while True:
        params: dict[str, Any] = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": cmtitle,
            "cmlimit": "500",
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue

        data = _request(params)
        for m in data.get("query", {}).get("categorymembers", []):
            if m.get("ns") == 0:
                members.add(m["title"])

        cont = data.get("continue")
        if cont and "cmcontinue" in cont:
            cmcontinue = cont["cmcontinue"]
        else:
            break

    return members


def fetch_page_thumbnails(titles: list[str], size: int = 64) -> dict[str, str]:
    """Batch-fetch page thumbnail URLs via MediaWiki API (max 50 titles per request)."""
    result: dict[str, str] = {}
    unique = list(dict.fromkeys(titles))

    for i in range(0, len(unique), 50):
        chunk = unique[i : i + 50]
        data = _request(
            {
                "action": "query",
                "titles": "|".join(chunk),
                "prop": "pageimages",
                "piprop": "thumbnail",
                "pithumbsize": size,
            }
        )
        for page in data.get("query", {}).get("pages", {}).values():
            title = page.get("title")
            thumb = page.get("thumbnail", {}).get("source")
            if title and thumb:
                result[title] = thumb

    return result
