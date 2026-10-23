# Omni (Go)

A personal CLI toolbox with 33 modules and an MCP server exposing 189 tools.
Read the repo-root `AGENTS.md` for the project-wide coding conventions; this
file only adds the commands, layout and conventions specific to this Go module.

## Commands

| Command          | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `make all`       | `format` + `lint` + `test` + `build`                 |
| `make format`    | `go fmt ./...`                                       |
| `make lint`      | `go vet ./...`                                       |
| `make test`      | `go test ./...`                                      |
| `make build`     | Build `bin/omni` (native)                            |
| `make build-all` | Cross-compile 4 platforms into `bin/` (zig)          |
| `make coverage`  | HTML coverage report in `./coverage`                 |
| `make tidy`      | `go mod tidy`                                        |
| `make install`   | Build to `~/bin/omni`                                |
| `make clean`     | Remove `./bin` and `./coverage`                      |

Version is injected at build time via `-ldflags` into
`src/cmd/version.V` as `<date>.<time>-<git-short-sha>`.

Verification before handoff: `make lint` exits 0, `make test` passes.

## Key Conventions

- Entrypoint is the module root `main.go` (`package main`) — it only calls
  `cmd.Execute()`. All commands live under `src/cmd/`.
- Standard layout: `main.go` + `src/cmd/` (33 module packages + `root.go`) +
  `src/libs/` (shared) + `src/data/` + `tests/`. Each top-level module exposes
  `NewCommand()`; subcommands are their own Go packages in subdirectories.
- Generic file naming, one responsibility per file/dir:
  - `cmd.go` — cobra command definition (one per command package)
  - `service.go` — pure logic, no cobra — in the same package directory; some
    modules split services further (e.g. `doi/internal/resolver_service.go`,
    `file/grep/search_service.go`)
  - `tui.go` — BubbleTea TUI model/view/update (casino blackjack/poker/baccarat,
    gemini code, openrouter code)
  - `*_test.go` — colocated tests, same package, e.g. `bmi_cmd_test.go`
- RunE pattern (return `error`), not `Run`. Error messages are lowercase.
  Output via `fmt.Println`, not `cmd.Printf`.
- `--json` (`-j`) is a persistent flag on the module root (28 modules;
  `completion`, `games`, `mcp`, `net`, `video`, `write` skip it). Read it in
  `RunE` with `cmd.Flags().GetBool("json")`.
- HTTP calls go through `requests.Get/Post/Put/Patch/Delete` from
  `src/libs/requests/` (15s client timeout, 10s per-request context, retries on
  network errors and 5xx with exponential backoff, JSON body marshaling).
- History tracking: `cmd.Execute()` calls `trackCommand()` →
  `libs/history.Append()` (timestamp, source cli/mcp, command path, CWD,
  duration, error). `omni help`, `omni completion`, `omni history`, and
  `omni mcp` are excluded from tracking.
- Follow repo-wide Go rules from the root [AGENTS.md](../../../../../AGENTS.md):
  `error` last, handle errors explicitly, `var` zero-init over `:=`, no global
  state, table-driven tests, return early — plus the repo `cobra.go`
  conventions (RunE, thin command bodies, `StringVarP`/`IntVarP` short flags).

## Shared Libraries (`src/libs/`)

| Library      | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `requests`   | HTTP client with retries/timeouts/headers/debug mode |
| `browser`    | Headless Chrome via go-rod (fetch HTML, screenshot)  |
| `chat`       | Shared BubbleTea base model for AI chat TUIs         |
| `colors`     | ANSI helpers with TTY detection                      |
| `history`    | JSONL command history at `~/.omni/history.jsonl`     |
| `mcp`        | MCP JSON-RPC protocol types + server loop            |
| `number`     | Integer formatting (zero-pad, comma)                 |
| `theme`      | Lipgloss styles + status glyphs                      |

## MCP Server

- `omni mcp serve` starts the MCP stdio server (JSON-RPC 2.0, newline-delimited
  JSON, protocol version `2025-11-25`). The server identifies as `omni-mcp`
  `1.0.0` and exposes `initialize`, `ping`, `tools/list`, `tools/call`.
- Tool discovery (`src/cmd/mcp/serve/discover_service.go`) walks the cobra
  tree (skipping `help`, `completion`, `mcp`), keeps command paths that have a
  `RunE`/`Run`, and registers **189 tools** using dot notation matching the CLI
  path (`file.read`, `search.files`, `calc.bmi`, `time.clock.now`).
- Schema generation (`schema_service.go`) maps cobra flags to JSON Schema
  (bool→boolean, int→integer, float64→number, string→string, slices→array);
  positional args are exposed as an `_args` array property.
- Execution (`exec_service.go`) runs in-process: flags are set directly,
  positional args passed to `RunE`, stdout captured via pipe (mutex-guarded),
  and each call is recorded in history with `source=mcp`.
- Configure in `.mcp.json`:
  ```json
  {"mcpServers":{"omni":{"command":"omni","args":["mcp","serve"]}}}
  ```
- TTY-dependent commands (e.g. `system monitor`, `gemini code`) may fail via
  MCP because no TTY is available.

## Data

- Command history: `~/.omni/history.jsonl` (append-only JSONL; cleared via
  `omni history clear`). No other persistent state.
- `src/data/countries.go` is the embedded ISO country-code map used by the
  `time`/`web` modules.

## Documentation

| Document        | Description                                  |
| --------------- | -------------------------------------------- |
| [docs](./docs/) | Architecture, contributing, downloads, packaging, roadmap |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Modules, libs, MCP internals |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Setup, commands, conventions, testing |
| [docs/DOWNLOADS.md](./docs/DOWNLOADS.md) | Get the binaries or build from source |
| [docs/PACKAGING.md](./docs/PACKAGING.md) | Build + CI artifact pipeline |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phased feature roadmap |