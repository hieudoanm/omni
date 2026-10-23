# macOS Features (`packages/desktop/macos`)

A native menu-bar utility and dashboard app. The menu-bar popover covers eight tabs (Battery, Clipboard, Front, IP, Memory, Network, Ports, Workspaces); `⇧⌘D` opens a resizable dashboard window that shares the same view models. Memory is the default tab.

## Menu Bar

- Compact indicator: `RAM 39%   Disk 83%` — configurable metric set (CPU, Memory, Storage, Network, Battery) and display style (Percentages / Values / Used-Total), persisted in Settings.
- SF Symbols instead of emoji; monospaced digits keep the item width stable.
- Click opens a native popover; threshold tinting (orange ≥ 70%, red ≥ 90%).
- Single shared Settings / Quit footer.

## Memory

- Used / total (`12.4 / 32 GB`) via Mach `host_statistics64`; defined metric: active + wired + compressed.
- Breakdown: active / wired / compressed; availability: cached / inactive / free.
- Memory pressure from the kernel (`Normal` / `Warning` / `Critical`).
- Progress bar tinted by usage threshold.

## Storage

- Used / total (`412 / 494 GB`) via Foundation `URLResourceValue` keys; free and purgeable amounts.
- Boot volume (`/`) only.
- Progress bar tinted by usage threshold.

## CPU & System

- Aggregate load percentage (delta of per-CPU tick counters) and load average 1/5/15 min.
- Swap used / total (only when configured).
- Footer: chip (`hw.model`), core count, uptime.

## Battery

- Charge level, status (`Charging` / `On battery` / `Fully charged`), power source.
- Time remaining / time to full, capacity, cycle count, temperature, health, adapter wattage (IOKit power sources + `AppleSmartBattery`).
- Distinct **Battery unavailable** state on Macs without a readable battery.

## Network

- Live download / upload rates and session totals (`getifaddrs` deltas, 32-bit wrap handled).
- Per-interface rows with Wi-Fi vs Ethernet classification via IOKit.

## Ports

- Listening TCP / bound UDP ports via `/usr/sbin/lsof` (explicit args, never a shell).
- Search by port, process, PID, command, path; SIGTERM kill / SIGKILL force-kill with confirmation; refuses invalid PIDs and the app itself.

## Clipboard

- Automatic history via `NSPasteboard.changeCount` polling; search, copy again, pin, delete, clear unpinned; dedupe with copy count.
- Configurable max history (default 500); stored locally at `~/Library/Application Support/Clipper/clipboard.json`.

## IP

- Public IP via `api.ipify.org`, enriched by `ipinfo.io` with `ipapi.co` fallback; ASN, org, geolocation, VPN/shared-hosting badge, OpenStreetMap link.
- A-record DNS lookup via Cloudflare DNS-over-HTTPS; raw JSON view; distinct **Offline** state.

## Front (Running Apps)

- Regular running apps (Omni excluded) with on-screen window counts; search by name or bundle ID; one-click bring-all-windows-to-front via `NSRunningApplication`.

## Workspaces

- Save on-screen window layouts per display; restore launches missing apps in parallel and places windows via Accessibility (AX) APIs; multi-monitor with primary-display fallback.
- Stored at `~/Library/Application Support/Workspaces/workspaces.json`; Accessibility permission gated with an in-tab Grant banner.

## Dashboard & Navigation

- `NavigationSplitView` sidebar with alphabetical groups and one shared `SearchField`; `ContentLayout` switches panel vs window presentation.
- Applications Manager (installed apps + Homebrew packages) as a dashboard route; global refresh `⌘R`; settings `⌘,`; launch at login via `SMAppService`.

## Design & UX

- Design system in `Omni/Views/Shared/DesignSystem/` — spacing, radius, palette, typography, motion, surface metrics; `DesignSystemTests` fails the build on raw literals.
- Semantic system colours only; Light/Dark Mode, increased transparency, Reduce Motion.
- Accessibility: labels on icon-only controls, combined VoiceOver labels, `Unable to read` error states (never `0 GB`).
- Snapshot tests via `ImageRenderer` + `assertSnapshot`.

**Tech Stack:** Swift, SwiftUI, Xcode project (`OmniCore` framework + `Omni` app targets via xcodegen), Swift Testing, `swiftformat`; no third-party runtime dependencies.

See also: [macOS — UI/UX Design](../07-ui-ux-design/macos.md) · [macOS — Architecture](../04-architecture/macos.md) · [macOS — Operations](../12-operations/macos.md)
