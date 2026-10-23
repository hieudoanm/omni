# Git Hooks — Husky, lint-staged

## Setup

```bash
# Root package.json
{
  "scripts": {
    "prepare": "husky || true"
  },
  "devDependencies": {
    "husky": "9.1.7"
  }
}
```

```bash
# Install hooks
pnpm install
# Runs "husky" via prepare script
```

## Hook Files

```
.husky/
├── pre-commit
└── commit-msg
```

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged on staged files
npx lint-staged
```

### `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validate commit message format (optional)
# npx commitlint --edit "$1"
```

## lint-staged (Not Yet Wired)

Declared in root `package.json` but not configured:

```json
{
  "devDependencies": {
    "lint-staged": "15.x"
  }
}
```

To enable, add `.lintstagedrc`:

```json
{
  "*.{kt,kts}": ["cd packages/android && make format"],
  "*.swift": ["cd packages/macos && make format"],
  "*.go": ["cd packages/cli && make format"],
  "*.{ts,tsx,json,md}": ["cd packages/browser && pnpm format"]
}
```

## Current State

- Husky installed, `pre-commit` runs `npx lint-staged`
- `lint-staged` installed but no config → no-op
- `commit-msg` exists but no commitlint → no-op

## Per-Package Format Commands

| Package | Format Command |
|---------|----------------|
| Android | `./gradlew spotlessApply` |
| macOS | `swiftformat Sources Tests Package.swift` |
| CLI | `go fmt ./...` |
| Browser | `prettier --write "{src,apps,libs,test}/**/*.ts"` |

## Why Not Root `make format`

Each package has different toolchains. Root `pnpm format` → `turbo run format` → each package's `make format` / `pnpm format` is the correct abstraction.