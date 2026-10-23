# 06 — API Specification

Service boundaries, contracts, and error handling for Omni.

Omni is a local-first desktop application with no network-facing REST API. This document specifies the internal service contracts between Views, ViewModels, Services, and Core.

## View ↔ ViewModel contract

Views bind to `@Published` properties on view models. Views never query Mach, filesystem, IOKit, `NSPasteboard`, or window APIs directly.

| ViewModel | Owns | Exposes |
| --------- | ---- | ------- |
| `MemoryViewModel` | system monitor pipeline (memory, disk, swap, CPU, system, pressure) | `MemoryStats`, `DiskStats`, `SwapStats`, `CPUStats`, `SystemInfo`, pressure level |
| `PortsViewModel` | port discovery and termination | `[PortInfo]`, kill action |
| `ClipboardViewModel` | clipboard history, `ClipboardStore`, monitor | `[ClipboardItem]`, pin/delete/clear |
| `AppsViewModel` | running-apps list (Front tab) | `[RunningAppInfo]`, bring-to-front |
| `IPViewModel` | IP/DNS lookups, connectivity classification | `IPInfo`, `DNSResponse`, Offline/error state |
| `BatteryViewModel` | battery state | `BatteryInfo`, `.unavailable` when unreadable |
| `NetworkViewModel` | throughput and session totals | `NetworkStats`, session totals |
| `WorkspacesViewModel` | saved workspaces (capture, list, restore, delete) | `[Workspace]`, restore result |

## Service → Core contract

All parsing and classification lives in pure Core functions so they are unit-testable without real hardware:

- `BatteryInfoParsing` — folds IOKit `-1`/`-2` time sentinels into `nil`; normalizes temperature units
- `IPInfoParsing` — normalizes ipinfo/ipapi payloads, `detectVPN`, `IPNetworkError`
- `LsofParser` — defensively parses `lsof` tabular output into `[PortInfo]`, skipping headers/malformed rows/connected UDP sockets, deduplicating per (pid, protocol, port, address)
- `CoordinateConverter` — maps normalized ↔ absolute coordinates
- `WorkspaceWindowBuilder` — normalizes window CGRects to `NormalizedRect` per `ScreenInfo` visible frame

## Error handling

Every monitor returns `Result<T, MonitorError>`.

| Error case | Behaviour |
| ---------- | --------- |
| Metric temporarily unreadable | Show `Unable to read`, never `0 GB` |
| Missing/zero battery capacity | Treat as unreadable, show `Battery unavailable` |
| `lsof` malformed rows | Skip; continue with valid rows |
| IP lookup rate-limited | Fall back from `ipinfo.io` to `ipapi.co` |
| Network unreachable | Distinct `Offline` state, not a generic error |
| Accessibility not trusted | Workspaces tab shows Grant banner; restore skipped gracefully |

## IP lookup flow

```text
api.ipify.org  (current IP)
     ↓
ipinfo.io ──fail──→ ipapi.co
     ↓
IPInfoParsing  (normalise + detectVPN + offline classification)
     ↓
IPInfo | DNSResponse
     ↓
IPViewModel
     ↓
IPView
```

`IPViewModel` classifies `URLError`s into an explicit **Offline** state (`notConnectedToInternet`, `cannotConnectToHost`, `cannotFindHost`, `networkConnectionLost`, `timedOut`, `dnsLookupFailed`) versus a generic error message.

## Port discovery flow

```text
lsof -nP -iTCP -sTCP:LISTEN     lsof -nP -iUDP
     ↓                             ↓
LsofParser → [PortInfo]
     ↓
PortsViewModel
     ↓
PortsView
```

`LsofPortDiscoveryService` runs `/usr/sbin/lsof` with explicit arguments via `Process` — never through a shell.

## Clipboard flow

```text
NSPasteboard.general.changeCount
     ↓ (poll every 0.5 s)
changed? ──no──→ wait for next tick
     ↓ yes
getLatestContent()
     ↓
ClipboardStore.add()  →  dedupe / cap / save
     ↓
ClipboardView
```

The system pasteboard remains the source of truth — Omni only observes and never pretends to own the clipboard.

## Supporting files

See `06-api-specification/` for service-contract diagrams and error-state transition diagrams.
