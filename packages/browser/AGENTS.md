# Omni - redirect new tabs to the hieudoanm home page and capture the current view or the full scrolling page as PNG/JPEG/WebP, copy or download

## Documentation

Reference docs live in `docs/`:

| Doc                    | Covers                                              |
| ---------------------- | --------------------------------------------------- |
| `docs/ARCHITECTURE.md` | Tech stack, build pipeline, MV2/MV3 strategy        |
| `docs/ROADMAP.md`      | Phased feature roadmap with progress tracking       |
| `docs/CONTRIBUTING.md` | Setup, dev commands, coding and testing conventions |
| `docs/PACKAGING.md`    | Packaging and store-submission checklist            |
| `docs/DOWNLOADS.md`    | Download links and supported browsers               |

## Key Conventions

- New-tab interception lives entirely in the background; the default landing
  URL is `DEFAULT_TARGET_URL` in `src/lib/newtab.ts`. Users can override it from
  the popup's New Tab tab (stored in `storage.sync` under `newTabTargetUrl`);
  the background resolves the stored URL before every redirect, falling back to
  the default when unset, and refuses newtab/about targets to avoid loops
- Listen on both `tabs.onCreated` (via `pendingUrl`, fires before navigation
  completes) and `tabs.onUpdated` (catches late navigations into
  `chrome://newtab`); redirect **only** new-tab / home / private-browsing URLs
  and leave every other URL untouched
- The popup toggle `redirectNewTabs` (default on) and the custom redirect
  target `newTabTargetUrl` (default `https://hieudoanm.github.io`) are persisted
  in `storage.sync`; the background reads both before each redirect
- The block list lives in `src/lib/block.ts` (`BLOCKED_DOMAINS`): facebook,
  x/twitter, instagram, reddit, tiktok, youtube, netflix, twitch, discord —
  when one loads, `maybeRenderBlockWall()` in `src/content.ts` replaces the
  page with the offline focus wall built from `BETTER_SITES` and `SUGGESTIONS`;
  the `blockDistractingSites` toggle (default on, `storage.sync`) gates it and
  is the only config the wall reads
- Chess.com focus lives in `src/lib/chess.ts` (`registerChessFocus()`): on a
  `chess.com` host it sets `display: none` on every match of `HIDE_CLASSES`
  (live-game start/over overlays, user tagline username/rating, user rating),
  and a single `MutationObserver` (with `WebKitMutationObserver` fallback) on
  `childList` + `subtree` re-applies hiding after Chess.com's SPA re-renders —
  only rerun when nodes are actually added/removed, plus one initial pass on
  `DOMContentLoaded`; the `chessFocus` toggle (default on, `storage.sync`)
  gates it and it never mutates game state, clicks, or sends any data
- Claude.ai usage lives in `src/lib/claude.ts` (`registerClaudeUsage()`): on a
  `claude.ai` host it overrides `window.fetch` once and inspects only responses
  whose URL contains `/rate_limits` or `/usage` (`WATCHED`), parsing tolerantly
  across response shapes (top-level array, `rate_limits`/`limits` objects,
  usage objects, `*_message_count` fallbacks). Parsed daily/weekly periods are
  merged into `localStorage['claude_limit_data']`, rendered as the inline
  `claude-limit-indicator` next to the composer (MutationObserver + 1s/3s
  fallbacks, 60s refresh, idempotent `replaceWith` mounts), and pushed
  fire-and-forget as `{ action: CLAUDE_RESULT_ACTION, result: ClaudeLimitData }`
  so the background can update a per-tab badge (`X%`, `claudeColor` thresholds,
  blank when no data) and the popup can read `chrome.storage.local['claudeLimit']`.
  The module must stay side-effect-free at import — the background and popup
  import only its constants, `claudePercent`, `claudeColor`, `formatReset`, and
  types. Always claude.ai-only: fetch override, observer, and render mount only
  on that host; `claudeUsage` toggle (default on, `storage.sync`) gates start/stop
  live via a `storage.onChanged` listener
- Ad blocking lives in `src/lib/ads.ts`: `AD_SELECTORS` hides ad banners via an
  idempotent `MutationObserver`, `AD_NETWORK_DOMAINS` feeds the network blocker;
  the `blockAds` toggle (default on, `storage.sync`) gates it, with MV2 network
  blocking in `background.ts` via `webRequest` and MV3 via the static DNR
  ruleset `ruleset_block` in `public/manifest/v3/rules.json` — keep the two
  domain lists in sync
