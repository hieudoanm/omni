#!/usr/bin/env python3
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

PROTOTYPES_DIR = Path(__file__).parent
HTML_DIR = PROTOTYPES_DIR / "html"
LIGHT_DIR = PROTOTYPES_DIR / "images" / "light"
DARK_DIR = PROTOTYPES_DIR / "images" / "dark"

LIGHT_DIR.mkdir(parents=True, exist_ok=True)
DARK_DIR.mkdir(parents=True, exist_ok=True)

html_files = sorted(HTML_DIR.glob("*.html"))

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()

    for html_file in html_files:
        out_name = html_file.with_suffix(".png").name

        # Light
        page.goto(html_file.as_uri())
        page.evaluate("localStorage.setItem('theme', 'light')")
        page.reload()
        page.wait_for_timeout(200)
        page.screenshot(path=str(LIGHT_DIR / out_name), full_page=True)

        # Dark
        page.goto(html_file.as_uri())
        page.evaluate("localStorage.setItem('theme', 'dark')")
        page.reload()
        page.wait_for_timeout(200)
        page.screenshot(path=str(DARK_DIR / out_name), full_page=True)

    browser.close()
    print(f"Captured {len(html_files)} files")
