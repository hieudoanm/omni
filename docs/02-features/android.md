# Android Features (`packages/android`)

Android is a single APK "super app" with two bundled features under one launcher icon.

## Hub (Omni)
| Feature | Description |
| ------- | ----------- |
| Launcher Activity | Main entry point showing both features |
| Home Screen | Card-based UI to navigate to Focus Blocker or NFC Toolkit |
| Unified Theme | Single merged theme across all features |

## Focus Blocker (`io.github.hieudoanm.block`)
| Feature | Description |
| ------- | ----------- |
| Accessibility Service | `FocusAccessibilityService` monitors and blocks selected apps |
| Block Overlay | Full-screen `BlockActivity` shown when blocked app is opened |
| App Picker | Browse and select apps to block with search functionality |
| Block Management | Toggle blocking on/off per app, manage blocked app list |
| Statistics | Track time saved from blocked distractions |
| Data Persistence | Room database + DataStore for preferences and blocked apps |
| Scheduling | Data layer for time-based blocking (Room entity/DAO prepared) |
| Status Monitoring | Dashboard shows accessibility service status and blocking state |

## NFC Toolkit (`io.github.hieudoanm.nfc`)
| Feature | Description |
| ------- | ----------- |
| NFC Tag Reading | Read NDEF messages, tag technology info, and tag details |
| NFC Intent Handling | Responds to `NDEF_DISCOVERED`, `TECH_DISCOVERED`, `TAG_DISCOVERED` intents |
| Host Card Emulation (HCE) | `HceApduService` for card emulation scenarios |
| Tag History | Store and view previously scanned tags (Room) |
| Settings | Configure app behavior via DataStore |
| NFC Status Detection | Checks device NFC support and enabled state |
| Animated UI | Pulse animation while waiting for tag scan |

**Tech Stack:** Kotlin 2.4, Jetpack Compose BOM 2026.09, Hilt 2.60, Room, DataStore, Navigation Compose, Robolectric 4.17
