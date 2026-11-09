# Popup — UI Logic (Omni)

## Role

Action popup (popup.html/css/ts). Renders tabs, toggles, controls; communicates with background.

## Best Practices

- Keep DOM queries scoped; update only on change.
- Cache state; handle busy states (capture guard).
- Contextual tabs shown/hidden based on active tab.
- Surface errors with prefixed messages.
