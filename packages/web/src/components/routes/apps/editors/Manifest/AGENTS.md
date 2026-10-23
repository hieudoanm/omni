# Apps / Editors / Manifest

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Manifest/
  index.tsx            # Entry component — PWA/Extension manifest editor
  utils.ts             # ManifestType union ('pwa' | 'extension')
  data/
    manifest/
      pwa.ts           # PWAManifest interface + sample PWA template
      extension.ts     # Browser extension manifest sample template
```

## Overview

Hand-rolled JSON editor preloaded with two templates — a PWA web app manifest
and a browser extension manifest — selectable via tabs. The active document is
editable in a textarea with line numbers and a live line/byte count.

## Logic

- `type` toggles between `'pwa'` and `'extension'`; `manifests` state stores
  each tab's raw JSON string separately, so edits persist per tab.
- `setManifest` updates only the active type via a functional update; `reset`
  restores that type's template.
- `copy` writes the current manifest to the clipboard and flashes a `copied`
  state for 2s; `lines`/`bytes` derive from `manifest.split('\n')` and
  `new Blob([manifest]).size`.
- `ManifestType` from `utils.ts` is the only exported type.

## Routes

```tsx
// src/app/(products)/apps/editors/page.tsx          — category listing
// src/app/(products)/apps/editors/manifest/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Editors` section, `toolId: 'manifest'`

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
