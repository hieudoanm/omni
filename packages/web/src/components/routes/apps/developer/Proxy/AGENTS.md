# Apps / Developer / Proxy

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Proxy/
  index.tsx            # Entry component — URL input + snippet tabs + copy
  utils.ts             # PROXY_BASE_URL + TabType
```

## Overview

CORS proxy code generator: the user enters a target URL and gets a ready-to-use
snippet for `curl`, `fetch`, `axios`, or TanStack Query that wraps the URL in a
public proxy base URL. The snippet can be copied to the clipboard.

## Logic

- `PROXY_BASE_URL` is the proxy endpoint; `encodeURIComponent` encodes the
  trimmed target URL (fallback `https://example.com`) into `fullUrl`
- `snippets` is built with `useMemo` keyed on the URL and returns four language
  variants via the `TabType` union
- `copyToClipboard` writes the active tab's snippet and shows a transient
  "Copied" state for 2 s

## Routes

```tsx
// src/app/(products)/apps/developer/page.tsx       — category listing
// src/app/(products)/apps/developer/proxy/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Developer` section, `toolId: 'proxy'`

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
