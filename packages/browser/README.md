# Omni - Browser Extension

Redirect every new tab to the hieudoanm home page, block distracting sites and
ads, keep GitHub routing external links to new tabs, detect Shopify stores,
track Claude.ai API rate-limit usage, control tab sound, and capture the current
tab as a screenshot, all from one toolbar button.

Features:

- **New Tab redirect** — new-tab / home / private-browsing tabs are redirected
  to the hieudoanm home page (toggleable from the popup).
- **Block** — visiting a distracting site (Facebook, X, Instagram, Reddit,
  TikTok, Netflix, Twitch, Discord, and more) stops on a focus wall with better
  sites to jump to and a suggestion wheel (toggleable from the popup).
- **Block ads** — hides ad banners on the page and cancels advertising and
  tracking requests at the network level (toggleable from the popup).
- **GitHub** — on GitHub pages, links that leave github.com open in a new tab
  instead of navigating away (toggleable from the popup).
- **Instagram** — on Instagram, Shift + right-click a post image to open every
  photo of the post in new tabs (toggleable from the popup).
- **Shopify** — on a Shopify store, the popup tells you whether it runs Shopify
  or Shopify Plus (read-only, no config).
- **Chess** — on Chess.com, live-game start/over overlays, user taglines, and
  ratings are hidden so you can focus on the board (toggleable from the popup).
- **Claude** — on Claude.ai, daily and weekly API rate-limit usage is read from
  the /rate_limits and /usage responses and shown in a toolbar badge and the
  popup (toggleable from the popup).
- **Sound** — every tab is listed with a ♪ marker while it is playing audio;
  mute or unmute any individual tab, mute all tabs, or mute all tabs except
  the current one (no config, works in the popup).
- **Current view** — a snapshot of exactly what is visible on screen.
- **Full page** — scrolls through the whole page, stitches the screenshots
  together, and downloads the full-length image.

## Install

Load as an unpacked extension in Chrome/Edge/Firefox from `dist/v3` (or `dist/v2`).
