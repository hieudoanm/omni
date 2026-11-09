# Omni — Operations

## 1. Troubleshooting

- Capture fails: check protected page (clipboard blocked), content script loaded (document_start), SNAP messages reach content. Look for Snapshot: prefix.
- Shopify badge missing: cache may not have push; click "Check Shopify" (runs MAIN world). Check CSP/nonce behavior.
- Sound tab empty on Firefox: media sweep fallback runs; ensure page has audio elements.
- Redirect not happening: only new-tab URLs; toggle enabled; target valid.

## 2. Compatibility

- Chromium MV3: Chrome/Edge/Brave/Opera/Vivaldi/Arc.
- Gecko MV2: Firefox/Tor/Zed.
- Safari WebKit: not published.

## 3. Debug Logging

Prefixes: Snapshot:, Block:, BlockAds:, GitHub:, Insta:, Shopify:, Chess:, Claude:, Sound:, Tabs:. Keep minimal; no sensitive data.

## 4. Maintenance

- web-ext lint before release (both v2/v3).
- Keep MV2/MV3 parity; update DNR rules.json when AD_NETWORK_DOMAINS change.
- Update BLOCKED_DOMAINS cautiously.
- Bump version in package.json and both manifests together.

## 5. Recovery

Clear storage.sync if corrupted: chrome.storage.sync.clear() (dev). Rebuild from clean state.
