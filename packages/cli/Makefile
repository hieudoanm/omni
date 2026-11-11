CARGO       ?= cargo
BIN_DIR     ?= bin
BIN_NAME    ?= omni
BINARY      ?= $(BIN_DIR)/$(BIN_NAME)
VERSION     := $(shell date +%Y.%m.%d.%H.%M.%S)
COMMIT      := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
FULL_VERSION := $(VERSION)-$(COMMIT)
OMNI_VERSION ?= $(FULL_VERSION)

# Rust target triples for the release platforms (linux/amd64 linux/arm64 darwin/amd64 darwin/arm64)
PLATFORMS   := x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu x86_64-apple-darwin aarch64-apple-darwin
HOST_TARGET := $(shell rustc -vV | sed -n 's/^host: //p')

.PHONY: help all format lint test build build-all build-darwin coverage clean install

help:
	@echo "omni — personal CLI toolbox (Rust port)"
	@echo ""
	@echo "Targets:"
	@echo "  all        format + lint + test + build"
	@echo "  format     cargo fmt"
	@echo "  lint       cargo clippy -- -D warnings"
	@echo "  test       cargo test"
	@echo "  build      build $(BINARY) (release)"
	@echo "  build-all  cross-compile for $(PLATFORMS) into $(BIN_DIR)"
	@echo "  build-darwin  build darwin/{amd64,arm64}"
	@echo "  coverage   generate HTML coverage report (cargo-llvm-cov)"
	@echo "  install    build and install to $(HOME)/bin"
	@echo "  clean      remove build artifacts"

all: format lint test build

format:
	$(CARGO) fmt

lint:
	$(CARGO) clippy --all-targets -- -D warnings

test:
	$(CARGO) test

build:
	@mkdir -p $(BIN_DIR)
	OMNI_VERSION=$(OMNI_VERSION) $(CARGO) build --release
	@cp target/release/$(BIN_NAME) $(BINARY)
	@echo "built $(BINARY) (version $(FULL_VERSION))"

build-all:
	@mkdir -p $(BIN_DIR)
	@for t in $(PLATFORMS); do rustup target add $$t >/dev/null 2>&1 || true; done
	@for t in $(PLATFORMS); do \
		os=$${t%-*}; arch=$${t##*-}; \
		case $$t in \
			aarch64-unknown-linux-gnu) \
				export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc \
					CC_aarch64_unknown_linux_gnu=aarch64-linux-gnu-gcc \
					AR_aarch64_unknown_linux_gnu=aarch64-linux-gnu-ar ;; \
		esac; \
		case $$t in \
			x86_64-unknown-linux-gnu) name=linux-amd64 ;; \
			aarch64-unknown-linux-gnu) name=linux-arm64 ;; \
			x86_64-apple-darwin) name=darwin-amd64 ;; \
			aarch64-apple-darwin) name=darwin-arm64 ;; \
			*) name=$$t ;; \
		esac; \
		printf "  %s... " $$t; \
		OMNI_VERSION=$(OMNI_VERSION) $(CARGO) build --release --target $$t && \
		cp target/$$t/release/$(BIN_NAME) $(BIN_DIR)/$(BIN_NAME)-$$name && echo "ok" || echo "FAILED"; \
	done
	@echo "Binaries in $(BIN_DIR)/:"
	@ls -1 $(BIN_DIR)/

build-darwin:
	@mkdir -p $(BIN_DIR)
	rustup target add x86_64-apple-darwin aarch64-apple-darwin >/dev/null 2>&1 || true
	OMNI_VERSION=$(OMNI_VERSION) $(CARGO) build --release --target x86_64-apple-darwin
	@cp target/x86_64-apple-darwin/release/$(BIN_NAME) $(BIN_DIR)/$(BIN_NAME)-darwin-amd64
	OMNI_VERSION=$(OMNI_VERSION) $(CARGO) build --release --target aarch64-apple-darwin
	@cp target/aarch64-apple-darwin/release/$(BIN_NAME) $(BIN_DIR)/$(BIN_NAME)-darwin-arm64
	@echo "built darwin binaries"

coverage:
	cargo llvm-cov --html
	@echo "Coverage report: file://$(CURDIR)/target/llvm-cov/html/index.html"

install:
	@mkdir -p $(HOME)/bin
	OMNI_VERSION=$(OMNI_VERSION) $(CARGO) build --release
	@cp target/release/$(BIN_NAME) $(HOME)/bin/$(BIN_NAME)
	@chmod +x $(HOME)/bin/$(BIN_NAME)
	@echo "Installed to $(HOME)/bin/$(BIN_NAME)"

clean:
	@rm -rf $(BIN_DIR) target
