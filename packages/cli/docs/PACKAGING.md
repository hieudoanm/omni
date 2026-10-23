# Packaging

Omni ships as four cross-compiled static Go binaries (linux/macOS ×
amd64/arm64). There is no container image.

## Binary

`make build` produces `bin/omni` for the native platform; `make build-all`
cross-compiles all four:

```bash
cd packages/cli
make build        # → bin/omni
make build-all    # → bin/omni-{linux,darwin}-{amd64,arm64}
```

`PLATFORMS := linux/amd64 linux/arm64 darwin/amd64 darwin/arm64`. Binaries are
named `omni-{GOOS}-{GOARCH}`. Native builds use `CGO_ENABLED=1`; non-native
targets use `CC="zig cc -target <zig-arch>-<zig-os>"` with `CGO_ENABLED=1`,
where the Go arch/os map to zig targets (`amd64`→`x86_64`, `arm64`→`aarch64`,
`darwin`→`macos`, `linux`→`linux`). Windows is handled in the loop but is not
currently in `PLATFORMS`.

Version is injected with `-ldflags="-s -w -X 'github.com/hieudoanm/omni/packages/cli/src/cmd/version.V=<date>.<time>-<short-sha>'"`.

## CI Pipeline

CI runs from the Omni repository and publishes a rolling GitHub Release:

| Stage     | What it does                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------ |
| `ci`      | gofmt check, `go vet` (`make lint`), `go test` (`make test`), `make build-all` (zig) — uploads `bin/*` |
| `publish` | Publishes a rolling GitHub Release from the uploaded artifacts                                         |

Artifacts (release `cli-latest`):

- `omni-linux-amd64`
- `omni-linux-arm64`
- `omni-darwin-amd64`
- `omni-darwin-arm64`

The release tag `cli-latest` is force-updated on every push, so the download
URLs in [DOWNLOADS](DOWNLOADS) always point at the newest build. The runner
must have zig installed.

## Install script

`scripts/install.sh` downloads the matching platform binary from the rolling
release (`cli-latest`) and installs it to `~/bin` (override with `INSTALL_DIR`).
Prefer the [DOWNLOADS](DOWNLOADS) release URLs for the current pipeline.

## Checklist

1. `go vet ./...` clean
2. `go test ./...` green
3. `gofmt -l .` empty
4. `make build` succeeds and `bin/omni version` prints a version
5. `make build-all` (with zig) produces all four `bin/omni-{os}-{arch}`
   binaries
