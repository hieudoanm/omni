# 06 — API Specification

Intent boundaries, contracts, and error handling for Omni.

Omni is a local-first Android application with no network-facing REST API. This document specifies the internal contracts between the hub and features, and between features and Android system services.

## Hub → Feature contract

The hub launches each feature `MainActivity` with an explicit class-based `Intent`:

```text
startActivity(MainActivity in io.github.hieudoanm.block)
startActivity(MainActivity in io.github.hieudoanm.nfc)
```

Feature components use fully-qualified names so they resolve independently of the module namespace. Identical class names (e.g. `MainActivity`, `HomeViewModel`) across feature packages are independent and never collide.

## Navigation contract

Each feature owns a Compose `NavGraph` inside its own `MainActivity`:

- **Block**: `home` → `app_list` → `settings` (`BlockActivity` is launched separately by the AccessibilityService).
- **NFC**: `home` / `history` / `settings`.

## Manifest contract

A single merged `AndroidManifest.xml` declares:

- **hub** — `OmniApp` (Application), `MainActivity` with the launcher intent-filter and the Omni theme.
- **block** — `io.github.hieudoanm.block.activity.MainActivity` (exported=false, opened by the hub), `BlockActivity` (overlay, singleInstance), `FocusAccessibilityService`, and the `queries` element for the app picker.
- **nfc** — `MainActivity` (exported=true with `NDEF_DISCOVERED`, `TECH_DISCOVERED`, `TAG_DISCOVERED` intent filters), `HceApduService` (HOST_APDU_SERVICE), NFC permission + feature declarations.

Only the hub sets `android:name` on `<application>` and ships the launcher intent-filter + icon.

## AccessibilityService contract

`FocusAccessibilityService` is `@AndroidEntryPoint` with Hilt field injection. It receives `TYPE_WINDOW_STATE_CHANGED` events and calls `FocusRepository.isBlocked(packageName)`. If blocked, it launches `BlockActivity`.

## NFC contract

`HceApduService` (HOST_APDU_SERVICE) responds to reader APDUs. NFC intent filters (`NDEF_DISCOVERED`, `TECH_DISCOVERED`, `TAG_DISCOVERED`) allow launching from NFC intents.

## Error handling

- Blocking failures: the app does not crash if the AccessibilityService is unavailable; the user is guided to enable it.
- NFC failures: if NFC hardware is unavailable, read/write/emulate features are gracefully unavailable.
- Room/Database errors: handled gracefully; no data loss.

## Supporting files

See `06-api-specification/` for intent-flow diagrams and manifest merge diagrams.
