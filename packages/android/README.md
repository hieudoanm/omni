# Omni (Android)

A Kotlin + Jetpack Compose Android "super app" that bundles two applications under one launcher icon and one APK. The first screen lists both apps — **Focus Blocker** and **NFC Toolkit** — and opens each inside the shared Omni process.

## Apps

One Gradle *application* module hosts everything; each app is a source package tree inside it.

| App | Package |
| --- | ------- |
| Omni (hub) | `io.github.hieudoanm.omni` |
| Focus Blocker | `io.github.hieudoanm.block` |
| NFC Toolkit | `io.github.hieudoanm.nfc` |

### Focus Blocker

Blocks distracting apps using the Accessibility Service. When a blocked app is opened, the service intercepts it and shows a full-screen block overlay.

- Home dashboard (accessibility + blocking status, blocked count, time saved)
- App picker with search and per-app toggle
- Room persistence + DataStore preferences
- Scheduling data layer (Room entity + DAO, no UI yet)

### NFC Toolkit

Reads, scans, and emulates NFC tags.

- NDEF / tech / tag tag-read flows (launchable via NFC intents)
- HCE (Host Card Emulation) APDU service
- History, settings, and dark mode via DataStore

## Tech Stack

| Layer        | Library                      |
| ------------ | ---------------------------- |
| UI           | Jetpack Compose + Material 3 |
| Navigation   | Compose Navigation           |
| DI           | Dagger Hilt                  |
| Local DB     | Room (per feature)           |
| Preferences  | DataStore Preferences        |
| Blocking     | Accessibility Service        |
| NFC          | Android NFC + HCE            |
| Architecture | MVVM + Repository            |

## Build

```bash
./gradlew assembleDebug        # debug APK
./gradlew assembleRelease      # release APK (requires keystore)
./gradlew bundleRelease        # release AAB (requires keystore)
```

## Test

```bash
./gradlew test                 # unit tests for all packages
./gradlew lint                 # Android lint
```

## Project Structure

```text
app/
└── src/
    ├── main/
    │   ├── kotlin/io/github/hieudoanm/
    │   │   ├── omni/   Omni hub — launcher activity, home screen
    │   │   ├── block/      Focus Blocker feature
    │   │   └── nfc/        NFC Toolkit feature
    │   └── res/            shared resources (merged across features)
    └── test/kotlin/io/github/hieudoanm/
        ├── omni/   hub tests
        ├── block/      Focus Blocker tests
        └── nfc/        NFC Toolkit tests
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the package layout and
[AGENTS.md](AGENTS.md) for engineering details.