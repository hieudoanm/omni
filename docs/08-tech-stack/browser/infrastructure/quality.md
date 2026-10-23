# Quality — Linting/Formatting/Types (Omni)

## Tools

ESLint 10, typescript-eslint 8.x, Prettier 3.9.x, TypeScript strict.

## Best Practices

- `pnpm lint` and `pnpm format` run in prebuild.
- Fix lint errors; avoid disabling rules without justification.
- Type-check passes (tsc --noEmit implicit in build via ts-loader).
- web-ext lint validates MV2/MV3 packaging rules.
