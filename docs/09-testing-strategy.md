# Omni — Testing Strategy

## 1. Purpose

Ensure correctness and repeatability across four native platforms: Android (Kotlin/Jetpack Compose), macOS (Swift/SwiftUI), CLI (Go/Cobra/Bubble Tea), and Browser (TypeScript/Manifest V3). Each platform uses its native testing stack; there is no shared test layer.

## 2. Test Layers

- [`01-test-layers.md`](./09-testing-strategy/01-test-layers.md)
- [`02-test-fixtures.md`](./09-testing-strategy/02-test-fixtures.md)
- [`03-test-organization.md`](./09-testing-strategy/03-test-organization.md)
- [`04-quality-gates.md`](./09-testing-strategy/04-quality-gates.md)
- [`05-critical-test-scenarios.md`](./09-testing-strategy/05-critical-test-scenarios.md)
- [`06-definition-of-done.md`](./09-testing-strategy/06-definition-of-done.md)

## 3. Guiding Principles

- Tests assert observable behaviour (UI output, CLI output, file artifacts).
- Platform tests run in their native toolchain — no cross-platform test runner.
- Fixtures are synthetic; never commit private data or credentials.
- Unit tests mock external dependencies (network, filesystem, hardware); integration tests use real implementations where feasible.
- Every module/category gets unit tests; critical paths get integration/snapshot tests.
- Coverage is a signal, not a target — but zero-coverage gaps in new code are not accepted.

## 4. Platform Testing Overview

| Layer | Android | macOS | CLI | Browser |
|-------|---------|-------|-----|---------|
| **Unit** | Robolectric + JUnit 4 + Turbine + MockK | Swift Testing (`@Suite`/`@Test`) | `go test` (stdlib `testing`) | Vitest + jsdom + React Testing Library |
| **Integration** | Instrumented tests (emulator/device) | — | `go test` with real fs/net | — |
| **Snapshot** | — | `ImageRenderer` + `assertSnapshot` | — | — |
| **E2E** | — | — | `tests/` (golden files, CLI invocation) | Playwright (future) |
| **Contract** | — | — | — | — |
| **Coverage Gate** | None (enforced via CI) | None (enforced via CI) | None (enforced via CI) | **80%** (statements, branches, functions, lines) |

## 5. CI Quality Gates

Pre-commit (Husky): `pnpm turbo run lint` then `pnpm turbo run format` — whole-workspace.

CI is the merge gate (`.github/workflows/ci.yaml`):

- **Android** — `make lint` (Spotless + Android Lint), `make test` (Robolectric), `make build`
- **macOS** — `make format` (swiftformat), `make lint` (swift build), `make test` (Swift Testing), `make build`
- **CLI** — `make format` (go fmt), `make lint` (go vet), `make test` (go test ./...), `make build`
- **Browser** — ESLint, `tsc --noEmit`, `pnpm test:coverage` (80% gate), `pnpm build`

All four must pass for `release-latest` to create the rolling release.