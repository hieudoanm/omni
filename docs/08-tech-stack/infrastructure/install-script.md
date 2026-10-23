# Install Script — `packages/cli/scripts/install.sh`

## Script

```bash
#!/usr/bin/env bash
set -euo pipefail

BIN_NAME="omni"
RELEASE="latest"
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
printf "Installed to %s/%s\n" "$INSTALL_DIR" "$BIN_NAME"
```

## Usage

```bash
# Default: installs to ~/bin
curl -fsSL https://raw.githubusercontent.com/hieudoanm/omni/master/packages/cli/scripts/install.sh | bash

# Custom install dir
INSTALL_DIR=/usr/local/bin curl -fsSL ... | bash

# Custom repo (fork)
REPO=myuser/omni curl -fsSL ... | bash
```

## Design Decisions

| Decision | Reason |
|----------|--------|
| `set -euo pipefail` | Fail fast, no silent errors |
| `mktemp` + `trap` | Atomic install, cleanup on exit |
| `uname` detection | No external deps, works everywhere |
| `curl -fsSL` | Silent, follow redirects, fail on error |
| `REPO`/`INSTALL_DIR` env vars | Overridable for forks/CI |
| Single binary name (`omni`) | No version in filename, matches release asset |

## Release Asset Naming

CI produces (via `make build-all`):
```
bin/omni-linux-amd64
bin/omni-linux-arm64
bin/omni-darwin-amd64
bin/omni-darwin-arm64
```

Uploaded to `latest` release as:
```
omni-linux-amd64
omni-linux-arm64
omni-darwin-amd64
omni-darwin-arm64
```

Script constructs URL: `https://github.com/hieudoanm/omni/releases/download/latest/omni-<os>-<arch>`

## Testing Locally

```bash
# Build all
cd packages/cli
make build-all

# Test script against local files (modify RELEASE to local file:// URL)
RELEASE=latest REPO=hieudoanm/omni INSTALL_DIR=/tmp/test ./scripts/install.sh
```