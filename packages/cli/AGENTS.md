# Omni CLI (Rust)

Rust port of the Go CLI in [`packages/cli.go`](../cli.go) — a personal CLI
toolbox with an MCP server. Read the repo-root `AGENTS.md` for project-wide
conventions; this file covers the Rust port's layout and status.

## Commands

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `make all`        | `format` + `lint` + `test` + `build`                   |
| `make format`     | `cargo fmt`                                            |
| `make lint`       | `cargo clippy --all-targets -- -D warnings`            |
| `make test`       | `cargo test`                                           |
| `make build`      | Release build -> `bin/omni`                            |
| `make build-all`  | Cross-compile 4 targets into `bin/`                    |
| `make build-darwin` | darwin amd64+arm64 builds                           |
| `make coverage`   | `cargo llvm-cov --html` (requires cargo-llvm-cov)      |
| `make install`    | Build to `~/bin/omni`                                  |
| `make clean`      | Remove `bin/` and `target/`                            |

Version comes from `build.rs`: `OMNI_VERSION` env var if set, otherwise
`<date +%Y.%m.%d.%H.%M.%S>-<git short sha>` — same format as the Go
`-ldflags -X` injection.

## Port status

Phased port — modules land one at a time, mirroring `cli.go/src/cmd/`:

| Module         | Status      | Notes                                            |
| -------------- | ----------- | ------------------------------------------------ |
| `version`      | done        |                                                    |
| `convert`      | done        | all 16 subcommands incl. base64 encode/decode      |
| `history`      | done        | list/search/clear/stats over `~/.omni/history.jsonl` |
| `completion`   | done        | bash/zsh/fish via `clap_complete`                  |
| `english`      | done        | `define` — dictionary lookup via `requests::get`   |
| `port`         | done        | check/find/scan, sync `TcpStream`                  |
| `semver`       | done        | validate/compare/sort + root `--bump`/`--range`    |
| `doi`          | done        | fetch/cite/ref/validate, Crossref API, APA format  |
| `write`        | done        | summarize/grammar/rewrite/translate via OpenRouter |
| `openapi`      | done        | validate + openapi2postman (JSON/YAML via serde_yml) |
| `mcp`          | done        | `mcp serve` JSON-RPC stdio; tools exec via subprocess (`OMNI_MCP_SOURCE=mcp` marks history `source=mcp`) |
| `calc`         | done        | all 20 subcommands: age/base/bmi/compound/currency/date/discount/eval/factorial/gcd/lcm/loan/mortgage/percent/prime/random/stats/tax/tip/unit |
| `time`         | done        | age, clock now, cron, epoch, pomodoro, stopwatch, timer, until, world (`chrono-tz`, `ctrlc`, Go-layout `src/timefmt.rs`) |
| `better`       | done        | du/env/find/ls/ps/psaux/which with shared table printer |
| `system`       | done        | info/env/path/disk(+stats)/battery/monitor(JSON+ANSI loop)/clipboard (rusqlite -> ~/.omni/omni.db, sysinfo) |
| `data`         | done        | archive(zip)/csv/ebook/excel(info,to-csv,to-json via calamine)/json/split/yml |
| `search`       | done        | files/text/code/web; path-aware glob, regex text search, code symbol patterns, DuckDuckGo lite (scraper) |
| `file`         | done        | checksum/chmod/count/duplicates/edit/grep/head/read/size/stats/tail/type/write; md5/sha1/sha256/sha512, glob matcher |
| `net`          | done        | cert(info,check via openssl s_client + x509-parser)/http/ip(+dns A AAAA CNAME MX NS TXT via hand-rolled UDP DNS)/ping/serve(HTTP+TLS via rustls)/status(25 statuspage endpoints)/whois/wifi(nmcli linux, empty macOS like nocgo) |
| `video`        | done        | compress/convert/extract-audio/mute/resize/subtitles/to-gif/to-mp3/trim — ffmpeg shell-outs |
| `colors`       | done        | hex/rgb/hcl/oklch/palette/random + figma list/name/hex/palettes (797 colours, 144 palettes embedded) |
| `gh`           | done        | coc/ignore/languages/license/og — GitHub API via `requests`, `GITHUB_TOKEN` env, SVG generators |
| `docsify`      | done        | cobra (tree-sitter-go)/obsidian/scan(GraphML)/tree; internal walker+extractor+graph+writer ports |
| `crypto`       | done        | hash/hmac, jwt encode/decode, keygen (rsa/ecdsa/ed25519 PEM), passwd/pin/pronounceable, uuid, totp (base32+RFC3339 test time), encrypt/decrypt (AES-256-GCM nonce||ct), qrcode encode/decode (rqrr), barcode encode/decode (rxing writers+readers) |
| `casino`       | done        | blackjack(cheatsheet/count/play), poker(hand eval 7-card/odds Monte Carlo/play), baccarat(rules/strategy/play), slots, coin, dice, roulette; play cmds are ratatui TUIs (src/tui/) porting the Go Bubble Tea programs: blackjack bet/hit/stand/double, baccarat bet-side/deal, poker check/bet/raise/call/fold vs AI |
| `image`        | done        | background/blur/border/collage/combine/compress/convert/crop/dominant/flip/grayscale/icons/info/pixelate/resize/round/sharpen/split/text; imageproc + embedded basicfont 7x13 bitmap font |
| `web`          | done        | shopify detect, simplify (md/csv/images via readability-rust + html2md + headless_chrome), snapshot (headless_chrome + presets), weather (wttr.in), youtube fetch/thumbnails (Innertube + XML3 timedtext) |
| `openrouter`   | done        | models/status/serve/hook + `code` TUI — tool calls (read/write/edit/bash) with y/N approval, /help /models /model /probe /new /undo /exit |
| `requests` lib | partial     | `get`/`get_string`/`post_json`/`request`/`request_status` (ureq, 15s timeout, status-aware variant) |
| `browser` lib  | partial     | headless_chrome wrapper: capture/screenshot/presets; used by web snapshot + simplify images |
| `games`         | done        | anagram/reaction/recall/typerace/wordle — interactive stdin prompts (survey -> read_line), 10,268-word embedded list, wordle `--json` result |
| `chess`         | done        | elo, chess960, fen, pgn, play, setup + lichess/com APIs — shakmaty for SAN/FEN/UCI, hand-rolled PGN tokenizer, serde_json::Value passthrough for API output |
| `telegram`      | done        | all 60 Bot API leaves generated from Go services — token via --token/TELEGRAM_BOT_TOKEN, JSON flag passthrough, custom result printers for get-me/get-chat/invite-link/webhook-info |
| `gemini`        | done        | `code` TUI (ratatui; ports Go Bubble Tea chat) — model list + /help /new /undo /models /model /exit, GEMINI_API_KEY |
| `pdf`           | done        | all 24 leaves via lopdf + hayro: add-numbers/annotate/combine/convert/create/crop/delete/edit/extract/inspect/maintain/rearrange/security |

