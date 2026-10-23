# AGENTS.md

# Omni

Omni is a lightweight native macOS menu-bar utility for monitoring **RAM usage** and **disk storage usage** at a glance.

The primary UI is a compact menu-bar indicator showing current usage. Clicking it opens a popover containing detailed memory and storage information.

The application should feel like a **small, native macOS utility**, not a web application.

---

## 1. Product Goal

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

Do not add unrelated system monitoring features until the core experience is polished.

---

## 2. Platform

### Target

- macOS only
- Native Apple Silicon support
- Intel support is optional unless project requirements specify otherwise

### UI Technology

Use:

- Swift
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

---

## 3. Architecture

Prefer a small, clearly separated architecture:

```text
Omni/
├── App/
│   ├── OmniApp.swift
│   └── AppDelegate.swift
│
├── Models/
│   ├── MemoryStats.swift
│   └── DiskStats.swift
│
├── Services/
│   ├── MemoryMonitor.swift
│   └── DiskMonitor.swift
│
├── Views/
│   ├── MenuBarView.swift
│   ├── OmniPopover.swift
│   ├── ResourceMeter.swift
│   ├── MemoryView.swift
│   └── DiskView.swift
│
├── Utilities/
│   ├── ByteFormatter.swift
│   └── AppConstants.swift
│
└── Resources/
```

The exact directory structure can evolve, but maintain the following separation:

```text
System APIs
     ↓
Monitoring Services
     ↓
Observable State / Models
     ↓
SwiftUI Views
     ↓
Menu Bar / Popover
```

Views should not directly query Mach or filesystem APIs.

---

# 4. Core Features

## 4.1 Memory Usage

Omni must display:

```text
Used / Total
Percentage
```

Example:

```text
12.4 / 32 GB
39%
```

The memory monitor should use native macOS APIs.

Prefer Mach VM APIs such as:

```swift
host_statistics64()
```

and related VM statistics.

Do not shell out to:

```text
top
vm_stat
memory_pressure
```

for the primary implementation.

The monitor should expose a model similar to:

```swift
struct MemoryStats {
    let usedBytes: UInt64
    let totalBytes: UInt64

    var usageRatio: Double
    var usagePercentage: Double
}
```

### Memory calculation

Be explicit about what "used" means.

The implementation should document the chosen definition of memory usage and remain consistent across releases.

Avoid presenting a misleading number simply because it is easy to calculate.

If additional metrics are available, they may later include:

- active
- wired
- compressed
- cached
- swap
- memory pressure

These are secondary features.

---

# 5. Disk Usage

The initial version monitors the boot/system filesystem:

```text
/
```

Display:

```text
Used / Total
Percentage
```

Example:

```text
412 / 494 GB
83%
```

Use native Foundation APIs such as:

```swift
URLResourceKey.volumeTotalCapacityKey
URLResourceKey.volumeAvailableCapacityForImportantUsageKey
```

or an equivalent native filesystem API.

Do not invoke shell commands such as:

```text
df
du
diskutil
```

from the application.

The disk monitor should expose something similar to:

```swift
struct DiskStats {
    let usedBytes: UInt64
    let totalBytes: UInt64

    var usageRatio: Double
    var usagePercentage: Double
}
```

---

# 6. Menu Bar UI

The menu-bar display must be compact.

Preferred initial design:

```text
RAM 39%   Disk 83%
```

Alternative configurations can later display:

```text
RAM 12.4 GB   Disk 412 GB
```

or:

```text
RAM 12.4/32 GB   Disk 412/494 GB
```

Do not make the menu-bar item excessively wide.

Users should be able to understand system usage without opening the popover.

---

# 7. Popover UI

Clicking the menu-bar item opens a compact native popover.

Example:

```text
┌──────────────────────────────┐
│ Memory                       │
│ █████████░░░░░░  12.4 / 32 GB│
│ 39% used                     │
│                              │
│ Storage                      │
│ █████████████░░  412 / 494 GB│
│ 83% used                     │
│                              │
│ Memory Pressure      Normal  │
└──────────────────────────────┘
```

The first release should keep this UI intentionally small.

Avoid:

- large dashboards
- charts
- unnecessary animations
- excessive configuration
- complicated navigation

---

# 8. Resource Meter

Create a reusable SwiftUI component:

