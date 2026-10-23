# Apps / Utilities / LoremIpsum

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
LoremIpsum/
  index.tsx            # Entry — unit tabs, editable count input + steppers, textarea, copy
  utils.ts             # WORDS + UNIT_CONFIG + per-unit generators
```

## Overview

Lorem ipsum generator with four output units — paragraphs, words, bytes, and
bullet lists — each with a unit-appropriate count range, live char/word/byte
counts, and one-click copy to the clipboard.

## Logic

- `UNIT_CONFIG` maps each `LoremUnit` (`paragraphs`/`words`/`bytes`/`lists`) to
  a singular/plural label, `min`/`max` count range, and `step` size
- `sentence(wordCount)` slices a random contiguous window of `WORDS`,
  capitalizes the first character, and appends a period; `paragraph(sentences)`
  joins 8–13 word sentences
- `generate(count, unit)` dispatches: `generateParagraphs` joins paragraphs with
  blank lines, `generateWords` slices to exactly `count` words, `generateBytes`
  grows text until the UTF-8 byte length reaches `count` then slices, and
  `generateLists` emits `• `-prefixed items joined by newlines
- Unit tabs call `handleUnitChange`, which clamps the current count into the new
  unit's `min`–`max` range; the count is an editable `type="number"` input
  (`handleCountInput` clamps typed values into `min`–`max`), steppers step by
  the unit's `step`, and `x1`/`x3`/`x5` presets show only for `paragraphs` and
  `lists`
- Text is memoized via `useMemo` on `count` and `unit`; stats show chars, words,
  and UTF-8 bytes of the output
- `copy` writes the generated text and flashes a "Copied" success state for 1500
  ms

## Routes

```tsx
// src/app/(products)/apps/utilities/page.tsx          — category listing
// src/app/(products)/apps/utilities/lorem-ipsum/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Utilities` section, `toolId: 'lorem-ipsum'`

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
