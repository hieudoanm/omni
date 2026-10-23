# Omni — Brand

## Brand Identity

Omni uses a Jarvis-inspired dark blue theme with cyan highlights. The logo mark is a simple rounded box with a ring in the middle, main colour blue (Iron Man Jarvis Blue).

## Name

- Display name: "omni" (Bebas Neue)
- Extension name: "Omni"

## Logos

| Asset         | File                              | Notes                                    |
| ------------- | --------------------------------- | ---------------------------------------- |
| Logo mark     | [`svg/logo-mark.svg`](./svg/logo-mark.svg)         | Rounded box with ring, Jarvis blue gradient |
| Omni wordmark | [`svg/logo-word.svg`](./svg/logo-word.svg) | #0066FF → #0039CC gradient, "omni"       |

## Colours

| Token             | Color     | Usage                            |
| ----------------- | --------- | -------------------------------- |
| Primary/Accent    | `#0066FF` | Active tabs, buttons, brand mark |
| Accent            | `#0039CC` | Gradient stop                    |
| Highlight         | `#7FC9FF` | Emphasis/highlights              |
| Background        | `#050a14` | Popup background                 |
| Surface           | `#0b1020` | Cards/tab bar                    |
| Border            | `#13233d` | Dividers/outlines                |
| Text              | `#e6f0ff` | Primary text                     |
| Muted             | `#7a8aa8` | Secondary text                   |
| Danger            | `#ff4757` | Status/error                     |

## Typography

| Use     | Font         | Notes     |
| ------- | ------------ | --------- |
| Display | `Bebas Neue` | Brand     |
| Body/UI | `DM Mono`    | Monospace |

## Rasterise

```sh
./docs/07-ui-ux-design/brand/brand.sh [width]
```

Reads every `*.svg` in `svg/` and writes the matching `*.png` in `images/`. Default width is 1024 px.