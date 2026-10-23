# Omni — Screen Designs

## Popup overview

The popup is an 11-tab toolbar. The header shows the brand and the active tab's URL; the tab bar switches panes; the body shows the selected pane's controls.

## Tabs (alphabetical)

Ads, BackToTop, Block, Chess, Claude, GitHub, Insta, New Tab, Shopify, Snap, Sound. Contextual tabs (Chess, Claude, GitHub, Insta, Shopify) start hidden; shown when active tab matches domain.

## Pane details

- **Ads**: Toggle "Block ads" (hide ads and tracking requests). ID `blockAds`. MV2 network blocking in `background.ts` via `webRequest`; MV3 via the static DNR ruleset `ruleset_block` in `public/manifest/v3/rules.json` — keep the two domain lists in sync.
- **BackToTop**: Toggle show Back to Top button; hint explains behavior (appears after 300 px scroll, smooth scroll to top, only on scrollable pages).
- **Block**: Toggle "Block distracting sites". Block list in `src/lib/block.ts` (`BLOCKED_DOMAINS`): facebook, x/twitter, instagram, reddit, tiktok, youtube, netflix, twitch, discord. When one loads, `maybeRenderBlockWall()` in `src/content.ts` replaces the page with the offline focus wall built from `BETTER_SITES` and `SUGGESTIONS`.
- **Chess** (contextual): Toggle hide ratings & overlays on Chess.com. Sets `display: none` on every match of `HIDE_CLASSES`; a single `MutationObserver` (with `WebKitMutationObserver` fallback) on `childList` + `subtree` re-applies hiding after Chess.com's SPA re-renders.
- **Claude** (contextual): Daily/weekly usage values and reset times; toggle track usage (badge + indicator). Reads `/rate_limits` and `/usage`. Always claude.ai-only: fetch override, observer, and render mount only on that host.
- **GitHub** (contextual): Toggle open external links in new tab. Delegated `click` listener resolves `getAbsoluteUrl()` and routes any link leaving GitHub to a new tab (`preventDefault` + `window.open(..., '_blank', 'noopener')`).
- **Insta** (contextual): Toggle Shift+right-click to open carousel images. Fires on right-button `mousedown` (`event.button === 2` + `shiftKey`); a capture-phase `window` `contextmenu` listener suppresses the menu only when paired with a fired gesture.
- **New Tab**: Toggle redirect new tabs + target URL input. Default target `https://hieudoanm.github.io`, overridable from `storage.sync` under `newTabTargetUrl`. Background refuses newtab/about targets to avoid loops.
- **Shopify** (contextual): "Check Shopify" button; verdict; Shopify and Shopify Plus indicator lists. Follows the Fera.ai "Shopify App Detector" architecture: content script pushes one-way, fire-and-forget; popup and background talk only over `chrome.runtime.sendMessage`.
- **Snap**: Two mode buttons (Current View, Full Page), format/quality/autosave controls (PNG/JPEG, quality slider, filename pattern), status line. Full-page capture splits layout measurement in the content script from scrolling in the background, then `stitchChunks()` in `src/lib/snapshot.ts` composites chunks on an `OffscreenCanvas`.
- **Sound**: Count of playing tabs; actions (Mute all, Mute others); scrollable list of sound rows with favicon, title, meta, mute toggle. Empty state shown when none playing. Firefox audibility fallback via `src/lib/audio.ts`.

## States

See [`states.md`](./states.md).