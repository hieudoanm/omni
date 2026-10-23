# Apps / Developer / TextUrlTracer

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
TextUrlTracer/
  index.tsx            # Entry — URL input + timeout + redirect chain display
  utils.ts             # RedirectStep type
```

## Overview

Redirect tracker that follows a URL's redirect chain server-side and renders
each hop with its HTTP status. The user sets a per-request timeout (1–30 s) and
receives the full chain plus any server-reported error.

## Logic

- `handleTrace` normalises the URL (`https://` added when missing) and POSTs to
  `/api/trace-url` with an `AbortController` that aborts after `timeout` seconds
- A non-OK response sets a `Server error: <status>` message; a fetch/abort
  failure produces a single synthetic `RedirectStep` with `status: 0` and a
  "Request failed or timed out" text
- Steps are rendered in order with the final status styled by range (redirects
  vs. errors); empty input is ignored

## Routes

```tsx
// src/app/(products)/apps/developer/page.tsx             — category listing
// src/app/(products)/apps/developer/text-url-tracer/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Developer` section, `toolId: 'text-url-tracer'`

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
