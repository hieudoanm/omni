# 09 — Testing Strategy

Test layers, fixtures, and acceptance criteria for Omni.

## Test layers

Unit (Core models and services), UI (Light Mode, Dark Mode, increased transparency, Reduce Motion), Build (`swift build`), Smoke (`make dev`).

## Unit tests

Test the monitoring logic independently from SwiftUI.

### Memory

- total memory
- used memory
- ratio calculation
- percentage calculation
- zero/invalid values
- formatting

### Disk

- total capacity
- available capacity
- used capacity
- percentage calculation
- formatting
- unavailable filesystem information

### Clipboard

- dedupe on repeated copies
- pin/delete/clear-unpinned
- maxItems cap enforcement
- atomic JSON persistence

### Workspaces

- capture → normalize → save round-trip
- restore launches missing apps and arranges windows
- multi-monitor: saved display ID with fallback to primary
- `CoordinateConverter` normalized ↔ absolute mapping

### Ports

- `LsofParser` skips headers, malformed rows, connected UDP sockets
- deduplication per (pid, protocol, port, address)
- `SignalProcessTerminator` refuses invalid PIDs and the app itself

### IP

- `IPInfoParsing` normalizes ipinfo/ipapi payloads
- `detectVPN` heuristic on cloud orgs
- `URLError` classification into Offline vs generic error

### Battery

- `BatteryInfoParsing` folds `-1`/`-2` time sentinels into `nil`
- temperature normalization (deci-kelvin → deci-celsius on Intel)
- missing/zero capacity treated as unreadable

## UI tests

- progress bar reaches 0%
- progress bar reaches 100%
- large formatted values
- dark mode
- light mode
- long formatted values
- menu-bar width stability (monospaced digits)
- error-state rendering (`Unable to read`, never `0 GB`)

## Acceptance criteria

Before you push:

1. `make build` — clean compile
2. `make test` — all tests pass
3. `make dev` — smoke test the app
4. Menu-bar icon shows memory and disk percentages
5. Popover shows all eight tabs with Memory the default
6. Memory tab shows both progress bars with used/total values
7. Clipboard tab captures, searches, and copies history; pin and delete work
8. Front tab lists running apps (window count) and bringing an app to the front works
9. IP tab shows the current IP, geolocation, and DNS lookup; Offline and error states render distinctly
10. Network tab shows live download/upload rates, session totals, and per-interface rows with Wi-Fi/Ethernet classification
11. Battery tab shows charge, power source, and health rows; `Battery unavailable` renders on Macs without a battery
12. Ports view lists listening ports and kill actions work
13. Workspaces tab saves a workspace, the Grant banner appears without Accessibility, restore launches missing apps and places windows once granted
14. Verify both Light Mode and Dark Mode

## Tools

- `swift test` — unit tests
- `swift build` — compile check
- `make dev` — smoke test

## Supporting files

See `09-testing-strategy/` for the test matrix and CI configuration.
