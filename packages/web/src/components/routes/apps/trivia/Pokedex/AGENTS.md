# Games / Trivia / Pokedex

## Build & Test

```bash
pnpm dev                    # Start Next.js dev server
pnpm test                   # Run all Jest tests
pnpm jest -- "Pokedex"      # Run tests for this game
pnpm tsc --noEmit           # TypeScript type check
pnpm lint                   # ESLint
```

## File Structure

```text
Pokedex/
  index.tsx            # Entry component — search/filter/sort + grid
  constants.ts         # TYPE_COLORS badge mapping + getTypeColor
  types.ts             # Pokemon, SortKey, SortOrder types
  data/
    pokedex.ts         # Static Pokémon stat dataset (~15k lines)
  utils/
    search.ts          # Pure fuzzyMatch subsequence matcher
  components/
    PokemonDetail.tsx  # Modal — radar chart + stat bars for one Pokémon
```

## Gameplay

A searchable Pokémon database rather than a scoring game. Browse the full
Pokémon list, fuzzy-search by name, filter by a single type, and sort by id / hp
/ attack / speed ascending or descending. Clicking a card opens a modal with a
Chart.js radar of the six base stats, progress bars, and the stat total.

## Logic

- `fuzzyMatch(text, query)` in `utils/search.ts` returns 1 if every query char
  appears in order (subsequence match), else 0; an empty query matches all
- `getTypeColor(type)` maps a Pokémon type to a DaisyUI badge class with a
  `badge-ghost` fallback
- `index.tsx` derives `allTypes` from the dataset and computes `filtered` via
  `useMemo`, chaining fuzzy search, type filter, then a sort on `sortKey` with
  `sortOrder` (toggling the active key flips asc/desc)
- `PokemonDetail` renders the six stats from the `Pokemon` shape against a fixed
  255 max axis

## Routes

```tsx
// src/app/(products)/games/trivia/page.tsx          — category listing
// src/app/(products)/games/trivia/pokedex/page.tsx  — tool
```

## Registration

- `data/games.csv` → `Trivia` section, `toolId: 'pokedex'`

## Coding Rules

1. Arrow functions only — no `function` keyword
2. Explicit types on all exports — never `any`
3. Game logic MUST be pure functions in `utils.ts` — zero UI imports
4. State management: Zustand for complex games, `useState`/`useReducer` for
   simple ones
5. TailwindCSS v4 + DaisyUI v5 — no CSS modules, no styled-components
6. Icons: `react-icons/pi` (Phosphor)
7. Each game component receives `onClose: () => void` prop
8. Keep files under 200 lines, functions under 30 lines
9. Test behaviour, not implementation — Jest + Testing Library
10. Mobile-first responsive design
11. `GAME_SECTIONS` consumes `data/games.json` — never hardcode game sections in
    components
