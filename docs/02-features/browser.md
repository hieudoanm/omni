# Browser Features (`packages/extensions/browser`)

Manifest V3 (Chromium) and MV2 (Firefox) browser extension with extensive productivity and content control features.

## New Tab Management
| Feature | Description |
| ------- | ----------- |
| New Tab Redirect | Redirects new tabs/home/private tabs to custom URL |
| Custom Redirect Target | Configure redirect URL from popup (stored in sync storage) |
| Redirect Toggle | Enable/disable redirection |

## Content Blocking & Filtering
| Feature | Description |
| ------- | ----------- |
| Distracting Site Blocker | Blocks facebook, x/twitter, instagram, reddit, tiktok, youtube, netflix, twitch, discord |
| Focus Wall | Replaces blocked pages with focus wall showing better sites and suggestions |
| Ad Blocking | Hides ad banners via MutationObserver, network-level blocking (DNR in MV3, webRequest in MV2) |
| Block Toggle | Enable/disable site blocking globally |

## Site-Specific Enhancements
| Feature | Description |
| ------- | ----------- |
| Chess.com Focus | Hides live-game overlays, usernames/ratings for distraction-free play |
| Claude.ai Usage Tracking | Monitors API rate limits/usage, displays inline indicator, badge percentage, color-coded warnings |
| GitHub External Links | Routes external links to new tabs while keeping in-repo navigation intact |
| Instagram Gesture | Shift+Right-click to open carousel images in new tabs |
| Shopify Detection | Detects Shopify stores, shows badge, provides store info in popup |

## Productivity Tools
| Feature | Description |
| ------- | ----------- |
| Screenshot/Capture | Capture visible viewport or full scrolling page as PNG/JPEG/WebP |
| Copy/Download | Copy screenshots to clipboard or download directly |
| Back to Top Button | Appears on scrollable pages, smooth scroll to top |
| Tab Sound Control | Mute/unmute individual tabs, mute all, mute others except active tab |
| Firefox Audio Detection | Fallback for Firefox's unreliable `tabs.audible` API using media element detection |

## Extension UI
| Feature | Description |
| ------- | ----------- |
| Popup Interface | 11-tab interface (Ads, BackToTop, Block, Chess, Claude, GitHub, Insta, New Tab, Shopify, Snap, Sound) |
| Contextual Tabs | GitHub/Insta/Chess/Claude/Shopify tabs appear only on relevant sites |
| Settings Persistence | Sync storage for toggles and preferences, local storage for runtime data |
| Cross-Browser Support | Works on Chromium (MV3) and Firefox (MV2) |

**Tech Stack:** TypeScript 6, React 19, Tailwind CSS 4, Webpack 5, Manifest V3/V2

## Feature Specifications

Each feature has a detailed spec in [`browser/`](browser/):

| Feature | Spec |
| ------- | ---- |
| New Tab Redirect | [FEATURE-01](browser/FEATURE-01-New-Tab-Redirect.md) |
| Distraction Block Wall | [FEATURE-02](browser/FEATURE-02-Distraction-Block-Wall.md) |
| Ad Blocking | [FEATURE-03](browser/FEATURE-03-Ad-Blocking.md) |
| Capture (View & Full Page) | [FEATURE-04](browser/FEATURE-04-Capture.md) |
| GitHub External Links | [FEATURE-05](browser/FEATURE-05-GitHub-External-Links.md) |
| Instagram Gesture | [FEATURE-06](browser/FEATURE-06-Instagram-Gesture.md) |
| Shopify Detection | [FEATURE-07](browser/FEATURE-07-Shopify-Detection.md) |
| Chess.com Focus | [FEATURE-08](browser/FEATURE-08-Chess-Focus.md) |
| Claude.ai Usage | [FEATURE-09](browser/FEATURE-09-Claude-Usage.md) |
| Sound & Tab Audio Control | [FEATURE-10](browser/FEATURE-10-Sound-Tab-Audio.md) |
| Back to Top | [FEATURE-11](browser/FEATURE-11-Back-to-Top.md) |

Priorities: **P0** = required for usable MVP, **P1** = important enhancement, **P2** = advanced/future.
