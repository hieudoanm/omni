# Apps / Editors / Regex

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Regex/
  index.tsx            # Entry component — generate + test regex UI
  types.ts             # CharClass union type
  utils/
    regex.ts           # Pure regex generation + testing (no UI imports)
```

## Overview

Generates a regex from sample strings (one per line) and tests it against a list
of test strings. Identical strings collapse to one escaped literal; otherwise
strings are split by common separators and matched per-segment.

## Logic

- `generateRegex(strings)` returns `null` for fewer than 2 non-empty strings,
  then tries in order: identical strings (`escapeLit` of the first),
  same-part-count strings split by `[-_.\s/|~]+` (identical parts reused
  verbatim, per-char/segment runs classified, mixed chars collapsed into a
  `[...]` class or an alternation), and finally a common prefix/suffix with an
  alternation over the middles.
- `classifyChar`/`classifySegment` map chars/segments to `\d`, `[a-z]`, `[A-Z]`,
  `[a-zA-Z]`, `\w` (with `{n}` or `{min,max}` quantifiers); `escapeLit` escapes
  regex metacharacters; `splitParts` splits on separators.
- `testRegex(pattern, flags, tests)` wraps `new RegExp(pattern, flags)` and
  returns per-line booleans; invalid patterns yield all `false`.
- The UI lets the user type a custom pattern (overriding the generated one) and
  copy the pattern or flags.

## Routes

```tsx
// src/app/(products)/apps/editors/page.tsx          — category listing
// src/app/(products)/apps/editors/regex/page.tsx    — tool
```

## Registration

- `data/apps.csv` → `Editors` section, `toolId: 'regex'`

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
