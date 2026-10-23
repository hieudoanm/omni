# Apps / Utilities / Emojis

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Emojis/
  index.tsx            # Entry component — searchable emoji grid with copy-to-clipboard
  utils.ts             # EmojiMap type + IMAGES_BASE URL for image-based emojis
```

## Overview

GitHub-style emoji explorer. Emoji data comes from `utilities/data/emojis.ts`
(key → unicode glyph or image URL). Searching filters by name; clicking an emoji
copies it to the clipboard.

## Logic

- `filtered` filters `Object.entries(emojis)` by a case-insensitive key
  substring match (all entries when the query is empty)
- `handleCopy` writes the emoji via `navigator.clipboard.writeText` and flashes
  a check for 1200 ms
- Values that start with `http` render as `<img>` from `IMAGES_BASE/<key>.png`;
  all other values render as the unicode glyph
- `EmojiMap` is `Record<string, string>`

## Routes

```tsx
// src/app/(products)/apps/utilities/page.tsx          — category listing
// src/app/(products)/apps/utilities/emojis/page.tsx   — tool
```

## Registration

- `data/apps.csv` → `Utilities` section, `toolId: 'emojis'`

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
