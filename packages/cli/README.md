# Omni CLI (Rust)

A personal CLI toolbox — Rust port of the Go implementation in
[`packages/cli.go`](../cli.go). Single `omni` binary built with Cargo.

## Status

Phased port. Currently implemented:

- `version` — print version (`OMNI_VERSION` env or `date-sha` from build.rs)
- `convert` — all 16 subcommands: `base64 encode|decode`, `braille`, `camelcase`,
  `capitalise`, `count`, `deburr`, `kebabcase`, `lorem`, `lowercase`, `morse`,
  `pascalcase`, `slug`, `snakecase`, `uppercase`, `url`
- `history` — `list`, `search`, `clear`, `stats` (`~/.omni/history.jsonl`)
- `completion` — bash/zsh/fish scripts via `clap_complete`
- `english` — `define` dictionary lookup
- `port` — `check`, `find`, `scan`
- `semver` — `validate`, `compare`, `sort`, plus root `--bump`/`--range`
- `doi` — `fetch`, `cite`, `ref`, `validate` (Crossref metadata, APA output)
- `write` — `summarize`, `grammar`, `rewrite`, `translate` (OpenRouter)
- `openapi` — `validate`, `openapi2postman` (JSON/YAML specs)
- `mcp` — `serve`: JSON-RPC 2.0 MCP server over stdio exposing all ported
  commands as tools
- `calc` — all 20 subcommands (`eval`, `bmi`, `loan`, `tax`, `unit`, …)
- `time` — `age`, `clock now`, `cron`, `epoch`, `pomodoro`, `stopwatch`,
  `timer`, `until`, `world` (chrono + chrono-tz)
- `better` — `du`, `env`, `find`, `ls`, `ps`, `psaux`, `which`
- `system` — `info`, `env`, `path`, `disk` (+ `stats`), `battery`,
  `monitor`, `clipboard` (sysinfo + rusqlite)
- `data` — `archive`, `csv`, `ebook`, `excel` (`info`/`to-csv`/`to-json`),
  `json`, `split`, `yml`
- `search` — `files`, `text`, `code`, `web` (DuckDuckGo lite)
- `file` — `checksum`, `chmod`, `count`, `duplicates`, `edit`, `grep`,
  `head`, `read`, `size`, `stats`, `tail`, `type`, `write`
- `net` — `cert` (`info`/`check`), `http`, `ip` (+ `dns`), `ping`,
  `serve`, `status`, `whois`, `wifi`
- `video` — `compress`, `convert`, `extract-audio`, `mute`, `resize`,
  `subtitles`, `to-gif`, `to-mp3`, `trim` (ffmpeg)
- `colors` — `hex`, `rgb`, `hcl`, `oklch`, `palette`, `random`,
  `figma` (`list`/`name`/`hex`/`palettes`)
- `gh` — `coc`, `ignore`, `languages`, `license`, `og`
- `docsify` — `cobra`, `obsidian`, `scan`, `tree`
- `crypto` — `hash`, `jwt` (`encode`/`decode`), `keygen`, `passwd`,
  `uuid`, `totp`, `encrypt`, `decrypt`, `qrcode` (`encode`/`decode`),
  `barcode` (`encode`/`decode`)
- `casino` — `blackjack` (`cheatsheet`/`count`/`play`), `poker`
  (`odds`/`play`), `baccarat` (`play`/`strategy`), `slots`, `coin`,
  `dice`, `roulette` (play commands auto-play; Go used Bubble Tea TUIs)

- `image` — `background`, `blur`, `border`, `collage`, `combine`,
  `compress`, `convert`, `crop`, `dominant`, `flip`, `grayscale`,
  `icons`, `info`, `pixelate`, `resize`, `round`, `sharpen`, `split`,
  `text` (bitmap font overlay, dominant colours, all fit modes)
- `web` — `shopify detect`, `simplify` (`md`/`csv`/`images`),
  `snapshot` (headless Chrome screenshots), `weather` (wttr.in),
  `youtube` (`fetch`/`thumbnails`)
- `openrouter` — `models`, `status`, `serve` (local chat API),
  `hook` (Telegram webhook + ngrok), `code` (agentic REPL with tool approval)
- `games` — `anagram`, `reaction`, `recall`, `typerace`, `wordle`
- `chess` — `elo`, `chess960`, `fen`, `pgn`, `play`, `setup`, `lichess`, `com`
- `telegram` — `bot`, `callback`, `chat`, `contact`, `dice`, `forum`, `game`, `gift`, `inline`, `invoice`, `location`, `message`, `poll`, `sticker`, `venue`, `webhook`
  (interactive stdin prompts; `wordle --json` emits the result)
- `gemini` — `code` REPL with model switching (Go used a Bubble Tea TUI)
- `pdf` — `add-numbers`, `annotate`, `combine` (merge/split), `convert`
  (from-images/to-images), `create`, `crop`, `delete`, `edit`
  (compress/redact/rotate/watermark), `extract` (images/text),
  `inspect` (info/metadata), `maintain` (ocr/repair), `rearrange`,
  `security` (encrypt/decrypt) — lopdf for manipulation, hayro for
  rasterisation, tesseract for OCR

All 33 Go modules are ported. See `AGENTS.md` for the status table.

## Commands

```bash
make build      # release build -> bin/omni
make build-all  # cross-compile linux/darwin x86_64/arm64 into bin/
make test       # cargo test
make lint       # cargo clippy --all-targets -- -D warnings
make format     # cargo fmt
make install    # install to ~/bin/omni
make clean      # remove bin/ and target/
```

Version is injected at build time: `OMNI_VERSION=<date>-<sha> make build`,
or computed automatically by `build.rs` (`YYYY.MM.DD.HH.MM.SS-<short-sha>`).

## Conventions

- clap (derive) command tree in `src/cli.rs`; each module mirrors the Go
  `src/cmd/<module>` layout under `src/`.
- `--json` / `-j` is a `global` arg on each module root, matching the Go
  persistent flag.
- Every command is tracked to `~/.omni/history.jsonl` except `help`,
  `completion`, `history`, and `mcp` (same exclusions as the Go CLI).
- Interactive prompts: when a text argument is omitted, commands prompt on
  stdin (Go used `survey`; Rust reads a line from stdin).
