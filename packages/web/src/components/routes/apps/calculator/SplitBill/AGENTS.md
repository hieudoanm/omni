# Apps / Calculator / SplitBill

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
SplitBill/
  index.tsx            # Entry component — equal split / settle tabs UI
  constants.ts         # CURRENCIES list
  types.ts             # Settlement, PersonRow types
  utils/calculate.ts   # Settlement algorithm (no UI imports)
  __tests__/           # Component + calculate tests
```

## Overview

Bill-splitting tool with two modes. Equal Split computes tip, tax, total and
per-person share; Who Owes Who records each person's paid/owes amounts and
generates the minimal set of transfers to settle everyone up. Results can be
exported as a PNG (download or copy to clipboard).

## Logic

- Equal mode: `eqResult` derives `tipAmount = bill * tip/100`, `taxAmount`,
  `total` and `perPerson = total / people`; the people input clamps to `>= 1`.
- `calculateSettlements` computes `net = paid − owes` per person, sorts
  creditors descending and debtors ascending, then greedily matches the smaller
  side with a two-pointer loop to emit `Settlement { from, to, amount }`
  transfers.
- The `splitEqually` toggle auto-fills each `owes` as
  `totalPaid / persons.length`.
- `capture` renders the `captureRef` node via `html2canvas-pro`;
  `handleDownload` saves a PNG and `handleCopy` writes it to the clipboard. Any
  edit to person rows invalidates the current settlements.

## Routes

```tsx
// src/app/(products)/apps/calculator/page.tsx            — category listing
// src/app/(products)/apps/calculator/split-bill/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Calculator` section, `toolId: 'split-bill'`

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
