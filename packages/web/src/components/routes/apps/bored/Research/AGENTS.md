# Research — Agent Documentation

## Overview

**Deep Research** is a topic-randomiser mini-app that lives inside the "Bored"
games section. The user picks a _niche_ (specific subject area) from a dropdown
that groups niches by _category_, then presses **Roll topic** to spin a
slot-machine reel and land on a random concept prompt for that niche.

Inspired by [Unprompted](https://www.unprompted.cool/).

---

## Directory Structure

```text
Research/
├── AGENTS.md                  ← this file
├── index.tsx                  ← page entry-point (Research component)
├── types.ts                   ← shared TypeScript interfaces
├── data/
│   ├── constants.ts           ← loads topics.json, derives CATEGORIES/NICHES/TOPICS
│   ├── topics.json            ← all categories, niches, and topic arrays in one file
│   └── topics.csv             ← spreadsheet export (Category, Category Emoji, Niche, Niche Emoji, Topic)
├── scripts/
│   ├── convert-csv-to-json.ts ← rebuild topics.json from topics.csv
│   ├── generate-new-data.ts   ← generator for new categories/niches/topics
│   ├── get-categories.ts      ← print category list (CSV)
│   ├── get-niches.ts          ← print niche list with category (CSV)
│   └── get-topics.ts          ← print all topic rows (CSV)
├── hooks/
│   └── useResearch.ts         ← state & spin logic
└── components/
    ├── NicheSelect.tsx        ← grouped dropdown for picking a niche
    └── Reel.tsx               ← animated slot-machine reel
```

---

## Data Model

### `Category` (`types.ts`)

```ts
export interface Category {
  emoji: string; // single emoji displayed as the group header icon
  value: string; // unique key
  label: string; // human-readable display name
}
```

### `Niche` (`types.ts`)

```ts
export interface Niche {
  value: string; // unique key used in TOPICS lookup
  label: string; // human-readable display name
  category: string; // references Category.value — determines which group the niche appears under
}
```

### `CATEGORIES` × `NICHES` × `TOPICS`

30 categories, 900 niches (+ `all` computed), each niche has exactly 30 topics
(27 000 total, ignoring `all`).

| No  | Category             | Niches | Topics |
| --- | -------------------- | -----: | -----: |
| 01  | 🔎 Sciences          |     30 |    900 |
| 02  | ⚛️ Physics           |     30 |    900 |
| 03  | ⚗️ Chemistry         |     30 |    900 |
| 04  | 🤖 Technology        |     30 |    900 |
| 05  | 🚀 Business          |     30 |    900 |
| 06  | 💪 Health            |     30 |    900 |
| 07  | 🏥 Medical           |     30 |    900 |
| 08  | 🧠 Psychology        |     30 |    900 |
| 09  | 🎨 Arts              |     30 |    900 |
| 10  | 📚 Humanities        |     30 |    900 |
| 11  | 🤔 Philosophy        |     30 |    900 |
| 12  | ⚖️ Law               |     30 |    900 |
| 13  | 📐 Maths             |     30 |    900 |
| 14  | 📜 History           |     30 |    900 |
| 15  | 💰 Economy           |     30 |    900 |
| 16  | 🧬 Biology           |     30 |    900 |
| 17  | 🧠 Neuroscience      |     30 |    900 |
| 18  | 👥 Sociology         |     30 |    900 |
| 19  | ⚖️ Political Science |     30 |    900 |
| 20  | 🎓 Education         |     30 |    900 |
| 21  | 🗣️ Linguistics       |     30 |    900 |
| 22  | 📖 Literature        |     30 |    900 |
| 23  | 🎵 Music             |     30 |    900 |
| 24  | 🎥 Film              |     30 |    900 |
| 25  | 🏛️ Architecture      |     30 |    900 |
| 26  | 🔒 Cybersecurity     |     30 |    900 |
| 27  | 📈 Data Science      |     30 |    900 |
| 28  | 🥗 Nutrition         |     30 |    900 |
| 29  | 📣 Marketing         |     30 |    900 |
| 30  | 💹 Investing         |     30 |    900 |

---

## Component Details

### `index.tsx` — `Research`

Top-level page shell. Renders:

- A header with title "Deep Research" and the `NicheSelect` picker.
- A `Reel` slot-machine display.
- A **Roll topic** button wired to `spin()` from `useResearch`.

Props: none (self-contained page).

### `NicheSelect.tsx`

Custom dropdown that displays niches grouped under category headers.

**Key implementation details:**

- Closes on outside `mousedown` via a `useEffect` listener.
- Groups `niches` by `niche.category` using `categories` for header metadata.
- Applies DaisyUI tokens (`text-accent`, `bg-base-200`, etc.) — no raw colours.

**Props:**

| Prop         | Type                      | Description                        |
| ------------ | ------------------------- | ---------------------------------- |
| `categories` | `Category[]`              | Full array from `CATEGORIES` const |
| `niches`     | `Niche[]`                 | Full array from `NICHES` constant  |
| `value`      | `string`                  | Currently selected niche `value`   |
| `onChange`   | `(value: string) => void` | Called when user picks a new niche |

### `hooks/useResearch.ts`

Manages:

- `niche` state (selected niche value, default `'all'`).
- `topic` state (currently displayed prompt string).
- `spinning` boolean (controls reel animation).
- `topics` array (all prompts for the current niche, used for animation frames).
- `spin()` function — picks a random prompt from `TOPICS[niche]` and drives the
  reel animation.

### `Reel.tsx`

Slot-machine reel animation. Receives `topics`, `spinning`, `landed`, and
`current` props.

---

## Inventory

| Measure    | Count                                    |
| ---------- | ---------------------------------------- |
| Categories | 30 + `general` (auto-computed)           |
| Niches     | 900 + `all` (auto-computed)              |
| Topics     | 27 000 (auto-computed as `TOTAL_TOPICS`) |

**30 categories**, **900 niches** (30 per category), **30 topics per niche**.
(The `general` / `all` catch-all does not count toward these limits.)

Twenty niches were promoted to standalone categories and their replacements
added to their original categories:

| Promoted niche       | Original category | Replacement                   |
| -------------------- | ----------------- | ----------------------------- |
| 📐 Maths             | 🔎 Sciences       | 🕵️ Forensic Science           |
| ⚛️ Physics           | 🔎 Sciences       | 🛸 Astrobiology               |
| ⚗️ Chemistry         | 🔎 Sciences       | ⛰️ Geochemistry               |
| 🤔 Philosophy        | 📚 Humanities     | 🎙️ Rhetoric                   |
| ⚖️ Law               | 📚 Humanities     | 🔍 Criminology                |
| 🧬 Biology           | 🔎 Sciences       | 🔬 Laboratory Technique       |
| 🧠 Neuroscience      | 🔎 Sciences       | 🧪 Scientific Instrumentation |
| 👥 Sociology         | 📚 Humanities     | 💬 Communication Studies      |
| ⚖️ Political Science | 📚 Humanities     | 🗳️ Civics                     |
| 🎓 Education         | 📚 Humanities     | 📝 Writing Studies            |
| 🗣️ Linguistics       | 📚 Humanities     | 🧠 Cognitive Science          |
| 📖 Literature        | 🎨 Arts           | 🎲 Game Design                |
| 🎵 Music             | 🎨 Arts           | 🧸 Toy Design                 |
| 🎥 Film              | 🎨 Arts           | 🪆 Folk Art                   |
| 🏛️ Architecture      | 🎨 Arts           | 🖋️ Creative Writing           |
| 🔒 Cybersecurity     | 🤖 Technology     | 💾 Data Storage               |
| 📈 Data Science      | 🤖 Technology     | 🖥️ Computer Engineering       |
| 🥗 Nutrition         | 💪 Health         | 🍎 Dietary Health             |
| 📣 Marketing         | 🚀 Business       | 📊 Business Analytics         |
| 💹 Investing         | 🚀 Business       | 🔄 Change Management          |

---

## Reading Data (Category / Niche / Topic Listings)

Use the `get-*` scripts to print listings as CSV to stdout:

```bash
npx tsx scripts/get-categories.ts   # category_emoji, category_value, category_label, niche_count
npx tsx scripts/get-niches.ts       # category_value, niche_emoji, niche_value, niche_label, topic_count
npx tsx scripts/get-topics.ts       # category_value, niche_value, topic
```

These read directly from `data/topics.json`.

## Editing Data (Adding / Modifying)

`data/topics.csv` is the canonical source for all edits. **Never edit
`topics.json` directly** — it is a generated file.

### Workflow

1. Edit `data/topics.csv` (7 columns: `category_emoji`, `category_value`,
   `category_label`, `niche_emoji`, `niche_value`, `niche_label`, `topic`).
2. Rebuild `data/topics.json`:

```bash
npx tsx scripts/convert-csv-to-json.ts
```

The conversion script:

- Parses the 7-column CSV (handles quoted commas in topic values, strips `\r`).
- Groups rows into categories → niches, deduplicates topics.
- Slugifies labels into `value` keys.
- Sorts categories in canonical order, niches alphabetically within each
  category.
- Writes `data/topics.json` with the same structure `constants.ts` expects.

### Adding a topic to an existing niche

1. In `data/topics.csv`, append a new row with the category and niche details
   and the new topic in the last column.
2. Run the conversion script.

### Adding a new niche (within an existing category)

1. In `data/topics.csv`, add 30 rows with the category details, the new niche's
   emoji / value / label, and one topic per row.
2. Choose an emoji not already used by any other niche in the same category.
3. Use short concept phrases (1–5 words, no trailing punctuation, sentence case
   except proper nouns).
4. Run the conversion script.

### Adding a brand-new category

1. In `data/topics.csv`, add 900 rows (30 niches × 30 topics) with the new
   category's emoji / value / label.
2. The `general` category and `all` niche are derived automatically in
   `constants.ts` — no need to add them manually.
3. Add the new category's `value` to the `categoryValueOrder` array in
   `scripts/convert-csv-to-json.ts`.
4. Run the conversion script.

### Topic style guide

- Short concept words/phrases — e.g. `'Compound interest'`, `'Parkinson's law'`,
  `'The Fermi paradox'`
- **Not** full sentences or questions.
- No trailing punctuation.
- Title case for proper nouns; sentence case otherwise.

### Styling constraints

- Use **DaisyUI semantic tokens** only (`text-accent`, `bg-base-200`,
  `border-base-content/10`, etc.).
- Do **not** introduce raw hex/RGB colours or Tailwind palette colours.
