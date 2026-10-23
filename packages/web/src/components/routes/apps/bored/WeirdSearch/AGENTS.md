# WeirdSearch — Agent Documentation

## Overview

**Weird Search** is a query-randomiser mini-app that lives inside the "Bored"
games section. The user presses **Roll query** to spin a slot-machine reel and
land on a random weird thing to look up — from corkscrew duck penises to the
Great Emu War. The landed query is designed to be pasted into a search engine or
an AI chat.

---

## Directory Structure

```text
WeirdSearch/
├── AGENTS.md                  ← this file
├── index.tsx                  ← page entry-point (WeirdSearch component)
├── data/
│   ├── constants.ts           ← loads queries.json, exports QUERIES
│   ├── queries.txt            ← canonical source (one query per line)
│   ├── queries.json           ← generated file (array of strings)
│   ├── howToContent.ts        ← markdown for the How-to modal
│   └── scripts/
│       └── convert-txt-to-json.ts ← rebuild queries.json from queries.txt
```

Shared components live in `../_shared/`:

```text
_shared/
├── types.ts                   ← Category & Item interfaces
├── components/
│   ├── ItemSelect.tsx         ← grouped dropdown (generic, used by all bored games)
│   ├── Reel.tsx               ← animated slot-machine reel
│   └── HowToModal.tsx         ← markdown modal with configurable title
└── hooks/
    └── useTopicPicker.ts      ← state & spin logic (generic, takes topicsMap param)
```

---

## Component Details

### `index.tsx` — `WeirdSearch`

Thin wrapper around the shared `BoredGame` shell, exactly like its siblings
`Research`, `Develop`, and `Build`. Because the query list is flat (no
categories/niches), it passes a single `general` category containing one `all`
item whose topics map is `{ all: QUERIES }`.

Renders:

- A header with title "Weird Search" and the query count.
- A `Reel` slot-machine display.
- A **Roll query** button wired to `spin()` from `useTopicPicker`.

---

## Data Model

`data/queries.json` is a flat array of strings, one per weird search query.

```json
["Ducks have corkscrew penises", "Wombats poop cubes"]
```

| Measure | Count              |
| ------- | ------------------ |
| Queries | 367 (auto-deduped) |

`data/constants.ts` re-exports it as `QUERIES: string[]`.

---

## Editing Data (Adding / Modifying)

`data/queries.txt` is the canonical source for all edits. **Never edit
`queries.json` directly** — it is a generated file.

### Workflow

1. Edit `data/queries.txt` — one query per line.
2. Rebuild `data/queries.json`:

```bash
npx tsx src/components/routes/apps/bored/WeirdSearch/data/scripts/convert-txt-to-json.ts
```

The conversion script:

- Reads `queries.txt`, trims each line, drops blank lines.
- Deduplicates (keeps first occurrence).
- Writes `data/queries.json` as an array of strings.

### Query style guide

- Short searchable phrases — e.g. `'Great Emu War'`, `'Wombats poop cubes'`,
  `'Why cilantro tastes like soap'`
- **Not** full paragraphs or trailing punctuation.
- Sentence case; title case for proper nouns.

### Styling constraints

- Use **DaisyUI semantic tokens** only (`text-accent`, `bg-base-200`,
  `border-base-content/10`, etc.).
- Do **not** introduce raw hex/RGB colours or Tailwind palette colours.
