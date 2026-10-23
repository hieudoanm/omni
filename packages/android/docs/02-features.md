# 02 — Features

User-visible behaviour of Omni.

## The Hub

- Home screen lists both apps as cards
- Tap a card to open that app
- Single launcher icon and Application class (`OmniApp`)

## Focus Blocker

### Blocking

- Enable/disable blocking with one toggle
- Detect foreground app changes via AccessibilityService
- Instant blocking screen overlay when a blocked app is detected
- Per-app toggle — select exactly which apps to block
- Ignore system apps filter (on by default)
- Track last blocked time for statistics

### App Picker

- List all installed applications
- Search apps by name
- Show app icons and labels
- Alphabetical sorting
- Fast scrolling with LazyColumn
- Checkbox toggle per app

### Blocking Screen

- Full-screen overlay — blocks access to the underlying app
- "Stay Focused" message with blocked app name
- "Go Home" button to dismiss
- Prevents multiple instances (singleInstance launch mode)
- Hides from recent apps

## NFC Toolkit

- Read NDEF / tech / tag tags (launchable from NFC intents)
- HCE (Host Card Emulation) — emulate a card to readers
- Tag history persisted in Room
- Settings with dark mode via DataStore

## Persistence

- Room database per feature (blocked apps / tag history)
- DataStore preferences for all settings
- All data stored locally — no cloud sync

## Requirements

- Android 8.0 (API 26) or later
- Accessibility Service permission required for blocking
- NFC hardware required for read/write; HCE for card emulation

## Supporting files

See `02-features/` for the feature matrix and screen flow diagrams.
