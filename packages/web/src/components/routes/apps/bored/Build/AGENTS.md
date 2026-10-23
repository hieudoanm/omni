# Build — Agent Documentation

## Overview

**Build Products** is a product-randomiser mini-app that lives inside the
"Bored" games section. The user picks a _product type_ (specific product
category) from a dropdown that groups product types by _category_, then presses
**Roll product** to spin a slot-machine reel and land on a random product idea
prompt for that type.

Inspired by
[Build Your Own](https://github.com/codecrafters-io/build-your-own-x)

---

## Directory Structure

```text
Build/
├── AGENTS.md                  ← this file
├── index.tsx                  ← page entry-point (Build component)
├── data/
│   ├── constants.ts           ← loads products.json, derives CATEGORIES/PRODUCT_TYPES/PRODUCTS
│   ├── products.json          ← all categories, product types, and product arrays in one file
│   ├── products.csv           ← spreadsheet export (Category, Category Emoji, Product Type, Product Type Emoji, Product)
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
  value: string; // unique key used in PRODUCTS lookup
  label: string; // human-readable display name
  category: string; // references Category.value — determines which group the item appears under
}
```

### `CATEGORIES` × `PRODUCT_TYPES` × `PRODUCTS`

Each category has product types, each product type has 30 products.

| Measure       | Count                                      |
| ------------- | ------------------------------------------ |
| Categories    | varies + `general` (auto-computed)         |
| Product Types | varies + `all` (auto-computed)             |
| Products      | varies (auto-computed as `TOTAL_PRODUCTS`) |

---

## Component Details

### `index.tsx` — `Build`

Top-level page shell. Renders:

- A header with title "Build Products" and the `ItemSelect` picker.
- A `Reel` slot-machine display.
- A **Roll product** button wired to `spin()` from `useTopicPicker`.

Props: none (self-contained page).

### `ItemSelect.tsx` (in `../_shared/components/`)

Custom dropdown that displays items grouped under category headers.

**Key implementation details:**

- Closes on outside `mousedown` via a `useEffect` listener.
- Groups `items` by `item.category` using `categories` for header metadata.
- Applies DaisyUI tokens (`text-accent`, `bg-base-200`, etc.) — no raw colours.

**Props:**

| Prop          | Type                      | Description                           |
| ------------- | ------------------------- | ------------------------------------- |
| `categories`  | `Category[]`              | Full array from `CATEGORIES` const    |
| `items`       | `Item[]`                  | Full array from `PRODUCT_TYPES` const |
| `value`       | `string`                  | Currently selected item `value`       |
| `onChange`    | `(value: string) => void` | Called when user picks a new item     |
| `allLabel`    | `string`                  | Label for the "all" option            |
| `placeholder` | `string`                  | Search input placeholder              |

### `hooks/useTopicPicker.ts` (in `../_shared/hooks/`)

Manages:

- `item` state (selected item value, default `'all'`).
- `topic` state (currently displayed product string).
- `spinning` boolean (controls reel animation).
- `topics` array (all products for the current item, used for animation frames).
- `spin()` function — picks a random product from `PRODUCTS[item]` and drives
  the reel animation.

### `Reel.tsx` (in `../_shared/components/`)

Slot-machine reel animation. Receives `topics`, `spinning`, `landed`, and
`current` props.

---

## Inventory

| Measure       | Count                                      |
| ------------- | ------------------------------------------ |
| Categories    | varies + `general` (auto-computed)         |
| Product Types | varies + `all` (auto-computed)             |
| Products      | varies (auto-computed as `TOTAL_PRODUCTS`) |

(The `general` / `all` catch-all does not count toward these limits.)

---

## Editing Data (Adding / Modifying)

`data/products.csv` is the canonical source for all edits. **Never edit
`products.json` directly** — it is a generated file.

### Workflow

1. Edit `data/products.csv` (7 columns: `category_emoji`, `category_value`,
   `category_label`, `type_emoji`, `type_value`, `type_label`, `product`).
2. Rebuild `data/products.json`.

### Product style guide

- Short concept words/phrases — e.g. `'Portfolio Site'`, `'Real-time Chat'`,
  `'Project Management Tool'`
- **Not** full sentences or questions.
- No trailing punctuation.
- Title case for proper nouns; sentence case otherwise.

### Styling constraints

- Use **DaisyUI semantic tokens** only (`text-accent`, `bg-base-200`,
  `border-base-content/10`, etc.).
- Do **not** introduce raw hex/RGB colours or Tailwind palette colours.
