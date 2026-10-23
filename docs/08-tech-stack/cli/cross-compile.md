# CLI Cross-Compilation — Zig CC

## Platforms

```makefile
# Makefile
PLATFORMS := linux/amd64 linux/arm64 darwin/amd64 darwin/arm64
```

| GOOS | GOARCH | Zig Target | Binary Name |
|------|--------|------------|-------------|
| linux | amd64 | x86_64-linux | omni-linux-amd64 |
| linux | arm64 | aarch64-linux | omni-linux-arm64 |
| darwin | amd64 | x86_64-macos | omni-darwin-amd64 |
| darwin | arm64 | aarch64-macos | omni-darwin-arm64 |

## Native Build

```bash
CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 \
go build $(LDFLAGS) -o bin/omni-darwin-arm64 ./main.go
```

## Cross Build (Zig)

```bash
CC="zig cc -target aarch64-linux" CGO_ENABLED=1 \
GOOS=linux GOARCH=arm64 \
go build $(LDFLAGS) -o bin/omni-linux-arm64 ./main.go
```

## Make Target

```makefile
build-all:
	@mkdir -p $(BIN_DIR)
	@for p in $(PLATFORMS); do \
		os=$${p%/*}; arch=$${p#*/}; \
		za="$${arch}"; \
		[ "$${arch}" = "amd64" ] && za="x86_64"; \
		[ "$${arch}" = "arm64" ] && za="aarch64"; \
		zo="$${os}"; \
		[ "$${os}" = "darwin" ] && zo="macos"; \
		if [ "$$os" = "$(shell go env GOOS)" ]; then \
			CGO_ENABLED=1 GOOS=$$os GOARCH=$$arch \
			go build $(LDFLAGS) -o $(BIN_DIR)/$(BIN_NAME)-$$os-$$arch $(SRC); \
		else \
			CC="zig cc -target $${za}-$${zo}" CGO_ENABLED=1 \
			GOOS=$$os GOARCH=$$arch \
			go build $(LDFLAGS) -o $(BIN_DIR)/$(BIN_NAME)-$$os-$$arch $(SRC); \
		fi \
	done
```

## Why Zig

- Single binary provides libc + linker for all targets
- No Docker, no VM, no cross-compile toolchain install
- `goto-bus-stop/setup-zig@v2` in CI installs in seconds
- Version pinned (0.13.0) for reproducibility

## CGO_ENABLED=1

Required for:
- `os/user` (current user lookup)
- `net` (cgo resolver)
- `plugin` (not used but default on)

## Version Injection

```makefile
VERSION      := $(shell date +%Y.%m.%d.%H.%M.%S)
COMMIT       := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
FULL_VERSION := $(VERSION)-$(COMMIT)
LDFLAGS      := -ldflags="-s -w -X '$(OWNER)/src/cmd/version.V=$(FULL_VERSION)'"
```

Injected into `src/cmd/version.V` at build time.