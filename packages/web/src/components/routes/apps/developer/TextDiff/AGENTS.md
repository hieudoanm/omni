# Apps / Developer / TextDiff

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
TextDiff/
  index.tsx            # Entry — two textareas + diff output
  utils.ts             # computeDiff (pure line-by-line diff)
```

## Overview

Line-based text comparison tool. Two textareas hold original and modified text;
a unified-style diff of changed, added, and removed lines is rendered below as
soon as either side changes.

## Logic

- `computeDiff(a, b)` splits both inputs on newlines and iterates up to the
  longer length; matching lines are prefixed `  `, changed lines emit `- ` then
  `+ `, and lines only present on one side emit a single `+ ` / `- ` line
- `useMemo` recomputes the diff only when `textA`/`textB` change; empty inputs
  render nothing

## Routes

```tsx
// src/app/(products)/apps/developer/page.tsx         — category listing
// src/app/(products)/apps/developer/text-diff/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Developer` section, `toolId: 'text-diff'`

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
