# Omni — Technology Stack & Best Practices

## 1. Purpose

Defines technologies, rationale, and best practices for Omni. Where this conflicts with numbered docs (01-12), the numbered docs govern.

## 2. Principles

- **Single source, dual manifest**: One TypeScript codebase compiles to MV2 and MV3.
- **Type safety first**: Strict TypeScript; explicit types; prefer `unknown` over `any`.
- **Offline-first**: Core features work without network.
- **Idempotent & safe**: Content scripts idempotent; capture restores scroll; fail loudly with prefixed logs.
- **Minimal, explicit**: Small functions, flat structure, explicit error handling.

## 3. Stack Overview

| Layer       | Chosen                        | Rationale                               | Notes              |
| ----------- | ----------------------------- | --------------------------------------- | ------------------ |
| Language    | TypeScript 6.0.3              | Type safety, modern syntax, strict mode | tsconfig strict    |
| Runtime     | WebExtensions API             | Cross-browser (Chromium + Gecko)        | MV2/MV3 parity     |
| Build       | Webpack 5 + ts-loader 9.6.2   | Dual output, assets, CSS                | ts-node for config |
| Linting     | ESLint 10 + typescript-eslint | TS-aware linting                        | eslint.config.mts  |
| Formatting  | Prettier 3.9.10               | Consistent style                        | prebuild           |
| Packaging   | web-ext 10.8.0                | MV2 .xpi + linting                      | make build         |
| Package mgr | pnpm 12.14.0                  | Deterministic, fast                     | Node 26.12.0       |

## 4. Detailed Best Practices

See subdirectory docs for in-depth guidance:

| Category       | Doc                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend       | [typescript.md](./08-tech-stack/frontend/typescript.md), [webpack.md](./08-tech-stack/frontend/webpack.md), [webextension.md](./08-tech-stack/frontend/webextension.md) |
| Backend        | [background.md](./08-tech-stack/backend/background.md), [content.md](./08-tech-stack/backend/content.md), [popup.md](./08-tech-stack/backend/popup.md)                  |
| Infrastructure | [build.md](./08-tech-stack/infrastructure/build.md), [quality.md](./08-tech-stack/infrastructure/quality.md)                                                            |
| Tools          | [pnpm.md](./08-tech-stack/tools/pnpm.md), [web-ext.md](./08-tech-stack/tools/web-ext.md)                                                                                |
