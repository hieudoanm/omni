# Omni CLI (Go)

> A personal CLI toolbox — 33 modules with 189 MCP-exposed tools: system,
> crypto, files, networking, PDFs, AI chat, games, time and more.

![Linux](https://img.shields.io/badge/platform-linux-blue)
![macOS](https://img.shields.io/badge/platform-macos-blue)
![Go](https://img.shields.io/badge/go-1.26%2B-blue)

---

## Latest release

- **Version:** `cli-latest` — rebuilt automatically on every
  push (see [PACKAGING](PACKAGING)).
- **What's new:** see the [ROADMAP](ROADMAP) and [CONTRIBUTING](CONTRIBUTING).

---

## Installation

Pick the option that fits your environment.

### Install script

```bash
curl -fsSL https://raw.githubusercontent.com/hieudoanm/omni/master/packages/cli/scripts/install.sh | bash
```

### Prebuilt binaries

| No  | Platform | Architecture | Download Link                            | Note                          |
| --- | -------- | ------------ | ---------------------------------------- | ----------------------------- |
| 1   | Linux    | amd64        | [Download `omni`][download-linux-amd64]  | Cross-compiled with zig (CGO) |
| 2   | Linux    | arm64        | [Download `omni`][download-linux-arm64]  | Cross-compiled with zig (CGO) |
| 3   | macOS    | amd64        | [Download `omni`][download-darwin-amd64] | Cross-compiled with zig (CGO) |
| 4   | macOS    | arm64        | [Download `omni`][download-darwin-arm64] | Cross-compiled with zig (CGO) |

[download-linux-amd64]: https://github.com/hieudoanm/omni/releases/download/cli-latest/omni-linux-amd64
[download-linux-arm64]: https://github.com/hieudoanm/omni/releases/download/cli-latest/omni-linux-arm64
[download-darwin-amd64]: https://github.com/hieudoanm/omni/releases/download/cli-latest/omni-darwin-amd64
[download-darwin-arm64]: https://github.com/hieudoanm/omni/releases/download/cli-latest/omni-darwin-arm64

```bash
chmod +x omni
./omni version
```

### Build from source

Prefer to build it yourself? Clone, build, and run in three steps:

```bash
git clone https://github.com/hieudoanm/omni.git
cd packages/cli
make build          # native build → bin/omni
# or cross-compile all four platforms:
# make build-all    # requires zig (see PACKAGING)
./bin/omni version
```

See [PACKAGING](PACKAGING) for the CI artifact pipeline and
[CONTRIBUTING](CONTRIBUTING) for setup and dev commands.

---

## About

Omni is a batteries-included CLI. Everything is one command away:

- **System monitoring** and **network diagnostics**.
- **PDF, image, and video processing**.
- **Crypto hashes** and **semver**.
- **Color conversion**, **search**, and **time tools**.
- **Chess analysis**, **Telegram**, **games**, and **AI chat**.

All via cobra subcommands with a uniform `--json` flag.

---

## Features

- **33 modules** — from `calc`, `crypto`, `file` and `search` to `pdf`,
  `video`, `image`, `web`, `telegram` and `write`
- **`--json`** — machine-readable output on 28 modules for scripts
- **AI chat** — `gemini code` and `openrouter code` TUI sessions
- **MCP server** — `omni mcp serve` exposes all 189 leaf commands as tools to
  AI agents (Claude Code, Cursor, VS Code) over stdio
- **Command history** — every invocation tracked in `~/.omni/history.jsonl`
  (`omni history list/search/stats`, `omni history clear`)
- **Shell completion** — `omni completion <bash|zsh|fish|powershell>`
- **Cross-platform** — linux/macOS × amd64/arm64 binaries

---

## MCP setup

```json
{ "mcpServers": { "omni": { "command": "omni", "args": ["mcp", "serve"] } } }
```

Tools are named with dot notation matching the CLI path — `file.read`,
`search.files`, `calc.bmi`, `time.clock.now`.

---

## First run

- `omni --help` and `omni <module> --help` show the full module tree
- Command history is written to `~/.omni/history.jsonl` (managed with
  `omni history clear`)

---

## Next steps

- Want to contribute? Read [CONTRIBUTING](CONTRIBUTING).
- Curious what's coming? Check the [ROADMAP](ROADMAP).

---

## License

See [LICENSE](LICENSE).
