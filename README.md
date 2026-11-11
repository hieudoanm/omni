# Omni

**Five native platforms plus extensions and a static web page, one codebase — Android, iOS, macOS, CLI, Browser, VS Code, and Web.**

Omni is a personal toolbox that runs everywhere: a focus blocker and NFC toolkit on Android, an NFC toolkit on iOS, a menu-bar system monitor on macOS, a 33-module CLI with an MCP server, a browser extension, a VS Code theme, and a J.A.R.V.I.S.-style web page deployed to GitHub Pages. All seven share a single monorepo, a single CI pipeline, and a single rolling `latest` release.

[📱 Android](#android) · [📲 iOS](#ios) · [🖥️ macOS](#macos) · [⌨️ CLI](#cli) · [🌐 Browser](#browser) · [🔧 Technical Docs](AGENTS.md)

## The Problem

Personal tools are usually scattered across separate repos, each with its own build, release, and CI. You end up maintaining four pipelines, four versioning schemes, and four install paths for tools that conceptually belong together.

Meanwhile, most "cross-platform" approaches mean Electron or a web wrapper — slow, heavy, and non-native. Native tooling per platform (Kotlin/Jetpack Compose, Swift/SwiftUI, Go, TypeScript/Manifest V3) is better for performance, battery, and platform integration, but it fragments the codebase.

## The Solution

Omni keeps each platform **native** while unifying the rest:

| Platform | Language   | UI Framework        | Package            |
| -------- | ---------- | ------------------- | ------------------ |
| Android  | Kotlin     | Jetpack Compose     | `packages/mobile/android` |
| iOS      | Swift      | SwiftUI             | `packages/mobile/ios`     |
| macOS    | Swift      | SwiftUI             | `packages/desktop/macos`   |
| CLI      | Rust       | clap                      | `packages/cli`        |
| CLI (Go) | Go         | Bubble Tea / Cobra        | `packages/cli.go`     |
| Browser  | TypeScript | Manifest V3 / React | `packages/extensions/browser` |
| VS Code  | TypeScript | Theme                | `packages/extensions/vscode`  |
| Web      | TypeScript | Next.js 16 / React  | `packages/web`     |

- **Single monorepo** (pnpm + Turborepo) — one `pnpm install`, one `pnpm lint`, one `pnpm test`, one `pnpm build`.
- **Single CI** (`.github/workflows/ci.yaml`) — per-platform runners (Ubuntu for Android/CLI/Browser, macOS for macOS), proper toolchains, artifact uploads. iOS builds locally via `xcodebuild` (not yet in CI).
- **Single rolling release** — every push to `master` force-updates the `latest` GitHub Release with all four platform artifacts.
- **Single install script** — `curl -fsSL https://raw.githubusercontent.com/hieudoanm/omni/master/packages/cli.go/scripts/install.sh | bash` gets the right binary for your OS/arch.

No Electron. No shared UI layer. Just five best-in-class native apps and a static site that happen to live together.

## Features

### Android (`packages/mobile/android`)

Two tools in one app:

- **Focus Blocker** — pick apps to block, set a timer, and an accessibility service enforces it. Uses Jetpack Compose, Hilt, Room, DataStore, Robolectric tests.
- **NFC Toolkit** — scan tags, read NDEF records, view tech list, host-based card emulation (HCE). Foreground dispatch, tag dispatch, ISO-DEP APDU service.

**Stack:** Kotlin 2.4, Compose BOM 2026.09, Gradle 9.8, KSP, Hilt 2.60, Room 2.8, DataStore 1.3, ktlint 0.50 via Spotless.

### iOS (`packages/mobile/ios`)

The mobile hub plus the NFC Toolkit ported to iPhone:

- **Omni hub** — home screen with app cards, same HUD visual language as Android/web.
- **NFC Toolkit** — Core NFC tag discovery, NDEF read/write, tag metadata, scan history (SwiftData), settings. Local Orbitron/DM Mono fonts.

Platform limits vs Android: **no Focus Blocker** (iOS has no AccessibilityService-style app blocking) and **no HCE** (iOS cannot emulate NFC cards to external readers). Real tag scans require a physical device; the simulator builds and runs the UI but cannot scan.

**Stack:** Swift 6, SwiftUI, Core NFC, SwiftData, Xcode project (`Omni.xcodeproj`), `xcodebuild` via Makefile, `swiftformat`, Swift Testing.

### macOS (`packages/desktop/macos`)

Menu-bar system monitor:

- **Memory** — pressure, wired/active/compressed, swap, per-process breakdown.
- **Storage** — APFS volumes, snapshots, purgeable space, SMART health (via `smartctl`).
- **Network** — per-interface throughput, connections, `lsof` integration.
- **CPU** — per-core usage, thermal pressure, frequency.
- **Design system** — tokens for color, spacing, typography, elevation; reduced-motion support; snapshot tests.

**Stack:** Swift, SwiftUI, Xcode project (`Omni.xcodeproj` via xcodegen), Swift Testing (219 tests, 36 suites), `swiftformat`.

### CLI (`packages/cli`)

Rust implementation of the Omni CLI, built with Cargo + clap — the shipped `omni` binary (release artifacts and CI build from this package). All 33 modules ported from the Go reference, same `--json` flag, same `~/.omni/history.jsonl` tracking, and an MCP server exposing 437 tools over stdio.

**Stack:** Rust (stable), clap derive, serde/serde_json, Makefile targets identical to the Go package.

### CLI — Go reference (`packages/cli.go`)

> Legacy implementation kept for reference — no longer built by CI or shipped in releases.

33 modules + MCP server:

| Category   | Modules                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **Calc**   | age, base, bmi, compound, currency, date, loan, percent, tip, unit                               |
| **Casino** | baccarat, blackjack (play/count/cheatsheet), coin, dice, poker (hand/odds/play), roulette, slots |
| **Crypto** | hash, uuid                                                                                       |
| **Dev**    | gh (languages, og), json (jq/fmt), regex, uuid                                                   |
| **File**   | better (du, ls, tree), encode (base64, url), hash, mime, rename, split                           |
| **Net**    | curl, dns, headers, ip, port, whois                                                              |
| **OS**     | cpu, disk, load, mem, proc, sys, uptime                                                          |
| **Text**   | diff, grep, sort, wc                                                                             |
| **Web**    | fetch, html, youtube (thumbnails, transcript)                                                    |
| **Write**  | grammar, rewrite, summarize, translate                                                           |
| **MCP**    | `omni mcp serve` — exposes all modules as MCP tools                                              |

**Stack:** Go 1.27, Cobra, Bubble Tea, Zig for cross-compilation, pdfcpu v0.15 (pinned), vendored Gemini API client. 479 test packages.

### Browser (`packages/extensions/browser`)

Manifest V3 extension with React:

- Content script injection, background service worker, popup, options page.
- TypeScript, ESLint, Webpack 5, React 19, Tailwind CSS 4.

### Web (`packages/web`)

Static site deployed to GitHub Pages:

- Next.js 16 App Router with static export (`output: "export"`), Tailwind CSS 4, Turbopack.
- J.A.R.V.I.S.-style interface with speech recognition word lists in `public/data/`.

## Key Benefits

- **Native everywhere** — no Electron, no WebView, no compromises on performance or platform feel.
- **One command to rule them all** — `pnpm lint`, `pnpm test`, `pnpm build` run the correct toolchain per package.
- **Rolling `latest` release** — `https://github.com/hieudoanm/omni/releases/tag/latest` always has the newest build for every platform.
- **Install in one line** — the CLI install script detects OS/arch and pulls the matching binary from the `latest` release.
- **Vendored dependencies** — no external API module (`github.com/hieudoanm/api`); Gemini client copied into `packages/cli.go/src/libs/api/gemini.google.com`.
- **Pinned stability** — `pdfcpu v0.15.0` (v0.16.x breaks the `pdf` command; upstream issue).

## Get Started

### Prerequisites

| Tool        | Version                                     |
| ----------- | ------------------------------------------- |
| Node.js     | 26 (see `.node-version` / `.nvmrc`)         |
| pnpm        | 12                                          |
| JDK         | 25 (Temurin)                                |
| Android SDK | API 37 (via Android Studio or `sdkmanager`) |
| Xcode       | 15+ (macOS)                                 |
| Go          | 1.27                                        |
| Zig         | 0.13 (for CLI cross-compilation)            |

### Run locally

```sh
# Clone
git clone https://github.com/hieudoanm/omni.git
cd omni

# Install Node deps (extensions + web)
pnpm install

# Android
cd packages/mobile/android
ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleDebug

# iOS (requires Xcode)
cd ../ios
make build        # simulator build via xcodebuild

# macOS (requires Xcode)
cd ../macos
make app           # release build + Omni.app bundle

# CLI
cd ../cli
make build        # native binary at bin/omni
make build-all    # all 4 platforms at bin/omni-{os}-{arch}

# Browser
cd ../extensions/browser
pnpm dev          # webpack dev server
pnpm build        # dist/ for Manifest V3

# VS Code theme
cd ../vscode
pnpm package      # vsce package → build/*.vsix
```

### Quick test matrix

```sh
# From repo root
pnpm lint         # all workspace packages
pnpm typecheck    # browser, web
pnpm test         # all workspace packages
pnpm build        # all workspace packages
```

## CI Pipeline

`.github/workflows/ci.yaml` runs on every push/PR to `master`:

| Job                | Runner          | Steps                                                                                                                                          |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **android**        | `ubuntu-latest` | JDK 25 + Android SDK → `make lint` → `make test` → `make build` → upload `app-debug.apk`                                                        |
| **macos**          | `macos-latest`  | `make format-check` → `make lint` → `make test` → `make build` → `make app` → `make dmg` → CLI `make build-darwin` → upload `Omni.app` + `omni-darwin-*` |
| **cli**            | `ubuntu-latest` | Go 1.27 + Zig → `make format` → `make lint` → `make test` → `make build` → `make build-all` → upload `omni-*`                                  |
| **browser**        | `ubuntu-latest` | Node 26 + pnpm → `pnpm install` → `pnpm typecheck` → `pnpm lint:check` → `pnpm format:check` → `pnpm test` → `pnpm build` → upload `dist/`      |
| **web**            | `ubuntu-latest` | Node 26 + pnpm → `pnpm install` → `pnpm build` → upload Pages artifact                                                                         |
| **release-latest** | `ubuntu-latest` | *on push to master* → downloads all artifacts → force-updates GitHub Release `latest`; web deploys to GitHub Pages                             |

The `latest` release is the **single source of truth** for downloads. The CLI install script, Dockerfile, and docs all reference `https://github.com/hieudoanm/omni/releases/download/latest/...`.

## Install CLI

```sh
# One-liner (auto-detects OS/arch, installs to ~/bin)
curl -fsSL https://raw.githubusercontent.com/hieudoanm/omni/master/packages/cli.go/scripts/install.sh | bash

# Or download manually from the latest release:
# https://github.com/hieudoanm/omni/releases/tag/latest
```

## Project Structure

```
omni/
├── .github/workflows/ci.yaml     # Unified CI
├── turbo.json                    # Turborepo config (globalEnv for Android SDK)
├── pnpm-workspace.yaml           # packages/**
├── package.json                  # Root scripts: format, lint, test, build
├── packages/
│   ├── mobile/                   # Mobile apps
│   │   ├── android/              # Kotlin + Compose (not a pnpm workspace package)
│   │   │   ├── app/              # Main module
│   │   │   ├── build.gradle.kts  # Spotless + ktlint 0.50
│   │   │   ├── Makefile          # format/lint/test/build/clean
│   │   └── ios/                  # Swift + SwiftUI + Core NFC (not a pnpm workspace package)
│   │       ├── Omni/             # App sources (Hub, NFC, Theme)
│   │       ├── OmniTests/        # Swift Testing unit tests
│   │       ├── Omni.xcodeproj    # Xcode project
│   │       └── Makefile          # build/test/format/clean
│   ├── macos/                    # Swift + SwiftUI
│   │   ├── Omni.xcodeproj        # Xcode project (xcodegen)
│   │   ├── project.yml           # xcodegen spec — edit this
│   │   ├── Omni/                 # App target (App/, Services/, Views/, Resources/)
│   │   ├── OmniCore/             # Framework target (models, services)
│   │   ├── OmniTests/            # 219 tests, 36 suites
│   │   ├── Resources/            # AppIcon.iconset sources
│   │   ├── Makefile              # format/lint/test/build/app/dmg/install/clean
│   │   └── package.json          # @omni/macos
│   ├── cli/                      # Rust + clap (port of cli.go)
│   │   ├── src/                  # cli.rs + modules (version, convert, history, ...)
│   │   ├── Makefile              # format/lint/test/build/build-all/install/clean
│   │   └── package.json          # @omni/cli
│   ├── cli.go/                   # Go + Cobra + Bubble Tea (port reference)
│   │   ├── src/                  # 33 modules under cmd/
│   │   ├── scripts/install.sh    # Rolling release downloader
│   │   ├── docker/Dockerfile     # Alpine + install script
│   │   ├── Makefile              # format/lint/test/build/build-all/build-darwin/coverage/tidy/install/clean
│   │   └── package.json          # @omni/cli.go
│   ├── extensions/               # Editor extensions
│   │   ├── browser/              # TypeScript + Manifest V3 + React
│   │   │   ├── src/              # apps/, libs/, components/ (+ vitest unit tests)
│   │   │   ├── Makefile          # format/lint/test/build/clean
│   │   │   └── package.json      # @omni/browser
│   │   └── vscode/               # Nothing-inspired VS Code theme
│   │       ├── themes/           # nothing.json
│   │       └── package.json      # @omni/vscode
│   └── web/                      # Next.js 16 static export → GitHub Pages
│       ├── src/app/              # App Router pages
│       └── package.json          # @omni/web
├── AGENTS.md                     # Technical reference
└── LICENSE                       # MIT
```

## Technical Reference

See [AGENTS.md](AGENTS.md) for:
- Architecture decisions per package
- Adding a new CLI module
- Android Compose/Hilt patterns
- macOS SwiftUI/Swift Testing patterns
- Browser extension structure
- CI/CD details

## License

This project is licensed under the [MIT License](LICENSE).

---

**Omni** — one toolbox, five native homes.
