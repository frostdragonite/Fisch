#!/usr/bin/env python3
"""Scrape fischipedia.org and write catalog JSON for the Angular frontend."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow running as script from repo root or scraper dir
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fish import scrape_fish
from rods import scrape_rods

DEFAULT_OUTPUT = (
    Path(__file__).resolve().parent.parent / "frontend" / "src" / "assets" / "data"
)


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Wrote {path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape Fischipedia catalog data")
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output directory for JSON files",
    )
    parser.add_argument("--rods", action="store_true", help="Scrape rods only")
    parser.add_argument("--fish", action="store_true", help="Scrape fish only")
    args = parser.parse_args()

    scrape_all = not args.rods and not args.fish

    if scrape_all or args.rods:
        print("Scraping fishing rods...")
        rods_data = scrape_rods()
        write_json(args.output / "rods.json", rods_data)
        meta = rods_data["meta"]
        print(
            f"  Rods: {meta['total_required']} required, "
            f"{meta['total_excluded']} excluded, "
            f"{meta['total_scraped']} total"
        )

    if scrape_all or args.fish:
        print("Scraping fish...")
        fish_data = scrape_fish()
        write_json(args.output / "fish.json", fish_data)
        meta = fish_data["meta"]
        print(
            f"  Fish: {meta['total_required']} required, "
            f"{meta['total_excluded']} excluded, "
            f"{meta['total_scraped']} total"
        )

    print("Done.")


if __name__ == "__main__":
    main()
