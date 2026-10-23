# Omni — Technology Stack & Decisions

## 1. Purpose

This document records **which technologies are chosen and why** for the Omni monorepo. Companion how-to docs live under `docs/08-tech-stack/` (to be created as needed).

Where this file disagrees with other numbered documents, the numbered documents govern.

## 2. How Decisions Are Made

1. Prefer the boring, mature option.
2. One tool per responsibility.
3. Types and validation at the boundaries (Kotlin, Swift, Go, TypeScript).
4. Reproducibility: pinned deps, lockfiles, vendor copies.
5. Justify every dependency.
6. Record the rejected alternative.

Non-negotiable:
- **Native per platform** — no Electron, no WebView, no shared UI layer.
- **Rolling `latest` release** — one tag updated on every master push.
- **Vendored, not linked** — external code copied in (Gemini client), not replaced.

## 3. Stack at a Glance

| Layer           | Android                  | macOS         | CLI                | Browser                    | Cross-cutting    |
| --------------- | ------------------------ | ------------- | ------------------ | -------------------------- | ---------------- |
| Language        | Kotlin 2.4               | Swift 6       | Go 1.23            | TypeScript 6.0             | —                |
| UI Framework    | Jetpack Compose          | SwiftUI       | Bubble Tea (TUI)   | React 19 / Manifest V3     | —                |
| Build           | Gradle 9.8 (wrapper)     | SwiftPM       | `go build` + Zig   | Webpack 5                  | Turborepo 2.11   |
| Package Manager | Maven/Gradle             | SwiftPM       | Go modules         | pnpm 12.15                 | pnpm workspace   |
| DI              | Hilt 2.60                | —             | —                  | —                          | —                |
| Database        | Room 2.8                 | —             | —                  | —                          | —                |
| Preferences     | DataStore 1.3            | —             | —                  | —                          | —                |
| Testing         | Robolectric + JUnit 4    | Swift Testing | `go test`          | Vitest + Playwright        | —                |
| Format          | Spotless + ktlint 0.50   | swiftformat   | `go fmt`           | Prettier + Tailwind plugin | —                |
| Lint            | Android Lint             | `swift build` | `go vet`           | ESLint                     | —                |
| CI Runner       | Ubuntu (android-actions) | macOS-latest  | Ubuntu (Go + Zig)  | Ubuntu (Node + pnpm)       | GitHub Actions   |
| Artifacts       | `app-debug.apk`          | `Omni.app`    | `omni-{os}-{arch}` | `dist/` (V2+V3)            | `latest` release |

## 4. Android (`packages/android`)

### 4.1 Kotlin + Jetpack Compose

**Choice:** Kotlin 2.4.21, Compose BOM 2026.09.00, Material3.

**Why:** Current stable; Compose is Google's recommended UI toolkit; Material3 provides design system components.

**Rejected:** XML + ViewBinding (legacy), Flutter (non-native, Dart), React Native (JS bridge).

### 4.2 Hilt for Dependency Injection

**Choice:** Hilt 2.60.1 (Dagger wrapper), KSP for codegen.

**Why:** Android-standard DI; compile-time validation; integrates with ViewModel, WorkManager, Navigation.

**Rejected:** Koin (runtime, no compile safety), manual factories (boilerplate), Dagger raw (verbose).

### 4.3 Room + DataStore

**Choice:** Room 2.8.5 for SQLite, DataStore Preferences 1.3.0 for key-value.

**Why:** Room = compile-time SQL verification, Flow support, migrations. DataStore = coroutine-friendly, migration from SharedPreferences.

**Rejected:** Raw SQLite (no verification), Realm (heavy), SharedPreferences (deprecated, no Flow).

### 4.4 NFC Stack

**Choice:** `NfcAdapter.enableForegroundDispatch()` with `ACTION_TAG_DISCOVERED` (suppressed deprecation), `Ndef`/`IsoDep` for reading, HCE service for card emulation.

**Why:** Foreground dispatch gives priority; `ACTION_TAG_DISCOVERED` catches tags without NDEF; HCE enables host-based emulation.

**Rejected:** Reader mode (API 19+, limited), background dispatch (lower priority), third-party NFC libs (unmaintained).

### 4.5 Testing

**Choice:** Robolectric 4.17 + JUnit 4 + Turbine (Flow testing) + MockK.

**Why:** Robolectric runs Android tests on JVM (fast); Turbine tests `Flow`/`StateFlow` emissions; MockK is Kotlin-first mocking.

**Rejected:** Instrumented tests on device (slow, flaky), Espresso (UI only), JUnit 5 (Robolectric 4.x best with JUnit 4).

### 4.6 Format/Lint

**Choice:** Spotless 6.25 + ktlint 0.50.0 for Kotlin/Gradle/Markdown/JSON/XML/YAML; Android Lint.

