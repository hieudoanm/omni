# AGENTS.md

- Technical reference for working in the Omni monorepo.
- The README explains what the project is.
- This file is the index; each package has its own conventions.

## Read this first

- **Four native packages, one monorepo** — no shared UI, no Electron.
- `pnpm` + Turborepo for Node workspaces (browser only); Gradle, SwiftPM, Go for native.
- Root scripts delegate to per-package Makefiles: `format`, `lint`, `test`, `build`.
- CI uses per-platform runners: Ubuntu (Android, CLI, Browser), macOS (macOS).
- Rolling `latest` release on every push to `master`.

## Package Quick Reference

| Package            | Language   | Build                     | Format                                    | Lint                  | Test                          |
| ------------------ | ---------- | ------------------------- | ----------------------------------------- | --------------------- | ----------------------------- |
| `packages/android` | Kotlin     | `./gradlew assembleDebug` | `./gradlew spotlessApply`                 | `./gradlew lintDebug` | `./gradlew testDebugUnitTest` |
| `packages/macos`   | Swift      | `swift build -c release`  | `swiftformat Sources Tests Package.swift` | `swift build`         | `swift test`                  |
| `packages/cli`     | Go         | `go build`                | `go fmt ./...`                            | `go vet ./...`        | `go test ./...`               |
| `packages/browser` | TypeScript | `pnpm build`              | `prettier --write`                        | `eslint --fix`        | `vitest`                      |

## Root Commands

```bash
pnpm install          # installs browser deps only
pnpm format           # turbo run format (all 4)
pnpm lint             # turbo run lint (all 4)
pnpm test             # turbo run test (all 4)
pnpm build            # turbo run build (all 4)
```

## Per-Package Conventions

### Android (`packages/android`)

- **Kotlin 2.4**, Compose BOM 2026.09, Gradle 9.8 (wrapper).
- **Hilt** for DI — `@HiltAndroidApp` on `OmniApp`, `@AndroidEntryPoint` on Activities, `@HiltViewModel` on ViewModels.
- **Compose** — Material3, `remember`/`derivedStateOf`, `LaunchedEffect` for side effects.
- **Room** — DAOs return `Flow`; `@Entity` with `@PrimaryKey(autoGenerate = true)`.
- **DataStore Preferences** — `Preferences.DataStore<Preferences>`, typed keys via `stringPreferencesKey()`.
- **NFC** — `NfcAdapter.enableForegroundDispatch()` with `ACTION_TAG_DISCOVERED` (suppressed deprecation), `Ndef`/`IsoDep` for reading.
- **Tests** — Robolectric 4.17, JUnit 4, Turbine for Flow testing, MockK for mocks.
- **Format** — Spotless + ktlint 0.50.0 (configured in `app/build.gradle.kts`).
- **Lint** — Android Lint (`:app:lintDebug`), zero warnings.
- **No `local.properties`** — `ANDROID_HOME` from env / CI.

### macOS (`packages/macos`)

- **Swift 6**, SwiftUI, Swift Package Manager.
- **Architecture** — `OmniCore` (models, services, providers), `Omni` (app, views).
- **Swift Testing** — `@Suite`, `@Test`, `#expect`, 219 tests / 36 suites.
- **Design tokens** — `DesignTokens.swift`: color, spacing, typography, elevation, radius, animation.
- **Reduced motion** — `@Environment(\.accessibilityReduceMotion)` respected.
- **Snapshot tests** — `ImageRenderer` + `assertSnapshot` in `Tests/SnapshotTests/`.
- **Format** — `swiftformat` (no config file; defaults).
- **Lint** — `swift build` (warnings as errors via `-w` in `Package.swift`).
- **App bundle** — `make app` creates `.app` with `Info.plist`, `AppIcon.icns`, `Omni.entitlements`.
- **DMG** — `make dmg` creates signed distributable.

### CLI (`packages/cli`)

