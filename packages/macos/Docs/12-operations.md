# 12 — Operations

Contributing, build, and development operations for Omni.

## Getting Started

### Prerequisites

- macOS 13 Ventura or later
- Xcode 15+ (Swift 5.9+)

### Build

```bash
cd packages/macos
make build
make dev
```

No permissions are required to run Omni. The only permission Omni can ever request is **Accessibility**, and only the Workspaces tab's window arrangement needs it; it is never required to build, run, or use the other six tabs.

## Development Commands

| Command | Description |
| ------- | ----------- |
| `make build` | Build the app |
| `make app` | Create .app bundle |
| `make dmg` | Create .dmg installer |
| `make test` | Run unit tests |
| `make dev` | Build and run for development |
| `make clean` | Remove build artifacts |

## Coding Conventions

### Repo-Wide Rules

1. Use explicit types everywhere — never rely on type inference
2. Flat nesting only — no nested classes, structs, or enums
3. Self-documenting identifiers — no comments explaining what code does
4. DRY — abstract repeated logic into shared utilities
5. Small files — target ≤30 lines for utilities, ≤200 lines for features
6. Explicit errors — never use `try!`, handle or propagate errors
7. Consistent imports — order: Foundation, SwiftUI, third-party
8. Pure functions — prefer stateless helpers with no side effects

### Swift Conventions

- `let` over `var` whenever possible
- `guard` for early returns over nested `if`
- `Codable` for all models — use `CodingKeys` when JSON keys differ
- `enum` + associated values for state machines and error types
- `struct` over `class` unless reference semantics are needed
- Monitoring logic returns `Result<T, MonitorError>` — never panics
- Prefer computed properties over methods that take no arguments

### SwiftUI Conventions

- `@State` for local view state
- `@Binding` for child-to-parent communication
- `@StateObject` / `@ObservedObject` for view models
- Use `VStack` / `HStack` for layout — avoid manual frames when possible
- Prefer `Label` over raw `Image` + `Text` combinations

### Monitoring Conventions

- Views never query Mach or filesystem APIs directly
- All calculations live in `Core` so they are unit-testable
- Document the chosen definition of "used" in the service
- Handle unavailable metrics by showing "Unable to read", never `0 GB`
- One coordinated timer for all metrics

### Ports Conventions

- Views never spawn `lsof` directly — go through `PortDiscovering`
- `PortDiscovering` / `ProcessTerminating` protocols keep discovery and termination mockable and UI-independent
- Never build shell strings from process metadata; use `Process` with explicit executable URLs and arguments
- Never auto-kill a process; destructive actions require explicit user action
- Keep all parsing in `LsofParser` so it stays unit-testable

### Clipboard Conventions

- Views never touch `NSPasteboard` directly — go through `PasteboardManager`
- Keep all history logic in `ClipboardStore` (dedupe, pin, cap, save) so it stays unit-testable
- The system pasteboard is the source of truth; never clear or overwrite it except for an explicit user "copy" action
- Persist atomically to `Application Support/Clipper/clipboard.json`
- Never skip the `maxItems` cap — history must stay bounded

### Workspaces Conventions

- Views never touch window APIs directly — go through `WorkspaceCapturing`, `WorkspaceRestoring`, and `WindowListing`
- Keep coordinate math in Core (`CoordinateConverter`, `WorkspaceWindowBuilder`, `NormalizedRect`) so it stays unit-testable
- Always restore to the saved display ID with a fallback to the primary display when the saved display is gone; never fail a restore because a monitor moved
- Launch missing apps in parallel per bundle identifier; never re-signal or re-launch an app that is already running
- Only touch Accessibility APIs through `AccessibilityManager`, and only for window arrangement; gate every restore on `AXIsProcessTrusted()`
- Persist atomically to `Application Support/Workspaces/workspaces.json`
- Restoration must never be destructive: no quitting apps, no killing PIDs, no resizing windows beyond their saved bounds

### IP Conventions

- Views never build HTTP requests directly — go through `IPLookupServicing`
- Keep all parsing and classification in `IPInfoParsing` (normalise ipinfo / ipapi payloads, `detectVPN`, `IPNetworkError`) so it stays unit-testable
- Prefer `ipinfo.io` and fall back to `ipapi.co`; never fail the tab when one provider rate-limits
- Distinguish an explicit Offline state from generic errors — never show a misleading value when the lookup fails

### Battery Conventions

- Views never touch IOKit directly — go through `BatteryMonitor`
- Keep all parsing in `BatteryInfoParsing` (fold IOKit's `-1`/`-2` time sentinels into `nil`) so it stays unit-testable
- Normalise battery temperature to one unit (celsius) before parsing; Intel's `AppleSmartBattery` reports deci-kelvin, Apple Silicon reports deci-celsius
- Treat a missing/zero capacity as unreadable rather than showing `0%`
- Show a distinct `Battery unavailable` state, never a blank or zero battery

## Before You Push

1. `make build` — clean compile
2. `make test` — all tests pass
3. `make dev` — smoke test the app
4. Menu-bar icon shows memory and disk percentages
5. Popover shows all eight tabs with Memory the default
6. Memory tab shows both progress bars with used/total values
7. Clipboard tab captures, searches, and copies history; pin and delete work
8. Front tab lists running apps (Windows count) and bringing an app to the front works
9. IP tab shows the current IP, geolocation, and DNS lookup; Offline and error states render distinctly
10. Network tab shows live download/upload rates, session totals, and per-interface rows with Wi-Fi/Ethernet classification
11. Battery tab shows charge, power source, and health rows; `Battery unavailable` renders on Macs without a battery
12. Ports view lists listening ports and kill actions work
13. Workspaces tab saves a workspace, the Grant banner appears without Accessibility, restore launches missing apps and places windows once granted
14. Verify both Light Mode and Dark Mode

## Documentation

Numbered `docs/00`–`12` govern implementation detail. Where this document and the numbered documents disagree on implementation detail, the numbered documents govern.

## Supporting files

See `12-operations/` for the Makefile reference and build script templates.