**Why:** Spotless integrates with Gradle; ktlint is the Kotlin community standard; Android Lint catches SDK/API issues.

**Rejected:** ktfmt (Google style only), detekt (rules overlap with ktlint + Android Lint), manual formatting.

## 5. macOS (`packages/macos`)

### 5.1 Swift + SwiftUI

**Choice:** Swift 6, SwiftUI, Swift Package Manager.

**Why:** Apple's modern declarative UI; SPM is native package manager; Swift 6 adds data-race safety.

**Rejected:** AppKit/UIKit (imperative, verbose), Objective-C (legacy), Catalyst (iOS port, not native macOS).

### 5.2 Architecture

**Choice:** `OmniCore` (models, services, providers) + `Omni` (app, views). Observable objects + `@Environment` for DI.

**Why:** Separation of concerns; testable core without UI; SwiftUI's environment injection is lightweight.

**Rejected:** TCA (The Composable Architecture) — extra dependency, learning curve; VIPER/MVVM (boilerplate).

### 5.3 Swift Testing

**Choice:** Swift Testing (`@Suite`, `@Test`, `#expect`) — 219 tests, 36 suites.

**Why:** Native Swift testing; parameterized tests; traits; parallel execution; built into Swift 6 toolchain.

**Rejected:** XCTest (legacy, verbose), Quick/Nimble (extra dep), SnapshotTesting (separate lib, but used for UI snapshots).

### 5.4 Design Tokens

**Choice:** `DesignTokens.swift` — color, spacing, typography, elevation, radius, animation as `struct` constants.

**Why:** Single source of truth; compile-time access; works with SwiftUI `EnvironmentValues`.

**Rejected:** JSON + runtime parsing (no compile safety), Figma tokens plugin (external tool), hard-coded values.

### 5.5 Format/Lint

**Choice:** `swiftformat` (defaults) for format; `swift build` (warnings as errors via `-w` in `Package.swift`) for lint.

**Why:** `swiftformat` is the de facto standard; zero config; `swift build` catches compiler warnings.

**Rejected:** SwiftLint (rules overlap with compiler), manual formatting.

## 6. CLI (`packages/cli`)

### 6.1 Go + Cobra + Bubble Tea

**Choice:** Go 1.23, Cobra for CLI commands, Bubble Tea for TUI modules.

**Why:** Go = single binary, cross-compile, fast startup; Cobra = industry standard CLI framework; Bubble Tea = Elm-style TUI, composable.

**Rejected:** urfave/cli (less composable), click (Python), raw flag parsing (boilerplate), Electron (heavy).

### 6.2 Module Structure

**Choice:** 33 modules under `src/cmd/<category>/<module>/` — each with `cmd.go`, optional `service.go`, `*_test.go`.

**Why:** Clear ownership; easy to add/remove; `go test ./...` runs all; Cobra auto-discovers subcommands.

**Rejected:** Flat structure (clutters root), plugin system (over-engineered for single binary).

### 6.3 MCP Server

**Choice:** `src/cmd/mcp/serve.go` exposes all modules as MCP tools over stdio.

**Why:** Model Context Protocol is emerging standard; stdio transport works with any LLM client; zero config.

**Rejected:** HTTP server (needs port, auth), custom protocol (non-standard).

### 6.4 Vendored Dependencies

**Choice:** Gemini client copied to `src/libs/api/gemini.google.com/`; `pdfcpu v0.15.0` pinned (v0.16.x breaks `pdf` command).

**Why:** Old `github.com/hieudoanm/api` module abandoned; vendoring gives control; pinning avoids upstream breakage.

**Rejected:** Replace directive (fragile, not hermetic), forking (maintenance burden), upgrading `pdfcpu` (breaking changes).

### 6.5 Cross-Compilation

**Choice:** `make build-all` uses Zig CC for non-native targets:
- Native: `CGO_ENABLED=1`
- Cross: `CC="zig cc -target <zig-arch>-<zig-os>" CGO_ENABLED=1`

**Why:** Zig provides libc + linker for all targets; single toolchain; no Docker needed.

**Rejected:** `xgo` (Docker-based, slower), GoReleaser (extra config), separate CI jobs per platform.

### 6.6 Format/Lint/Test

**Choice:** `go fmt ./...`, `go vet ./...`, `go test ./...` (479 packages).

**Why:** Built into Go toolchain; zero config; fast; standard across Go ecosystem.

**Rejected:** golangci-lint (extra tool, slow), staticcheck (overlaps with vet), testify (stdlib `testing` sufficient).

## 7. Browser (`packages/browser`)

### 7.1 TypeScript + Manifest V3 + React

**Choice:** TypeScript 6.0.3, Manifest V3, React 19, Tailwind CSS 4.

**Why:** MV3 is required for Chrome Web Store; React for popup/options UI; Tailwind for styling; TS for safety.