```swift
ResourceMeter
```

It should accept:

```swift
label
usedBytes
totalBytes
percentage
```

and render:

```text
Label
Progress Bar
Used / Total
Percentage
```

Example:

```swift
ResourceMeter(
    title: "Memory",
    usedBytes: memory.usedBytes,
    totalBytes: memory.totalBytes
)
```

The component should be reusable for:

- Memory
- Storage
- Future CPU/GPU/etc.

---

# 9. Update Frequency

The default refresh interval should be approximately:

```text
1 second
```

Do not update more frequently unless there is a demonstrated UX requirement.

Monitoring should have negligible CPU overhead.

Prefer a single coordinated refresh mechanism rather than independent timers for every metric.

Conceptually:

```text
Timer
  ↓
SystemMonitor
  ├── MemoryMonitor
  └── DiskMonitor
        ↓
      State
        ↓
      SwiftUI
```

The implementation should avoid unnecessary work when the popover is closed if menu-bar values do not require continuous updates.

---

# 10. Formatting

Create a centralized byte formatter.

Use human-readable binary units:

```text
B
KB
MB
GB
TB
```

Prefer sensible rounding.

Examples:

```text
12.4 GB
412 GB
1.2 TB
```

Avoid excessive precision:

```text
12.438291 GB
```

Do not mix formatting rules between Memory and Disk.

---

# 11. Usage Thresholds

The initial implementation may visually distinguish resource usage.

Suggested thresholds:

```text
0–69%    Normal
70–89%   Elevated
90–100%  High
```

However, do not overuse colors.

The UI should remain readable in:

- Light Mode
- Dark Mode

Prefer semantic system colors such as:

```swift
Color.primary
Color.secondary
Color.accentColor
```

and system-provided semantic colors where appropriate.

Do not hard-code colors unless there is a strong design reason.

---

# 12. macOS Menu Bar Integration

Omni is a menu-bar application.

It should:

- run without a Dock icon when appropriate
- create an `NSStatusItem`
- provide a popover
- respond to menu-bar clicks
- behave correctly when the application is activated/deactivated

Use AppKit where SwiftUI alone does not provide the required menu-bar behavior.

A typical integration can use:

```swift
NSStatusItem
NSPopover
```

Do not create a traditional main application window for the primary experience.

---

# 13. Application Lifecycle

Omni should be suitable for:

```text
Launch at Login
```

but this can be implemented after the core monitoring experience.

When implemented, prefer modern macOS APIs such as:

```swift
SMAppService
```

Do not implement launch-at-login using shell scripts or deprecated mechanisms.

---

# 14. Permissions

Omni should require **no special permissions** for its basic functionality.

Basic monitoring should work without:

- Full Disk Access
- Accessibility permission
- Screen Recording permission
- Administrator privileges

Do not request permissions unless a future feature genuinely requires them.

---

# 15. Performance Requirements

Omni itself should consume very little:

### CPU

Target:

```text
~0% when idle
```

and minimal CPU during refresh.

### Memory

Target:

```text
< 50 MB
```

for the application under normal operation.

Avoid:

- large frameworks
- embedded browsers
- background processes
- shell commands
- unnecessary polling
- retained historical data

Omni is a system utility, so **its own resource usage is part of the product quality**.

---

# 16. Error Handling

System monitoring failures should not crash the application.

For example:

```swift
Result<MemoryStats, MonitorError>
```

or another appropriate error model may be used.

If a metric temporarily cannot be read:

```text
Memory
Unable to read
```

is preferable to crashing or showing an incorrect value.

Never silently display `0 GB` when the actual value is unavailable.

---

# 17. Testing

Test the monitoring logic independently from SwiftUI.

### Memory

Test:

- total memory
- used memory
- ratio calculation
- percentage calculation
- zero/invalid values
- formatting

### Disk

Test:

- total capacity
- available capacity
- used capacity
- percentage calculation
- formatting
- unavailable filesystem information

### UI

Test:

- progress bar reaches 0%
- progress bar reaches 100%
- large values
- dark mode
- light mode
- long formatted values

---

# 18. Build & Development

Before implementing features, inspect the existing repository and follow its existing:

- Swift version
- Xcode version
- project structure
- build configuration
- signing configuration
- bundle identifier
- deployment target

