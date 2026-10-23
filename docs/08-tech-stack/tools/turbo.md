# Turborepo — Task Orchestration

## `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["ANDROID_HOME", "ANDROID_SDK_ROOT", "JAVA_HOME"],
  "tasks": {
    "deploy": {
      "cache": true,
      "dependsOn": ["build", "test", "lint"],
      "inputs": ["$TURBO_DEFAULT$", "!docs/**", "!images/**"],
      "outputs": []
    },
    "format": {
      "cache": true,
      "dependsOn": ["^format"],
      "inputs": ["$TURBO_DEFAULT$", "!docs/**", "!images/**"],
      "outputs": []
    },
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "!docs/**", "!images/**"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**",
        "build/**",
        "bin/**"
      ]
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^lint"],
      "inputs": ["$TURBO_DEFAULT$", "!docs/**", "!images/**"],
      "outputs": []
    },
    "test": {
      "cache": true,
      "dependsOn": ["^test"],
      "inputs": ["$TURBO_DEFAULT$", "!docs/**", "!images/**"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## Key Concepts

| Concept | Value | Purpose |
|---------|-------|---------|
| `globalEnv` | `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `JAVA_HOME` | Passed to all tasks; needed for Android Gradle |
| `dependsOn: ["^task"]` | Run `task` in dependencies first | Topological order (browser has no deps) |
| `inputs` | `$TURBO_DEFAULT$` + excludes | What triggers cache miss |
| `outputs` | Package-specific artifacts | What to cache/restore |

## Package Dependency Graph

```
@omni/workspace (root)
├── @omni/android    (Gradle)
├── @omni/macos      (SwiftPM)
├── @omni/cli        (Go)
└── @omni/browser    (pnpm)
```

No inter-package dependencies — all independent. `^task` runs on all packages in parallel.

## Cache Behavior

```bash
# First run: executes all
pnpm build

# Second run (no changes): CACHED
pnpm build
# Output: "Cached: 4 cached, 4 total"
```

## Cache Invalidation

Changes to these files invalidate cache:
- Source files (`src/**`, `Sources/**`, `app/**`)
- Config files (`*.kts`, `*.toml`, `Package.swift`, `go.mod`, `webpack.config.js`)
- `turbo.json` itself
- `package.json` scripts

Excluded: `docs/**`, `images/**`, `*.md`

## CI Integration

Turbo runs locally and in CI. No remote cache configured (optional: `turbo login` + `TURBO_TOKEN`).

## Why Not Nx/Bazel

- Turborepo: minimal config, Go/ Gradle/ SwiftPM agnostic, fast
- Nx: heavy, opinionated, better for JS-heavy monorepos
- Bazel: steep learning curve, overkill for 4 packages