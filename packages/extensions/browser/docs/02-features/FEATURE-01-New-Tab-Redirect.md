# FEATURE-01: New Tab Redirect

## Priority

P0 (FR-001)

## Description

Redirect new-tab / home / private-browsing URLs to configurable target.

## User-visible behaviour

- Toggle "Redirect new tabs" in popup (default on).
- Custom redirect target per install (stored in storage.sync as newTabTargetUrl).
- Only affects chrome://newtab, about:newtab, about:home, about:privatebrowsing.

## Inputs

- newTabTargetUrl (string, optional). Defaults to https://hieudoanm.github.io.

## Behaviour

- Background registers listeners: tabs.onCreated, tabs.onUpdated.
- Uses lib/newtab.ts: getStoredTargetUrl with fallback to DEFAULT_TARGET_URL; shouldRedirect reads storage.sync.

## Edge cases

- Empty/invalid stored value → fallback to default.
- Redirect toggle disabled → no redirect.

## Acceptance conditions

- New tab opens and redirects to target.
- Other URLs never redirected.
- Toggle persists across browser restart (storage.sync).
