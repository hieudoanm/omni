# Apps / Calculator / Calculator

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Calculator/
  index.tsx            # Entry component — keypad + unit converter UI
  convert.ts           # Converter categories + pure conversion math
  __tests__/
    Calculator.test.tsx  # Component behaviour tests
```

## Overview

Combined scientific calculator and unit converter. The keypad evaluates
arbitrary arithmetic expressions (trig, log, √, π, e, powers, factorial) while
the converter section converts a live result across 8 categories: length,
weight, temperature, data, angle, time, base and Roman numerals.

## Logic

- `calculate` sanitizes the expression (`×`→`*`, `÷`→`/`, `^`→`**`,
  `π`→`Math.PI`, trig to degree-based `Math.sin`/`cos`/`tan`,
  `log(`→`Math.log10(`, `ln(`→`Math.log(`) then evaluates via `Function`;
  failures set the display to `'Error'`.
- `formatNumber` locale-formats integers, trims trailing zeros from
  `toFixed(6)`, and falls back to exponential notation for values longer than 16
  digits.
- `converterCategories` (convert.ts) drives the UI. Rate-based categories use
  `convertWithRates` over `lengthRates`, `weightRates`, `dataRates`;
  `convertTemperature` and `convertAngle` pivot through celsius/degrees;
  `convertTime` pivots through ms (months/years use 365.25-day averages); base
  and Roman use `convertBase`/`arabicToRoman`/`romanToArabic` from
  `@lodashx/ts`.
- `onKeyDown` maps Escape (close), Enter (calculate), Backspace (delete), Delete
  (clear) and digit/operator keys. `switchCategory` resets from/to units to the
  category defaults; `swap` exchanges them.

## Routes

```tsx
// src/app/(products)/apps/calculator/page.tsx              — category listing
// src/app/(products)/apps/calculator/calculator/page.tsx   — tool
```

## Registration

- `data/apps.csv` → `Calculator` section, `toolId: 'calculator'`

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
