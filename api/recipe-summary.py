"""Vercel Python serverless function: fetch a recipe URL and summarise it.

Uses recipe-scrapers, which ships site-specific parsers for hundreds of
recipe sites (BBC Good Food, Jamie Oliver, AllRecipes, Serious Eats, ...)
and falls back to generic schema.org parsing for everything else.
"""

import ipaddress
import json
import re
import urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from recipe_scrapers import scrape_html

FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-GB,en;q=0.9",
}


def is_blocked_host(hostname: str) -> bool:
    lower = (hostname or "").lower()
    if lower in ("localhost",) or lower.endswith((".local", ".internal")):
        return True
    try:
        return not ipaddress.ip_address(lower).is_global
    except ValueError:
        return False  # a normal domain name


def human_duration(minutes) -> str | None:
    if not minutes:
        return None
    try:
        minutes = int(minutes)
    except (TypeError, ValueError):
        return str(minutes)
    hours, mins = divmod(minutes, 60)
    parts = []
    if hours:
        parts.append(f"{hours} hr")
    if mins:
        parts.append(f"{mins} min")
    return " ".join(parts) or None


def call(scraper, method):
    """recipe-scrapers raises for fields a site doesn't provide — treat as absent."""
    try:
        return getattr(scraper, method)()
    except Exception:
        return None


def summarise(url: str, html: str) -> dict:
    scraper = scrape_html(html, org_url=url, supported_only=False)

    instructions = call(scraper, "instructions") or ""
    steps = [s.strip() for s in instructions.split("\n") if s.strip()]

    nutrients = call(scraper, "nutrients") or {}
    calories = nutrients.get("calories")

    return {
        "title": call(scraper, "title"),
        "description": call(scraper, "description"),
        "ingredients": call(scraper, "ingredients") or [],
        "steps": steps,
        "prepTime": human_duration(call(scraper, "prep_time")),
        "cookTime": human_duration(call(scraper, "cook_time")),
        "totalTime": human_duration(call(scraper, "total_time")),
        "servings": call(scraper, "yields"),
        "calories": calories,
        "image": call(scraper, "image"),
    }


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: dict) -> None:
        payload = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self) -> None:  # noqa: N802 (Vercel requires this name)
        query = parse_qs(urlparse(self.path).query)
        target = (query.get("url") or [None])[0]

        if not target:
            return self._send(400, {"error": "Missing url parameter"})

        parsed = urlparse(target)
        if parsed.scheme not in ("http", "https"):
            return self._send(400, {"error": "Only http(s) URLs are supported"})
        if is_blocked_host(parsed.hostname or ""):
            return self._send(400, {"error": "That host is not allowed"})

        try:
            req = urllib.request.Request(target, headers=FETCH_HEADERS)
            with urllib.request.urlopen(req, timeout=10) as res:
                html = res.read().decode("utf-8", errors="replace")
        except Exception:
            return self._send(502, {"error": "Could not fetch that page"})

        try:
            recipe = summarise(target, html)
        except Exception:
            recipe = None

        if not recipe or not recipe.get("title") or not recipe.get("ingredients"):
            return self._send(
                422,
                {"error": "No recipe found on that page — add it manually instead"},
            )

        # Drop empty fields so the payload matches the TS parser's shape
        recipe = {k: v for k, v in recipe.items() if v}
        return self._send(200, {"recipe": recipe})
