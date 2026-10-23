#!/bin/sh
# Scan this docs tree and write the link graph (graph.dot, graph.json,
# graph.html) into <docs>/.graph. Uses the shared pagify binary from
# packages/app/headless/pagify/languages/go/bin, building it when it is
# missing or older than any pagify source file.
set -e

DOCS_DIR="$(cd "$(dirname "$0")" && pwd)"
HEADLESS_DIR="$(cd "$DOCS_DIR/../../../.." && pwd)"
PAGIFY_DIR="$HEADLESS_DIR/pagify/languages/go"
BIN="$PAGIFY_DIR/bin/pagify"
OUT_DIR="$DOCS_DIR/.graph"

needs_build=0
if [ ! -x "$BIN" ]; then
  needs_build=1
else
  for src in "$PAGIFY_DIR"/*.go "$PAGIFY_DIR"/cmd/*.go "$PAGIFY_DIR"/internal/*/*.go "$PAGIFY_DIR"/internal/*/*/*.go; do
    [ -f "$src" ] || continue
    if [ "$src" -nt "$BIN" ]; then
      needs_build=1
      break
    fi
  done
fi

if [ "$needs_build" -eq 1 ]; then
  echo "Building $BIN ..."
  (cd "$PAGIFY_DIR" && go build -o "$BIN" .)
fi

mkdir -p "$OUT_DIR"

echo "Scanning $DOCS_DIR ..."
"$BIN" graph "$DOCS_DIR" -o "$OUT_DIR"
