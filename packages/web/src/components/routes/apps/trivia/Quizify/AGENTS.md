# Games / Memory / Quizify

## Build & Test

```bash
pnpm dev                    # Start Next.js dev server
pnpm test                   # Run all Jest tests
pnpm jest -- "Quizify"      # Run tests for this game
pnpm tsc --noEmit           # TypeScript type check
pnpm lint                   # ESLint
```

## File Structure

```text
Quizify/
  index.tsx            # Entry component — quiz player with CSV import
  types.ts             # QuizData interface (question/answers/correct)
  utils/
    quiz.ts            # Pure CSV parsing + answer colour map
  __tests__/
    Quizify.test.tsx   # Component tests
    utils/__tests__/quiz.test.ts # Parser tests
```

## Gameplay

Drop a CSV file into the Dropzone to load a custom quiz. Each question offers
four colour-coded answers (red/yellow/blue/green); pick one and move to the next
question, scoring a point per correct answer. A progress bar and final score
summary track the run.

## Logic

- `parseCsv` expects a header of `question,red,blue,green,yellow,correct`
  (matched case-insensitively, positional fallback if any column is missing) and
  skips rows with fewer than 6 fields; it casts `correct` to the four-key union
  type
- `colorClassMap` maps each answer key to a DaisyUI button class (`btn-error`,
  `btn-warning`, `btn-info`, `btn-success`)
- `handleFile` reads the file with `FileReader`, resets the quiz on success, or
  shows `csvError` when no valid rows parse
- `handleSelect` is a no-op once an answer is chosen; `handleNext` advances
  through questions and `resetQuiz` restarts with the same data
- Keyboard: `R`/`Y`/`B`/`G` select an answer, `→` advances (ignored inside
  inputs); `progress` counts the answered question

## Routes

```tsx
// src/app/(products)/games/memory/page.tsx          — category listing
// src/app/(products)/games/memory/quizify/page.tsx  — tool
```

## Registration

- `data/games.csv` → `Memory` section, `toolId: 'quizify'`

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
