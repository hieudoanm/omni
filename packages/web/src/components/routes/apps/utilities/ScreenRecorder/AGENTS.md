# Apps / Utilities / ScreenRecorder

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
ScreenRecorder/
  index.tsx            # Entry component (single file) — record screen to WebM
```

## Overview

Records the screen plus audio via `getDisplayMedia` and `MediaRecorder`, then
previews and downloads the result as a WebM file.

## Logic

- `handleStart` requests a display stream (`video.webm`), creates a
  `MediaRecorder`, collects `dataavailable` chunks into `chunksRef`, and on stop
  builds a Blob, stops all stream tracks, and sets `recording` to false
- `handleStop` calls `mediaRecorderRef.current?.stop()`
- `handleDownload` creates an object URL and clicks a temporary anchor named
  `recording_<timestamp>.webm`, then revokes the URL
- Errors during capture are logged to the console; the recording button toggles
  between Start and Stop states

## Routes

```tsx
// src/app/(products)/apps/utilities/page.tsx          — category listing
// src/app/(products)/apps/utilities/screen-recorder/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Utilities` section, `toolId: 'screen-recorder'`

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
