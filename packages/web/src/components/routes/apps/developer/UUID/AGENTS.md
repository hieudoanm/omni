# Apps / Developer / UUID

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
UUID/
  index.tsx            # Entry — v1/v4/v7 cards with regenerate + copy
```

## Overview

UUID generator showing three versions side by side: v1 (timestamp + MAC), v4
(cryptographically random), and v7 (Unix timestamp + random). Each card can be
regenerated individually, all at once, or copied to the clipboard.

## Logic

- `generate(version)` dispatches to `uuid`'s `v1()`, `v4()`, or `v7()`
- `regenerate(version)` updates a single key of the `uuids` state map;
  `regenerateAll` replaces all three
- `copy` writes the value and shows a per-card `✓` success state for 1.5 s

## Routes

```tsx
// src/app/(products)/apps/developer/page.tsx      — category listing
// src/app/(products)/apps/developer/uuid/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Developer` section, `toolId: 'uuid'`

## Coding Rules

1. Arrow functions only — no `function` keyword
2. Explicit types on all exports — never `any`
3. State management: `useState`/`useReducer` for local, React Context for shared
4. TailwindCSS v4 + DaisyUI v5 — no CSS modules, no styled-components
5. Icons: `react-icons/pi` (Phosphor)
6. Each tool component receives `onClose: () => void` prop
7. Keep files under 200 lines, functions under 30 lines
8. Pure logic in `utils.ts` — never mix UI and business logic
9. Test behaviour, not implementation — Jest + Testing Library
10. `APP_SECTIONS` consumes `data/apps.json` — never hardcode app sections in
    components
