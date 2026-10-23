# Omni — Product Specification

Product strategy · Functional requirements · Architecture · Data model · Delivery roadmap

> This document is the product-strategy source. The normative implementation set is [`00`–`12`](#normative-documents). Where this document and the numbered documents disagree on implementation detail, the numbered documents govern.

## Normative documents

| #   | Document                                                 | Governs                                                   |
| --- | -------------------------------------------------------- | --------------------------------------------------------- |
| 00  | [`00-overview.md`](00-overview.md)                       | Product vision and scope                                  |
| 01  | [`01-requirements.md`](01-requirements.md)               | Functional/non-functional requirements (`FR-`, `NFR-`)    |
| 02  | [`02-features.md`](02-features.md)                       | User-visible behaviour                                    |
| 03  | [`03-user-stories.md`](03-user-stories.md)               | User goals and acceptance scenarios                       |
| 04  | [`04-architecture.md`](04-architecture.md)               | Module boundaries, request lifecycle, tab/scripting model |
| 05  | [`05-data-model.md`](05-data-model.md)                   | Storage, state schema, persistence rules                  |
| 06  | [`06-api-specification.md`](06-api-specification.md)     | Extension messaging protocol, message actions             |
| 07  | [`07-ui-ux-design.md`](07-ui-ux-design.md)               | Popup layout, tabs, accessibility                         |
| 08  | [`08-tech-stack.md`](08-tech-stack.md)                   | Allowed technologies and dependency policy                |
| 09  | [`09-testing-strategy.md`](09-testing-strategy.md)       | Test layers, fixtures, acceptance criteria                |
| 10  | [`10-implementation-plan.md`](10-implementation-plan.md) | Phased delivery plan                                      |
| 11  | [`11-deployment.md`](11-deployment.md)                   | Build, packaging, release artifacts                       |
| 12  | [`12-operations.md`](12-operations.md)                   | Operations, troubleshooting, compatibility                |

---

## 1. Product vision

Omni is a cross-browser extension that supercharges tab control, focus, and capture from a single toolbar popup. It redirects new tabs to a home page, blocks distracting sites with an offline focus wall, blocks ads and tracking requests, routes GitHub external links to new tabs, adds an Instagram quick-open gesture, detects Shopify stores, hides distractions on Chess.com, tracks Claude.ai API rate-limit usage, lists and controls tab audio, and captures the visible viewport or full page as an image.

The product demonstrates disciplined WebExtension engineering across Manifest V2 and Manifest V3, with offline-first behaviour, type-safe TypeScript, strict build guardrails, and reproducible packaging for Chromium and Gecko.

## Product principles

**Offline by default** — redirect target, block wall, ad blocking, and capture work with no network calls and no data leaving the device.

**Cross-browser parity** — a feature must work on both MV2 and MV3 or be documented as version-specific.

**Idempotent and safe** — content scripts are idempotent, capture restores scroll position where possible, and operations fail loudly with prefixed logs.

**Single source, dual manifest** — one codebase compiles twice with per-version manifests.

### The product promise

> Redirect, focus, and capture any tab with one consistent popup across Chrome, Edge, Brave, Opera, Vivaldi, Arc, and Firefox.

Omni is a personal productivity utility. It does not collect telemetry, does not send user data to remote endpoints, and respects page integrity.

## 2. Target users

| Persona              | Primary need                              | Desired outcome                                                             |
| -------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Focus-oriented user  | Reduce distraction and regain tab control | Block distracting sites, mute unwanted tabs, open new tabs on home          |
| Power browser user   | Capture pages and navigate faster         | Full-page/viewport screenshots, GitHub/Instagram shortcuts, Shopify insight |
| Developer/maintainer | Ship cross-browser extension reliably     | MV2/MV3 parity, typed messaging, reproducible builds                        |

## 3. Scope and priorities

- **P0** — Core platform: new-tab redirect, block wall, ad blocking, capture (view/full), popup, MV2/MV3 dual build.
- **P1** — Refinements: Sound tab with mute controls, GitHub external links, Instagram gesture, Chess focus, Claude usage badge, Shopify detection, Back to Top.
- **P2** — Advanced capture (selection, element, scroll containers), store distribution automation.

## 4. Functional requirements

See [`01-requirements.md`](01-requirements.md).

## 5. User journeys

### Journey A — Regain focus on new tab

1. Open a new tab (chrome://newtab / about:newtab).
2. Redirect kicks in and lands on `https://hieudoanm.github.io` (or custom target).
3. Distraction blocking protects from returning to blocked domains.

### Journey B — Capture a long page

1. Open any page and click the extension icon.
2. Choose "Current view" or "Full page".
3. Full page scrolls, stitches chunks, downloads the image.

### Journey C — Control audio

1. Open popup and switch to Sound tab.
2. See which tabs are playing audio (♪ marker).
3. Mute a tab, mute all, or mute others.

## 6. Application structure

See [`04-architecture.md`](04-architecture.md).
