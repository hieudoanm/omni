# Apps / Calculator / Tax

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Tax/
  index.tsx            # Entry component — input/results tabs UI
  TaxResults.tsx       # Deductions, net pay and per-bracket table
  constants.ts         # PIT brackets, deductions, insurance rates
  types.ts             # Period, SalaryMode, Tab, TaxResult types
  utils/calculate.ts   # Pure Vietnamese PIT math (no UI imports)
  __tests__/           # Component + calculate tests
```

## Overview

Vietnamese personal income tax (PIT) calculator. Enter gross or net salary to
see the monthly breakdown: deductions, taxable income, tax per bracket,
take-home pay and the employer's total labour cost. Migrated from the
`finance/tax` app's `/personal/calculator` page.

## Logic

- `calculateTax` normalises the period to monthly via `toMonthly` (annual ÷ 12),
  then applies `PERSONAL_DEDUCTION` (11,000,000) plus `DEPENDENT_DEDUCTION`
  (4,400,000) per dependent and employee insurance.
- `calculateTaxBreakdown` walks `TAX_BRACKETS` (5% → 35%, last has
  `limit: Infinity`) consuming remaining taxable income; returns one
  `TaxBreakdownItem` per bracket actually reached.
- Insurance applies to `clampInsuranceBase(gross, enabled)` — the gross capped
  at `INSURANCE_CAP` (36,000,000), or 0 when the toggle is off. Employee rates
  total 10.5%, employer rates total 21.5%.
- Net mode runs `solveGrossFromNet`, which iterates the gross-to-net calculation
  up to 20 times to converge on the gross that yields the target net.
- `effectiveTaxRate` guards against a zero gross; `totalLaborCost` adds employer
  insurance to the gross.

## Routes

```tsx
// src/app/(products)/calculator/page.tsx — category listing
// src/app/(products)/calculator/tax/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Calculator` section, `toolId: 'tax'`, `icon: 'PiReceipt'`
- `PiReceipt` added to the import list and `ICON_BY_NAME` in `data/apps.ts`

## Coding Rules

1. Arrow functions only — no `function` keyword
2. Explicit types on all exports — never `any`
3. State management: `useState`/`useReducer` for local, React Context for shared
4. TailwindCSS v4 + DaisyUI v5 — no CSS modules, no styled-components
5. Icons: `react-icons/pi` (Phosphor)
6. Each tool component receives `onClose: () => void` prop
7. Keep files under 200 lines, functions under 30 lines
8. Pure logic in `utils/calculate.ts` — never mix UI and business logic
9. Test behaviour, not implementation — Jest + Testing Library
10. `APP_SECTIONS` consumes `data/apps.json` — never hardcode app sections in
    components
