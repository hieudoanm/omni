# Roadmap

> Phased roadmap. Shipped items map to the omni module surface described in
> [ARCHITECTURE](ARCHITECTURE) and [DOWNLOADS](DOWNLOADS).

## Phase 1 — Core modules (shipped)

- [x] Cobra-based root command `omni` (`src/cmd/root.go`)
- [x] 33 modules: better, calc, casino, chess, colors, convert, crypto, data,
      docsify, doi, english, file, search, semver, port, telegram, time,
      system, net, web, version
- [x] `--json` persistent flag on 28 module roots
- [x] Shell completion (`omni completion <bash|zsh|fish|powershell>`)
- [x] Cross-platform `make build-all` with zig (linux/macOS × amd64/arm64)

## Phase 2 — Libraries & integrations (shipped)

- [x] `src/libs/requests` HTTP wrapper (retries, timeout, headers)
- [x] `src/libs/browser` headless Chrome automation (go-rod)
- [x] `src/libs/colors`, `theme` (lipgloss), `number` helpers
- [x] `src/libs/history` — command history in `~/.omni/history.jsonl`
- [x] `src/data/countries.go` ISO country map

## Phase 3 — AI & MCP (shipped)

- [x] AI chat TUIs: `gemini code`, `openrouter code` (BubbleTea + shared chat
      base model)
- [x] `omni mcp serve` — JSON-RPC stdio MCP server (`omni-mcp`, protocol
      `2025-11-25`)
- [x] Automatic cobra-tree discovery: 189 dot-named tools
- [x] Cobra-flag → JSON Schema generation (incl. `_args`)
- [x] In-process tool execution with stdout capture + history logging
- [x] `write` module (OpenRouter-powered summarize/grammar/rewrite/translate)

## Phase 4 — Media & games (shipped)

- [x] `pdf` module (combine, split, edit, annotate, create, security, OCR…)
- [x] `video` module via ffmpeg (compress, convert, gif, mp3, subtitles, trim…)
- [x] `image` module (19 subcommands: resize, crop, convert, collage…)
- [x] `games` module (anagram, wordle, typerace, reaction, recall)

## Phase 5 — Hardening

- [ ] Config file (`~/.omni.yaml`) for default flags and API keys
- [ ] `golangci-lint` as the lint gate (currently `go vet` only)
- [ ] `history` completion + fuzzy search across modules
- [ ] Windows (amd64/arm64) in `PLATFORMS` for `make build-all`

## Phase 6 — Ecosystem

- [ ] Homebrew tap / Scoop / winget manifests
- [x] `scripts/install.sh` downloads from the rolling release
- [ ] MCP resources + prompts support (`resources/*`, `prompts/*`)
- [ ] Pluggable auth/token stores for gemini/openrouter/telegram
