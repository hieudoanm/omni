# Games / Word / Palindrome

## Build & Test

```bash
pnpm dev                    # Start Next.js dev server
pnpm test                   # Run all Jest tests
pnpm jest -- "Palindrome"   # Run tests for this game
pnpm tsc --noEmit           # TypeScript type check
pnpm lint                   # ESLint
```

## File Structure

```text
Palindrome/
  index.tsx            # Entry component — letter bank, drop zone, timer, HUD
  constants.ts         # PUZZLES (built from JSON word lists), TIMER_START
  types.ts             # Puzzle, PuzzleType, Definition, WordData types
  utils/
    puzzle.ts          # Pure logic: shuffle, isPalindrome, isEmordnilap, fetchDefinition
```

## Gameplay

Scramble-and-arrange word game. A 30-second timer counts down while the player
taps letters from a shuffled bank into a drop zone to build a word. Guessing the
target palindrome or emordnilap word scores points and fetches its dictionary
definition; any _valid_ palindrome/emordnilap is worth a smaller bonus. `Enter`
checks, `Space` clears, `N` advances after a solve.

## Logic

- `PUZZLES` is derived in `constants.ts` from `palindrome.json` +
  `emordnilap.json` word lists, filtered to words longer than 5 letters
- `shuffle` is a Fisher–Yates swap; `isPalindrome` compares a word to its
  reversal; `isEmordnilap` checks both the word and its reverse against the
  emordnilap list (a word whose reversal is a different valid word)
- `fetchDefinition` loads a per-word JSON from the repo's English word dataset
  and returns `WordData` (or `null` on any failure)
- Scoring: exact answer = `max(10, timer * 3)` pts; a valid but non-target
  palindrome/emordnilap = +5; the `checkAnswer` path in `index.tsx` stops the
  timer on a solve or time-out

## Routes

```tsx
// src/app/(products)/games/word/page.tsx            — category listing
// src/app/(products)/games/word/palindrome/page.tsx — tool
```

## Registration

- `data/games.csv` → `Word` section, `toolId: 'palindrome'`

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
