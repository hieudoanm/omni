# Apps / Visualization / Legislation

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Legislation/
  index.tsx            # Entry component — country/chamber selector + stats + party bars
  types.ts             # Party, Chamber, Country interfaces
  constants.ts         # COUNTRIES — static chamber/party data
  components/
    Hemicycle.tsx      # buildHemicycle + SVG seat layout
```

## Overview

Visualizes legislative chamber seat distributions for 8 countries as a
semicircular hemicycle plus per-party bars and totals. Data is approximate and
last updated 2024–2025.

## Logic

- `buildHemicycle` expands each party's seats into a color array and distributes
  them across 6 weighted rows (inner to outer), projecting each seat onto the
  semicircle via `x = CX - r*cos(angle)`, `y = CY - r*sin(angle)`
- `dotR` shrinks with chamber size:
  `Math.max(0.8, Math.min(2, 40 / sqrt(totalSeats)))`
- `Legislation` derives `majority = Math.floor(totalSeats/2) + 1` and the
  largest party; selecting a country resets to its first chamber
- Parties with `seats >= majority` get a "Majority" badge; percent share is
  computed per party against `chamber.totalSeats`

## Routes

```tsx
// src/app/(products)/apps/visualization/page.tsx          — category listing
// src/app/(products)/apps/visualization/legislation/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Visualization` section, `toolId: 'legislation'`

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
