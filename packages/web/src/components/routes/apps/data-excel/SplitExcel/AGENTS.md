# Apps / Data - Excel / SplitExcel

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
SplitExcel/
  index.tsx            # Entry component — rows-per-file input + Dropzone
  utils.ts             # readFile, downloadBlob (pure helpers)
```

## Overview

Splits a large `.xlsx`/`.xls` file into multiple workbooks of a configurable row
count. The user sets _Rows per file_ (default 100, min 1), drops a file, and
each chunk is downloaded immediately as `{name}_part{N}.xlsx`.

## Logic

- `handleSplit(file)` lazily imports `xlsx`, reads the first sheet into an array
  of rows with `sheet_to_json(..., { header: 1 })`, requires at least 2 rows,
  and keeps the first row as the header.
- Data rows are chunked by `rowsPerFile`; each chunk becomes a new workbook
  (`book_new` + `aoa_to_sheet` + `book_append_sheet`) and is downloaded. The
  resulting file count is shown via the `fileCount` state.
- An empty/header-only file aborts silently; failures surface as
  `'Failed to split Excel file.'`.

## Routes

```tsx
// src/app/(products)/apps/data-excel/page.tsx       — category listing
// src/app/(products)/apps/data-excel/split-excel/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Data - Excel` section, `toolId: 'split-excel'`

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
