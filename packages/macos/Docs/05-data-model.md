# 05 — Data Model

Schema, constraints, and state transitions for Omni.

## Models

All models are immutable value types with computed ratio/percentage.

### MemoryStats

| Field | Type | Meaning |
| ----- | ---- | ------- |
| usedBytes | UInt64 | active + wired + compressed pages × page size |
| totalBytes | UInt64 | physical memory |

Computed: `usageRatio`, `usagePercentage`.

### DiskStats

| Field | Type | Meaning |
| ----- | ---- | ------- |
| usedBytes | UInt64 | total − available for important usage |
| totalBytes | UInt64 | volume total capacity |

Computed: `usageRatio`, `usagePercentage`. Free and purgeable amounts exposed for the details view.

### SwapStats

| Field | Type | Meaning |
| ----- | ---- | ------- |
| usedBytes | UInt64 | bytes swapped out |
| totalBytes | UInt64 | total swap configured |

### CPUStats

Derived from `host_processor_info(PROCESSOR_CPU_LOAD_INFO)` delta and `getloadavg()`.

### SystemInfo

| Field | Source |
| ----- | ------ |
| chip | `hw.model` |
| cores | `hw.physicalcpu`, `hw.logicalcpu` |
| uptime | `kern.boottime` |

### BatteryInfo

| Field | Source |
| ----- | ------ |
| charge level | IOKit power-source description |
| power source | `IOPSGetPowerSourceDescription` |
| charging | power-source state |
| time to empty/full | IOKit (sentinels `-1`/`-2` folded to `nil`) |
| health condition | IOKit |
| cycle count | `AppleSmartBattery` / `PowerManagementController` |
| temperature | deci-kelvin (Intel) → deci-celsius; deci-celsius (Apple Silicon) |
| adapter wattage | `IOPSCopyExternalPowerAdapterDetails` |

### PortInfo

| Field | Type |
| ----- | ---- |
| port | Int |
| protocol | TCP / UDP |
| process name | String |
| pid | Int32 |

### ClipboardItem

| Field | Type |
| ----- | ---- |
| content | String |
| copiedCount | Int |
| pinned | Bool |

Persisted atomically as JSON at `~/Library/Application Support/Clipper/clipboard.json`. Dedupe on repeated copies (bump `copiedCount`, move to front). Capped at `maxItems`.

### Workspace / WorkspaceWindow

| Field | Type |
| ----- | ---- |
| name | String |
| windows | [WorkspaceWindow] |

WorkspaceWindow: bundleID, title?, screenID?, NormalizedRect. Persisted atomically as JSON at `~/Library/Application Support/Workspaces/workspaces.json`.

### NormalizedRect

Window CGRect converted to normalized coordinates relative to the visible frame of the display it occupies.

### ScreenInfo

| Field | Type |
| ----- | ---- |
| displayID | CGDirectDisplayID |
| visibleFrame | CGRect |

### NetworkStats / NetworkSnapshots

Per-interface byte counters from `getifaddrs`, aggregated into one sample per interface; deltas converted to bytes-per-second rates; 32-bit wrap handled by `delta(from:to:)`.

### IPInfo / DNSResponse

| IPInfo field | Source |
| ------------ | ------ |
| ip | api.ipify.org |
| version, ASN, org, timezone, country, region, city, postal, coordinates | ipinfo.io / ipapi.co |
| vpn/shared hosting | `detectVPN` heuristic on org name |

### RunningAppInfo

| Field | Type |
| ----- | ---- |
| name | String |
| bundleIdentifier | String |
| windowCount | Int |

### SettingsStore

| Field | Type | Default |
| ----- | ---- | ------- |
| refreshInterval | Double | 1.0 |
| menuBarMetrics | [MenuBarMetric] | CPU, Memory, Storage |
| menuBarDisplay | MenuBarDisplay | Percentages |
| clipboardMonitorEnabled | Bool | true |
| clipboardMaxItems | Int | 500 |

### Constraints

- `ClipboardStore.maxItems` caps retained history; never skip the cap.
- `SettingsStore.menuBarMetrics` is always non-empty so the status item keeps a label.
- Restoration must never be destructive: no quitting apps, no killing PIDs, no resizing windows beyond saved bounds.
- Never auto-kill a process; destructive actions require explicit user action.

### State transitions

- Clipboard: `changeCount` changed → `getLatestContent()` → `ClipboardStore.add()` → dedupe/cap/save → `ClipboardView`.
- Workspace restore: for each bundleID (async group): running? → no: launch → wait for PID → AX window list → place via `kAXPosition`/`kAXSize`.
- Port termination: `SignalProcessTerminator` sends SIGTERM (graceful) or SIGKILL (force), refusing invalid PIDs or the app itself.

## Supporting files

See `05-data-model/` for model relationship diagrams and the mmd entity schema.