- **Go 1.23**, Cobra for commands, Bubble Tea for TUI modules.
- **Module path** — `github.com/hieudoanm/omni/packages/cli`.
- **33 modules** under `src/cmd/` — each has `cmd.go`, optional `service.go`, `*_test.go`.
- **MCP server** — `src/cmd/mcp/serve.go` exposes all modules as MCP tools over stdio.
- **Vendored API** — Gemini client at `src/libs/api/gemini.google.com/` (copied from old `github.com/hieudoanm/api`).
- **Pinned deps** — `pdfcpu v0.15.0` (v0.16.x breaks `pdf` command).
- **Cross-compile** — `make build-all` uses Zig CC for non-native targets (`linux/amd64`, `linux/arm64`, `darwin/amd64`, `darwin/arm64`).
- **Version** — `-ldflags="-X github.com/hieudoanm/omni/packages/cli/src/cmd/version.V=date-sha"`.
- **Format** — `go fmt ./...`
- **Lint** — `go vet ./...`
- **Test** — `go test ./...` (479 packages).
- **Install script** — `scripts/install.sh` downloads from `latest` release, `REPO=hieudoanm/omni`, `RELEASE=latest`, asset `omni-{os}-{arch}`.

### Browser (`packages/browser`)

- **TypeScript 6.0**, Manifest V3, React 19, Tailwind 4.
- **Webpack 5** — separate configs for background, content, popup, options.
- **ESLint** — `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-tailwindcss`.
- **Prettier** — Tailwind plugin for class sorting.
- **Vitest** — unit tests, jsdom environment.
- **Structure** — `apps/` (background, content, popup, options), `libs/` (shared), `components/` (React).

## Non-Negotiables

- **Per-package Makefiles** — root `pnpm` scripts delegate; never call Gradle/Swift/Go directly from root.
- **No shared UI code** — each platform owns its view layer.
- **Vendored, not linked** — external code copied in (Gemini client), not replaced.
- **Rolling `latest` only** — no version tags; CI force-updates `latest` release.
- **Keep diffs minimal** — don't reformat unrelated files.
- **Build outputs gitignored** — `build/`, `.build/`, `bin/`, `coverage/`, `dist/`, `.gradle/`, `.kotlin/`.

## Adding a CLI Module

1. Create `src/cmd/<category>/<module>/cmd.go` with `cobra.Command`.
2. Add `service.go` for logic, `*_test.go` for tests.
3. Register in `src/cmd/root.go` `init()`.
4. Run `go mod tidy`, `go vet ./...`, `go test ./...`.

## CI Artifacts

| Package | Artifact           | Path                                            |
| ------- | ------------------ | ----------------------------------------------- |
| Android | `app-debug.apk`    | `packages/android/app/build/outputs/apk/debug/` |
| macOS   | `Omni.app`         | `packages/macos/build/`                         |
| CLI     | `omni-{os}-{arch}` | `packages/cli/bin/`                             |
| Browser | `dist/`            | `packages/browser/dist/`                        |

All uploaded to `latest` release on master push.

## Gotchas

- **Android** — `ANDROID_HOME` must be set; `local.properties` is gitignored.
- **macOS** — must run on macOS runner; `codesign` requires entitlements.
- **CLI** — cross-compile needs Zig; `CGO_ENABLED=1` for native, `CC="zig cc -target ..."` for others.
- **Browser** — `pnpm install` only at root; browser has its own `pnpm-lock.yaml`.
- **Turborepo** — `globalEnv` passes `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `JAVA_HOME` to tasks.

## Useful Docs

- `packages/android/docs/12-operations.md` — Android dev commands
- `packages/macos/Docs/CONTRIBUTING.md` — macOS contributing
- `packages/cli/docs/PACKAGING.md` — CLI release/packaging
- `packages/cli/docs/DOWNLOADS.md` — Download URLs for `latest`
- `.github/workflows/ci.yaml` — Full CI definition