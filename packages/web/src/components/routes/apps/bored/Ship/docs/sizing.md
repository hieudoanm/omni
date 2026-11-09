# Sizing (512 × 512)

This document defines a consistent design system for creating high-quality
square graphics on a **512 × 512 px** canvas. All values are scaled
proportionally from the original 1080 × 1080 system (approximately **47.4%**)
while preserving the same visual hierarchy and spacing rhythm.

---

## Table of Contents

- [Sizing (512 × 512)](#sizing-512--512)
  - [Table of Contents](#table-of-contents)
  - [Canvas](#canvas)
  - [Typography](#typography)
  - [Spacing System](#spacing-system)
  - [Margins](#margins)
  - [Lists](#lists)
  - [Cards](#cards)
  - [Icons](#icons)
  - [Paragraphs](#paragraphs)
  - [Chart \& Diagram Guidelines](#chart--diagram-guidelines)
    - [General Principles](#general-principles)
    - [Recommended Chart Types](#recommended-chart-types)
    - [Grid](#grid)
    - [Data Labels](#data-labels)
  - [CSS Design Tokens](#css-design-tokens)
  - [Tailwind CSS Equivalents](#tailwind-css-equivalents)
    - [Typography (TailwindCSS)](#typography-tailwindcss)
    - [Spacing](#spacing)
    - [Border Radius](#border-radius)
    - [Layout](#layout)
    - [Example Card](#example-card)
  - [Design Tokens Summary](#design-tokens-summary)

---

## Canvas

- **Canvas Size:** 512 × 512 px
- **Color Profile:** sRGB
- **Export Format**

  - PNG (graphics, diagrams, code snippets)
  - JPEG (photography)

- **Safe Area:** Keep all important content at least **32 px** from every edge.

---

## Typography

The following typography scale is optimized for a **512 × 512 px** canvas.

| Level      |    Font Size | Line Height | Usage                     |
| ---------- | -----------: | ----------: | ------------------------- |
| H1         | **34–40 px** |        1.1× | Main title                |
| H2         | **27–30 px** |       1.15× | Section title             |
| H3         | **21–23 px** |        1.2× | Subsection                |
| H4         | **17–19 px** |       1.25× | Minor heading             |
| H5         | **14–15 px** |        1.3× | Small heading             |
| H6         | **11–13 px** |       1.35× | Tiny heading              |
| Body Large | **13–15 px** |       1.45× | Main explanation          |
| Body       | **11–13 px** |        1.5× | Paragraph text            |
| Small      |  **9–10 px** |        1.5× | Captions                  |
| Tiny       |     **8 px** |        1.5× | Non-essential information |

> Avoid body text smaller than **11 px** unless absolutely necessary.

---

## Spacing System

Use a **4 px spacing grid** throughout the design.

| Space | Usage               |
| ----: | ------------------- |
|  4 px | Icon ↔ Label        |
|  8 px | Related elements    |
| 12 px | Bullet spacing      |
| 16 px | Paragraph ↔ Heading |
| 20 px | Section spacing     |
| 24 px | Large separation    |
| 32 px | Major separation    |
| 40 px | Hero spacing        |

---

## Margins

- Outer padding: **32–40 px**
- Card padding: **16 px**
- Maintain consistent whitespace.

---

## Lists

- Heading → First bullet: **12–16 px**
- Between bullets: **8–12 px**
- Bullet → Text: **6–8 px**

---

## Cards

- Padding: **16 px**
- Gap between cards: **12–16 px**
- Corner radius: **12–16 px**

---

## Icons

|  Size | Usage    |
| ----: | -------- |
| 12 px | Small    |
| 16 px | Standard |
| 24 px | Large    |
| 32 px | Hero     |

Spacing between icon and text:

- **6–8 px**

---

## Paragraphs

- Line height: **1.4–1.6×**
- Paragraph spacing: **12–16 px**
- Maximum line width: **240–330 px**

---

## Chart & Diagram Guidelines

Educational content benefits from clean, minimal charts that communicate one
idea per visual.

### General Principles

- Show **one key takeaway** per chart.
- Avoid unnecessary decorations.
- Use consistent typography and spacing.
- Prefer horizontal labels.
- Use no more than **5–7 colors**.
- Always include titles and axis labels when appropriate.

### Recommended Chart Types

| Purpose            | Chart                   |
| ------------------ | ----------------------- |
| Compare categories | Bar Chart               |
| Show trends        | Line Chart              |
| Show proportions   | Pie / Donut Chart       |
| Show distributions | Histogram               |
| Show relationships | Scatter Plot            |
| Show processes     | Flow Diagram            |
| Explain systems    | Block Diagram           |
| Compare concepts   | Table / Comparison Card |
| Decision making    | Flowchart               |

### Grid

- Align to the **4 px grid**.
- Minimum chart margin: **16 px**.
- Leave **12–16 px** between chart and surrounding content.

### Data Labels

- Prefer direct labels over legends.
- Round values appropriately.
- Highlight only the key values.

---

## CSS Design Tokens

```css
:root {
  --canvas-width: 512px;
  --canvas-height: 512px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --font-h1: 38px;
  --font-h2: 30px;
  --font-h3: 23px;
  --font-h4: 19px;
  --font-h5: 15px;
  --font-h6: 13px;
  --font-body: 13px;
  --font-small: 10px;
  --font-tiny: 8px;
}
```

---

## Tailwind CSS Equivalents

### Typography (TailwindCSS)

| Design Token | Tailwind    |
| ------------ | ----------- |
| H1           | `text-4xl`  |
| H2           | `text-3xl`  |
| H3           | `text-2xl`  |
| H4           | `text-xl`   |
| H5           | `text-lg`   |
| H6           | `text-base` |
| Body         | `text-sm`   |
| Small        | `text-xs`   |

### Spacing

| Pixels | Tailwind              |
| -----: | --------------------- |
|   4 px | `p-1`, `m-1`, `gap-1` |
|   8 px | `p-2`, `m-2`, `gap-2` |
|  12 px | `p-3`, `m-3`, `gap-3` |
|  16 px | `p-4`, `m-4`, `gap-4` |
|  20 px | `p-5`, `m-5`, `gap-5` |
|  24 px | `p-6`, `m-6`, `gap-6` |
|  32 px | `p-8`, `m-8`, `gap-8` |

### Border Radius

| Design Token | Tailwind      |
| ------------ | ------------- |
| 8 px         | `rounded-lg`  |
| 12 px        | `rounded-xl`  |
| 16 px        | `rounded-2xl` |

### Layout

```html
<div class="flex h-[512px] w-[512px] flex-col gap-4 rounded-2xl p-8"></div>
```

### Example Card

```html
<div class="flex flex-col gap-2 rounded-2xl p-4 shadow-lg">
  <h2 class="text-2xl font-bold">Title</h2>
  <p class="text-sm leading-relaxed">Description goes here.</p>
</div>
```

---

## Design Tokens Summary

```text
Canvas
------
512 × 512

Spacing
--------
4
8
12
16
20
24
32
40

Typography
----------
H1: 38
H2: 30
H3: 23
H4: 19
H5: 15
H6: 13
Body: 13
Small: 10
Tiny: 8

Padding
-------
Outer: 36
Card: 16

Radius
------
8
12
16
```
