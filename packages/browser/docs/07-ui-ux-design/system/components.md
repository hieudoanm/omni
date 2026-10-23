# Omni — UI/UX Design — Components

_Part of [07-ui-ux-design.md](../../07-ui-ux-design.md)._

## Tabs

- Tab buttons: `.tab-btn` with role="tab", active state shows accent bottom border. Contextual tabs start `.hidden`.
- Panes: `.pane` with role="tabpanel"; only `.pane.active` shown.

## Toggles

- Custom toggle: `.toggle` wraps checkbox + `.toggle-track` + `.toggle-thumb`. Uses accent color when checked.

## Buttons

- Primary action buttons (`.mode-btn`, `.btn-primary`, `.btn-secondary`) with border and hover states using accent color.
- Capture buttons in Snap pane.

## Lists/Rows

- Sound tab: `.sound-row` with favicon, title, meta; `.audible` marks playing; `.muted` shows strikethrough.
- Shopify indicators: `.indicators` list with on/off states.

## Usage display

- Claude usage: `.usage-cols` with `.usage-value` (large), labels, reset timestamps.
