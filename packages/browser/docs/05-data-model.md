# Omni — Data Model

## 1. Purpose

Defines extension state persisted in chrome.storage (sync/local) and in-memory caches.

## 2. Storage Keys (sync)

| Key                   | Type    | Default                     | Purpose                                     |
| --------------------- | ------- | --------------------------- | ------------------------------------------- |
| redirectNewTabs       | boolean | true                        | FR-001                                      |
| blockDistractingSites | boolean | true                        | FR-002 (BLOCK_KEY)                          |
| blockAds              | boolean | true                        | FR-003 (ADS_KEY)                            |
| newTabTargetUrl       | string  | https://hieudoanm.github.io | FR-001                                      |
| githubExternalLinks   | boolean | true                        | FR-005                                      |
| instaGesture          | boolean | true                        | FR-006                                      |
| chessFocus            | boolean | true                        | FR-008                                      |
| claudeUsage           | boolean | true                        | FR-009                                      |
| backToTop             | boolean | true                        | FR-011                                      |
| claudeLimits          | object  | undefined                   | cached ClaudeLimitData (CLAUDE_STORAGE_KEY) |

## 3. In-Memory Caches (background)

- shopifyResults: Map<tabId, ShopifyDetectionResult> — per-tab detection, cleared on tab removal.
- contentAudibleTabs: Set<tabId> — from content script SOUND_AUDIBLE_ACTION (Firefox fallback).

## 4. Sound State

SoundTabInfo and SoundState describe tabs with audible/mutedInfo/state; broadcast on changes.

## 5. Capture State (ephemeral)

lastDataUrl, lastFilename, isBusy in popup during capture; no long-term persistence of images.

## 6. Rules

- Only sync for user toggles/preferences; large blobs never stored.
- Storage keys defined in lib modules; consistent naming.
- Cached results derived, not authoritative beyond session.