**Rejected:** Manifest V2 (deprecated), vanilla JS (no types), Svelte/Vue (extra learning), CSS modules (no tokens).

### 7.2 Webpack 5

**Choice:** Separate configs for background, content, popup, options.

**Why:** Each entry point has different constraints (service worker vs DOM); Webpack handles code splitting, assets, TS.

**Rejected:** Vite (MV3 config complex), esbuild (no CSS extraction for MV3), Rollup (similar to Webpack).

### 7.3 Format/Lint/Test

**Choice:** Prettier + Tailwind plugin; ESLint (`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-tailwindcss`); Vitest (jsdom).

**Why:** Prettier + Tailwind plugin sorts classes; ESLint catches TS/React issues; Vitest is fast, Vite-compatible.

**Rejected:** `rome`/`biome` (immature for TS/React), Jest (slower, config), Playwright only (no unit layer).

## 8. Cross-Cutting Tooling

### 8.1 Monorepo: pnpm + Turborepo

**Choice:** pnpm 12.15.0 workspace (`packages/**`); Turborepo 2.11 for task orchestration.

**Why:** pnpm = fast, disk-efficient, strict dependencies; Turbo = caching, parallelism, `globalEnv` for `ANDROID_HOME`/`JAVA_HOME`.

**Rejected:** npm/yarn workspaces (hoisting issues), Nx (heavy), Bazel (overkill), plain Make (no caching).

### 8.2 CI: GitHub Actions

**Choice:** Per-platform runners with proper toolchains:
- Ubuntu: Android (JDK 21 + Android SDK), CLI (Go + Zig), Browser (Node + pnpm)
- macOS-latest: macOS (Xcode + SwiftPM)

**Why:** Native toolchains need native runners; Android SDK only on Linux; macOS signing only on macOS.

**Rejected:** Self-hosted (maintenance), single Ubuntu with Docker for macOS (codesign fails), Cirrus/Buildkite (vendor lock-in).

### 8.3 Rolling Release

**Choice:** `softprops/action-gh-release@v2` with `tag_name: latest`, `make_latest: true` on every master push.

**Why:** Single URL for install script; no version management; always current.

**Rejected:** SemVer tags (maintenance), GitHub Packages (auth required), manual release (toil).

### 8.4 Install Script

**Choice:** `packages/cli/scripts/install.sh` — detects OS/arch, downloads from `latest` release, installs to `~/bin`.

**Why:** Zero-dep bash; works on Linux/macOS; curl | bash friendly; `REPO`/`INSTALL_DIR` overridable.

**Rejected:** Homebrew (review delay), Scoop/Chocolatey (Windows only), npm package (Node dep), Go install (no cross-compile).

## 9. Explicitly Out of Stack

- Electron, Tauri, Wails, Flutter, React Native, Capacitor
- Shared UI layer / design tokens across platforms
- Kubernetes, Helm, cloud deployment (local-only CLI tools)
- GraphQL, gRPC, tRPC (CLI is single binary, no API)
- Redis, Kafka, PostgreSQL (no backend services)
- Semantic versioning tags (rolling `latest` only)
- External API modules (vendored instead)

## 10. Version Pinning Summary

| Dependency  | Version    | Pinned?               | Reason                                     |
| ----------- | ---------- | --------------------- | ------------------------------------------ |
| Kotlin      | 2.4.21     | Yes                   | Compose compiler compatibility             |
| Compose BOM | 2026.09.00 | Yes                   | Locked to Kotlin version                   |
| Gradle      | 9.8.2      | Yes (wrapper)         | Reproducible builds                        |
| ktlint      | 0.50.0     | Yes                   | Spotless plugin; 0.54 not on Maven Central |
| Swift       | 6          | Toolchain             | Xcode 15+                                  |
| swiftformat | latest     | No                    | Zero config, backward compatible           |
| Go          | 1.23       | Yes                   | Toolchain version                          |
| pdfcpu      | v0.15.0    | Yes                   | v0.16.x breaks pdf command                 |
| Zig         | 0.13.0     | Yes                   | Cross-compile stability                    |
| Node        | 26.12.1    | Yes (`.node-version`) | LTS at time of writing                     |
| pnpm        | 12.15.0    | Yes                   | Workspace + CI                             |
| TypeScript  | 6.0.3      | Yes                   | Browser package                            |
| React       | 19         | Yes                   | Browser package                            |
| Webpack     | 5          | Yes                   | Browser package                            |

## 11. References

- `AGENTS.md` — Technical reference index
- `README.md` — Project overview, quick start
- `.github/workflows/ci.yaml` — Full CI definition
- `packages/android/docs/12-operations.md` — Android dev commands
- `packages/macos/Docs/CONTRIBUTING.md` — macOS contributing
- `packages/cli/docs/PACKAGING.md` — CLI release/packaging
- `packages/cli/docs/DOWNLOADS.md` — Download URLs for `latest`
