#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
if command -v uv >/dev/null 2>&1; then
  uv sync
  uv run playwright install chromium
  uv run python screenshot.py
else
  python3 -m pip install --quiet playwright
  python3 -m playwright install chromium
  python3 screenshot.py
fi
