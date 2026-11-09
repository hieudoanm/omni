# Apps / Calculator / Inflation

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Inflation/
  index.tsx            # Entry component — options/result tabs UI
  constants.ts         # currencyLocaleMap + healthConfig styling
  types.ts             # Country, InflationResult, Tab types
  utils/calculate.ts   # Pure inflation math (no UI imports)
  __tests__/           # Component + calculate/constants tests
```

## Overview

CPI inflation calculator fed by World Bank-style annual inflation data. Pick a
country (defaults to Việt Nam), a currency, a from/to year range and an amount
to see the adjusted value, cumulative and average annual rates, and a colour-
coded health band.

## Logic

- `calculateInflation` compounds each annual rate
  (`adjusted *= 1 + value / 100`) across the range; returns `null` when
  `startYear >= endYear` or any year's data is missing. Health: `deflation` < 0,
  `low` < 3, `moderate` < 6, else `high`.
- Data loads from
  `@hieudoanm.github.io/json/inflation/{history,currencies,countries_currencies}.json`;
  `allCountries = Object.values(history)` and each country's `data` is filtered
  to non-null years for the year selects.
- `currencyLocaleMap` picks the `toLocaleString` locale per currency code;
  `healthConfig` maps each health level to DaisyUI colour classes plus emoji.
- `onCountryChange` resets currency to the country's first listed code and
  re-clamps the year range; the amount input rejects negative values.

## Routes

```tsx
// src/app/(products)/apps/calculator/page.tsx           — category listing
// src/app/(products)/apps/calculator/inflation/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Calculator` section, `toolId: 'inflation'`

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
