#!/usr/bin/env bash
#
# Build Omni from source and install it locally.
#
# What gets built/installed depends on the toolchains available:
#   - CLI       -> make build in packages/cli, binary -> $INSTALL_DIR/omni
#   - macOS app -> make install in packages/macos (-> /Applications, macOS only)
#   - Android   -> ./gradlew assembleDebug, APK copied to $DOWNLOAD_DIR
#   - Browser   -> pnpm build in packages/browser, prints load-unpacked path
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

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

have_go()     { command -v go     >/dev/null 2>&1; }
have_swift()  { command -v swift  >/dev/null 2>&1; }
have_pnpm()   { command -v pnpm   >/dev/null 2>&1; }
have_java()   { command -v java   >/dev/null 2>&1; }
have_gradlew(){ [[ -x "$ROOT/packages/android/gradlew" ]]; }

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
      *) printf "Unknown flag: %s\n" "$arg" >&2; exit 1 ;;
    esac
  done
fi

install_cli() {
  have_go || { printf '== cli: skipped (go not found)\n'; return; }
  printf '== cli: building\n'
  make -C "$ROOT/packages/cli" build
  mkdir -p "$INSTALL_DIR"
  cp "$ROOT/packages/cli/bin/omni" "$INSTALL_DIR/omni"
  chmod +x "$INSTALL_DIR/omni"
  printf 'Installed CLI to %s/omni\n' "$INSTALL_DIR"
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    printf '  Add it to your PATH: export PATH="%s:$PATH"\n' "$INSTALL_DIR"
  fi
}

install_macos() {
  [[ "$OS" == "darwin" ]] || { printf '== macos: skipped (not macOS)\n'; return; }
  have_swift || { printf '== macos: skipped (swift not found)\n'; return; }
  printf '== macos: building and installing Omni.app\n'
  make -C "$ROOT/packages/macos" install
}

install_android() {
  have_java || { printf '== android: skipped (java not found)\n'; return; }
  have_gradlew || { printf '== android: skipped (no gradlew)\n'; return; }
  printf '== android: building debug APK\n'
  "$ROOT/packages/android/gradlew" -p "$ROOT/packages/android" assembleDebug
  local apk="$ROOT/packages/android/app/build/outputs/apk/debug/app-debug.apk"
  if [[ -f "$apk" ]]; then
    mkdir -p "$DOWNLOAD_DIR"
    cp "$apk" "$DOWNLOAD_DIR/app-debug.apk"
    printf 'Copied APK to %s\n' "$DOWNLOAD_DIR/app-debug.apk"
    command -v adb >/dev/null 2>&1 && printf 'Install with: adb install %s\n' "$DOWNLOAD_DIR/app-debug.apk"
  fi
}

install_browser() {
  have_pnpm || { printf '== browser: skipped (pnpm not found)\n'; return; }
  printf '== browser: building extension\n'
  (cd "$ROOT/packages/browser" && pnpm install --frozen-lockfile && pnpm build)
  printf 'Load unpacked from: %s/packages/browser/dist/v3\n' "$ROOT"
  printf '(Firefox: use dist/v2 instead)\n'
}

install_web() {
  have_pnpm || { printf '== web: skipped (pnpm not found)\n'; return; }
  printf '== web: building static export\n'
  (cd "$ROOT/packages/web" && pnpm install --frozen-lockfile && pnpm build)
  printf 'Static export at: %s/packages/web/out\n' "$ROOT"
}

if $want_cli;     then install_cli; fi
if $want_macos;   then install_macos; fi
if $want_android; then install_android; fi
if $want_browser; then install_browser; fi
if $want_web;     then install_web; fi

printf '\nDone.\n'