- Sound control lives in `src/lib/sounds.ts` (pure constants/types/helpers only —
  it is imported by both `background.ts` and `popup.ts` and must stay
  side-effect-free at import). The popup's Sound tab lists every tab
  (favicon, title, hostname) with a `♪ playing` marker when `tab.audible` and
  a muted style when `mutedInfo.muted`; each row toggles that tab via
  `chrome.tabs.update(tabId, { muted })`. Global actions: **Mute All** mutes
  every tab (repeating the query in `background.ts` `handleMuteAll`), **Mute
  Others** mutes all tabs except the active one (`handleMuteOthers`). The
  popup requests state with `GET_SOUND_STATE` and also re-polls it every 1.5 s
  while open (re-rendering only on change), and the background broadcasts
  fresh state as `{ action: SOUND_STATE_CHANGED_ACTION, state }` on
  `tabs.onUpdated` when `audible` / `mutedInfo` change and on `tabs.onRemoved`
  (fire-and-forget, `lastError` swallowed) so the open popup stays live.
  There is no toggle for this feature
- Back to Top lives in `src/lib/backtotop.ts` (`registerBackToTop()`): adds a
  "Back to Top" button to the bottom-right corner of scrollable pages. The button
  appears when the user scrolls past `SCROLL_THRESHOLD` (300px) and smoothly
  scrolls back to the top when clicked. It only activates on pages where
  `scrollHeight > clientHeight` (truly scrollable pages). The feature is gated
  by the `backToTop` toggle (default on, `storage.sync`) and uses frame-scheduled
  scroll handling via `onNextFrame` for performance. The button has a high
  z-index (2147483647) to appear above other page content
- Firefox audibility fallback — Firefox's `tabs.Tab.audible` is unreliable (it
  is decoupled from the real audio state; speaker-visible tabs can report
  `false`). So on Firefox only (detected per-page via
  `navigator.userAgent` — `chrome.runtime.getBrowserInfo` is a background-only
  API, not available in content scripts), `src/lib/audio.ts`
  `registerAudioDetection()` runs in the top frame of every page and reports
  fire-and-forget
  `{ action: SOUND_AUDIBLE_ACTION, playing }` whenever a non-muted
  `<video>`/`<audio>` element with `volume > 0` toggles playing (1 s sweep,
  change-only). `background.ts` merges those per-tab reports into the sound
  state, so a row counts as audible if **either** the API says so **or** the
  page is audibly playing media; reports are dropped on `tabs.onRemoved`
- The popup is an 11-tab bar ordered alphabetically: **Ads, BackToTop, Block, Chess,
  Claude, GitHub, Insta, New Tab, Shopify, Snap, Sound** — keep data-tab ids,
  buttons, and panes in this order. Contextual tabs (GitHub, Insta, Chess,
  Claude, Shopify) start with class `hidden` in `popup.html` and are shown only
  when the active tab matches: `github.com` / `instagram.com` / `chess.com` /
  `claude.ai` hostnames (via `matchesHost` in `popup.ts`, www-stripped, exact
  domain or `.<domain>` suffix), and Shopify when the background's per-tab
  detection cache reports `isShopify` (asked via the cache-only
  `GET_SHOPIFY_STATE_ACTION`, never `executeScript`). The popup opens straight
  onto the first matching tab — Insta → GitHub → Chess → Claude → Shopify — so
  all five are contextual features; Shopify's pane still shows the result of a
  manual "Check Shopify" button
- External-link routing lives in `src/lib/github.ts`
  (`registerExternalLinkRouting()`): on a `github.com` host it mounts a
  delegated `click` listener that resolves `getAbsoluteUrl()` and routes any
  link leaving GitHub to a new tab (`preventDefault` +
  `window.open(..., '_blank', 'noopener')`); in-repo links, `#` and
  `javascript:` hrefs, modifier-key clicks, and programmatic clicks pass
  through untouched. The listener mounts only on GitHub hosts (no per-page
  cost elsewhere). Gated by the `githubExternalLinks` toggle (default on,
  `storage.sync`)
- The Instagram gesture lives in `src/lib/insta.ts`
  (`registerInstaGesture()`): **Shift + right-click** on an Instagram page
  opens `<img>` sources collected from the right-clicked element plus its
  siblings and their subtrees (carousel images), `Set`-deduped, each in a new
  tab with `noopener noreferrer`. The gesture fires on the right-button
  `mousedown` (`event.button === 2` + `shiftKey`) — deliberately not on
  `contextmenu`, which Instagram/Facebook pages can swallow — and a
  capture-phase `window` `contextmenu` listener suppresses the menu only when
  paired (within `CONTEXT_MENU_PAIR_MS`) with a fired gesture. Plain
  right-clicks keep the normal menu. No multi-click/interval heuristics. Gated
  by the `instaGesture` toggle (default on, `storage.sync`) and an
  `instagram.com` hostname check — on every other page it is inert
