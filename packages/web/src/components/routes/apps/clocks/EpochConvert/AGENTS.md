# Apps / Clocks / EpochConvert

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
EpochConvert/
  index.tsx            # Entry component — two-way Unix time converter
```

## Overview

Unix timestamp converter with two directions: Epoch → Date turns a millisecond
timestamp into a UTC human-readable string, and Date → Epoch turns a local
`datetime-local` value into milliseconds. Includes Now and quick-reference
buttons (1 day, yesterday, Unix epoch).

## Logic

- `handleConvert` branches on `mode`: in `toDate` it formats
  `new Date(ms).toISOString()` and slices to 19 chars (`YYYY-MM-DD HH:mm:ss`);
  in `toEpoch` it returns `new Date(dateStr).getTime()`. Invalid inputs (NaN)
  are silently ignored.
- `handleNow` fills the current epoch and switches to `toDate`. The Convert
  button is disabled while its input is empty.
- Note: the datetime-local input is interpreted in local time while the output
  is always UTC (ISO), so a round-trip is exact only within the same timezone.

## Routes

```tsx
// src/app/(products)/apps/clocks/page.tsx               — category listing
// src/app/(products)/apps/clocks/epoch-convert/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Clocks` section, `toolId: 'epoch-convert'`

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
