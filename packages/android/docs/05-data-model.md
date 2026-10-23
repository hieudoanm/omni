# 05 — Data Model

Schema, constraints, and state transitions for Omni.

## BlockedApp (focus_blocker.db)

| Field | Type | Meaning |
| ----- | ---- | ------- |
| packageName | String | Primary key; app package name |
| label | String | App display name |
| enabled | Boolean | Whether this app is blocked |

Future: `Schedule` entity — package, start/end time, days of week.

## NFC Tag History

Entity persisted on read/write. Fields include tag ID, NDEF payload, tech list, timestamp.

## DataStore Preferences

| Key | Type | Default |
| --- | ---- | ------- |
| `blocking_enabled` | Boolean | false |
| `first_launch` | Boolean | true |
| `dark_mode` | Boolean | false |
| `last_blocked_time` | Long | 0 |
| `accessibility_enabled` | Boolean | false |
| `ignore_system_apps` | Boolean | true |
| `launch_on_boot` | Boolean | false |

## Constraints

- Room instances are per-feature (distinct DB names): `focus_blocker.db` and nfc tag history DB.
- No cross-feature database access.
- All data stored locally — no cloud sync.

## State transitions

- Blocking: `AccessibilityService` receives `TYPE_WINDOW_STATE_CHANGED` → `FocusRepository.isBlocked(packageName)` → if yes, launch `BlockActivity`.
- NFC tag: tag discovered → read NDEF/tech/payload → persist to Room → display in history.
- HCE: reader sends APDU → `HceApduService` processes → send response APDU.

## Supporting files

See `05-data-model/` for Room entity diagrams and DataStore schema.
