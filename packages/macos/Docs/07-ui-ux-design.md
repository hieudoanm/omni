# 07 — UI/UX Design

UI tokens, layout, states, and accessibility for Omni.

Code is the source of truth: `Sources/Views/Shared/DesignSystem/`. This document explains *why* those values exist and what to do when a screen needs something new. Where the two disagree, the code is the system and this file is the bug.

## Principles

Inherited from `AGENTS.md` §20, restated as decisions:

| Principle | What it means in practice |
| --------- | ------------------------- |
| Native first | System controls, system colours, SF Symbols. Never a colour the app invented. |
| Minimal | Every element earns its place; a screen with two jobs does not get a third. |
| Fast | A click opens instantly. Nothing waits on a network or a sleep. |
| Quiet | The utility disappears. No bounce, no glow, no attention-seeking motion. |
| Accurate | A wrong number shown beautifully is still wrong. Unknown state says so. |

## Surfaces

Two surfaces, one window, deliberately different (`ContentLayout`).

| | Panel | Window |
| --- | --- | --- |
| Entry | Menu-bar popover | `⇧⌘D`, Dock icon while open |
| Width | 600pt fixed | 1100×760, resizable to 820×560 |
| Navigation | Tab bar across the top | Sidebar, alphabetical groups |
| Content | One section at a time, behind a picker | One route per screen, plus cards for sub-sections |
| Chrome | Section header, divider, picker | Toolbar title, subtitle, cards |

The rule behind it: the panel competes with the rest of the screen, so it shows one thing well; the window has room, so it shows several things at once and lets the sidebar carry the navigation.

## Tokens

All in `Sources/Views/Shared/DesignSystem/`. Raw numbers for spacing, radius, colour opacity and duration are **banned** outside these files — `DesignSystemTests` fails the build if one appears.

### Spacing — the 4pt grid

| Token | Value | Use |
| ----- | ----- | --- |
| hairline | 2 | A label stacked on its value |
| iconGap | 3 | An icon against its label |
| xxs | 4 | Badge insets, tight lines |
| tight | 5 | Label-to-value pairs that want air |
| xs | 6 | Inside a capsule control |
| sm | 8 | Between related rows |
| compact | 10 | System capsule inset |
| md | 12 | Between blocks, card gutters |
| inset | 14 | Panel section inset |
| lg | 16 | Card padding |
| section | 18 | Between a screen's head and body |
| xl | 20 | Card header to content |
| xxl | 24 | Between groups on a screen |
| xxxl | 28 | Window screen inset |
| huge | 40 | Around an empty state |
| giant | 48 | Empty state inside a card |

`iconGap`, `tight`, `compact`, `inset` and `section` are off-grid on purpose: they match macOS's own control insets so the app sits correctly beside system UI. Everything else is on the grid.

### Radius

`small` 6 (details) · `medium` 8 (controls, badges) · `large` 10 (cards). A surface is exactly one of the three.

### Palette — semantic colours only

| Token | Value | Use |
| ----- | ----- | --- |
| cardFill | `primary` 4% | Card background |
| controlFill | `primary` 8% | Unselected control, row |
| track | `primary` 12% | Unfilled ring, progress track |
| stroke | `primary` 15% | Hairline, card outline |
| tint(_:) | any colour 15% | Badge wash |
| dimmed / faint | `secondary` / `primary` 40% | Placeholder, missing value, second hand |
| quietFill / quietText | `quaternary` 40% / `secondary` 60% | A tile with no state; a unit |
| muted | `primary` 60% | Secondary hand |
| lead | `primary` 80% | The value that leads a screen of values |
| pin | `primary` 20% | Analog face pin |
| shadow | `black` 15% | Elevation |

Every value is a semantic colour at a fixed opacity, so the whole app adapts to Light Mode, Dark Mode and increased transparency without a single hard-coded colour. Feature colours (usage thresholds via `UsageThresholdColor`, clock phase tints) belong to the feature, not to `Palette`.

### Typography

Prose uses macOS semantic styles directly — `.headline` for a card or screen title, `.subheadline` for a value, `.caption`/`.caption2` for supporting text. Tokens exist for what semantic styles cannot express: `emptyStateIcon` 28, `emptyStateIconLarge` 48, `emptyStateTitle` 44, `percentage` 30 semibold, `digitalReadout` 52 monospaced, `ringReadout` 40 monospaced, and `readoutCap` 40 — the ceiling a clock readout scales to.

Any number that changes more than once a second is monospaced, so digits do not shuffle horizontally as they tick.

### Motion

The app animates values, never decoration, so all durations are linear: easing a number that ticks every frame reads as lag.

| Token | Value | Use |
| ----- | ----- | --- |
| tick | 0.02s | A readout that changes as fast as the clock ticks |
| ring | 0.5s | Countdown ring sweeping to the next second |
| face | 1.0s | Watchface second hand |
| crossfade | 0.15s | The panel's tab crossfade — the only eased animation in the app |

