# Architecture

## Tech Stack

| Layer        | Choice                                         |
| ------------ | ---------------------------------------------- |
| Language     | Go 1.26+ (module `github.com/hieudoanm/omni/packages/cli`)  |
| CLI          | `github.com/spf13/cobra` + `pflag`             |
| TUI          | BubbleTea / Bubbles / Lipgloss (v2)            |
| HTTP         | `src/libs/requests` wrapper (retries, timeout) |
| Browser      | `go-rod/rod` (headless Chrome)                 |
| System stats | `shirou/gopsutil/v4`                           |
| MCP          | custom stdio JSON-RPC server in `src/libs/mcp` |
| PDF/image    | `pdfcpu`, `disintegration/imaging`, `gozxing`  |
| Storage      | `mattn/go-sqlite3`, JSONL history              |
| Testing      | Standard `go test`, table-driven               |

## Directory Structure

```txt
go/
├── main.go              # Entrypoint (package main) → cmd.Execute()
├── src/
│   ├── cmd/             # Cobra root + 33 module packages
│   │   ├── root.go      # rootCmd, module registration, history tracking
│   │   ├── root_test.go
│   │   └── <module>/    # cmd.go, service.go, tui.go, *_test.go per command
│   ├── libs/            # Shared libraries (8): requests, browser, chat,
│   │                    #   colors, history, mcp, number, theme
│   └── data/            # countries.go (ISO country map)
├── tests/               # integration_test.go — black-box binary tests
├── scripts/             # install.sh
├── TREE.md              # generated directory tree (docsify tree)
└── docs/                # This documentation set
```

## Entrypoint (`main.go`)

The module root is `package main`. `main.go` calls `src/cmd.Execute()`, which:

1. Registers all module commands on the root in `init()` (33 modules).
2. Runs `rootCmd.Execute()` (cobra).
3. Records history via `trackCommand()` → `libs/history.Append()`
   (`~/.omni/history.jsonl`; skips `help`, `completion`, `history`,
   `mcp` paths).
4. Exits 1 on error.

## Command tree

```
omni
├── better      du env find ls ps psaux which
├── calc        tax loan currency bmi base unit percent mortgage date eval stats ... (20)
├── casino      blackjack(play/cheatsheet/count) poker(play/odds) baccarat slots coin dice roulette
├── chess       fen pgn play elo chess.com chess960 lichess.org setup
├── colors      hex rgb hcl oklch palette random figma
├── completion  (shell completion, --shell)
├── convert     base64 braille camelcase morse slug ... (15)
├── crypto      barcode hash jwt keygen passwd uuid qrcode encrypt decrypt totp
├── data        archive csv ebook excel json split yml
├── docsify     cobra obsidian scan tree
├── doi         cite ref fetch validate
├── english     define
├── file        checksum chmod count duplicates edit grep head read size stats tail type write (13)
├── games       anagram reaction recall typerace wordle
├── gemini      code (AI chat TUI)
├── gh          coc ignore languages license og
├── history     list search clear stats
├── image       background blur border collage combine compress convert crop dominant flip grayscale icons info pixelate resize round sharpen split text (19)
├── mcp         serve
├── net         cert ip ping serve status wifi http whois
├── openapi     postman validate
├── openrouter  serve status models hook code
├── pdf         combine security extract edit inspect maintain convert crop delete rearrange addnumbers create annotate (13)
├── port        check find scan
├── search      files text code web
├── semver      validate compare sort (bump/range via root flags)
├── system      monitor clipboard info env path disk battery
├── telegram    message webhook chat location venue contact poll dice sticker bot forum game callback inline invoice gift (16)
├── time        clock cron epoch pomodoro timer until world age stopwatch (9)
├── version     (leaf — prints build version)
├── video       compress convert extractaudio mute resize subtitles togif tomp3 trim (9)
├── web         shopify simplify snapshot weather youtube
└── write       summarize grammar rewrite translate
```

Every leaf command (one with `RunE`/`Run`) becomes an MCP tool when served:
189 tools with dot-notation names like `file.read`, `search.files`,
`calc.bmi`, `time.clock.now`.

## Modules

### CLI wiring (`src/cmd/root.go`)

`rootCmd` is a package-level `*cobra.Command`. Each module package exports
`NewCommand() *cobra.Command`; `completion` and `mcp` additionally receive the
root for shell-completion generation and tree discovery. `init()` registers
all 33 via `rootCmd.AddCommand(...)`.

### Requests library (`src/libs/requests`)

HTTP wrapper used by network-y modules. Client timeout 15s, per-request
timeout 10s, retries on network errors / HTTP 5xx with exponential backoff
`(attempt+1)*300ms`, JSON body auto-marshaling, optional headers/query/debug.
Exposes `Get`, `Post`, `Put`, `Patch`, `Delete` as
`(url, Options) ([]byte, error)`.

### History (`src/libs/history`)

Append-only JSONL at `~/.omni/history.jsonl`: timestamp, source (`cli`|`mcp`),
command path, CWD, duration, error. `omni history list/search/stats/clear`.

### MCP (`src/libs/mcp` + `src/cmd/mcp`)

- `src/libs/mcp/protocol.go` — JSON-RPC 2.0 types, tool/schema types, error
  codes, response constructors.
- `src/libs/mcp/server.go` — `Server` with `AddTool`/`Run`; dispatches
  `initialize`, `ping`, `tools/list`, `tools/call` over newline-delimited
  JSON on stdin (identifies as `omni-mcp` `1.0.0`).
- `src/cmd/mcp/serve/discover_service.go` — walks the cobra tree, keeps
  command paths with an action, registers 189 dot-named tools, skips
  `help`/`completion`/`mcp`.
- `src/cmd/mcp/serve/schema_service.go` — cobra flags → JSON Schema properties,
  positional args → `_args` array, defaults included.
- `src/cmd/mcp/serve/exec_service.go` — in-process execution: sets flags,
  passes positional args, captures stdout/stderr via pipe (mutex-guarded),
  records history with `source=mcp`.

### AI chat (`src/libs/chat` + `gemini code` / `openrouter code`)

Shared BubbleTea base model (viewport, textarea, spinner, markdown rendering)
drives the interactive chat TUIs in `gemini code` and `openrouter code`.

### System/browser (go-rod)

`src/libs/browser` wraps headless Chrome (path resolution, viewport presets,
`FetchHTML`, `Capture` screenshot/PDF, `GetPageInfo`) — used by `web snapshot`,
`web simplify` and similar.

## Configuration

Omni reads no environment variables and stores no config files. Two data
sources exist:

- `~/.omni/history.jsonl` — command history (append-only, user-owned)
- `src/data/countries.go` — embedded ISO country-code map

Version is baked in at build time (`-ldflags` → `src/cmd/version.V`).
