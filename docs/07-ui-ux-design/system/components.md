# Omni — Components

## Tabs

- Tab buttons: `.tab-btn` with `role="tab"`, active state shows accent bottom border. Contextual tabs start `.hidden`.
- Panes: `.pane` with `role="tabpanel"`; only `.pane.active` shown.

## Toggles

- Custom toggle: `.toggle` wraps checkbox + `.toggle-track` + `.toggle-thumb`. Uses accent colour when checked.
- Toggles persist to `storage.sync`; the background reads them before each redirect/block.

## Buttons

- Primary action buttons (`.mode-btn`, `.btn-primary`, `.btn-secondary`) with border and hover states using accent colour.
- Capture buttons in Snap pane: **Current View** and **Full Page**.

## Lists/Rows

- Sound tab: `.sound-row` with favicon, title, meta; `.audible` marks playing; `.muted` shows strikethrough.
- Shopify indicators: `.indicators` list with on/off states.

## Usage display

- Claude usage: `.usage-cols` with `.usage-value` (large), labels, reset timestamps.

## Status line

- Capture status: prefixed `Snapshot:` so errors read consistently in the popup status line; never dump raw data URLs to logs.

## Rules

1. Prefer a wrapper over a bare class string.
2. A button in a loading state keeps its label and shows the spinner beside it; it does not become a spinner itself.
3. A disabled control renders as a non-interactive element, not a link with `pointer-events-none`.