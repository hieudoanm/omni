# Omni — Project Overview

## 1. Project Summary

Omni is a cross-browser WebExtension that redirects new tabs to a home page, blocks distracting sites with an offline focus wall, blocks ads and tracking requests, routes GitHub external links to new tabs, adds an Instagram quick-open gesture (Shift+right-click), detects Shopify stores, hides distractions on Chess.com, tracks Claude.ai API rate-limit usage, lists and controls tab audio (mute individual/all/others), and captures the visible viewport or full page as an image. It ships Manifest V2 and Manifest V3 builds from a single TypeScript source for Chromium and Gecko browsers.

## 2. Problem Statement

Common pain points: opening a new tab leads to a feed, distracting domains pull attention, ads degrade reading, need to save a full-page screenshot, want quick tab audio control, or want small workflow helpers (GitHub external links, Instagram carousel images, Shopify detection, Claude usage visibility, Chess focus). Omni addresses these with one offline-capable popup and minimal permissions.

## 3. Product Vision

Build a disciplined, cross-browser extension that is safe, offline-capable, and type-safe. Prioritise correctness, parity across MV2/MV3, idempotent content scripts, and reproducible packaging over feature count.

## 4. Target Users

- **Focus-oriented user:** wants distraction blocking and home-redirect on new tabs.
- **Power browser user:** needs full-page capture and audio/tab utilities.
- **Developer/maintainer:** values MV2/MV3 parity, typed messaging, tests, and clean build.

## 5. Product Goals

1. **Focus-first:** new-tab redirect (toggleable) and distraction block wall (toggleable).
2. **Privacy:** block ads/tracking requests and hide selected DOM ads (toggleable), offline-first.
3. **Capture:** viewport and full-page screenshots with chunk stitching and download.
4. **Utilities:** GitHub external links (new tab), Instagram Shift+right-click to open carousel images, Shopify detection, Chess.com distraction hiding, Claude.ai usage tracking, Sound tab with mute controls, Back to Top.
5. **Cross-browser:** MV2 + MV3 from single source, Chromium + Gecko.

## 6. Non-Goals

- Telemetry or remote data collection.
- Syncing sensitive user data to cloud.
- Arbitrary page modification beyond documented scope.
- Safari/WebKit distribution (not currently published).
- Heavy UI frameworks (vanilla/standard DOM in popup).

## 7. Key Features

See README for complete feature list. Core: New Tab redirect, Block, Block ads, GitHub, Instagram, Shopify, Chess, Claude, Sound, Current view, Full page.

## 8. Primary User Workflow

1. Install (unpacked from dist/v3 or dist/v2).
2. Click popup to toggle features (redirect, block, ads, GitHub, Insta, Chess, Claude).
3. Open new tab → redirected to home.
4. Visit blocked domain → focus wall.
5. Capture pages via popup buttons.
6. Control audio via Sound tab.
