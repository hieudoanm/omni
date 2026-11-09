# Apps / Editors / JSONSchema

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
JSONSchema/
  index.tsx            # Entry component — Input/Schema/Convert tabs + actions
  types.ts             # InputMode, LanguageExt, DataFormatExt, TabExt, PanelTab
  constants.ts         # INITIAL_JSON sample + language/format tab lists
  hooks/
    useCodeMirror.ts   # Reusable CodeMirror editor hook (editable or read-only)
```

## Overview

JSON/YAML editor that live-parses the input, generates a JSON Schema, and
converts the parsed data into Java, Python, Rust, TypeScript, XML, or YAML.
Offers Beautify, Minify, Sort, and Copy actions across three panes.

## Logic

- Effects on `jsonText`/`yamlText` re-parse the active `inputMode` via
  `parseJson`/`parseYaml`; parse failures are logged and the last good `data` is
  kept.
- `others` maps every `TabExt` to a snippet via `json(data).convert(fmt)`,
  falling back to `'Invalid input'` on error; `schema` uses
  `json(data).convert('schema')`.
- `getLangExt` picks the CodeMirror extension per language tab.
- Actions: `beautify`, `minify` (JSON only — disabled in YAML mode), `sort`
  (skips non-objects/arrays), and `copyActive` copies the active pane.
- `useCodeMirror` creates/destroys an `EditorView` and exposes `ref` +
  `viewRef`; the convert pane is kept in sync by dispatching full-doc changes
  when the generated value differs.

## Routes

```tsx
// src/app/(products)/apps/editors/page.tsx          — category listing
// src/app/(products)/apps/editors/json-schema/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Editors` section, `toolId: 'json-schema'`

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
