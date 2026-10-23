# Contributing to omni

Thanks for contributing to Omni, a personal toolbox spanning Android, iOS,
macOS, a Rust CLI, a browser extension, a VS Code theme, and a static web
page — one monorepo, one CI pipeline, one rolling `latest` release.

## Read this first

[AGENTS.md](AGENTS.md) is the technical reference: per-package conventions,
root commands, CI artifacts, and gotchas. This file only covers the
contribution workflow.

## Repository layout

- `packages/mobile/android` — Kotlin + Jetpack Compose.
- `packages/mobile/ios` — Swift + SwiftUI (Xcode project via xcodegen).
- `packages/desktop/macos` — Swift + SwiftUI menu-bar app.
- `packages/cli` — Rust CLI (the shipped `omni` binary).
- `packages/cli.go` — legacy Go implementation kept as the port reference.
- `packages/extensions/browser` — Manifest V3 browser extension.
- `packages/extensions/vscode` — VS Code theme.
- `packages/web` — Next.js static site.

## Setup

```bash
git clone https://github.com/hieudoanm/omni.git
cd omni
pnpm install
```

Platform builds use per-package Makefiles (Gradle for Android, xcodebuild for
iOS/macOS, cargo for the Rust CLI). See the root commands in AGENTS.md.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Per-package checks run through the package Makefiles — never call
Gradle/Swift/Go directly from the root.

## Conventions

- Each platform owns its view layer — no shared UI code, no Electron.
- The Rust CLI must stay a complete port of the Go reference: same commands,
  same `--json` flag, same history format.
- Releases are rolling `latest` only — no version tags.
- Keep diffs minimal; don't reformat unrelated files.

## License

By contributing, you agree that your contributions will be licensed under the
repository license in [`LICENSE`](LICENSE).
