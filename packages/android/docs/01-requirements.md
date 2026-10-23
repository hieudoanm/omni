# 01 — Requirements

Functional and non-functional requirements for Omni.

## Functional requirements

### FR-001 — Hub

The app shall show a home screen listing Focus Blocker and NFC Toolkit as cards; tapping a card launches the corresponding feature activity.

### FR-002 — Blocking toggle

The app shall enable/disable blocking with one toggle.

### FR-003 — Foreground detection

The AccessibilityService shall detect foreground app changes via `TYPE_WINDOW_STATE_CHANGED` events.

### FR-004 — Blocking overlay

When a blocked app is detected, the app shall show a full-screen blocking overlay ("Stay Focused" with blocked app name, "Go Home" button).

### FR-005 — App picker

The app shall list all installed applications, searchable by name, showing icons and labels, alphabetically sorted, with checkbox toggle per app.

### FR-006 — Per-app toggle

The app shall allow selecting exactly which apps to block.

### FR-007 — Ignore system apps

The app shall filter out system apps by default.

### FR-008 — Last blocked time

The app shall track the last blocked time for statistics.

### FR-009 — Blocking screen

The blocking screen shall be a full-screen overlay that prevents access to the underlying app, uses `singleInstance` launch mode, and is hidden from recent apps.

### FR-010 — NFC tag reading

The app shall read NDEF / tech / tag tags, launchable from NFC intents.

### FR-011 — HCE emulation

The app shall emulate a card to readers via `HceApduService` (HOST_APDU_SERVICE).

### FR-012 — Tag history

The app shall persist tag history in Room.

### FR-013 — NFC settings

The app shall provide settings with dark mode via DataStore.

### FR-014 — Persistence

The app shall use Room databases per feature (blocked apps, tag history) and DataStore preferences for all settings.

### FR-015 — Local-first

The app shall make no network calls; all data is stored locally on device.

## Non-functional requirements

### NFR-001 — Min SDK

Android 8.0 (API 26).

### NFR-002 — Target SDK

Android 15+ (API 37).

### NFR-003 — Permissions

Accessibility Service permission required for blocking. NFC hardware required for read/write; HCE for card emulation.

### NFR-004 — Build

AGP 9.x, Gradle Kotlin DSL, Kotlin 2.x, Hilt 2.x, Compose BOM.

### NFR-005 — UI

Compose for all UI — no XML layouts. Material 3.

### NFR-006 — Architecture

MVVM. StateFlow + `collectAsStateWithLifecycle`. Hilt dependency injection.

### NFR-007 — Local-first

No network calls. Room + DataStore for all persistence.

## Supporting files

See `01-requirements/` for the FR/NFR traceability matrix.
