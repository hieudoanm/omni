# Apps / Developer / OpenAPI2Postman

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
OpenAPI2Postman/
  index.tsx                 # Entry — debounced conversion, tabs, copy/download
  constants.ts              # SAMPLE_OPENAPI fixture + lineCount
  types.ts                  # OpenAPI + Postman collection types
  utils/yamlParser.ts       # parseOpenAPI (JSON, or hand-rolled YAML fallback)
  utils/schemaHelpers.ts    # resolveRef + schemaToExample
  utils/converter.ts        # convertToPostman
```

## Overview

Converts an OpenAPI 3.x spec (JSON or YAML) into a Postman Collection v2.1.
Conversion is debounced by 300 ms while typing, so output appears live, and the
result can be copied or downloaded as `postman-collection.json`.

## Logic

- `parseOpenAPI` tries `JSON.parse` first and falls back to a custom
  indentation-based `parseYAML` (arrays via `- `, scalars coerced to
  boolean/number/string)
- `convertToPostman` groups operations into folders by their first `tag`
  (default: `default`), only recognising the standard HTTP methods
- `schemaHelpers.schemaToExample` builds example bodies from schema types,
  resolving `$ref`s via `resolveRef` and guarded by a depth cap of 5
- Request bodies map `application/json` → raw, `x-www-form-urlencoded` →
  urlencoded, `multipart/form-data` → formdata; path/query/header params become
  URL variables, query params, and headers

## Routes

```tsx
// src/app/(products)/apps/developer/page.tsx       — category listing
// src/app/(products)/apps/developer/openapi/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Developer` section, `toolId: 'openapi'`

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