- Shopify detection in `src/lib/shopify.ts`
  (`registerShopifyDetection()`) follows the Fera.ai "Shopify App Detector"
  architecture: the **content script pushes one-way, fire-and-forget** to the
  background, and the **popup and background only talk over
  `chrome.runtime.sendMessage`** — the popup never sends `tabs.sendMessage` to
  a content script. On page load (immediately / at `DOMContentLoaded`, then
  600 ms after `load`, and again on `visibilitychange`) the content script
  computes a `ShopifyDetectionResult` (`isShopify`, `isShopifyPlus`, plus the
  `indicators` / `plusIndicators` breakdown) and sends
  `{ action: SHOPIFY_RESULT_ACTION, result }` with **no reply expected**. A
  store is Shopify if any indicator (window.Shopify, `shopify-checkout-api-token`
  meta, `cdn.shopify.com` script, `/cart.js`) is true; Plus if a shopify store
  also has any plus indicator (`checkout.shopify` host, `Shopify.checkout`,
  `shopify-digital-wallet` meta). `window.Shopify` / `Shopify.checkout` are
  page-context globals the isolated content-world cannot read, so a tiny
  main-world probe (guarded `__tabsShopifyHook`, removed after append) answers
  `TABS_SHOPIFY_CHECK` `postMessage` requests; if the page uses CSP nonces
  (e.g. `script-src 'strict-dynamic'`) the probe copies an existing script's
  nonce, and detection falls back to DOM-only indicators if the probe is
  unavailable. The background stores the last true result per tab in
  `shopifyResults` and sets a **toolbar badge** "S" on detected stores. The
  popup's Shopify tab appears only when the active tab's cached result says
  `isShopify` (via cache-only `GET_SHOPIFY_STATE_ACTION`); clicking "Check Shopify" sends
  `{ action: GET_SHOPIFY_ACTION, tabId }` to the background, which returns the
  cached result instantly when present, otherwise runs
  `detectShopifyInPage()` in the tab's **MAIN world** via
  `chrome.scripting.executeScript` (reads `window.Shopify` + DOM directly,
  immune to CSP and content-script channel quirk, works on stale tabs). If
  `chrome.scripting` is unavailable (e.g. older Firefox) the push-cache is the
  only source. The popup retries up to 2 times (250 ms apart), races each round
  trip against a 1.2 s timeout, and shows a fast visible outcome — verdict,
  "Not a Shopify store", or "Not responding — refresh the page" — instead of
  hanging on "Checking…"
- Keep `BETTER_SITES` (jump shortcuts) and `SUGGESTIONS` (spin-wheel ideas)
  family-friendly and dependency-free; they render without any network call
- The block wall and the capture content script coexist in `content.ts`: the
  block only fires on a blocked domain, the capture listeners only answer
  `SNAP_` messages — never let the wall intercept non-blocked pages
- Two message actions arrive from the popup: `captureView` and
  `captureFullPage`; both respond with `{ dataUrl }` or `{ error }` and the
  background **must return `true`** from the listener to keep the channel open
  for async capture
- Full-page capture is split: the content script measures layout only
  (`scrollHeight`/`clientHeight`/`scrollY`/`dpr`) and drives scrolling; the
  background scrolls `clientHeight`-sized steps with `SETTLE_EXTRA_MS = 80`
  settle time, then `stitchChunks()` in `src/lib/snapshot.ts` composites chunks
  on an `OffscreenCanvas` (white fill, `createImageBitmap` decode, then
  `convertToBlob` → PNG data URL)
- Formats other than PNG/JPEG are re-encoded server-side of the document (in
  the background) with default quality 92; keep capture math in the background
  and pure image work in `src/lib/snapshot.ts`
- Popup flow stays idempotent: single `lastDataUrl` + filename, busy guard;
  autodownload default is PNG named from the tab's hostname/path
- Errors are prefixed `Snapshot:` so they read consistently in the popup
  status line; never dump raw data URLs to logs
- Cross-browser: Chromium (MV3) + Firefox (MV2)
- Everything runs fully offline: redirect target, block wall, ad blocking,
  and capture all work with no network calls and no data leaving the page or
  device
