# FEATURE-03: Ad Blocking

## Priority

P0 (FR-003)

## Description

DOM ad hiding + network request blocking (MV2 webRequest, MV3 DNR).

## User-visible behaviour

- Toggle "Block ads" (default on).
- Hides matched ad containers via MutationObserver; cancels ad/tracking requests when enabled.

## Behaviour

- lib/ads.ts defines AD_SELECTORS (explicit) and AD_NETWORK_DOMAINS.
- MutationObserver batches via onNextFrame (frame-scheduled).
- MV3: declarativeNetRequest with rules.json (ruleset_block), enabled/disabled by toggle.
- MV2: chrome.webRequest.onBeforeRequest with urls filter.

## Acceptance conditions

- Toggle syncs; disabling stops blocking.
- MV2 and MV3 parity for core set.
- No broad substring selectors causing false positives (by design).
