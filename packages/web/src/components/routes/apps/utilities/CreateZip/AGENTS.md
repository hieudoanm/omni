# Apps / Utilities / CreateZip

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
CreateZip/
  index.tsx            # Entry component — dropzone, file list, archive name, create button
  utils.ts             # Pure ZIP writer — FileEntry, createZipBlob, downloadBlob, crc32
```

## Overview

Creates `.zip` archives from dropped files entirely in the browser using a
hand-rolled ZIP writer (no external library). Files are stored uncompressed
(STORE method); a CRC-32 checksum is computed per file.

## Logic

- `createZipBlob` builds local file headers, central directory entries, and an
  end-of-central-directory record, concatenating them into one Blob with MIME
  type `application/zip`
- `crc32` computes the CRC-32 checksum with the standard polynomial `0xEDB88320`
  over each file's bytes
- `downloadBlob` triggers a download via a temporary object URL
- `handleAddFile`/`removeFile` manage the `FileEntry` list; the create button is
  disabled with no files and shows a spinner while `loading`

## Routes

```tsx
// src/app/(products)/apps/utilities/page.tsx          — category listing
// src/app/(products)/apps/utilities/create-zip/page.tsx — tool
```

## Registration

- `data/apps.csv` → `Utilities` section, `toolId: 'create-zip'`

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
