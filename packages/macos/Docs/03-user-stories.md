# 03 — User Stories

User goals and acceptance scenarios for Omni.

## Persona: End User

### Goal: Know memory and disk usage at a glance

**As a** macOS user,
**I want to** see RAM and disk usage in the menu bar,
**so that** I can tell whether my system is under pressure without opening an app.

**Acceptance criteria:**

1. Menu bar shows `RAM NN%   Disk NN%`.
2. Values use monospaced digits so the indicator width stays stable.
3. Clicking the menu bar opens a popover with Memory and Storage details.

### Goal: Inspect detailed memory breakdown

**As a** user,
**I want to** see active / wired / compressed and cached / inactive / free memory,
**so that** I understand what is actually consuming RAM.

**Acceptance criteria:**

1. Memory tab shows the full breakdown.
2. Progress bar is tinted by usage threshold (Normal/Elevated/High).
3. Used / total values are shown (`12.4 / 32 GB`).

## Persona: Power User

### Goal: Find and kill a process listening on a port

**As a** developer,
**I want to** see which process is listening on a local port,
**so that** I can terminate it when a port is stuck.

**Acceptance criteria:**

1. Ports tab lists listening TCP/UDP ports with process name and PID.
2. Right-click context menu offers copy and kill/force-kill actions.
3. Kill sends SIGTERM; force kill sends SIGKILL with confirmation.
4. The app never signals itself or invalid PIDs.

### Goal: Save and restore a workspace layout

**As a** user who switches between display setups,
**I want to** save my current window layout and restore it later,
**so that** I can resume work after a reboot or monitor change.

**Acceptance criteria:**

1. Workspaces tab captures all on-screen apps and window positions.
2. Restore launches missing apps automatically.
3. Windows are placed back to saved positions on the correct display.
4. Accessibility permission is requested when needed; a Grant banner appears when missing.

### Goal: Copy something from clipboard history

**As a** user,
**I want to** search and re-copy previous clipboard items,
**so that** I do not lose anything I copied earlier.

**Acceptance criteria:**

1. Clipboard tab shows searchable history of copied text.
2. Copy again, pin, or delete any item.
3. Repeated copies dedupe and move to the front.
4. History is stored locally (`~/Library/Application Support/Clipper/clipboard.json`).

### Goal: Check public IP and geolocation

**As a** user behind a VPN,
**I want to** see my public IP, ASN, org, and VPN badge,
**so that** I can verify my connection is routed as expected.

**Acceptance criteria:**

1. IP tab shows current IP, geolocation, ASN, organization.
2. VPN/shared-hosting badge appears for known cloud orgs.
3. Distinct Offline state when the network is unreachable.
4. DNS A-record lookup via Cloudflare DNS-over-HTTPS.

### Goal: Bring a running app to the front

**As a** user with many apps open,
**I want to** bring any app's windows forward with one click,
**so that** I can switch context quickly.

**Acceptance criteria:**

1. Front tab lists running apps with window counts.
2. Search filters by app name or bundle identifier.
3. One-click Bring to Front activates all of the app's windows.
4. No permission required.

### Goal: Monitor battery health and charge

**As a** laptop user,
**I want to** see charge level, power source, health condition, and cycle count,
**so that** I can manage battery wear.

**Acceptance criteria:**

1. Battery tab shows charge percentage with progress bar.
2. Status (`Charging` / `On battery` / `Fully charged`) and power source.
3. Capacity, cycle count, temperature, health condition, adapter wattage.
4. `Battery unavailable` state on Macs without a readable battery.

### Goal: Use the dashboard window for long-lived monitoring

**As a** operator,
**I want to** open a resizable window with all monitoring sections at once,
**so that** I can keep an eye on the system while working.

**Acceptance criteria:**

1. `⇧⌘D` opens the dashboard window.
2. Sidebar shows all sections; content area renders cards side by side.
3. Dashboard and menu-bar panel share the same view models.
4. Window closes without leaving a Dock icon.

## Supporting files

See `03-user-stories/` for journey maps and acceptance-scenario tables.
