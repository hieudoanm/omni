# 10 — Implementation Plan

Phased delivery plan for Omni.

## Phase 1 — Skeleton

macOS menu-bar app with the Omni popover.

- [x] Swift Package Manager project
- [x] Menu-bar item with popover
- [x] Native SwiftUI UI shell
- [x] No Dock icon (accessory app)

## Phase 2 — Memory

Mach-based memory monitoring.

- [x] `host_statistics64` read
- [x] `MemoryStats` model with ratio/percentage
- [x] Memory progress bar
- [x] Byte formatting

## Phase 3 — Storage

Foundation-based disk monitoring.

- [x] Boot volume capacity read
- [x] `DiskStats` model with ratio/percentage
- [x] Storage progress bar
- [x] Byte formatting

## Phase 4 — Combined UI

Both metrics in the menu bar and popover.

- [x] `RAM 39%   Disk 83%` menu-bar indicator
- [x] Memory + Storage sections in popover
- [x] Used / total values
- [x] Memory pressure status row

## Phase 5 — Polish

Fit and finish.

- [x] Spacing and typography review
- [x] Dark Mode / Light Mode verification
- [x] Accessibility audit
- [x] Menu-bar width tuning
- [x] Error-state review

## Phase 6 — Optional Features

Only after the core product is stable.

- [x] Memory pressure detail
- [x] Swap usage
- [x] CPU usage
- [x] CPU load average (1/5/15 min)
- [x] Full RAM breakdown (active / wired / compressed / cached / inactive / free)
- [x] System info (chip / cores / uptime)
- [x] Network monitoring (throughput and per-interface traffic)
- [x] Battery monitoring (charge, health, cycle count, battery temperature)
- [ ] Additional sensors (ambient / CPU temperature)
- [x] Launch at login via `SMAppService`
- [x] Configurable refresh interval (presets shipped in v1)
- [x] Configurable menu-bar display
- [ ] Threshold customization

## Phase 7 — Port Monitoring

Developer view for discovering and managing local listening ports, migrated from the standalone Ports app.

- [x] `PortInfo` / `NetworkEndpoint` models in OmniCore
- [x] `lsof`-based discovery service (`LsofPortDiscoveryService`)
- [x] Defensive `lsof` output parsing (`LsofParser`)
- [x] `ProcessTerminating` protocol and `SignalProcessTerminator` (SIGTERM / SIGKILL)
- [x] `PortsViewModel` sharing the Omni `SettingsStore.refreshInterval`
- [x] Dedicated Ports tab in the popover (search, list, kill action)
- [x] Monitor and Ports as two tabs with Monitor the default (renamed to Memory when the Clipboard tab was added)
- [ ] Open port in browser action
- [ ] Project detection for development servers

## Phase 8 — Clipboard History

Clipboard manager migrated from the standalone Clipper app.

- [x] `ClipboardItem` / `ClipboardStore` models in OmniCore (dedupe, pin, cap, atomic JSON persistence at `Application Support/Clipper/clipboard.json`)
- [x] `ClipboardMonitor` (0.5 s `changeCount` poll) and single access point `PasteboardManager`
- [x] `ClipboardViewModel` sharing monitor state and max-history prefs with Settings
- [x] Dedicated Clipboard tab in the popover (search, copy, pin, delete, clear unpinned)
- [x] Clipboard section in Settings (monitor toggle, max history picker)
- [ ] Rich-text / image clipboard support
- [ ] Snippets with custom names

## Phase 9 — IP Inspector

Public IP inspector migrated from the web IP tool.

- [x] `IPInfo` / `DNSResponse` models in OmniCore
- [x] `IPLookupService` (ipify → ipinfo → ipapi fallback, Cloudflare DNS-over-HTTPS)
- [x] Pure `IPInfoParsing` (normalise both providers, `detectVPN`, offline classification) with unit tests
- [x] Dedicated IP tab in the popover between Clipboard and Memory (geolocation rows, raw JSON, VPN badge, map link, DNS lookup)
- [x] Offline state shown distinctly from generic errors
- [ ] Custom DNS record types / IPv6 queries

## Phase 10 — Running Apps (Front)

Bring any running app's windows to the front, in one click.

