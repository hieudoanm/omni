# Apps / Data - JSON / JsonToXml

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
JsonToXml/
  index.tsx            # Entry component — textarea + preview + Download
  utils.ts             # jsonToXml, downloadBlob (pure helpers)
```

## Overview

Converts a JSON array into XML. The user pastes JSON (or drops a file into the
`Dropzone` to populate the textarea), clicks _Convert to XML_, and sees the XML
output in a preview pane with a Download button.

## Logic

- `jsonToXml` parses the input and wraps a non-array value into a single-element
  array; an empty array returns `<root></root>`. Column keys come from the first
  object, and every item becomes an `<item>` with one element per key.
- Tag names are sanitized (`[^a-zA-Z0-9_-]` → `_`); values are XML-escaped for
  `&`, `<`, `>`. Output starts with an XML declaration and wraps everything in
  `<root>`.
- `handleConvert` catches parse failures and sets output to
  `'Error: invalid JSON'`.

## Routes

```tsx
// src/app/(products)/apps/data-json/page.tsx       — category listing
// src/app/(products)/apps/data-json/json-to-xml/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Data - JSON` section, `toolId: 'json-to-xml'`

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
