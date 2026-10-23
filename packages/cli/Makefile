GO           ?= go
BIN_DIR      ?= bin
BIN_NAME     ?= omni
BINARY       ?= $(BIN_DIR)/$(BIN_NAME)
SRC          ?= ./main.go
OWNER        ?= github.com/hieudoanm/omni/packages/cli
COVERAGE_DIR ?= coverage
PLATFORMS    := linux/amd64 linux/arm64 darwin/amd64 darwin/arm64

VERSION      := $(shell date +%Y.%m.%d.%H.%M.%S)
COMMIT       := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
FULL_VERSION := $(VERSION)-$(COMMIT)
LDFLAGS      := -ldflags="-s -w -X '$(OWNER)/src/cmd/version.V=$(FULL_VERSION)'"

.PHONY: help all format lint test build build-all coverage clean tidy install

help:
	@echo "omni — personal CLI toolbox"
	@echo ""
	@echo "Targets:"
	@echo "  all        format + lint + test + build"
	@echo "  format     go fmt ./..."
	@echo "  lint       go vet ./..."
	@echo "  test       go test ./..."
	@echo "  build      build $(BINARY)"
	@echo "  build-all  cross-compile for $(PLATFORMS) into $(BIN_DIR) (zig)"
	@echo "  coverage   generate HTML coverage report"
	@echo "  tidy       go mod tidy"
	@echo "  install    build and install to $(HOME)/bin"
	@echo "  clean      remove build artifacts"

all: format lint test build

format:
	$(GO) fmt ./...

lint:
	$(GO) vet ./...

test:
	$(GO) test ./...

build:
	@mkdir -p $(BIN_DIR)
	$(GO) build $(LDFLAGS) -o $(BINARY) $(SRC)
	@echo "built $(BINARY) (version $(FULL_VERSION))"

build-all:
	@mkdir -p $(BIN_DIR)
	@for p in $(PLATFORMS); do \
		os=$${p%/*}; arch=$${p#*/}; \
		ext=; [ $$os = windows ] && ext=.exe; \
		za="$${arch}"; \
		[ "$${arch}" = "amd64" ] && za="x86_64"; \
		[ "$${arch}" = "arm64" ] && za="aarch64"; \
		zo="$${os}"; \
		[ "$${os}" = "darwin" ] && zo="macos"; \
		printf "  %s/%s... " $$os $$arch; \
		if [ "$$os" = "$(shell go env GOOS)" ]; then \
			CGO_ENABLED=1 GOOS=$$os GOARCH=$$arch \
			go build $(LDFLAGS) -o $(BIN_DIR)/$(BIN_NAME)-$$os-$$arch$$ext $(SRC) && echo "ok"; \
		else \
			CC="zig cc -target $${za}-$${zo}" CGO_ENABLED=1 \
			GOOS=$$os GOARCH=$$arch \
			go build $(LDFLAGS) -o $(BIN_DIR)/$(BIN_NAME)-$$os-$$arch$$ext $(SRC) && echo "ok"; \
		fi \
	done
	@echo "Binaries in $(BIN_DIR)/:"
	@ls -1 $(BIN_DIR)/

coverage:
	@mkdir -p $(COVERAGE_DIR)
	$(GO) test -coverprofile=$(COVERAGE_DIR)/coverage.out -covermode=atomic ./...
	@$(GO) tool cover -html=$(COVERAGE_DIR)/coverage.out -o $(COVERAGE_DIR)/coverage.html
	@$(GO) tool cover -func=$(COVERAGE_DIR)/coverage.out | tail -1
	@echo "Coverage report: file://$(abspath $(COVERAGE_DIR))/coverage.html"

tidy:
	$(GO) mod tidy

install:
	@mkdir -p $(HOME)/bin
	$(GO) build $(LDFLAGS) -o $(HOME)/bin/$(BIN_NAME) $(SRC)
	chmod +x $(HOME)/bin/$(BIN_NAME)
	@echo "Installed to $(HOME)/bin/$(BIN_NAME)"

clean:
	@rm -rf $(BIN_DIR) $(COVERAGE_DIR)
