# Background — Architecture (Omni)

## Role

Service worker (MV3) / background page (MV2). Orchestrates capture, network blocking, state (shopify cache, sound state), redirects, messaging.

## Best Practices

- Keep orchestration pure/explicit; no DOM access.
- Handle async capture with timeouts (CAPTURE_HARD_TIMEOUT_MS).
- Maintain in-memory caches (shopifyResults, contentAudibleTabs) and sync with storage where appropriate.
- Return `true` from message listeners when async.
- Consistent logging prefixes.