- [x] `RunningAppInfo` model and `RunningAppProviding` protocol in OmniCore
- [x] `RunningAppsDiscoveryService` (NSWorkspace list filtered to regular apps, on-screen window counts, sorted by localized name) with unit tests
- [x] Dedicated Front tab in the popover (searchable list, window counts, bring-all-windows-to-front)
- [x] 2-second refresh while the tab is visible
- [ ] Activate by bundle identifier search history / favorites

## Phase 11 — Workspaces

Save the apps and window positions you use, then restore them after a boot, migrated from the standalone Snap app.

- [x] `Workspace` / `WorkspaceWindow` / `NormalizedRect` / `ScreenInfo` models in OmniCore
- [x] `WorkspaceStore` (atomic JSON persistence at `Application Support/Workspaces/workspaces.json`) with unit tests
- [x] Capture via `CoreGraphicsWindowLister` (layer-0 on-screen windows, bundle IDs from `NSRunningApplication`) and `WorkspaceWindowBuilder` (normalize to screen visible frames) with unit tests
- [x] `CoordinateConverter` mapping normalized ↔ absolute coordinates, with unit tests
- [x] Restore that launches missing apps in parallel and arranges windows via the Accessibility (AX) APIs (`WorkspaceRestoreService`, `WindowArranger`)
- [x] Multi-monitor: windows restore to the saved display ID, falling back to the primary display
- [x] Dedicated Workspaces tab (last) with the in-tab Accessibility Grant banner and per-restore summary
- [ ] Keyboard shortcut to toggle workspaces popover
- [ ] Auto-arrange on login / after wake
- [ ] Overwrite-in-place ("re-save" edits the current snapshot)

## Phase 12 — Battery

Full battery monitoring via the IOKit power-source APIs.

- [x] `BatteryInfo` model and pure `BatteryInfoParsing` in OmniCore (folds unknown/unlimited time sentinels into `nil`) with unit tests
- [x] `BatteryMonitor` reading charge, power source, charging, time to empty/full, health condition and adapter wattage
- [x] `AppleSmartBattery` / `PowerManagementController` registry read for cycle count and temperature (deci-kelvin normalised on Intel)
- [x] Dedicated Battery tab (first, alphabetical) with charge bar, overview and detail rows, refreshing while the popover is open
- [x] `Battery unavailable` state on Macs without a readable battery
- [ ] Charge history / time-series chart
- [ ] Low-battery and charge-limit notifications

## Phase 13 — Dashboard Window

A window-based UI for long-lived monitoring, with room to show more at once than the panel can.

- [x] `SurfaceSection` section model (single source of truth for the menu-bar tabs and the window sidebar) with unit tests
- [x] `DashboardView` window: `NavigationSplitView` sidebar + full-size content, reusing every existing section view
- [x] Shared `AppViewModels` container so both surfaces drive the same view models instead of separate instances
- [x] Per-surface refresh gating: `SurfaceVisibilityMonitor` treats the panel or the dashboard window (`Omni.dashboard`) as a live surface
- [x] `⇧⌘D` dashboard, `⇧⌘A` Applications Manager, `⌘,` settings, `⌘R` refresh-all commands; the app still launches with no Dock icon and promotes itself only while a window is open
- [x] One window instead of two: the Applications Manager moved into the dashboard sidebar (`DashboardRoute`, `ApplicationsSidebarGroup`) and the standalone Homebrew window with its nested sidebar was removed
- [x] No tab strip in the window; `ContentLayout.window` + `SectionGrid` lay each section's sub-sections out side by side as cards
- [x] Clipboard keeps its segmented control in the window because it filters one list rather than navigating
- [ ] Window remembers per-section toolbar state (e.g. sort order, search filters)
- [ ] Optional "open window instead of panel" menu-bar click preference

## Phase 14 — Menu Bar Polish

Make a menu-bar glance sufficient on its own.

- [x] Configurable metric set (`MenuBarMetric` / `MenuBarMetrics`): CPU, Memory, Storage, Network, Battery, persisted, deduplicated, never empty
- [x] `MenuBarDisplay` (percentage / GB / ratio) applies to every metric, not only disk
- [x] Threshold tinting in the menu bar (orange ≥ 70%, red ≥ 90%)
- [x] Single shared Settings / Quit footer instead of per-tab duplicates
- [ ] Menu-bar item shows the highest-priority metric when space is tight
- [ ] Option-click the menu-bar item to cycle metrics without opening Settings

## Supporting files

See `10-implementation-plan/` for the Gantt-style phase timeline and phase dependency graph.
