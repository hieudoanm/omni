# CLI Tech Stack — How-To Guides

> These guides describe the Go implementation (`packages/cli.go`). The Rust
> port (`packages/cli`) uses clap derive + Cargo; equivalent topics: clap
> (cobra.md), ratatui (bubbletea.md), rmcp/JSON-RPC (mcp.md), cargo
> cross-compile (cross-compile.md), cargo fmt/clippy/test (format-lint-test.md),
> `OMNI_VERSION` env (versioning.md).

| Guide                                      | Description                                       |
| ------------------------------------------ | ------------------------------------------------- |
| [cobra.md](cobra.md)                       | Command structure, flags, subcommands, completion |
| [bubbletea.md](bubbletea.md)               | Model-View-Update, styles, key bindings, testing  |
| [mcp.md](mcp.md)                           | MCP server, stdio transport, tool registration    |
| [vendoring.md](vendoring.md)               | Copying external code, go:generate, pinning deps  |
| [cross-compile.md](cross-compile.md)       | Zig CC, CGO_ENABLED, make build-all, platforms    |
| [format-lint-test.md](format-lint-test.md) | go fmt, go vet, go test, coverage, benchmarks     |
| [versioning.md](versioning.md)             | ldflags, date-sha, rolling latest, install script |
| [ci.md](ci.md)                             | Go 1.23, Zig 0.13, cache, cross-compile, upload   |

See also: [`packages/cli.go/docs/PACKAGING.md`](../../../packages/cli.go/docs/PACKAGING.md), [`packages/cli.go/docs/DOWNLOADS.md`](../../../packages/cli.go/docs/DOWNLOADS.md)
