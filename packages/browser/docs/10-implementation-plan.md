# Omni — Implementation Plan

## 1. Phases

| Phase | Focus                                                                 | Status          |
| ----- | --------------------------------------------------------------------- | --------------- |
| 0     | Foundation: repo structure, dual build (v2/v3), lint/format, Makefile | Done (existing) |
| 1     | Core capture: SNAP messages, layout, stitching, download              | Done            |
| 2     | Redirect + Block wall + Ads                                           | Done            |
| 3     | GitHub, Instagram, Shopify                                            | Done            |
| 4     | Chess, Claude, Sound, Back to Top                                     | Done            |
| 5     | Docs normalization (this work)                                        | In progress     |
| 6     | Packaging/release polish, web-ext clean, store checklist              | Future          |

## 2. Milestones

- M1: MV2/MV3 both build clean.
- M2: Capture passes viewport+full page on sample pages.
- M3: All features toggleable and idempotent.
- M4: Release artifacts (zip/xpi/crx) reproducible.

## 3. Dependencies

pnpm, webpack, web-ext, Chrome/Firefox for smoke tests.

## 4. Definition of Done

- web-ext lint passes dist/v2 and dist/v3.
- eslint/format clean.
- Manual smoke matrix passes.
- Docs updated to match code.