Do not introduce a new package manager or dependency unless necessary.

Prefer Apple's built-in frameworks.

Primary frameworks:

```text
SwiftUI
AppKit
Foundation
Darwin
ServiceManagement
```

Only use additional dependencies when there is a clear benefit.

---

# 19. Development Phases

## Phase 1 — Skeleton

Implement:

- macOS application
- menu-bar item
- popover
- basic SwiftUI UI

Expected result:

```text
Menu Bar
   ↓
Omni
   ↓
Popover
```

---

## Phase 2 — Memory

Implement:

- Mach memory monitoring
- `MemoryStats`
- percentage calculation
- byte formatting
- menu-bar memory value
- memory progress bar

Expected:

```text
RAM 39%

Memory
████████░░░░░░░░
12.4 / 32 GB
```

---

## Phase 3 — Storage

Implement:

- filesystem capacity monitoring
- `DiskStats`
- percentage calculation
- disk formatting
- disk menu-bar value
- storage progress bar

Expected:

```text
Disk 83%

Storage
█████████████░░░
412 / 494 GB
```

---

## Phase 4 — Combined UI

Combine both:

```text
RAM 39%   Disk 83%
```

Popover:

```text
Memory
████████░░░░░░  12.4 / 32 GB

Storage
█████████████░  412 / 494 GB
```

---

## Phase 5 — Polish

Improve:

- spacing
- typography
- animation
- Dark Mode
- Light Mode
- accessibility
- menu-bar width
- update behavior
- error states

Do not add major new functionality during this phase.

---

## Phase 6 — Optional Features

Only after the core product is stable consider:

- memory pressure
- swap usage
- multiple disks
- disk selection
- CPU usage
- GPU usage
- battery
- network
- temperature
- launch at login
- configurable menu-bar display
- refresh interval
- thresholds

Each additional metric must justify its existence.

---

# 20. Design Principles

### Native first

Omni should look and behave like a macOS utility.

Use:

- SwiftUI
- AppKit
- SF Symbols
- native controls
- system colors
- native typography

Avoid mimicking web UI.

### Minimal

Every UI element must have a purpose.

### Fast

Opening the popover should feel instantaneous.

### Quiet

Omni should stay out of the user's way.

### Accurate

Never sacrifice correctness for a visually convenient number.

### Resource-conscious

A system monitor that consumes significant resources is self-defeating.

---

# 21. AI Agent Instructions

When starting work on Omni:

1. Inspect the existing repository before modifying anything.
2. Read this `AGENTS.md` completely.
3. Identify the current Xcode/project structure.
4. Build the application before making architectural changes.
5. Keep changes small and incremental.
6. Prefer native Apple APIs.
7. Avoid adding dependencies.
8. Do not introduce Tauri, Electron, React, or WebViews.
9. Keep monitoring logic separate from UI.
10. Add tests for calculations and formatting.
11. Verify both Light Mode and Dark Mode.
12. Verify the menu-bar application lifecycle.
13. Measure performance before declaring the feature complete.
14. Do not delete or rewrite existing functionality without understanding why it exists.

When a task is ambiguous, prefer the **smallest implementation that satisfies the requirement**.

---

# 22. Definition of Done

A Omni release is considered complete when:

- [ ] Application runs as a native macOS menu-bar utility
- [ ] RAM usage is displayed
- [ ] RAM shows used / total
- [ ] RAM shows a progress indicator
- [ ] RAM percentage is accurate
- [ ] Storage usage is displayed
- [ ] Storage shows used / total
- [ ] Storage shows a progress indicator
- [ ] Storage percentage is accurate
- [ ] Values refresh automatically
- [ ] No unnecessary permissions are requested
- [ ] Light Mode works
- [ ] Dark Mode works
- [ ] UI is accessible
- [ ] Monitoring logic has unit tests
- [ ] Application has low CPU usage
- [ ] Application has low memory usage
- [ ] No unnecessary third-party dependencies are introduced
- [ ] The application does not require a web runtime

---

# 23. Product North Star

Omni should ultimately feel like:

> **A tiny, beautiful system resource meter that you forget is running until you need it.**

The first release should do **two things extremely well**:

```text
RAM
████████░░░░  12.4 / 32 GB

Storage
████████████  412 / 494 GB
```

Everything else is secondary.
