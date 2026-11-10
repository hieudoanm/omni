# Content Scripts — Best Practices (Omni)

## Role

Run at `document_start` in page context (isolated world). Handle block wall, ad hiding, capture layout/scroll, feature hooks (GitHub, Insta, Chess, Claude, Shopify push, audio detection, Back to Top).

## Best Practices

- Idempotent: guard against re-injection (don’t stack listeners).
- Minimal DOM queries; batch with frame scheduling.
- Never block page load unnecessarily.
- Communicate via `chrome.runtime.sendMessage`/tabs messaging; use postMessage for main-world bridge.
- Prefix logs.
