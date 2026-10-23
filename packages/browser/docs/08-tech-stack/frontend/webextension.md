# WebExtensions — MV2/MV3 (Omni)

## Overview

Cross-browser extension using WebExtensions API. MV2 for Gecko, MV3 for Chromium.

## Best Practices

- Parity across MV2/MV3; document version-specific behavior.
- Stable message action names; return `true` for async runtime listeners.
- Content scripts `document_start`; idempotent bindings.
- Redirect only new-tab/home/private-browsing.
- Block wall gated by toggle; ads selectors explicit; DNR vs webRequest kept in sync.
- Capture: measure in content, orchestrate in background, stitch in OffscreenCanvas; restore scroll.
- Shopify: fire-and-forget push from content; popup cache-only; MAIN world probe with CSP nonce handling.