Anything that moves a view must respect `accessibilityReduceMotion`.

### SurfaceMetrics

Panel: `panelWidth` 600, `panelPadding` = `Spacing.inset`, icon button 22×20. Window: 1100×760, minimum 820×560, screen inset `28 / 20`, sidebar 200 (170–280). Cards: `cardHeight` 320, `cardMinHeight` 140, `cardPadding` `Spacing.lg`, refresh button 24×24.

A control's size is a parameter (`CircleIconButton(size:)`), not a global token — what matters is that the same control looks the same everywhere.

## Components

| Component | File | For |
| --------- | ---- | --- |
| `SectionCard` | `Views/Shared/` | A titled card in the window grid. Fixed height so an inner list has something to scroll inside. |
| `SectionGrid` | `Views/Shared/` | Lays cards into as many columns as the width allows. |
| `ChipButton` | `DesignSystem/` | Choosing one of a few known options: presets, faces. |
| `CapsuleBadge` | `DesignSystem/` | A short label that states something and cannot be pressed. |
| `CircleIconButton` | `DesignSystem/` | Round icon controls: clock reset, play/pause, lap, stop. |
| `ClipboardListPane` | `Views/Clipboard/` | Search field, count, list, empty state — the shared clipboard body. |
| `InfoRow` / `JSONText` | `Views/IP/` | A label and its value; a raw payload block. |
| `ResourceMeter` | `Views/Shared/` | Used/total with a proportional bar and a percentage. |
| `UnavailableView` | `Views/Shared/` | The one way to say "this cannot be read". |
| `SearchField` | `DesignSystem/` | The one search field: rounded quiet fill, plain text field, clear button. |
| `ContentLayout` | `Views/Shared/` | `.panel` vs `.window`, so one view serves both surfaces. |

When a pattern appears three times, it becomes a component. When it appears twice, it stays local until the third arrives.

## Patterns

**Panel tab** — header with section name, divider, segmented picker, divider, body, panel padding. The picker filters or switches a sub-section; in the window that same choice becomes its own route.

**Window screen** — toolbar title and subtitle, then one route: either a centred, padded single body or a card grid. A window screen is never a card grid *and* a picker.

**Card grid** — sub-sections of one section, side by side, each a `SectionCard` with a definite height.

**Filtered list** — search field, item count, list, empty state. Empty state first names the filter: "No images copied yet", not "No results".

**Empty state** — a 28pt SF Symbol, a 44pt headline, one sentence saying what would fill it.

**Value tile** — label in `.caption`, value in `.subheadline` (or a display font when the number *is* the tile), optional badge.

**Sidebar search** — one `SearchField` above the sidebar list. A query narrows the groups; an empty group is not drawn at all.

## Rules

1. Spacing, radius, colour opacity and duration come from tokens. No exceptions, no "just this once".
2. Semantic system colours only. A hard-coded colour needs a reason in the commit that adds it.
3. One primary action per surface. The window toolbar carries refresh and settings; nothing else.
4. The panel has a tab bar; the window has a sidebar and never a tab bar.
5. Sidebar groups are alphabetical; rows inside a group keep their meaningful order.
6. Every icon-only control carries an accessibility label; decorative symbols are marked `accessibilityHidden`.
7. Anything that ticks is monospaced and digits-only.
8. A card that holds a list has a fixed height.
9. Unknown is a state, not a zero. Never render `0 GB` for a failed read.

## Anti-patterns

**A magic number in a view.** `.padding(14)` is a decision nobody made. → `Spacing.inset`.

**A hard-coded colour.** `Color(red: 0.2, green: 0.3, blue: 0.4)` breaks Dark Mode. → A semantic colour, or `Palette`.

**A tab bar in the window.** The window has room for a sidebar and cards; tabs throw that away.

**Animation on a number that ticks.** Anything under a second should be linear, or nothing.

## Content and voice

- Sentence case. No exclamation marks, ever.
- Ellipsis `…` when an action opens or changes something ("Open Dashboard…").
- Empty states name the filter that produced them, in the present tense: "Nothing pinned yet".
- Errors state what failed and what to try, not what went wrong internally.
- Units ride with the number ("12.4 GB", "3 min"), never in a separate column.

## Governance

**Changing a token** — edit the file, then `swift test`. `DesignSystemTests` pins the scale order, the grid, and the surface geometry.

**Adding a component** — it lives in `DesignSystem/` if more than one section uses it, next to the views that use it if only one does. Update §5 of this file in the same change.

**Verifying** — `swift build`, `swift test`, then look at the app: `make dev`. Check Light Mode, Dark Mode, increased transparency and Reduce Motion.

## Supporting files

See `07-ui-ux-design/` for token reference sheets, component specs, and the DesignSystemTests snapshot.
