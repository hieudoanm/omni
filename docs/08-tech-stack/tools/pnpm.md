# pnpm — Workspace Configuration

## Root `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/**'
minimumReleaseAge: 0
```

Only `packages/browser` has a `package.json` with dependencies. Other packages use Makefiles.

## Root `package.json`

```json
{
  "name": "@omni/workspace",
  "version": "0.0.1",
  "packageManager": "pnpm@12.15.0",
  "scripts": {
    "prepare": "husky || true",
    "format": "turbo run format",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "husky": "9.1.7",
    "turbo": "2.11.10"
  }
}
```

## Per-Package `package.json`

```json
// packages/android/package.json
{
  "name": "@omni/android",
  "scripts": {
    "format": "make format",
    "build": "make build",
    "test": "make test",
    "lint": "make lint"
  }
}

// packages/macos/package.json
{
  "name": "@omni/macos",
  "scripts": { ... }
}

// packages/cli/package.json
{
  "name": "@omni/cli",
  "bin": { "omni": "bin/omni" },
  "scripts": { ... }
}

// packages/browser/package.json
{
  "name": "@omni/browser",
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode production",
    "lint": "eslint ...",
    "test": "vitest",
    "format": "prettier --write ..."
  }
}
```

## Commands

```bash
# Install browser deps only (other packages use system toolchains)
pnpm install

# Run across all packages via Turbo
pnpm format   # turbo run format
pnpm lint     # turbo run lint
pnpm test     # turbo run test
pnpm build    # turbo run build

# Browser-specific (from packages/browser/)
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm format
```

## Lockfiles

- Root: `pnpm-lock.yaml` (tracks browser deps + root devDeps)
- Browser: `packages/browser/pnpm-lock.yaml` (tracked in CI cache key)

## CI Cache

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 26.12.1
    cache: 'pnpm'
    cache-dependency-path: packages/browser/pnpm-lock.yaml
```

## Version Pinning

- pnpm: `12.15.0` (in `package.json`, `.github/workflows/ci.yaml`, `pnpm/action-setup@v4`)
- Node: `26.12.1` (in `.node-version`, `.nvmrc`, `package.json#engines`, CI)