## Key conventions

- **clap derive** — `src/cli.rs` holds the root `Parser` + `Subcommand`
  enum; `dispatch()` matches on parsed args. Each module exposes an `Args`
  struct (with `#[command(subcommand)]` where it has children) and a `run()`.
- **Module roots with children** use `Option<Sub>` + a help fallback via
  `<Args as clap::Args>::augment_args` so bare `omni <module>` prints help,
  matching cobra's `RunE: cmd.Help()`.
- **`--json` (`-j`)** — `global = true` arg on each module root; thread the
  bool down to leaf `run()` functions (Go read it via `cmd.Flags()`).
- **History** — `src/history.rs` mirrors `cli.go/src/libs/history`: JSONL at
  `~/.omni/history.jsonl`, `source` is `cli`/`mcp`, `top_errors` is keyed by
  command name (same as Go). Tracked in `main.rs` after dispatch; excluded
  prefixes: `omni help`, `omni completion`, `omni history`, `omni mcp`.
- **Output** — `println!` for plain output; JSON via
  `serde_json::to_string_pretty` where Go used `MarshalIndent`, compact
  `to_string` where Go used `json.Marshal`.
- **Errors** — `anyhow::Result`; main prints `Error: {e:#}` and exits 1.
- **Interactive input** — Go used `survey.AskOne`; Rust prints `Text: ` and
  reads a line from stdin (`convert::internal::resolve_text`).

## Shared libs mapping (Go -> Rust)

| Go (`cli.go/src/libs/`) | Rust (`src/`)                    | Status |
| ----------------------- | -------------------------------- | ------ |
| `history`               | `history.rs`                     | done   |
| `requests`              | `requests.rs` (ureq, blocking)   | done   |
| `theme`, `colors`       | `tui/theme.rs` — ANSI-256 palette matching Go lipgloss colours in ratatui widgets | done |
| `browser` (go-rod)      | `browser.rs` (headless_chrome)   | done   |
| `chat`                   | done — `src/tui/chat.rs` shared chat view (markdown via termimad→ansi-to-tui) | |
| `mcp`                   | `mcp.rs`                         | done   |
| `number`                | covered per-module               | done   |
| `api` (Gemini vendored) | `gemini/client.rs` (ureq)        | done   |

## Gotchas

- `unicode_categories` + `unicode-normalization` replace Go's
  `unicode.IsMark`/`norm.NFD` for `convert deburr`.
- URL encode/decode (`convert url`) is hand-rolled to match Go's
  `url.QueryEscape`/`QueryUnescape` exactly (`+` for space, `~` unescaped).
- `Cargo.lock` is committed (binary crate).
