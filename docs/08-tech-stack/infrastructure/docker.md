# Docker — CLI Dockerfile

## Dockerfile

```dockerfile
# packages/cli/docker/Dockerfile

# download stage: fetch the latest release binary via scripts/install.sh
FROM debian:trixie-slim AS download

ARG REPO=hieudoanm/omni
ARG INSTALL_SCRIPT_URL=https://raw.githubusercontent.com/${REPO}/master/packages/cli/scripts/install.sh

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Download and install omni
RUN curl -fsSL "$INSTALL_SCRIPT_URL" | INSTALL_DIR=/usr/local/bin bash

# runtime stage: minimal image with just the binary
FROM debian:trixie-slim

COPY --from=download /usr/local/bin/omni /usr/local/bin/omni

ENTRYPOINT ["omni"]
CMD ["--help"]
```

## Build

```bash
# From repo root
docker build -t omni-cli -f packages/cli/docker/Dockerfile .
# or with custom repo
docker build --build-arg REPO=myfork/omni -t omni-cli -f packages/cli/docker/Dockerfile .
```

## Run

```bash
docker run --rm omni-cli version
docker run --rm omni-cli calc age --birthdate 1990-01-01
docker run --rm -v $(pwd):/data omni-cli file checksum --algorithm sha256 /data/file.txt
```

## Multi-Arch

The install script downloads the correct binary for the build platform (linux/amd64 or linux/arm64). For multi-arch images:

```bash
# Requires buildx
docker buildx build --platform linux/amd64,linux/arm64 -t omni-cli -f packages/cli/docker/Dockerfile .
```

## Why Not Multi-Stage Go Build

- Go cross-compile + Zig is already in CI
- Install script is the single source of truth for release assets
- Docker image stays minimal (no Go toolchain, no Zig)
- Binary is identical to what users get via `curl | bash`

## Base Image

`debian:trixie-slim` — current stable, small (~80MB), glibc compatible with Go binaries.

Alternative considered: `alpine` (musl libc) — but Go binaries built with `CGO_ENABLED=1` need glibc; would need separate static build.