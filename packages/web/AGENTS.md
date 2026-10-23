# @omni/web

Next.js 16 app in the Omni monorepo with static export enabled.

## Commands

```bash
pnpm dev      # Start dev server with Turbopack
pnpm build    # Build for production (static export to out/)
pnpm start    # Start production server
pnpm lint     # Run ESLint
pnpm typecheck # Run TypeScript type checking
```

## Structure

- `src/app/` - App Router pages and special files
  - `page.tsx` - J.A.R.V.I.S. interface (migrated from jarvis/packages/desktop)
  - `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx` - Error/loading states (arrow functions)
- `public/` - Static assets
  - `data/` - Word lists for J.A.R.V.I.S. speech recognition
- `next.config.ts` - Next.js config with `output: "export"` and Turbopack settings

## Configuration

- Output mode: Static export (`output: "export"`)
- Uses Tailwind CSS v4
- TypeScript strict mode
- Turbopack enabled for dev and build
