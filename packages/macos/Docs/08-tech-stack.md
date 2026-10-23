# 08 — Tech Stack

Allowed technologies and dependency policy for Omni.

## Platform

- macOS only
- Native Apple Silicon support
- Intel support optional
- Minimum macOS: 13 Ventura

## UI Technology

Use:

- Swift 5.9+
- SwiftUI
- AppKit where necessary for macOS menu-bar integration

Do **not** use:

- Tauri
- Electron
- React
- WebView
- JavaScript
- Node.js runtime

Omni should have minimal runtime overhead.

## Tech Stack

| Layer | Technology | Responsibility |
| ----- | ---------- | -------------- |
| Language | Swift 5.9+ | Application logic |
| UI | SwiftUI | Views and view models |
| Memory API | Mach VM (`host_statistics64`) | Memory statistics |
| Disk API | Foundation `URLResourceValue` | Disk capacity |
| Port discovery | `lsof` via `Process` | Listening TCP/UDP ports |
| Clipboard | `NSPasteboard` changeCount | Clipboard history |
| Network | `getifaddrs` + IOKit | Per-interface throughput |
| Battery | IOKit power sources + smart battery registry | Charge, health, cycle count |
| IP / DNS | `URLSession` public APIs | Public IP, geolocation, DNS |
| Front | `NSWorkspace` + `CGWindowListCopyWindowInfo` | Running apps, window counts |
| Windows | CoreGraphics (capture) + Accessibility AX (arrange) | Workspace capture/restore |
| Persistence | Codable + JSON + FileManager | Clipboard, workspaces, settings |
| Build | Swift Package Manager | Dependency management and build |

## Allowed frameworks

Primary frameworks:

- SwiftUI
- AppKit
- Foundation
- Darwin
- ServiceManagement (`SMAppService` for launch at login)

Only use additional dependencies when there is a clear benefit. Do not introduce a new package manager unless necessary.

## Build & development

Before implementing features, inspect the existing repository and follow its existing Swift version, Xcode version, project structure, build configuration, signing configuration, and bundle identifier.

Do not introduce Tauri, Electron, React, or WebViews. Keep monitoring logic separate from UI. Add tests for calculations and formatting.

## Dependency policy

- Prefer Apple's built-in frameworks.
- No third-party runtime dependencies.
- Swift Package Manager only.

## Supporting files

See `08-tech-stack/` for the dependency graph and framework allowlist.
