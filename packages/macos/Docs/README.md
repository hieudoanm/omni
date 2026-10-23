# Omni — Product Specification

Product strategy · Functional requirements · Architecture · Data model · Delivery roadmap

> This document is the product-strategy source. The normative implementation set is [`00`–`12`](#normative-documents). Where this document and the numbered documents disagree on implementation detail, the numbered documents govern.

## Normative documents

| #   | Document                                                 | Governs                                                      |
| --- | -------------------------------------------------------- | ------------------------------------------------------------ |
| 00  | [`00-overview.md`](00-overview.md)                       | Product vision and scope                                     |
| 01  | [`01-requirements.md`](01-requirements.md)               | Functional/non-functional requirements                       |
| 02  | [`02-features.md`](02-features.md)                       | User-visible behaviour                                       |
| 03  | [`03-user-stories.md`](03-user-stories.md)               | User goals and acceptance scenarios                          |
| 04  | [`04-architecture.md`](04-architecture.md)               | Module boundaries, request lifecycle, tenancy                |
| 05  | [`05-data-model.md`](05-data-model.md)                   | Schema, constraints, state transitions                       |
| 06  | [`06-api-specification.md`](06-api-specification.md)     | Service boundaries, contracts, error handling                |
| 07  | [`07-ui-ux-design.md`](07-ui-ux-design.md)               | UI tokens, layout, states, accessibility                     |
| 08  | [`08-tech-stack.md`](08-tech-stack.md)                   | Allowed technologies and dependency policy                   |
| 09  | [`09-testing-strategy.md`](09-testing-strategy.md)       | Test layers, fixtures, acceptance criteria                   |
| 10  | [`10-implementation-plan.md`](10-implementation-plan.md) | Phased delivery plan                                         |
| 11  | [`11-deployment.md`](11-deployment.md)                   | Packaging, notarization, distribution                        |
| 12  | [`12-operations.md`](12-operations.md)                   | Operations: contributing, build, dev commands                |

---

## 1. Product vision

Omni is a lightweight native macOS menu-bar utility for monitoring **RAM usage** and **disk storage usage** at a glance. The primary UI is a compact menu-bar indicator showing current usage. Clicking it opens a popover containing detailed memory and storage information.

Omni answers one question:

> **How much memory and storage am I using right now?**

The first version focuses exclusively on:

- RAM usage
- Disk/storage usage
- Percentage used
- Used / total values
- Compact progress indicators
- Menu-bar presentation
- Lightweight resource consumption

The application should feel like a **small, native macOS utility**, not a web application.

## Product principles

**Native first** — SwiftUI, AppKit, SF Symbols, system colours, native controls. Never Tauri, Electron, React, or WebView.

**Minimal** — Every UI element must have a purpose.

**Fast** — Opening the popover should feel instantaneous.

**Quiet** — Omni should stay out of the user's way.

**Accurate** — Never sacrifice correctness for a visually convenient number. Unknown state says so; never render `0 GB` for a failed read.

**Resource-conscious** — A system monitor that consumes significant resources is self-defeating (~0% idle CPU, <50 MB memory).

### The product promise

A tiny, beautiful system resource meter that you forget is running until you need it.

## 2. Target users

| Persona      | Primary need                    | Desired outcome                      |
| ------------ | ------------------------------- | ------------------------------------ |
| End user     | Know RAM and disk usage at a glance | Instant, native menu-bar visibility  |
| Power user   | Monitor ports, clipboard, apps, IP, network, battery, workspaces | Full system oversight from one utility |

Primary persona: a macOS user who wants a lightweight, native menu-bar meter for memory and storage, with optional deeper system monitoring tabs.

## 3. Scope and priorities

- **P0** — Core platform: necessary for the first usable release (RAM, disk, menu-bar indicator, popover).
- **P1** — Enhancement: important for a complete experience (ports, clipboard, front/apps, IP, network, battery, workspaces, dashboard window).

The first release should deliver RAM and disk monitoring extremely well rather than an incomplete version of every feature.

## 4. Functional requirements

See [`01-requirements.md`](01-requirements.md) for the complete specification.

### P0 — Core platform

Memory usage (used/total, percentage), disk usage (used/total, percentage), menu-bar indicator, popover with details.

### P1 — Enhancement

Swap, CPU, system info, battery, network throughput, port discovery, clipboard history, running apps, workspaces, IP inspector, dashboard window.

## 5. User journeys

See [`03-user-stories.md`](03-user-stories.md) for the complete user-goal and acceptance-scenario specification.

### Journey A — Check memory and disk at a glance

Goal: know current RAM and disk usage without opening anything.

1. Glance at the menu bar (`RAM 39%   Disk 83%`).
2. Click to open the popover.
3. Read the Memory and Storage sections with progress bars and used/total values.

Success metric: menu-bar percentages are visible and accurate within one second of opening the popover.

### Journey B — Deep-dive into a specific metric

Goal: inspect detailed breakdown for one subsystem.

1. Open the popover.
2. Select the desired tab (Memory, Network, Ports, Battery, etc.).
3. Read the details view (breakdowns, session totals, per-interface rows, etc.).

Success metric: each tab loads instantly and shows its full detail set without navigation delay.

### Journey C — Save and restore a workspace layout

Goal: restore app window positions after a reboot or display switch.

1. Arrange windows as desired.
2. Open the Workspaces tab and save a named workspace.
3. Later, click Restore; missing apps launch and windows return to saved positions.

Success metric: captured windows restore to the correct display and position; Accessibility grant banner appears when permission is missing.

## 6. Application structure

| Section       | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| Memory        | RAM usage, active/wired/compressed breakdown, progress bar       |
| Storage       | Boot volume usage, free/purgeable amounts, progress bar          |
| Swap          | Swap in/out, progress bar                                        |
| CPU           | Aggregate load percentage, load average (1/5/15 min)             |
| System        | Chip, core count, uptime                                         |
| Network       | Download/upload rates, session totals, per-interface traffic     |
| Battery       | Charge level, power source, health, cycle count, temperature     |
| Ports         | Listening TCP/UDP ports, process name/PID, kill actions          |
| Clipboard     | Searchable copy history, pin, delete, clear unpinned             |
| Front (Apps)  | Running apps with window counts, one-click bring-to-front        |
| IP            | Public IP, geolocation, ASN/org, DNS lookup, VPN badge           |
| Workspaces    | Save/restore app layouts, multi-monitor aware                    |
| Settings      | Refresh interval, menu-bar display style, clipboard, launch login|

## 7. Current implementation status

This snapshot reflects the repository state on 2026-10-17.

### Implemented

- RAM and disk monitoring via Mach VM APIs and Foundation URLResourceKeys
- Menu-bar indicator with compact percentages and monospaced digits
- Popover with Memory (default) and Storage sections
- Memory pressure status row, byte formatting, usage thresholds (Normal/Elevated/High)
- Swap, CPU load average, system info (chip/cores/uptime)
- Network throughput and per-interface traffic (Wi-Fi vs Ethernet via IOKit)
- Battery charge, power source, health, cycle count, temperature, adapter wattage
- Port discovery via `lsof` (no shell), searchable list, SIGTERM/SIGKILL actions
- Clipboard history (NSPasteboard changeCount, dedupe, pin, cap, atomic JSON persistence)
- Running apps (Front tab) with window counts, search, bring-to-front
- IP inspector (ipify → ipinfo → ipapi fallback, Cloudflare DoH DNS, VPN badge, Offline state)
- Workspaces (capture, list, restore, delete; Accessibility-gated; multi-monitor aware)
- Dashboard window (NavigationSplitView sidebar, shared view models, per-surface refresh gating)
- Launch at login via `SMAppService`, configurable refresh interval, configurable menu-bar display

### Not yet implemented

- Additional sensors (ambient/CPU temperature)
- Threshold customization
- Open port in browser action
- Project detection for development servers
- Rich-text/image clipboard support
- Snippets with custom names
- Custom DNS record types / IPv6 queries
- Activate by bundle identifier search history/favorites
- Keyboard shortcut to toggle workspaces popover
- Auto-arrange on login/after wake
- Overwrite-in-place ("re-save" edits the current snapshot)
- Window remembers per-section toolbar state
- Option-click menu-bar item to cycle metrics
- Charge history/time-series chart, low-battery and charge-limit notifications
- App Store distribution, Sparkle auto-update

## 8. Non-functional requirements

See [`01-requirements.md`](01-requirements.md) for the complete NFR specification.

### Key targets

- CPU: ~0% when idle; minimal during refresh
- Memory: < 50 MB under normal operation
- Refresh: single coordinated 1-second timer for all system monitors
- No special permissions for basic functionality (no Full Disk Access, root, Screen Recording)
- Accessibility requested only for Workspaces window arrangement
- Light Mode, Dark Mode, increased transparency, Reduce Motion all supported

## 9. Design and UX

See [`07-ui-ux-design.md`](07-ui-ux-design.md) for complete design specifications.

### Design principles

Native first, minimal, fast, quiet, accurate, resource-conscious (inherited from `AGENTS.md` §20).

## 10. Testing strategy

See [`09-testing-strategy.md`](09-testing-strategy.md) for complete testing strategy.

### Test layers

Unit tests for Core models and services (memory, disk, swap, CPU, system, battery, clipboard, workspaces, ports, IP parsing); UI tests for Light Mode, Dark Mode, increased transparency, Reduce Motion.

## 11. Deployment

See [`11-deployment.md`](11-deployment.md) for packaging, notarization, and distribution; [`12-operations.md`](12-operations.md) for build and development commands.

### Options

- Local: `make build`, `make dev`
- Installer: `make dmg` (drag to Applications, eject)
- Notarization: `xcrun notarytool submit` + `xcrun stapler staple`

## 12. Contributing

See [`12-operations.md`](12-operations.md) for contributor guidelines.

### Repository conventions

- Swift: explicit types, flat nesting, self-documenting identifiers, DRY, small files (≤30 lines utilities, ≤200 lines features), explicit errors
- Git hooks: none currently
- Tests: `swift test`
- Documentation: numbered `docs/00`–`12` govern implementation detail

## 13. License

See `LICENSE`.
