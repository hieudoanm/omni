# Omni (iOS)

A native Swift + SwiftUI iOS app that ports the Omni hub and NFC Toolkit from the Android package. The first screen is the Omni hub; today it lists the **NFC Toolkit**, which reads, writes, and keeps a history of NFC tags.

## Apps

One Xcode app target hosts everything.

| App | Area |
| --- | ---- |
| Omni (hub) | `Omni/Hub/` |
| NFC Toolkit | `Omni/NFC/` |

### NFC Toolkit

Reads and writes NDEF tags via Core NFC, with local history.

- Tag reading through `NFCTagReaderSession` (NDEF + TAG formats)
- NDEF parse/serialize (`NdefCodec`) for URI, text, MIME, and absolute records
- NDEF writing back to a tag
- Scan history persisted with SwiftData (`TagHistoryItem`)
- Settings persisted with `UserDefaults` (`SettingsStore`)

### Platform limits (vs Android)

- **No Focus Blocker** — iOS has no third-party app accessibility/overlay API.
- **No HCE** — iOS cannot emulate a card for external readers; read + write + history only.

## Stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| Language    | Swift 6                                                  |
| UI          | SwiftUI                                                 |
| NFC         | Core NFC (`NFCTagReaderSession`)                        |
| Persistence | SwiftData (history), UserDefaults (settings)            |
| Design      | HUD theme — Orbitron + DM Mono, bundled OFL fonts       |
| Tests       | Swift Testing (`OmniTests/`)                            |
| Build       | Xcode project (`Omni.xcodeproj` via `xcodegen`), `xcodebuild` via Makefile |
| Min iOS     | 17.0                                                     |

## Build

```bash
make build       # simulator build via xcodebuild
make test        # unit tests (simulator)
make app         # print built .app path
make lint        # build (compile check)
make format      # swiftformat Omni OmniTests
make format-check
make clean       # remove build/
```

`DESTINATION` defaults to `platform=iOS Simulator,name=iPhone 16`; override for
device builds, e.g. `make build DESTINATION="generic/platform=iOS"`.

NFC scanning requires a physical device — the simulator builds and runs the UI
but `NFCTagReaderSession.readingAvailable` is false there.

## Documentation

Product spec lives in the repo-level docs: [`docs/`](../../../docs/README.md)

- [Overview](../../../docs/00-overview/) — macOS/Android have spec docs; iOS follows the Android feature set minus platform-limited features
- [Architecture](../../../docs/04-architecture/android.md) — shared Omni architecture reference
- [Operations](../../../docs/12-operations/android.md) — dev commands

## License

See [LICENSE](LICENSE).
