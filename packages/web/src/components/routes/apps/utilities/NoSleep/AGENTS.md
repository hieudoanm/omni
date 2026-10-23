# Apps / Utilities / NoSleep

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
NoSleep/
  index.tsx            # Entry component — wake-lock acquisition + status badge
  utils.ts             # getElapsed — TimeUnit breakdown; WAKE_LOCK_STATUS meta (pure)
```

## Overview

Keeps the screen awake via the Wake Lock API while displaying how long the
browser has been "awake" as a live-updating elapsed timer.

## Logic

- `wakeLockStatus` drives a status badge (`checking` → `active` → `released`,
  `unsupported`, or `denied`): on mount `acquire()` requests
  `navigator.wakeLock.request('screen')`, sets `active` on success, `denied`
  with the error name when the request throws, and `unsupported` when the API is
  absent; a `release` listener on the sentinel sets `released` (guarded so a
  stale sentinel's event can't override a newer active lock)
- Re-acquires on `visibilitychange` to `visible` (setting `checking` first) and
  releases the current sentinel on unmount
- The badge renders `WAKE_LOCK_STATUS[wakeLockStatus]` label/description from
  `utils.ts`; a `data-status` attribute and an `role="alert"` error line expose
  the raw state for debugging
- A 1-second `setInterval` recomputes `getElapsed(startTimeRef.current)`, which
  breaks the elapsed time into years/months/days/hours/minutes/seconds
- Only non-zero `TimeUnit` values render, each zero-padded to two digits, with
  singular/plural labels chosen by `value`

## Routes

```tsx
// src/app/(products)/apps/utilities/page.tsx          — category listing
// src/app/(products)/apps/utilities/no-sleep/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Utilities` section, `toolId: 'no-sleep'`

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
