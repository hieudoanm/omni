# 02 — Features

User-visible behaviour of Omni.

## Menu Bar

- Compact indicator: `RAM 39%   Disk 83%`
- SF Symbols instead of emoji; monospaced digits keep the item width stable
- Click opens a native popover with details
- Configurable display style (Settings → Menu Bar):
  - Percentages: `RAM 39%   Disk 83%`
  - Values: `RAM 12.4 GB   Disk 412 GB`
  - Used / Total: `RAM 12.4/32 GB   Disk 412/494 GB`

## Memory

- Used / total (`12.4 / 32 GB`)
- Breakdown: active / wired / compressed
- Availability: cached / inactive / free
- Percentage (`39% used`)
- Progress bar tinted by usage threshold
- Defined metric: active + wired + compressed

## Storage

- Used / total (`412 / 494 GB`)
- Free and purgeable amounts
- Percentage (`83% used`)
- Progress bar tinted by usage threshold
- Boot volume (`/`) in v1

## CPU

- Aggregate load percentage
- Load average (`Load 2.1 · 1.8 · 1.5`)
- Progress bar tinted by usage threshold
- Delta of per-CPU tick counters between reads; load average from `getloadavg`

## System

- Hardware chip (e.g. `Mac14,7`)
- Core count
- Uptime
- Single footer line: `Mac14,7 · 8 cores · Up 2d 1h`

## Swap

- Used / total swap
- Progress bar tinted by usage threshold
- Shown only when swap is configured

## Battery

- Charge level as a large percentage with a progress bar and charge-tinted SF Symbol
- Status (`Charging` / `On battery` / `Fully charged`) and power source
- Time remaining (discharging) or time to full charge (charging)
- Capacity (`current / max mAh`), cycle count, temperature, health condition
- Connected adapter wattage
- Distinct **Battery unavailable** state on Macs without a readable battery
- Dedicated Battery tab, refreshing while the popover is open

## Network

- Live download / upload rates (`↓` / `↑`)
- Total received / sent this session (loopback excluded)
- Per-interface rows: name, kind, status and its own ↓ / ↑ rates
- Interface status: `Connected` (link up + address), `Link up`, or `Down`
- Wi-Fi vs Ethernet detection via IOKit interface classification
- Rates derived from `getifaddrs` byte-counter deltas, 32-bit wrap handled
- Separate Network tab sharing the refresh interval configured in Settings

## Ports

- Lists processes listening on local TCP ports and bound UDP sockets
- Port, protocol, process name and PID per row
- Search by port, process name, PID, command, path or directory
- Right-click context menu: copy address / port / PID, kill or force kill
- Kill sends SIGTERM; force kill sends SIGKILL (with confirmation dialog)
- Runs `/usr/sbin/lsof` with explicit arguments — no shell involved
- Separate Ports tab sharing the refresh interval configured in Settings

## Clipboard

- Automatic history of everything you copy (`NSPasteboard` change detection)
- Search by content (case-insensitive)
- Copy again, pin to keep on top, or delete any item
- Repeated copies dedupe and move to the front with a copy count
- `Clear Unpinned` to wipe history in one click
- Pause monitoring any time from Settings
- Configurable max history size (100 / 500 / 1,000 / 5,000, default 500)
- Stored locally at `~/Library/Application Support/Clipper/clipboard.json` — nothing leaves your machine

## IP

- Current public IP via `api.ipify.org`, enriched by `ipinfo.io` with automatic `ipapi.co` fallback
- IP / version, ASN, organization, timezone, country, region, city, postal and coordinates, plus a `View on map` link to OpenStreetMap
- `VPN / shared hosting` badge for Cloudflare / Amazon / Google / DigitalOcean / Microsoft orgs
- A-record DNS lookup through Cloudflare DNS-over-HTTPS (`application/dns-json`)
- Raw JSON visible for both the IP info and the DNS response
- Distinct **Offline** state when the network is unreachable, and an error state when a lookup fails
- Dedicated IP tab between Clipboard and Memory; fetches on tab open and on Refresh

## Front (Running Apps)

- Lists the regular running applications (Omni itself excluded), sorted by localized name
- Per-app on-screen window count
- Search by app name or bundle identifier
- One-click _Bring to Front_ activates all of an app's windows
- Refreshes every 2 seconds while the tab is visible; no permission required

## Workspaces

- Save the current layout — every on-screen app and its window positions — as a named workspace
- Restore it later with one click: missing apps are launched automatically and each app's windows are placed back to their saved positions (matching by saved title, falling back to the first window)
- Multi-monitor aware: windows restore to the saved display, falling back to the primary display if the saved one is gone
- Workspaces are stored locally at `~/Library/Application Support/Workspaces/workspaces.json` — nothing leaves your machine
- Menu-bar only (no global shortcuts)
- Arranging windows requires **Accessibility** permission; the tab shows a Grant banner and a restore summary (windows placed / apps launched) when permission is missing or a restore fails

## Popover

- Eight tabs: Battery, Clipboard, Front, IP, Memory (default), Network, Ports, Workspaces
- Memory section (details) with active / wired / compressed and cached / inactive / free breakdowns
- Storage section (details) with free / purgeable amounts
- CPU section (details) with load average
- Swap section (details)
- System footer (details) with chip / cores / uptime
- Memory pressure status (details), read from the kernel: `Normal` / `Warning` / `Critical`

## Settings

- Refresh interval presets (1/2/5/10 seconds)
- Menu Bar display style (Percentages / Values / Used-Total)
- Clipboard: monitor on/off, max history size, saved items count
- Launch at Login via `SMAppService`
- No special permissions required for the monitor/clipboard/network tabs; Accessibility is requested only when you first restore a workspace

## UX

- Values refresh every second by default
- Automatic color coding only at meaningful thresholds
- Light and Dark Mode friendly via semantic colors (no hard-coded colors)
- Accessible labels on all controls
- Every section exposes a combined VoiceOver label (e.g. `Memory, 39% used, 12.4 GB of 32 GB`)
- Menu-bar item is a single accessibility element that announces `39% RAM, 83% disk` and updates frequently
- Error states render a distinct `Unable to read` row with a warning icon instead of blank or zero values
- Menu-bar label uses monospaced digits and a fixed size so the indicator width stays stable

## Requirements

- macOS 13 Ventura

## Supporting files

See `02-features/` for the feature-versus-tab matrix and tab flow diagrams.
