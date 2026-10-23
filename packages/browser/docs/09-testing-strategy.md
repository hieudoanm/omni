# Omni — Testing Strategy

## 1. Layers

- **Unit (TypeScript)**: pure logic in lib/* and utils/* (isBlockedHostname, normalize, stitching math where pure). Run with node/vitest if added.
- **Lint/Typecheck**: eslint + tsc --noEmit (via build/lint).
- **Integration (manual)**: MV2/MV3 manual smoke against Chrome/Firefox (per CONTRIBUTING).
- **web-ext lint**: on dist/v2 and dist/v3 before release.
- **Packaging smoke**: build produces artifacts, Makefile checks.

## 2. What to test (priorities)

- Capture: layout/scroll/stitch produces valid dataUrl; scroll restored.
- Redirect: only new-tab URLs.
- Block wall: only blocked domains.
- Ads: toggle gates network + DOM.
- Messaging: return true for async; timeouts.
- Shopify probe: CSP nonce handling, fallback to DOM-only.
- Sound: merge API + Firefox media fallback.
- GitHub/Instagram guards (modifiers, programmatic clicks).

## 3. Fixtures

Small HTML fixtures for ad selectors, blocked domain simulation, tall page for capture, media elements for audio.

## 4. Acceptance

All P0 features pass manual matrix; web-ext lint clean on both builds.
