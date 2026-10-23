# Omni — Quality Gates

## Pre-commit (Husky)

```bash
# .husky/pre-commit
npx lint-staged
```

Runs `pnpm turbo run lint` then `pnpm turbo run format` on staged files (when lint-staged configured).

**Current state:** Husky installed, lint-staged declared but not wired → no-op on staged files.

## CI Merge Gate (`.github/workflows/ci.yaml`)

All four jobs must pass for `release-latest` to run:

### Android (`ubuntu-latest`)

| Step | Command | Failure Condition |
|------|---------|-------------------|
| Format | `make format` (spotlessCheck) | Any ktlint/format violation |
| Lint | `make lint` (`:app:lintDebug`) | Any Android Lint error |
| Test | `make test` (`:app:testDebugUnitTest`) | Any unit test failure |
| Build | `make build` (`:app:assembleDebug`) | Compile/link failure |

**No coverage gate** — Android Lint + unit tests are the gate.

### macOS (`macos-latest`)

| Step | Command | Failure Condition |
|------|---------|-------------------|
| Format | `make format` (swiftformat) | Any formatting change needed |
| Lint | `make lint` (`swift build`) | Any compiler warning (warnings as errors) |
| Test | `make test` (`swift test`) | Any test failure (219 tests) |
| Build | `make build` + `make app` | Compile/link/bundle failure |

**No coverage gate** — Swift Testing + warnings-as-errors are the gate.

### CLI (`ubuntu-latest`)

| Step | Command | Failure Condition |
|------|---------|-------------------|
| Format | `make format` (`go fmt ./...`) | Any formatting change needed |
| Lint | `make lint` (`go vet ./...`) | Any vet warning |
| Test | `make test` (`go test ./...`) | Any test failure (479 packages) |
| Build | `make build` + `make build-all` | Compile/link failure |

**No coverage gate** — `go vet` + full test suite are the gate.

### Browser (`ubuntu-latest`)

| Step | Command | Failure Condition |
|------|---------|-------------------|
| Lint | `pnpm lint` (ESLint) | Any ESLint error |
| Typecheck | `tsc --noEmit` | Any TypeScript error |
| Test | `pnpm test:coverage` (Vitest) | **Any failure OR coverage < 80%** |
| Build | `pnpm build` (Webpack) | Compile/bundle failure |

**Hard 80% threshold** on statements, branches, functions, lines — enforced by `vitest --coverage` in CI.

## Coverage Summary

| Package | Tool | Threshold | Enforced In |
|---------|------|-----------|-------------|
| Android | JaCoCo (optional) | None | CI (lint + test) |
| macOS | Swift Testing (built-in) | None | CI (test) |
| CLI | `go test -cover` | None | CI (test) |
| Browser | Vitest + c8 | **80%** | CI (test:coverage) |

## Release Gate

`release-latest` job only runs if **all four** platform jobs succeed:

```yaml
release-latest:
  needs: [android, macos, cli, browser]
  if: github.ref == 'refs/heads/master' && github.event_name == 'push'
```

## Local Verification

```bash
# From repo root
pnpm lint      # All 4 packages
pnpm test      # All 4 packages
pnpm build     # All 4 packages

# Per package
cd packages/android && make lint test build
cd packages/macos   && make format lint test build
cd packages/cli     && make format lint test build
cd packages/browser && pnpm lint && pnpm test:coverage && pnpm build
```