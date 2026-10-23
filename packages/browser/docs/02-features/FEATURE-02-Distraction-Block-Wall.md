# FEATURE-02: Distraction Block Wall

## Priority

P0 (FR-002)

## Description

Offline focus wall on blocked domains with better sites and suggestion wheel.

## User-visible behaviour

- Toggle "Block distracting sites" (default on).
- On blocked hostname, wall renders; non-blocked pages untouched.
- Jump to better sites; spin suggestion wheel.

## Behaviour

- Content script (document_start) checks isBlockedHostname in lib/block.ts.
- Renders styled wall with BETTER_SITES and SUGGESTIONS; spin animation.
- Toggle read from storage.sync.

## Edge cases

- Subdomains blocked (endsWith check).
- www prefix normalized.

## Acceptance conditions

- facebook.com etc show wall when enabled.
- Toggle off disables wall.
