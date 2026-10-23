# 01 — Requirements

Functional and non-functional requirements for Omni.

## Functional requirements

### FR-001 — Memory monitoring

The app shall read system memory statistics via Mach VM APIs (`host_statistics64`) and display used / total bytes and usage percentage.

**Definition of "used":** `active + wired + compressed` pages. Inactive and purgeable pages are excluded.

### FR-002 — Disk monitoring

The app shall read boot volume capacity via Foundation `URLResourceValue` keys and display used / total bytes and usage percentage.

**Definition of "used":** `total capacity − available for important usage`.

### FR-003 — Menu-bar indicator

The app shall show a compact menu-bar item with RAM and disk percentages using monospaced digits so the item width stays stable.

### FR-004 — Popover

Clicking the menu-bar item shall open a native popover with Memory and Storage sections, each showing a progress bar and used/total values.

### FR-005 — Memory pressure

The app shall read memory pressure status from the kernel (`kern.memorystatus_vm_pressure_level`) and show `Normal` / `Warning` / `Critical`.

### FR-006 — Swap monitoring

The app shall read swap usage from the Mach `vm.swapusage` sysctl and display used / total swap with a progress bar.

### FR-007 — CPU monitoring

The app shall compute aggregate CPU load as the delta of cumulative per-CPU tick counters between two reads, and report load average (1/5/15 min) from `getloadavg(3)`.

### FR-008 — System info

The app shall display static hardware identity and boot age (`hw.model`, `hw.physicalcpu`, `hw.logicalcpu`, `kern.boottime`).

### FR-009 — Network monitoring

The app shall read per-interface byte counters via `getifaddrs`, compute bytes-per-second rates from deltas (handling 32-bit counter wrap), and classify Wi-Fi vs Ethernet via IOKit.

### FR-010 — Battery monitoring

The app shall read battery state via IOKit power-source APIs (`IOPSCopyPowerSourcesInfo`, `IOPSGetPowerSourceDescription`, `IOPSCopyExternalPowerAdapterDetails`) and cycle count/temperature via `AppleSmartBattery` or `PowerManagementController`.

### FR-011 — Port discovery

The app shall discover local listening TCP/UDP ports by running `/usr/sbin/lsof` with explicit arguments (`-nP -iTCP -sTCP:LISTEN`, `-nP -iUDP`) via `Process` (never through a shell).

### FR-012 — Port termination

The app shall send SIGTERM for graceful kill and SIGKILL for force kill, refusing to signal invalid PIDs or the app itself.

### FR-013 — Clipboard history

The app shall maintain a searchable, local-first history of system clipboard contents by polling `NSPasteboard.general.changeCount` every 0.5 s.

### FR-014 — Running apps (Front)

The app shall list regular running applications (excluding itself), enriched with on-screen window counts, sorted by localized name, searchable by name or bundle identifier.

### FR-015 — Bring to front

The app shall activate all windows of a selected running app via `NSRunningApplication.activate(options: .activateAllWindows, .activateIgnoringOtherApps)`.

### FR-016 — Workspaces

The app shall capture on-screen window layouts (normalized rects per screen), save them as named workspaces, and restore them (launching missing apps in parallel, arranging windows via Accessibility APIs).

### FR-017 — IP inspector

The app shall resolve the public IP via `api.ipify.org`, enrich via `ipinfo.io` (fallback `ipapi.co`), perform A-record DNS lookups via Cloudflare DNS-over-HTTPS, and classify VPN/shared-hosting orgs.

### FR-018 — Dashboard window

The app shall provide a `Window`-based dashboard with a sidebar and card grid, sharing view models with the menu-bar panel.

### FR-019 — Launch at login

The app shall register/unregister at login via `SMAppService`.

### FR-020 — Settings

The app shall expose refresh interval presets (1/2/5/10 s), menu-bar display style (Percentages/Values/Used-Total), clipboard monitor toggle and max history size.

## Non-functional requirements

### NFR-001 — CPU usage

~0% when idle; minimal during refresh.

### NFR-002 — Memory usage

< 50 MB under normal operation.

### NFR-003 — Refresh interval

Default 1 second; single coordinated timer drives all system monitors; no independent per-metric timers.

### NFR-004 — Permissions

No special permissions required for basic functionality. Accessibility requested only for Workspaces window arrangement.

### NFR-005 — Error handling

System monitoring failures shall not crash the app. Unreadable metrics show `Unable to read`, never `0 GB`.

### NFR-006 — Appearance

Light Mode, Dark Mode, increased transparency, and Reduce Motion all supported.

### NFR-007 — Accessibility

All icon-only controls carry accessibility labels; decorative symbols marked `accessibilityHidden`; every section exposes a combined VoiceOver label.

## Supporting files

See `01-requirements/` for the FR/NFR traceability matrix.
