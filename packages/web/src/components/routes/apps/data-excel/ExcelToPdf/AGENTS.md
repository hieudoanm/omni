# Apps / Data - Excel / ExcelToPdf

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
ExcelToPdf/
  index.tsx            # Entry component — table preview + Print as PDF
  utils.ts             # Row interface, downloadBlob
```

## Overview

Converts an `.xlsx`/`.xls` file to PDF via the browser print dialog. The first
worksheet is parsed into rows and shown as an in-page table preview; _Print as
PDF_ opens a styled print window that calls `window.print()`.

## Logic

- `handleFile(file)` lazily imports `xlsx`, parses the first sheet with
  `sheet_to_json(..., { defval: '' })` into `Row[]` objects, and derives the
  `cols` header list from the keys of the first row.
- `exportPdf` builds a blank popup window with inline monospace table CSS and
  writes `tableRef.current.innerHTML`, then calls `print()`. It is a no-op when
  there are no rows or no table ref.
- The preview renders only the first 100 rows, with a "Showing first 100 of N
  rows" note for larger files; parse failures set
  `'Failed to parse Excel file'`.

## Routes

```tsx
// src/app/(products)/apps/data-excel/page.tsx       — category listing
// src/app/(products)/apps/data-excel/excel-to-pdf/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Data - Excel` section, `toolId: 'excel-to-pdf'`

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
