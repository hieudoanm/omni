# Apps / Data - Excel / ExcelToXml

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
ExcelToXml/
  index.tsx            # Entry component — Dropzone + spinner, converts and downloads
  utils.ts             # readFile, downloadBlob (pure helpers)
```

## Overview

Converts an `.xlsx`/`.xls` file to XML. The user drops a file into the
`Dropzone`; the first worksheet is read into an array of rows and serialized as
`<row>` elements under a `<root>` element, then downloaded with the original
extension replaced by `.xml`.

## Logic

- `handleConvert(file)` lazily imports `xlsx`, reads the file as an
  `ArrayBuffer`, and reads the first sheet with
  `sheet_to_json(..., { header: 1 })`.
- The first row provides headers used directly as tag names; each subsequent row
  emits `<header>value</header>` pairs, iterating up to the shorter of header or
  row length. Output starts with an XML declaration.
- Requires at least 2 rows (header + data); a header-only sheet aborts silently.
  Values are not XML-escaped. Failures surface as
  `'Failed to convert Excel to XML.'`.

## Routes

```tsx
// src/app/(products)/apps/data-excel/page.tsx       — category listing
// src/app/(products)/apps/data-excel/excel-to-xml/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Data - Excel` section, `toolId: 'excel-to-xml'`

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
