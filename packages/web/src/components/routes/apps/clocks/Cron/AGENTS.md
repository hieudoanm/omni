# Apps / Clocks / Cron

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Cron/
  index.tsx            # Entry component — expression editor + next runs
  constants.ts         # Field keys/labels/ranges, month/day names, presets
  types.ts             # Fields, Preset types
  utils/parser.ts      # Parse + match + next-execution logic (no UI)
  utils/format.ts      # Natural-language description + date formatting
```

## Overview

Cron expression builder and explorer. Shows preset expressions, a
natural-language description and the next 5 execution times; Edit mode provides
per-field inputs (minute, hour, day-of-month, month, day-of-week) with range
hints and error highlighting.

## Logic

- `parse` splits the 5 fields and `parseField` expands each into a `Set` of
  values supporting lists, ranges (`a-b`), steps (`*/n`, `a-b/n`) and validated
  bounds (minute 0–59, hour 0–23, day 1–31, month 1–12, dow 0–7); returns `null`
  on invalid shape.
- `matches` applies OR semantics when both day-of-month and day-of-week are
  restricted, and treats day-of-week `7` as Sunday (`0`).
- `nextTimes` scans minute-by-minute from the next minute until `count` matches
  are found (guarded at 525,600 iterations).
- `cronToDescription` short-circuits common patterns ("Every minute", "At
  midnight…") then builds a phrase from parsed field sets; `formatNext` renders
  "Day, Mon D HH:MM". `apply` loads presets and `sync` rebuilds the expression.

## Routes

```tsx
// src/app/(products)/apps/clocks/page.tsx       — category listing
// src/app/(products)/apps/clocks/cron/page.tsx  — tool
```

## Registration

- `data/apps.csv` → `Clocks` section, `toolId: 'cron'`

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
