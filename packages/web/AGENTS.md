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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
