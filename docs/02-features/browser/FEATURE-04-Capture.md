# FEATURE-04: Capture (View & Full Page)

## Priority

P0 (FR-004, FR-005)

## Description

Viewport and full-page screenshot capture with chunk stitching.

## Messages

- CAPTURE_VIEW / CAPTURE_FULLPAGE from popup → background.
- SNAP_GET_LAYOUT, SNAP_SCROLL_TO between background and content script.
- Keep channel open (return true from listener).

## Behaviour

- Content script measures scrollHeight, clientHeight, scrollY, dpr (document_start ready).
- Full page: scroll in clientHeight steps, capture each chunk, settle with SETTLE_EXTRA_MS, stitch via OffscreenCanvas in lib/snapshot.ts.
- Restore scroll position after full-page capture.
- Download via chrome.downloads.download; formats: PNG/JPEG (quality). reencode in background.
- Hard timeout CAPTURE_HARD_TIMEOUT_MS.

## Edge cases

- Protected pages may block clipboard; downloads preferred.
- Fixed backgrounds/lazy loading handled best-effort.
- Canvas unavailable → error.

## Acceptance conditions

- View returns image for visible area.
- Full page produces stitched tall image; scroll restored.
- Errors prefixed Snapshot:.
