#!/usr/bin/env bash

set -euo pipefail

BIN_NAME="omni"
RELEASE="cli-latest"
ASSET_PREFIX="omni"
REPO="${REPO:-hieudoanm/omni}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/bin}"

os="$(uname -s | tr '[:upper:]' '[:lower:]')"
arch="$(uname -m)"

case "$arch" in
  x86_64|amd64) arch="amd64" ;;
  aarch64|arm64) arch="arm64" ;;
  *) printf "Unsupported architecture: %s\n" "$arch" >&2; exit 1 ;;
esac

case "$os" in
  linux|darwin) ;;
  *) printf "Unsupported OS: %s\n" "$os" >&2; exit 1 ;;
esac

url="https://github.com/$REPO/releases/download/$RELEASE/${ASSET_PREFIX}-${os}-${arch}"
tmp="$(mktemp "${TMPDIR:-/tmp}/${BIN_NAME}.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

printf "Downloading %s (%s/%s)...\n" "$BIN_NAME" "$os" "$arch"
curl -fsSL "$url" -o "$tmp"
chmod +x "$tmp"

mkdir -p "$INSTALL_DIR"
mv "$tmp" "$INSTALL_DIR/$BIN_NAME"
trap - EXIT

printf "Installed %s to %s/%s\n" "$BIN_NAME" "$INSTALL_DIR" "$BIN_NAME"
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  printf '  Add it to your PATH: export PATH="%s:$PATH"\n' "$INSTALL_DIR"
fi
printf "Try '%s version'\n" "$BIN_NAME"