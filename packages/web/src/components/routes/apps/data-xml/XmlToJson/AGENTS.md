# Apps / Data - XML / XmlToJson

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
XmlToJson/
  index.tsx            # Entry component — Dropzone + spinner, converts and downloads
  utils.ts             # xmlToJson, readFileAsText, downloadBlob (pure helpers)
```

## Overview

Converts an XML file to JSON. The user drops a file into the `Dropzone`; the XML
is parsed with `DOMParser` and recursively walked into a nested object, which is
pretty-printed and downloaded with the `.xml` extension replaced by `.json`.

## Logic

- `xmlToJson` recursively walks the DOM. Attributes become `@<name>` keys, and
  repeated child tags are coerced into arrays (first occurrence is wrapped when
  a duplicate appears). Leaf elements with no keys and only trimmed text return
  that text directly.
- Elements with both text and children keep children; the returned document
  element's object is serialized with `JSON.stringify(json, null, 2)`.
- Failures surface as `'Failed to convert XML to JSON.'` through the `error`
  state. Note the `xmlToJson` return type is `any` (tree shape is not typed).

## Routes

```tsx
// src/app/(products)/apps/data-xml/page.tsx       — category listing
// src/app/(products)/apps/data-xml/xml-to-json/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Data - XML` section, `toolId: 'xml-to-json'`

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
