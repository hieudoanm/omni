# Omni

**Four native platforms, one codebase — Android, macOS, CLI, and Browser.**

Omni is a personal toolbox that runs everywhere: a focus blocker and NFC toolkit on Android, a menu-bar system monitor on macOS, a 33-module CLI with an MCP server, and a browser extension. All four share a single monorepo, a single CI pipeline, and a single rolling `latest` release.

[📱 Android](#android) · [🖥️ macOS](#macos) · [⌨️ CLI](#cli) · [🌐 Browser](#browser) · [🔧 Technical Docs](AGENTS.md)

## The Problem

Personal tools are usually scattered across separate repos, each with its own build, release, and CI. You end up maintaining four pipelines, four versioning schemes, and four install paths for tools that conceptually belong together.

Meanwhile, most "cross-platform" approaches mean Electron or a web wrapper — slow, heavy, and non-native. Native tooling per platform (Kotlin/Jetpack Compose, Swift/SwiftUI, Go, TypeScript/Manifest V3) is better for performance, battery, and platform integration, but it fragments the codebase.

## The Solution

Omni keeps each platform **native** while unifying the rest:

| Platform | Language   | UI Framework        | Package            |
| -------- | ---------- | ------------------- | ------------------ |
| Android  | Kotlin     | Jetpack Compose     | `packages/android` |
| macOS    | Swift      | SwiftUI             | `packages/macos`   |
| CLI      | Go         | Bubble Tea / Cobra  | `packages/cli`     |
| Browser  | TypeScript | Manifest V3 / React | `packages/browser` |

- **Single monorepo** (pnpm + Turborepo) — one `pnpm install`, one `pnpm lint`, one `pnpm test`, one `pnpm build`.
- **Single CI** (`.github/workflows/ci.yaml`) — per-platform runners (Ubuntu for Android/CLI/Browser, macOS for macOS), proper toolchains, artifact uploads.
- **Single rolling release** — every push to `master` force-updates the `latest` GitHub Release with all four platform artifacts.
- **Single install script** — `curl -fsSL https://raw.githubusercontent.com/hieudoanm/omni/master/packages/cli/scripts/install.sh | bash` gets the right binary for your OS/arch.

No Electron. No shared UI layer. Just four best-in-class native apps that happen to live together.

## Features

### Android (`packages/android`)

Two tools in one app:

- **Focus Blocker** — pick apps to block, set a timer, and an accessibility service enforces it. Uses Jetpack Compose, Hilt, Room, DataStore, Robolectric tests.
- **NFC Toolkit** — scan tags, read NDEF records, view tech list, host-based card emulation (HCE). Foreground dispatch, tag dispatch, ISO-DEP APDU service.

**Stack:** Kotlin 2.4, Compose BOM 2026.09, Gradle 9.8, KSP, Hilt 2.60, Room 2.8, DataStore 1.3, ktlint 0.50 via Spotless.

### macOS (`packages/macos`)

Menu-bar system monitor:

- **Memory** — pressure, wired/active/compressed, swap, per-process breakdown.
- **Storage** — APFS volumes, snapshots, purgeable space, SMART health (via `smartctl`).
- **Network** — per-interface throughput, connections, `lsof` integration.
- **CPU** — per-core usage, thermal pressure, frequency.
- **Design system** — tokens for color, spacing, typography, elevation; reduced-motion support; snapshot tests.

**Stack:** Swift 6, SwiftUI, Swift Testing (219 tests, 36 suites), Swift Package Manager, `swiftformat`.

### CLI (`packages/cli`)

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

**Stack:** Go 1.23, Cobra, Bubble Tea, Zig for cross-compilation, pdfcpu v0.15 (pinned), vendored Gemini API client. 479 test packages.

### Browser (`packages/browser`)

Manifest V3 extension with React:

- Content script injection, background service worker, popup, options page.
- TypeScript, ESLint, Webpack 5, React 19, Tailwind CSS 4.

## Key Benefits

- **Native everywhere** — no Electron, no WebView, no compromises on performance or platform feel.
- **One command to rule them all** — `pnpm lint`, `pnpm test`, `pnpm build` run the correct toolchain per package.
- **Rolling `latest` release** — `https://github.com/hieudoanm/omni/releases/tag/latest` always has the newest build for every platform.
- **Install in one line** — the CLI install script detects OS/arch and pulls the matching binary from the `latest` release.
- **Vendored dependencies** — no external API module (`github.com/hieudoanm/api`); Gemini client copied into `packages/cli/src/libs/api/gemini.google.com`.
- **Pinned stability** — `pdfcpu v0.15.0` (v0.16.x breaks the `pdf` command; upstream issue).

## Get Started

### Prerequisites

| Tool        | Version                                     |
| ----------- | ------------------------------------------- |
| Node.js     | 26 (see `.node-version` / `.nvmrc`)         |
| pnpm        | 12                                          |
| JDK         | 21 (Temurin)                                |
| Android SDK | API 37 (via Android Studio or `sdkmanager`) |
| Xcode       | 15+ (macOS)                                 |
| Go          | 1.23                                        |
| Zig         | 0.13 (for CLI cross-compilation)            |

### Run locally

```sh
# Clone
git clone https://github.com/hieudoanm/omni.git
cd omni

# Install Node deps (browser only)
pnpm install

# Android
cd packages/android
ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleDebug

# macOS
cd ../macos
swift build -c release && make app

# CLI
cd ../cli
make build        # native binary at bin/omni
make build-all    # all 4 platforms at bin/omni-{os}-{arch}

# Browser
cd ../browser
pnpm dev          # webpack dev server
pnpm build        # dist/ for Manifest V3
```

### Quick test matrix

```sh
# From repo root
pnpm lint         # all 4 packages
pnpm test         # all 4 packages
pnpm build        # all 4 packages
```

## CI Pipeline

`.github/workflows/ci.yaml` runs on every push/PR to `master`:

| Job                | Runner          | Steps                                                                                                         |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------- |
| **android**        | `ubuntu-latest` | JDK 21 + Android SDK → `make lint` → `make test` → `make build` → upload `app-debug.apk`                      |
| **macos**          | `macos-latest`  | `make format` → `make lint` → `make test` → `make build` → `make app` → upload `Omni.app`                     |
| **cli**            | `ubuntu-latest` | Go 1.23 + Zig → `make format` → `make lint` → `make test` → `make build` → `make build-all` → upload `omni-*` |
| **browser**        | `ubuntu-latest` | Node 20 + pnpm → `pnpm install` → `pnpm lint` → `pnpm test` → `pnpm build` → upload `dist/`                   |
| **release-latest** | `ubuntu-latest` | *on push to master* → downloads all artifacts → force-updates GitHub Release `latest`                         |

The `latest` release is the **single source of truth** for downloads. The CLI install script, Dockerfile, and docs all reference `https://github.com/hieudoanm/omni/releases/download/latest/...`.

## Install CLI

```sh
# One-liner (auto-detects OS/arch, installs to ~/bin)
curl -fsSL https://raw.githubusercontent.com/hieudoanm/omni/master/packages/cli/scripts/install.sh | bash

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
│   ├── android/                  # Kotlin + Compose
│   │   ├── app/                  # Main module
│   │   ├── build.gradle.kts      # Spotless + ktlint 0.50
│   │   ├── Makefile              # format/lint/test/build/clean
│   │   └── package.json          # @omni/android
│   ├── macos/                    # Swift + SwiftUI
│   │   ├── Sources/              # OmniCore, Omni (app)
│   │   ├── Tests/                # 219 tests, 36 suites
│   │   ├── Resources/            # Info.plist, Omni.entitlements, AppIcon
│   │   ├── Package.swift         # SwiftPM
│   │   ├── Makefile              # format/lint/test/build/app/dmg/install/clean
│   │   └── package.json          # @omni/macos
│   ├── cli/                      # Go + Cobra + Bubble Tea
│   │   ├── src/                  # 33 modules under cmd/
│   │   ├── scripts/install.sh    # Rolling release downloader
│   │   ├── docker/Dockerfile     # Alpine + install script
│   │   ├── Makefile              # format/lint/test/build/build-all/coverage/tidy/install/clean
│   │   └── package.json          # @omni/cli
│   └── browser/                  # TypeScript + Manifest V3 + React
│       ├── src/                  # apps/, libs/, components/
│       ├── Makefile              # format/lint/test/build/clean
│       └── package.json          # @omni/browser
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

**Omni** — one toolbox, four native homes.
