#!/usr/bin/env bash
#
# Install Omni from the rolling "latest" GitHub release.
#
# Downloads the prebuilt artifacts for this machine:
#   - CLI binary        -> $INSTALL_DIR/omni            (all platforms)
#   - Omni.app           -> /Applications                (macOS only)
#   - Android APK        -> ~/Downloads/app-debug.apk    (printed for sideloading)
#   - Browser extension  -> ~/Downloads/omni-v{2,3}.zip  (load unpacked)
#
# Usage:
#   ./scripts/install.sh [--cli] [--app] [--android] [--browser]
#
# With no flags every component supported on this OS is installed.
# Env: REPO, INSTALL_DIR, DOWNLOAD_DIR, BROWSER_VARIANT (v2|v3, default v3).

set -euo pipefail

REPO="${REPO:-hieudoanm/omni}"
RELEASE="${RELEASE:-latest}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
DOWNLOAD_DIR="${DOWNLOAD_DIR:-$HOME/Downloads}"
BASE_URL="https://github.com/$REPO/releases/download/$RELEASE"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) printf "Unsupported architecture: %s\n" "$ARCH" >&2; exit 1 ;;
esac

case "$OS" in
  linux|darwin) ;;
  *) printf "Unsupported OS: %s\n" "$OS" >&2; exit 1 ;;
esac

want_cli=true
want_app=true
want_android=true
want_browser=true

if [[ $# -gt 0 ]]; then
  want_cli=false; want_app=false; want_android=false; want_browser=false
  for arg in "$@"; do
    case "$arg" in
      --cli) want_cli=true ;;
      --app) want_app=true ;;
      --android) want_android=true ;;
      --browser) want_browser=true ;;
      -h|--help)
        sed -n '2,20p' "$0"
        exit 0
        ;;
      *) printf "Unknown flag: %s\n" "$arg" >&2; exit 1 ;;
    esac
  done
fi

download() {
  local url="$1" dest="$2"
  printf 'Downloading %s ...\n' "${url##*/}"
  curl -fsSL "$url" -o "$dest"
}

install_cli() {
  local tmp
  tmp="$(mktemp "${TMPDIR:-/tmp}/omni.XXXXXX")"
  trap 'rm -f "$tmp"' RETURN
  download "$BASE_URL/omni-$OS-$ARCH" "$tmp"
  chmod +x "$tmp"
  mkdir -p "$INSTALL_DIR"
  mv "$tmp" "$INSTALL_DIR/omni"
  trap - RETURN
  printf 'Installed CLI to %s/omni\n' "$INSTALL_DIR"
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    printf '  Add it to your PATH: export PATH="%s:$PATH"\n' "$INSTALL_DIR"
  fi
  printf '  Try: omni version\n'
}

install_macos_app() {
  [[ "$OS" == "darwin" ]] || return 0
  local zip app_dst staging
  staging="$(mktemp -d "${TMPDIR:-/tmp}/omni-app.XXXXXX")"
  zip="$staging/Omni.app.zip"
  download "$BASE_URL/Omni.app.zip" "$zip"
  unzip -q "$zip" -d "$staging"
  app_dst="/Applications/Omni.app"
  if [[ -w /Applications ]]; then
    rm -rf "$app_dst"
    cp -R "$staging/Omni.app" "$app_dst"
    printf 'Installed Omni.app to /Applications\n'
    open "$app_dst" 2>/dev/null || true
  else
    app_dst="$HOME/Applications/Omni.app"
    mkdir -p "$HOME/Applications"
    rm -rf "$app_dst"
    cp -R "$staging/Omni.app" "$app_dst"
    printf 'Installed Omni.app to ~/Applications (no /Applications write access)\n'
    open "$app_dst" 2>/dev/null || true
  fi
  rm -rf "$staging"
}

install_android() {
  mkdir -p "$DOWNLOAD_DIR"
  download "$BASE_URL/app-debug.apk" "$DOWNLOAD_DIR/app-debug.apk"
  printf 'Downloaded APK to %s\n' "$DOWNLOAD_DIR/app-debug.apk"
  if command -v adb >/dev/null 2>&1; then
    printf 'Install with: adb install %s\n' "$DOWNLOAD_DIR/app-debug.apk"
  else
    printf 'Sideload it on your device, or install adb to use: adb install\n'
  fi
}

install_browser() {
  local variant="${BROWSER_VARIANT:-v3}"
  mkdir -p "$DOWNLOAD_DIR"
  download "$BASE_URL/omni-$variant.zip" "$DOWNLOAD_DIR/omni-$variant.zip"
  printf 'Downloaded omni-%s.zip to %s\n' "$variant" "$DOWNLOAD_DIR"
  case "$variant" in
    v2) printf 'Firefox: about:debugging -> This Firefox -> Load Temporary Add-on -> pick manifest.json inside the unzipped folder.\n' ;;
    v3) printf 'Chrome/Edge: chrome://extensions -> Developer mode -> Load unpacked -> pick the unzipped folder.\n' ;;
  esac
}

if $want_cli; then install_cli; fi
if $want_app; then install_macos_app; fi
if $want_android; then install_android; fi
if $want_browser; then install_browser; fi
