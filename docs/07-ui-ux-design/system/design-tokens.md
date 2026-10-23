# Omni — Design Tokens

## Brand

Product name: **Omni**. Jarvis-inspired dark blue theme with cyan highlights. See [`brand/README.md`](../brand/README.md) for the marks themselves.

## Colour

| Token            | Color     | Usage                                |
| ---------------- | --------- | ------------------------------------ |
| `background`     | `#050a14` | Popup/body background                |
| `surface`        | `#0b1020` | Cards, tab bar, inputs               |
| `border`         | `#13233d` | Dividers, outlines                   |
| `accent`         | `#0F7BFF` | Active tabs, buttons, brand mark     |
| `accent2`        | `#7FC9FF` | Tab info text, emphasis              |
| `text`           | `#e6f0ff` | Primary text                         |
| `muted`          | `#7a8aa8` | Secondary text                       |
| `danger`         | `#ff4757` | Status/error states                  |

Rules:

1. Do not use raw hex in components when a semantic token exists.
2. The accent (`#0F7BFF`) is the single primary colour — active tabs, buttons, and the brand mark all use it.

## Typography

| Use             | Font        | Notes            |
| --------------- | ----------- | ---------------- |
| Display (brand) | `Bebas Neue`| "omni" in header |
| Body/UI         | `DM Mono`   | Monospace UI     |
| Fallbacks       | `monospace`, system fonts | Safety |

Scale: body text at base size, tab info and status lines slightly smaller.

## Spacing & Radius

- Border radius: `8px` (`--radius`)
- Header/body padding: `20px`
- Tab button padding: `10px 4px`

## Shadow

Subtle dark shadows on cards and the tab bar to separate surfaces from the background.