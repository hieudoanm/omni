# Develop — Agent Documentation

## Overview

**Develop Skills** is a skill-randomiser mini-app that lives inside the "Bored"
games section. The user picks a _skill type_ (specific skill area) from a
dropdown that groups skill types by _category_, then presses **Roll skill** to
spin a slot-machine reel and land on a random skill prompt for that type.

Inspired by [Bored](https://bored-api.appbrewery.com/)

---

## Directory Structure

```text
Develop/
├── AGENTS.md                  ← this file
├── index.tsx                  ← page entry-point (Develop component)
├── data/
│   ├── constants.ts           ← loads skills.json, derives CATEGORIES/SKILL_TYPES/SKILLS
│   ├── skills.json            ← all categories, skill types, and skill arrays in one file
│   ├── skills.csv             ← spreadsheet export (Category, Category Emoji, Skill Type, Skill Type Emoji, Skill)
│   └── howToContent.ts        ← markdown for the How-to modal
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

## Data Model

### `Category` (`../_shared/types.ts`)

```ts
export interface Category {
  emoji: string; // single emoji displayed as the group header icon
  value: string; // unique key
  label: string; // human-readable display name
}
```

### `Item` (`../_shared/types.ts`)

```ts
export interface Item {
  emoji: string;
  value: string; // unique key used in SKILLS lookup
  label: string; // human-readable display name
  category: string; // references Category.value — determines which group the item appears under
}
```

### `CATEGORIES` × `SKILL_TYPES` × `SKILLS`

Each category has skill types, each skill type has 30 skills.

| Measure     | Count                                    |
| ----------- | ---------------------------------------- |
| Categories  | varies + `general` (auto-computed)       |
| Skill Types | varies + `all` (auto-computed)           |
| Skills      | varies (auto-computed as `TOTAL_SKILLS`) |

---

## Component Details

### `index.tsx` — `Develop`

Top-level page shell. Renders:

- A header with title "Develop Skills" and the `ItemSelect` picker.
- A `Reel` slot-machine display.
- A **Roll skill** button wired to `spin()` from `useTopicPicker`.

Props: none (self-contained page).

### `ItemSelect.tsx` (in `../_shared/components/`)

Custom dropdown that displays items grouped under category headers.

**Key implementation details:**

- Closes on outside `mousedown` via a `useEffect` listener.
- Groups `items` by `item.category` using `categories` for header metadata.
- Applies DaisyUI tokens (`text-accent`, `bg-base-200`, etc.) — no raw colours.

**Props:**

| Prop          | Type                      | Description                         |
| ------------- | ------------------------- | ----------------------------------- |
| `categories`  | `Category[]`              | Full array from `CATEGORIES` const  |
| `items`       | `Item[]`                  | Full array from `SKILL_TYPES` const |
| `value`       | `string`                  | Currently selected item `value`     |
| `onChange`    | `(value: string) => void` | Called when user picks a new item   |
| `allLabel`    | `string`                  | Label for the "all" option          |
| `placeholder` | `string`                  | Search input placeholder            |

### `hooks/useTopicPicker.ts` (in `../_shared/hooks/`)

Manages:

- `item` state (selected item value, default `'all'`).
- `topic` state (currently displayed skill string).
- `spinning` boolean (controls reel animation).
- `topics` array (all skills for the current item, used for animation frames).
- `spin()` function — picks a random skill from `SKILLS[item]` and drives the
  reel animation.

### `Reel.tsx` (in `../_shared/components/`)

Slot-machine reel animation. Receives `topics`, `spinning`, `landed`, and
`current` props.

---

## Inventory

| Measure     | Count                                    |
| ----------- | ---------------------------------------- |
| Categories  | varies + `general` (auto-computed)       |
| Skill Types | varies + `all` (auto-computed)           |
| Skills      | varies (auto-computed as `TOTAL_SKILLS`) |

(The `general` / `all` catch-all does not count toward these limits.)

---

## Editing Data (Adding / Modifying)

`data/skills.csv` is the canonical source for all edits. **Never edit
`skills.json` directly** — it is a generated file.

### Workflow

1. Edit `data/skills.csv` (7 columns: `category_emoji`, `category_value`,
   `category_label`, `type_emoji`, `type_value`, `type_label`, `skill`).
2. Rebuild `data/skills.json`.

### Skill style guide

- Short concept words/phrases — e.g. `'REST API'`, `'Docker Compose'`,
  `'Test-Driven Development'`
- **Not** full sentences or questions.
- No trailing punctuation.
- Title case for proper nouns; sentence case otherwise.

### Styling constraints

- Use **DaisyUI semantic tokens** only (`text-accent`, `bg-base-200`,
  `border-base-content/10`, etc.).
- Do **not** introduce raw hex/RGB colours or Tailwind palette colours.
