# Cross-Cutting Tools — How-To Guides

| Guide | Description |
|-------|-------------|
| [pnpm.md](pnpm.md) | Workspace config, install, lockfile, cache, versions |
| [turbo.md](turbo.md) | turbo.json, tasks, globalEnv, caching, remote cache |
| [git-hooks.md](git-hooks.md) | Husky, pre-commit, lint-staged, commit-msg |
| [node.md](node.md) | .node-version, .nvmrc, engines, CI alignment |
| [go.md](go.md) | go.mod, go.sum, toolchain, vendor, go.work (if needed) |
| [gradle.md](gradle.md) | Wrapper, version catalog, plugins, KSP, dependency locking |
| [swiftpm.md](swiftpm.md) | Package.swift, package.resolved, swift package commands |

## pnpm + Turborepo Quick Reference

```bash
# Root commands (delegate to package Makefiles)
pnpm install          # browser deps only
pnpm format           # turbo run format
pnpm lint             # turbo run lint
pnpm test             # turbo run test
pnpm build            # turbo run build

# Per-package (from package dir)
make format           # package-specific formatter
make lint             # package-specific linter
make test             # package-specific tests
make build            # package-specific build
```

## globalEnv (turbo.json)

```json
{
  "globalEnv": ["ANDROID_HOME", "ANDROID_SDK_ROOT", "JAVA_HOME"]
}
```

Passes Android SDK env vars to Android tasks in CI and local.