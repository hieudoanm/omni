# TypeScript — Best Practices (Omni)

## Overview

TypeScript 6.0.3 with strict mode. Used for all extension code (background, content, popup, lib).

## Best Practices

- Enable strict mode; avoid `any` (use `unknown` + narrowing).
- Prefer `interface` for object shapes; `type` for unions/intersections.
- Explicit return types on exported functions.
- Use arrow functions, `const` by default.
- `as const` for literal types; avoid unnecessary assertions.
- Co-locate types with modules or export from `types/` if shared.
