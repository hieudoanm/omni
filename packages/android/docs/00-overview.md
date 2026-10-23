# 00 — Overview

Product vision and scope for Omni.

## Vision

Omni is a single launcher app whose home screen lists two applications:

- **Focus Blocker** — block access to selected apps using the Accessibility Service.
- **NFC Toolkit** — read, scan, and emulate NFC tags.

Both apps are bundled in one Gradle **application** module (`:app`).

## Focus

The first version focuses on:

- Hub home screen with app cards
- Focus Blocker: toggle blocking, app picker, instant blocking overlay
- NFC Toolkit: read NDEF/tech/tag tags, HCE emulation, tag history
- Local-first persistence: Room per feature, DataStore for settings
- No network calls; no sign-in; no cloud sync

## Platform

- Android only
- Min SDK: 26 (Android 8.0)
- Target / Compile SDK: 37 (Android 15+)

## UI Technology

- Kotlin 2.x
- Jetpack Compose + Material 3
- No XML layouts

## Principles

| Principle          | Meaning                                       |
| ------------------ | --------------------------------------------- |
| Local-first        | No network calls; data stays on device        |
| One module         | Single `:app` Gradle module, single APK       |
| Three packages     | hub, block, nfc — isolated by namespace       |
| Single Application | `OmniApp` is the single `@HiltAndroidApp` |
| No sign-in         | No authentication, no cloud sync              |

## Supporting files

See `00-overview/` for the product one-pager and module layout diagram.
