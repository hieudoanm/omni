# Omni (Go)

> A personal CLI toolbox. 33 modules and 189 MCP-exposed tools covering system
> monitoring, crypto, files, networking, PDFs, AI chat, games, time, and more —
> built with Cobra, runnable as a terminal app or as an MCP server for AI
> agents.

## Features

- **33 modules** — `better`, `calc`, `casino`, `chess`, `colors`, `completion`,
  `convert`, `crypto`, `data`, `docsify`, `doi`, `english`, `file`, `games`,
  `gemini`, `gh`, `history`, `image`, `mcp`, `net`, `openapi`, `openrouter`,
  `pdf`, `port`, `search`, `semver`, `system`, `telegram`, `time`, `version`,
  `video`, `web`, `write`
- **`--json` output** — most modules support `-j/--json` machine-readable
  output
- **MCP server** — `omni mcp serve` exposes all leaf commands (189 tools) to
  Claude Code, Cursor, VS Code, and other MCP clients over stdio
- **AI chat TUIs** — `gemini code` and `openrouter code` (BubbleTea)
- **Cross-platform** — ships prebuilt binaries for linux/darwin × amd64/arm64
- **Shell completion** — `completion` command generates bash/zsh/fish/powershell
  scripts

See [docs/](./docs/) for architecture, contributing, downloads, packaging and
roadmap.

## Development

```bash
make build        # build bin/omni (native platform)
make build-all    # cross-compile bin/omni-{os}-{arch} for 4 platforms (zig)
make test         # go test ./...
make lint         # go vet ./...
make format       # go fmt ./...
make coverage     # HTML coverage report
make install      # install to ~/bin/omni
```

## Usage

```sh
omni <module> <command> [flags]
omni --help
omni completion bash
omni mcp serve
```

All modules support `--json` (`-j`) for JSON output.

## MCP Server

```bash
omni mcp serve
```

Configure in your `.mcp.json`:

```json
{"mcpServers":{"omni":{"command":"omni","args":["mcp","serve"]}}}
```

## Architecture

- **CLI:** `github.com/spf13/cobra`; root `omni` wired in `src/cmd/root.go`
- **Modules:** each top-level module is a Go package under `src/cmd/` with a
  `NewCommand()` entrypoint; subcommands live in their own subdirectories
- **Shared libs:** `src/libs/` — `requests` (HTTP), `chat` (TUI base), `colors`
  (ANSI), `history` (JSONL command log at `~/.omni/history.jsonl`), `mcp`
  (protocol + server), `number`, `theme` (lipgloss styles), `browser`
  (go-rod headless Chrome)
- **History:** every command is logged with timestamp, source, command path,
  CWD and duration
- **Cross-compile:** `make build-all` uses `zig cc` as the C cross-compiler for
  the 3 non-native platform targets

## Documentation

| Document                              | Description                          |
| ------------------------------------- | ------------------------------------ |
| [Architecture](./docs/ARCHITECTURE.md)| Modules, libs, MCP internals         |
| [Contributing](./docs/CONTRIBUTING.md)| Setup, commands, conventions, testing|
| [Downloads](./docs/DOWNLOADS.md)      | Prebuilt binaries or build from source |
| [Packaging](./docs/PACKAGING.md)      | Build + CI artifact pipeline         |
| [Roadmap](./docs/ROADMAP.md)          | Phased feature roadmap               |