# Omni — API/Message Specification

## 1. Purpose

Defines extension messaging protocol (runtime + tabs + postMessage).

## 2. Background ↔ Popup (runtime.sendMessage)

| Action                   | Direction | Payload                                        | Response                            | Notes                                   |
| ------------------------ | --------- | ---------------------------------------------- | ----------------------------------- | --------------------------------------- |
| captureView              | popup→bg  | { action:'captureView', format, quality? }     | { dataUrl } or { error }            | return true                             |
| captureFullPage          | popup→bg  | { action:'captureFullPage', format, quality? } | { dataUrl } or { error }            | return true                             |
| SNAP_PING                | popup→bg  | { action:'SNAP_PING' }                         | { pong: true, alarm }               | health check                            |
| GET_SHOPIFY_STATE_ACTION | popup→bg  | { action, tabId }                              | ShopifyDetectionResult or undefined | cache-only                              |
| GET_SHOPIFY_ACTION       | popup→bg  | { action, tabId }                              | ShopifyDetectionResult              | may run MAIN world executeScript        |
| GET_SOUND_STATE_ACTION   | popup→bg  | { action }                                     | SoundState                          | aggregates current tabs + audible cache |
| SOUND_MUTE_TAB_ACTION    | popup→bg  | { action, tabId }                              | void (broadcast)                    | mute/unmute toggle                      |
| SOUND_MUTE_ALL_ACTION    | popup→bg  | { action }                                     | void                                | mute all audible                        |
| SOUND_MUTE_OTHERS_ACTION | popup→bg  | { action, exceptTabId }                        | void                                | mute others                             |

## 3. Background ↔ Content (tabs.sendMessage)

- SNAP_GET_LAYOUT: bg asks content for layout; content returns LayoutInfo.
- SNAP_SCROLL_TO: bg instructs content to scroll to y; content may report.
  Content may push: SHOPIFY_RESULT_ACTION { result }, SOUND_AUDIBLE_ACTION { playing }, CLAUDE_RESULT_ACTION { limit }.

## 4. Content Main World ↔ Isolated (postMessage)

- TABS_SHOPIFY_CHECK: isolated asks main world (probe); main world responds with Shopify globals/flags. Guarded by window.__tabsShopifyHook; removed after append. Respects CSP nonce if present.

## 5. Data Types (key)

- LayoutInfo: { scrollHeight, clientHeight, scrollY, dpr }
- ShopifyDetectionResult: { isShopify, isShopifyPlus, indicators, plusIndicators }
- SoundTabInfo: { tabId, title, url, audible, muted, pinned, windowId }
- SoundState: { tabs: SoundTabInfo[] }
- ClaudeLimitData: internal shape from lib/claude.ts

## 6. Error Handling

Errors returned as { error: string } with prefixed messages (Snapshot:, etc.). Listeners keep channel open for async operations.
