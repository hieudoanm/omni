# Omni — Architecture

## 1. Goals

Cross-browser (Chromium + Gecko), MV2+MV3 from single source, offline-first, typed messaging, idempotent content scripts, correct full-page capture, tab audio control.

## 2. Tech Stack

| Layer       | Technology                                 |
| ----------- | ------------------------------------------ |
| Runtime     | WebExtension API (MV2/MV3)                 |
| Language    | TypeScript 6 (strict)                      |
| Build       | Webpack 5 + ts-loader                      |
| Manifests   | MV2 + MV3                                  |
| DOM/Canvas  | Content script + OffscreenCanvas stitching |
| UI          | Action popup (popup.html, popup.ts)        |
| Linting     | ESLint 10 + Prettier                       |
| Packaging   | Makefile + web-ext (zip/xpi/crx)           |
| Package Mgr | pnpm                                       |

## 3. Directory Structure

See ARCHITECTURE.md (existing detailed) for full layout. Key: src/background.ts, src/content.ts, src/popup.ts, src/lib/_, src/utils/_, public/manifest/v2,v3.

## 4. Component Responsibilities

- **Popup**: toggles, capture actions, contextual tabs, Sound tab UI; communicates via chrome.runtime.sendMessage.
- **Background**: new-tab redirect, capture orchestration, network ad blocking (webRequest/DNR), Shopify state cache + badge, Sound state aggregation, Claude badge, message routing.
- **Content**: layout metrics for capture, block wall, ad hiding, GitHub routing, Instagram gesture, Shopify detection push, Chess focus, Claude usage injection/observation, audio detection (Firefox), Back to Top.
- **Lib modules**: ads, audio, block, chess, claude, github, insta, newtab, shopify, snapshot, sounds.

## 5. Messaging Protocol (key actions)

- CAPTURE_VIEW, CAPTURE_FULLPAGE
- SNAP_GET_LAYOUT, SNAP_SCROLL_TO, SNAP_PING
- SHOPIFY_RESULT_ACTION, GET_SHOPIFY_ACTION, GET_SHOPIFY_STATE_ACTION, TABS_SHOPIFY_CHECK
- SOUND_AUDIBLE_ACTION, GET_SOUND_STATE_ACTION, SOUND_MUTE_TAB_ACTION, SOUND_MUTE_ALL_ACTION, SOUND_MUTE_OTHERS_ACTION, SOUND_STATE_CHANGED_ACTION
- CLAUDE_RESULT_ACTION

Channels: popup↔background (runtime), background↔content (tabs.sendMessage/runtime), content main-world↔isolated via postMessage where needed.

## 6. Build Pipeline

webpack.config.ts compiles entries twice (v2, v3); CopyPlugin injects matching manifest.json and popup.html. make build produces zip/xpi/crx in download/.

## 7. Trust Boundaries

Isolated content script vs page main world (Shopify probe uses postMessage + guarded hook). Background isolated from DOM. Permissions limited to declared set.

## 8. Diagrams

MMD files under ./04-architecture/mmd/ (can be generated as needed).
