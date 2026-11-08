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

# --- logging ---------------------------------------------------------------
if [[ -t 1 ]]; then
  C_RESET=$'\e[0m'; C_DIM=$'\e[2m'
  C_CYAN=$'\e[36m'; C_GREEN=$'\e[32m'; C_YELLOW=$'\e[33m'; C_RED=$'\e[31m'
else
  C_RESET=''; C_DIM=''; C_CYAN=''; C_GREEN=''; C_YELLOW=''; C_RED=''
fi

log() {
  local level="$1"; shift
  local color label
  case "$level" in
    ok)    color="$C_GREEN";  label=" OK " ;;
    info)  color="$C_CYAN";   label="INFO" ;;
    warn)  color="$C_YELLOW"; label="WARN" ;;
    error) color="$C_RED";    label="ERR " ;;
    step)  color="$C_DIM";    label="    " ;;
  esac
  printf '%s[%s]%s %s[%s]%s %s\n' \
    "$C_DIM" "$(date +%H:%M:%S)" "$C_RESET" \
    "$color" "$label" "$C_RESET" "$*"
}

err() { log error "$@" >&2; }

# --- platform detection ----------------------------------------------------
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) err "Unsupported architecture: $ARCH"; exit 1 ;;
esac

case "$OS" in
  linux|darwin) ;;
  *) err "Unsupported OS: $OS"; exit 1 ;;
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
      *) err "Unknown flag: $arg"; exit 1 ;;
    esac
  done
fi

download() {
  local url="$1" dest="$2"
  log info "Downloading ${url##*/}"
  curl -fsSL --connect-timeout 10 --max-time 300 "$url" -o "$dest"
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
  log ok "CLI installed to $INSTALL_DIR/omni"
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    log warn "Add it to your PATH: export PATH=\"$INSTALL_DIR:\$PATH\""
  fi
  log step "Try: omni version"
}

install_macos_app() {
  [[ "$OS" == "darwin" ]] || return 0
  local zip app_dst staging
  staging="$(mktemp -d "${TMPDIR:-/tmp}/omni-app.XXXXXX")"
  zip="$staging/Omni.app.zip"
  download "$BASE_URL/Omni.app.zip" "$zip"
  unzip -q "$zip" -d "$staging"
  if [[ -w /Applications ]]; then
    app_dst="/Applications/Omni.app"
  else
    app_dst="$HOME/Applications/Omni.app"
    mkdir -p "$HOME/Applications"
    log warn "No write access to /Applications, using ~/Applications"
  fi
  rm -rf "$app_dst"
  cp -R "$staging/Omni.app" "$app_dst"
  rm -rf "$staging"
  log ok "Omni.app installed to $app_dst"
  open "$app_dst" 2>/dev/null || true
}

install_android() {
  mkdir -p "$DOWNLOAD_DIR"
  download "$BASE_URL/app-debug.apk" "$DOWNLOAD_DIR/app-debug.apk"
  log ok "APK downloaded to $DOWNLOAD_DIR/app-debug.apk"
  if command -v adb >/dev/null 2>&1; then
    log step "Install with: adb install $DOWNLOAD_DIR/app-debug.apk"
  else
    log step "Sideload it on your device, or install adb to use: adb install"
  fi
}

install_browser() {
  local variant="${BROWSER_VARIANT:-v3}"
  mkdir -p "$DOWNLOAD_DIR"
  download "$BASE_URL/omni-$variant.zip" "$DOWNLOAD_DIR/omni-$variant.zip"
  log ok "omni-$variant.zip downloaded to $DOWNLOAD_DIR"
  case "$variant" in
    v2) log step "Firefox: about:debugging -> This Firefox -> Load Temporary Add-on -> pick manifest.json inside the unzipped folder." ;;
    v3) log step "Chrome/Edge: chrome://extensions -> Developer mode -> Load unpacked -> pick the unzipped folder." ;;
  esac
}

log info "Installing Omni from $REPO@$RELEASE ($OS/$ARCH)"

if $want_cli; then install_cli; fi
if $want_app; then install_macos_app; fi
if $want_android; then install_android; fi
if $want_browser; then install_browser; fi

log ok "Done."
