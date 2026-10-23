# Apps / Editors / Slides

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Slides/
  index.tsx              # Entry component — editor + preview + export toolbar
  types.ts               # PitchDeck, SlideBlock, SlideLayout, Toast types
  constants.ts           # INITIAL_CONTENT sample deck
  hooks/
    useToast.tsx         # useToast + ToastUI (progress/error/success toasts)
  utils/
    yaml.ts              # validate() + mapYamlToSlides() deck mapping
    colors.ts            # oklch()/lab() → hex for PDF-safe rendering
    exportPdf.ts         # html2canvas + pdf-lib PDF export
    formatCurrency.ts    # Intl currency formatter for pricing
  components/
    YamlEditor.tsx       # CodeMirror YAML editor
    SlidePreview.tsx     # 16:9 pitch slide renderer
    LandingPage.tsx      # landing-page preview tab
    CenterBlock.tsx      # centered title/subtitle/pricing blocks
    TextBlock.tsx        # whitespace-preserving text block
```

## Overview

YAML-driven pitch deck builder with two previews — a fixed 5-slide pitch deck
and a landing page — plus PDF export and shareable URLs (deck encoded in the
`?yaml=` query string).

## Logic

- `getInitialInput` reads `?yaml=` from the URL or falls back to
  `INITIAL_CONTENT`; input is mirrored into the URL via
  `window.history.replaceState` (skipped when >4000 chars).
- `validate` requires `title.product`, `title.tagline`, and `title.audience`,
  returning `ValidationError[]`; `mapYamlToSlides` maps the deck to five
  `SlideLayout[]` (Introduction, Problems, Solution, Product, Pricing Model),
  formatting plan prices with `formatCurrency`.
- `exportPdf` clones `#pitch-preview`, inlines Tailwind styles and converts
  `oklch()/lab()/color()` values to hex via `applyExportSafeColors`/
  `inlineTailwindStyles`, rasterizes each `.aspect-video` slide with html2canvas
  (1280×720, scale 2), and builds a PDF with pdf-lib.
- `useToast` keeps at most 3 toasts, auto-dismissing after 2.5s (loading stays).
- Toolbar buttons toggle the editor, export PDF (blocked while validation errors
  exist), and copy a shareable link.

## Routes

```tsx
// src/app/(products)/apps/editors/page.tsx          — category listing
// src/app/(products)/apps/editors/slides/page.tsx   — tool
```

## Registration

- `data/apps.csv` → `Editors` section, `toolId: 'slides'`

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
