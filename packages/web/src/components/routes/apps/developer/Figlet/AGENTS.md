# Apps / Developer / Figlet

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Figlet/
  index.tsx            # Entry component — text input + font picker + ASCII preview
  constants.ts         # Four hand-authored fonts (STANDARD, BLOCK, SMALL, BANNER)
  types.ts             # FigletFont type (char → glyph rows)
  utils/render.ts      # renderFiglet + FONT_NAMES (pure glyph composition)
```

## Overview

Text-to-ASCII-art generator with four built-in figlet-style fonts. Renders live
as the user types and supports copy-to-clipboard with a temporary success state.
Input is capped at 20 characters.

## Logic

- `renderFiglet(text, fontName)` uppercases input, maps each char to its glyph,
  pads short glyphs with spaces to keep rows aligned, and joins rows with
  newlines
- Unknown characters fall back to `?`; unknown font names fall back to
  `Standard`
- `FONT_NAMES` enumerates the selectable fonts (`Standard`, `Block`, `Small`,
  `Banner`)
- Escaping the input closes the tool via the `onClose` prop

## Routes

```tsx
// src/app/(products)/apps/developer/page.tsx      — category listing
// src/app/(products)/apps/developer/figlet/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Developer` section, `toolId: 'figlet'`

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
