# Apps / Data - XML / XmlToExcel

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
XmlToExcel/
  index.tsx            # Entry component — Dropzone + spinner, converts and downloads
  utils.ts             # readFileAsText, downloadBlob (pure helpers)
```

## Overview

Converts an XML file to `.xlsx`. The user drops a file into the `Dropzone`; the
XML is parsed with `DOMParser` and its attributes and leaf text values are
flattened into a `Tag, Attribute, Value` table, which is written to a workbook
and downloaded with the `.xml` extension replaced by `.xlsx`.

## Logic

- `handleConvert(file)` reads the file as text and walks the DOM depth-first.
  The recursive `walk(node, path)` emits one row per attribute
  (`[path, attrName, attrValue]`) and, for leaf elements, one row
  (`[path/tag, '', textContent]`).
- A header row `['Tag', 'Attribute', 'Value']` is prepended; the rows are
  written via `XLSX.utils.aoa_to_sheet` into a workbook with a single `Sheet1`.
- Failures surface as `'Failed to convert XML to Excel.'` through the `error`
  state.

## Routes

```tsx
// src/app/(products)/apps/data-xml/page.tsx       — category listing
// src/app/(products)/apps/data-xml/xml-to-excel/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Data - XML` section, `toolId: 'xml-to-excel'`

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
