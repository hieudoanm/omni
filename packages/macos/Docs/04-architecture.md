# 04 — Architecture

Module boundaries, request lifecycle, and tenancy for Omni.

## Directory Structure

Code is organized by tab, with a `OmniCore` target holding everything unit-testable (models + protocol-driven services) and the `Omni` target holding system-facing services, ViewModels, and SwiftUI views.

```text
Sources/
├── App/                       ViewModels (one per tab)
│   ├── Battery/
│   │   └── BatteryViewModel.swift
│   ├── Clipboard/
│   │   └── ClipboardViewModel.swift
│   ├── Front/
│   │   └── AppsViewModel.swift
│   ├── IP/
│   │   └── IPViewModel.swift
│   ├── Memory/
│   │   └── MemoryViewModel.swift
│   ├── Network/
│   │   └── NetworkViewModel.swift
│   ├── Ports/
│   │   └── PortsViewModel.swift
│   ├── Workspaces/
│   │   └── WorkspacesViewModel.swift
│   └── Shared/
│       ├── OmniApp.swift
│       ├── LaunchAtLogin.swift
│       ├── MenuBarIcon.swift
│       └── MenuBarPanelPositioner.swift
├── Core/                      OmniCore target (public, unit-tested)
│   ├── Models/
│   │   ├── Battery/    BatteryInfo
│   │   ├── Clipboard/  ClipboardItem, ClipboardStore
│   │   ├── Front/      RunningAppInfo
│   │   ├── IP/         IPInfo, DNSResponse
│   │   ├── Memory/     MemoryStats, DiskStats, SwapStats, CPUStats, SystemInfo
│   │   ├── Network/    NetworkStats, NetworkSnapshots
│   │   ├── Ports/      PortInfo, NetworkEndpoint
│   │   ├── Workspaces/ Workspace, WorkspaceWindow, NormalizedRect, ScreenInfo
│   │   └── Shared/     MenuBarDisplay, UsageThreshold
│   ├── Services/
│   │   ├── Battery/    BatteryInfoParsing
│   │   ├── Clipboard/  (store lives in Models)
│   │   ├── Front/      RunningAppProviding, RunningAppsDiscoveryService
│   │   ├── IP/         IPLookupServicing, IPInfoParsing
│   │   ├── Network/    NetworkInterfaceClassifying
│   │   ├── Ports/      PortDiscovering, LsofPortDiscoveryService, LsofParser,
│   │   │               ProcessTerminating, SignalProcessTerminator
│   │   └── Workspaces/ CoordinateConverter, WindowListing, WorkspaceStoring,
│   │                   WorkspaceStore, WorkspaceCapturing, WorkspaceRestoring,
│   │                   WorkspaceWindowBuilder
│   ├── ByteFormatter.swift    (shared)
│   └── SettingsStore.swift    (shared)
├── Services/                  System-facing services (Omni target)
│   ├── Battery/    BatteryMonitor
│   ├── Clipboard/  ClipboardMonitor, PasteboardManager
│   ├── IP/         IPLookupService
│   ├── Memory/     MemoryMonitor, DiskMonitor, SwapMonitor, CPUMonitor,
│   │               SystemInfoMonitor, MemoryPressureMonitor
│   ├── Network/    NetworkMonitor, IOKitNetworkInterfaceClassifier
│   ├── Workspaces/ AccessibilityManager, CoreGraphicsWindowLister,
│   │               ScreenManager, ApplicationLauncher, WindowArranger,
│   │               WorkspaceCaptureService, WorkspaceRestoreService
│   └── Shared/     MonitorError
└── Views/
    ├── Battery/    BatteryView
    ├── Clipboard/  ClipboardView
    ├── Front/      AppsView, AppsListView, AppRow
    ├── IP/         IPView
    ├── Memory/     SmallView, DetailsView, CPUView, DiskView, SwapView,
    │               SystemInfoView
    ├── Network/    NetworkView
    ├── Ports/      PortsView, PortListView, PortRow
    ├── Workspaces/ WorkspacesView, WorkspaceRow
    └── Shared/     MenuBarView, DashboardView, ResourceMeter, SettingsView,
                    SurfaceLayout, UnavailableView, UsageThresholdColor,
                    WindowIdentifierTag
```

Tests mirror this layout under `Tests/Core/…`, one suite per tab, so parsing, math, and store logic are verified independently of SwiftUI.

## Application Layers

```text
┌────────────────────────────────────────┐
│         Menu Bar · Dashboard           │
│        CPU 39%   Disk 83%              │
├────────────────────────────────────────┤
│                Views                   │
│  MenuBarView | DashboardView |         │
│  SmallView | DetailsView               │
│  BatteryView | ClipboardView |         │
│  AppsView | IPView                     │
│  NetworkView | PortsView |             │
│  WorkspacesView | ResourceMeter |      │
│  SettingsView | UnavailableView        │
├────────────────────────────────────────┤
│             ViewModels                 │
│  MemoryViewModel | PortsViewModel      │
│  BatteryViewModel | ClipboardViewModel │
│  AppsViewModel | NetworkViewModel |    │
│  IPViewModel | WorkspacesViewModel     │
├────────────────────────────────────────┤
│              Services                  │
│  MemoryMonitor | DiskMonitor |         │
│  SwapMonitor | CPUMonitor |            │
│  SystemInfoMonitor |                   │
│  LsofPortDiscoveryService |            │
│  BatteryMonitor |                      │
│  ClipboardMonitor | PasteboardManager  │
│  NetworkMonitor | IPLookupService |    │
│  IOKitClassifier | RunningAppsDisc.    │
│  WorkspaceCapture/ RestoreService |    │
│  AccessibilityManager | CGWindowLister │
│  ScreenManager | ApplicationLauncher   │
│  WindowArranger                        │
├────────────────────────────────────────┤
│                 Core                   │
│  MemoryStats | DiskStats | SwapStats   │
│  CPUStats | SystemInfo | PortInfo      │
│  BatteryInfo | BatteryInfoParsing |    │
│  NetworkEndpoint | LsofParser |        │
│  SignalTerminator | ClipboardItem      │
│  ClipboardStore | NetworkStats |       │
│  IPInfo | DNSResponse | RunningAppInfo │
│  IPInfoParsing | IPNetworkError        │
│  SystemInfo | ByteFormatter |          │
│  Threshold | SettingsStore |           │
│  Workspace | WorkspaceWindow |         │
│  NormalizedRect | ScreenInfo |         │
│  WorkspaceStore | CoordinateConverter  │
└────────────────────────────────────────┘
```

## Layering rules

- Views never query Mach or filesystem APIs directly — they go through ViewModels → Services → Core.
- All calculations live in `Core` so they are unit-testable.
- Monitoring logic returns `Result<T, MonitorError>` — never panics.
- Discovery and termination are protocol-based (`PortDiscovering`, `ProcessTerminating`, `WorkspaceCapturing`, `WorkspaceRestoring`, `WindowListing`, `IPLookupServicing`, `RunningAppProviding`) so unit tests can substitute mocks.
- Views never touch `NSPasteboard` directly — go through `PasteboardManager`.
- Views never touch window APIs directly — go through `WorkspaceCapturing`, `WorkspaceRestoring`, `WindowListing`.
- Views never build HTTP requests directly — go through `IPLookupServicing`.
- Views never touch IOKit directly — go through `BatteryMonitor`.

## Supporting files

See `04-architecture/` for layering diagrams and the directory-structure mmd source.
