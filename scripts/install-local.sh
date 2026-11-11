#!/usr/bin/env bash
#
# Build Omni from source and install it locally.
#
# What gets built/installed depends on the toolchains available:
#   - CLI       -> make build in packages/cli (Rust), binary -> $INSTALL_DIR/omni
#   - macOS app -> make install in packages/desktop/macos (-> /Applications, macOS only)
#   - Android   -> ./gradlew assembleDebug, APK copied to $DOWNLOAD_DIR
#   - Browser   -> pnpm build in packages/extensions/browser, loads dist/v2 into
#                  Firefox/Firefox Dev Edition via web-ext (temporary install)
#   - Web       -> pnpm build in packages/web, prints the static export path
#
# Usage:
#   ./scripts/install-local.sh [--cli] [--macos] [--android] [--browser] [--web]
#
# With no flags every component whose toolchain is present is built.
# Env: INSTALL_DIR (default ~/.local/bin), DOWNLOAD_DIR (default ~/Downloads),
#      SKIP_SIGNING=1 to skip macOS code signing.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
DOWNLOAD_DIR="${DOWNLOAD_DIR:-$HOME/Downloads}"

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

have_cargo()  { command -v cargo  >/dev/null 2>&1; }
have_swift()  { command -v swift  >/dev/null 2>&1; }
have_pnpm()   { command -v pnpm   >/dev/null 2>&1; }
have_java()   { command -v java   >/dev/null 2>&1; }
have_gradlew(){ [[ -x "$ROOT/packages/mobile/android/gradlew" ]]; }
have_android_sdk() {
  [[ -n "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]] && return 0
  [[ -f "$ROOT/packages/mobile/android/local.properties" ]] && return 0
  [[ -d "$HOME/Library/Android/sdk" || -d "/opt/android-sdk" || -d "/usr/lib/android-sdk" ]]
}

want_cli=true
want_macos=true
want_android=true
want_browser=true
want_web=true

if [[ $# -gt 0 ]]; then
  want_cli=false; want_macos=false; want_android=false
  want_browser=false; want_web=false
  for arg in "$@"; do
    case "$arg" in
      --cli)     want_cli=true ;;
      --macos)   want_macos=true ;;
      --android) want_android=true ;;
      --browser) want_browser=true ;;
      --web)     want_web=true ;;
      -h|--help)
        sed -n '2,22p' "$0"
        exit 0
        ;;
      *) err "Unknown flag: $arg"; exit 1 ;;
    esac
  done
fi

install_cli() {
  have_cargo || { log warn "cli: skipped (cargo not found)"; return; }
  log info "cli: building"
  make -C "$ROOT/packages/cli" build
  mkdir -p "$INSTALL_DIR"
  cp "$ROOT/packages/cli/bin/omni" "$INSTALL_DIR/omni"
  chmod +x "$INSTALL_DIR/omni"
  log ok "CLI installed to $INSTALL_DIR/omni"
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    log warn "Add it to your PATH: export PATH=\"$INSTALL_DIR:\$PATH\""
  fi
}

install_macos() {
  [[ "$OS" == "darwin" ]] || { log warn "macos: skipped (not macOS)"; return; }
  have_swift || { log warn "macos: skipped (swift not found)"; return; }
  log info "macos: building and installing Omni.app"
  make -C "$ROOT/packages/desktop/macos" install
}

install_android() {
  have_java || { log warn "android: skipped (java not found)"; return; }
  have_gradlew || { log warn "android: skipped (no gradlew)"; return; }
  have_android_sdk || { log warn "android: skipped (no Android SDK — set ANDROID_HOME)"; return; }
  log info "android: building debug APK"
  "$ROOT/packages/mobile/android/gradlew" -p "$ROOT/packages/mobile/android" assembleDebug
  local apk="$ROOT/packages/mobile/android/app/build/outputs/apk/debug/app-debug.apk"
  if [[ -f "$apk" ]]; then
    mkdir -p "$DOWNLOAD_DIR"
    cp "$apk" "$DOWNLOAD_DIR/app-debug.apk"
    log ok "APK copied to $DOWNLOAD_DIR/app-debug.apk"
    command -v adb >/dev/null 2>&1 && log step "Install with: adb install $DOWNLOAD_DIR/app-debug.apk"
  fi
}

firefox_binary() {
  if [[ "$OS" == "darwin" ]]; then
    local app="/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox"
    [[ -x "$app" ]] && { printf '%s' "$app"; return; }
    app="/Applications/Firefox.app/Contents/MacOS/firefox"
    [[ -x "$app" ]] && { printf '%s' "$app"; return; }
  else
    command -v firefoxdeveloperedition >/dev/null 2>&1 && { command -v firefoxdeveloperedition; return; }
    command -v firefox >/dev/null 2>&1 && { command -v firefox; return; }
  fi
  return 1
}

install_browser() {
  have_pnpm || { log warn "browser: skipped (pnpm not found)"; return; }
  log info "browser: building extension"
  (cd "$ROOT/packages/extensions/browser" && pnpm install --frozen-lockfile && pnpm build)

  local fx
  if fx="$(firefox_binary)"; then
    local logf="${TMPDIR:-/tmp}/omni-web-ext.log"
    log info "browser: launching Firefox with omni installed (temporary)"
    log step "Detached via web-ext; log: $logf"
    log step "Close Firefox to remove the extension; re-run to reload."
    (cd "$ROOT/packages/extensions/browser" && nohup pnpm web-ext run \
      --source-dir=dist/v2 \
      --firefox="$fx" \
      --no-input >"$logf" 2>&1 &)
    log ok "browser: Firefox launch started"
  else
    log warn "Firefox not found. Load manually:"
    log step "about:debugging -> This Firefox -> Load Temporary Add-on"
    log step "-> $ROOT/packages/extensions/browser/download/v2/omni.xpi"
    log step "Chrome/Edge: load unpacked from $ROOT/packages/extensions/browser/dist/v3"
  fi
}

install_web() {
  have_pnpm || { log warn "web: skipped (pnpm not found)"; return; }
  log info "web: building static export"
  (cd "$ROOT/packages/web" && pnpm install --frozen-lockfile && pnpm build)
  log ok "Static export at $ROOT/packages/web/out"
}

log info "Building Omni from source ($ROOT)"

if $want_cli;     then install_cli; fi
if $want_macos;   then install_macos; fi
if $want_android; then install_android; fi
if $want_browser; then install_browser; fi
if $want_web;     then install_web; fi

log ok "Done."
