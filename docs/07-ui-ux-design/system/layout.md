# Omni — Layout

## Shell

- `.header`: brand name "omni" (Bebas Neue) and the tab info line (`#tabUrl`) showing the active tab's hostname and path.
- `.tabbar`: horizontal scrollable tab bar (Ads, BackToTop, Block, Chess, Claude, GitHub, Insta, New Tab, Shopify, Snap, Sound). Contextual tabs (Chess, Claude, GitHub, Insta, Shopify) start `.hidden` and appear only when the active tab's hostname matches.
- `.body`: container with `.pane` sections — only the active pane is visible.
- Fixed width popup (~320–360 px depending on view). Dark theme background.

## Breakpoints

| Name    | Width    | Layout                                                  |
| ------- | -------- | ------------------------------------------------------- |
| popup   | 320–360  | Fixed-width toolbar popup; tab bar scrolls horizontally |

The popup is not responsive to the viewport beyond the browser's own constraints; it is a fixed-size toolbar.

## Navigation

The popup is an 11-tab bar ordered alphabetically: **Ads, BackToTop, Block, Chess, Claude, GitHub, Insta, New Tab, Shopify, Snap, Sound**. Keep `data-tab` ids, buttons, and panes in this order.

Contextual tabs start with class `hidden` in `popup.html` and are shown only when the active tab matches: `github.com` / `instagram.com` / `chess.com` / `claude.ai` hostnames (via `matchesHost` in `popup.ts`, www-stripped, exact domain or `.<domain>` suffix), and Shopify when the background's per-tab detection cache reports `isShopify` (asked via the cache-only `GET_SHOPIFY_STATE_ACTION`, never `executeScript`).

The popup opens straight onto the first matching tab — Insta → GitHub → Chess → Claude → Shopify — so all five are contextual features.

## Theme

Jarvis-inspired dark theme only. Tokens live in [`design-tokens.md`](./design-tokens.md). There is no light/dark toggle.