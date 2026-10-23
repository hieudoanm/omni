# Omni — Product Specification

Product strategy · Functional requirements · Architecture · Data model · Delivery roadmap

> This document is the product-strategy source. The normative implementation set is [`00`–`12`](#normative-documents). Where this document and the numbered documents disagree on implementation detail, the numbered documents govern.

## Normative documents

| #   | Document                                                 | Governs                                                      |
| --- | -------------------------------------------------------- | ------------------------------------------------------------ |
| 00  | [`00-overview.md`](00-overview.md)                       | Product vision and scope                                     |
| 01  | [`01-requirements.md`](01-requirements.md)               | Functional/non-functional requirements                       |
| 02  | [`02-features.md`](02-features.md)                       | User-visible behaviour                                       |
| 03  | [`03-user-stories.md`](03-user-stories.md)               | User goals and acceptance scenarios                          |
| 04  | [`04-architecture.md`](04-architecture.md)               | Module boundaries, request lifecycle, tenancy                |
| 05  | [`05-data-model.md`](05-data-model.md)                   | Schema, constraints, state transitions                       |
| 06  | [`06-api-specification.md`](06-api-specification.md)     | Intent boundaries, contracts, error handling                 |
| 07  | [`07-ui-ux-design.md`](07-ui-ux-design.md)               | UI tokens, layout, states, accessibility                     |
| 08  | [`08-tech-stack.md`](08-tech-stack.md)                   | Allowed technologies and dependency policy                   |
| 09  | [`09-testing-strategy.md`](09-testing-strategy.md)       | Test layers, fixtures, acceptance criteria                   |
| 10  | [`10-implementation-plan.md`](10-implementation-plan.md) | Phased delivery plan                                         |
| 11  | [`11-deployment.md`](11-deployment.md)                   | Build types, release signing, distribution                   |
| 12  | [`12-operations.md`](12-operations.md)                   | Operations: contributing, setup, dev commands                |

---

## 1. Product vision

Omni is a single launcher app, **Omni**, whose home screen lists two applications:

- **Focus Blocker** — block access to selected apps using the Accessibility Service.
- **NFC Toolkit** — read, scan, and emulate NFC tags.

Both apps are bundled in one Gradle **application** module (`:app`). The module hosts the hub UI, the single `@HiltAndroidApp` (`OmniApp`), the launcher activity, and both feature source trees.

## Product principles

**Local-first** — No network calls; everything is local-first (Room + DataStore). Data stays on device.

**One module, three packages** — Every app ships in a single APK; features stay isolated by package namespace with no cross-feature class dependencies.

**Single Application subclass** — Features don't declare `<application>` `android:name`; `OmniApp` owns the process.

**No sign-in** — No authentication; no cloud sync.

## 2. Target users

| Persona      | Primary need                              | Desired outcome                        |
| ------------ | ----------------------------------------- | -------------------------------------- |
| End user     | Block distracting apps; read NFC tags     | Focused device use, NFC tag workflows  |
| Power user   | Per-app schedules, focus sessions, PIN    | Granular control over device usage     |

Primary persona: an Android user who wants a single app combining Focus Blocker and NFC Toolkit, with all data stored locally.

## 3. Scope and priorities

- **P0** — Core platform: necessary for the first usable release (hub, Focus Blocker core, NFC Toolkit core).
- **P1** — Enhancement: important for a complete experience (schedules, focus mode, PIN protection, widgets).

The first release should deliver blocking and NFC tag read/write/emulate rather than an incomplete version of every feature.

## 4. Functional requirements

See [`01-requirements.md`](01-requirements.md) for the complete specification.

### P0 — Core platform

Hub home screen with app cards, Focus Blocker (toggle, app picker, blocking overlay), NFC Toolkit (read/write/emulate, tag history), Room databases per feature, DataStore preferences.

### P1 — Enhancement

Time-based schedules, focus sessions, PIN protection, widgets, Material You dynamic color, Accessibility pass.

## 5. User journeys

See [`03-user-stories.md`](03-user-stories.md) for the complete user-goal and acceptance-scenario specification.

### Journey A — Block a distracting app

Goal: prevent access to a selected app.

1. Open Omni.
2. Tap Focus Blocker card.
3. Select apps to block in the app picker.
4. Enable blocking with one toggle.
5. When a blocked app comes to the foreground, the blocking screen overlay appears.

Success metric: blocked app cannot be accessed while blocking is enabled.

### Journey B — Read an NFC tag

Goal: read data from an NFC tag.

1. Open Omni.
2. Tap NFC Toolkit card.
3. Tap an NFC tag to the device.
4. View tag data (NDEF / tech / tag).

Success metric: tag data is displayed and persisted to history.

### Journey C — Emulate an NFC card

Goal: present the device as an NFC card to a reader.

1. Open Omni.
2. Tap NFC Toolkit card.
3. Enable HCE (Host Card Emulation).
4. Tap the device to an NFC reader.

Success metric: reader receives the emulated APDU responses.

## 6. Application structure

| Screen          | Purpose                                                         |
| --------------- | --------------------------------------------------------------- |
| Hub Home        | Lists Focus Blocker and NFC Toolkit as cards                    |
| Focus Blocker   | Toggle blocking, app picker, blocked app list, settings         |
| Blocking Screen | Full-screen overlay when a blocked app is detected              |
| NFC Home        | Read/scan/emulate entry points                                  |
| NFC History     | History of read/written tags                                    |
| NFC Settings    | Dark mode via DataStore, card emulation profiles                |

## 7. Current implementation status

This snapshot reflects the repository state on 2026-10-17.

### Implemented

- Single `:app` Gradle module bundling hub + `block` + `nfc` source packages
- Single `OmniApp` `@HiltAndroidApp` (removed old application classes)
- Hub home screen — card list launching each feature activity
- Launcher icons and intent filters moved to the hub
- Namespaced feature string labels (`block_app_name`, `nfc_app_name`)
- Full `block` unit test suite + hub + `nfc` smoke tests
- Omni branding: workflows, store entry, landing page, docs
- Blocking: enable/disable toggle, AccessibilityService foreground detection, instant blocking overlay, per-app toggle, ignore system apps, last blocked time tracking
- App picker: list installed apps, search, icons/labels, alphabetical sorting, LazyColumn, checkbox toggle
- Blocking screen: full-screen overlay, "Stay Focused" message, "Go Home" button, singleInstance launch mode, hidden from recent apps
- NFC: read NDEF/tech/tag tags, HCE card emulation, tag history in Room, settings with dark mode
- Persistence: Room per feature, DataStore for settings, all data local

### Not yet implemented

- AccessibilityService resilience (crash recovery, service restart)
- Debounce for rapid app switching
- Launch-on-boot via BroadcastReceiver
- Onboarding flow for AccessibilityService
- Temporary disable (timer-based)
- Blocked attempt counter and statistics
- Schedule entity and editor UI
- WorkManager integration for schedules
- Per-app schedules
- Rich tag payload editing, tag comparison/cloning guard, export tag history
- Card emulation profiles (selectable AIDs)
- Focus sessions, daily usage limits, category-based blocking
- PIN protection, widgets, Material You dynamic color, Accessibility pass
- E2E testing with Espresso/Compose Testing

## 8. Non-functional requirements

See [`01-requirements.md`](01-requirements.md) for the complete NFR specification.

### Key targets

- Local-first: no network calls; all data on device
- Min SDK: 26 (Android 8.0); Target/Compile SDK: 37 (Android 15+)
- Accessibility Service permission required for blocking
- NFC hardware required for read/write; HCE for card emulation

## 9. Design and UX

See [`07-ui-ux-design.md`](07-ui-ux-design.md) for complete design specifications.

### Design principles

Kotlin first, Compose for all UI (no XML layouts), MVVM, StateFlow + collectAsStateWithLifecycle, val over var, explicit types, small files (<200 lines), small functions (<30 lines).

## 10. Testing strategy

See [`09-testing-strategy.md`](09-testing-strategy.md) for complete testing strategy.

### Test layers

Unit (JUnit 4 + Robolectric + MockK + Turbine), Compose UI testing, instrumented tests.

## 11. Deployment

See [`11-deployment.md`](11-deployment.md) for build types, release signing, and output.

### Options

- Debug: `./gradlew assembleDebug` (debug key, no minify)
- Release: `./gradlew assembleRelease` (release keystore, minify + shrink)
- Install: `./gradlew installDebug` / `./gradlew installRelease`

## 12. Contributing

See [`12-operations.md`](12-operations.md) for contributor guidelines.

### Repository conventions

- Kotlin first — no Java source files
- Compose for all UI — no XML layouts
- MVVM — Screen composable owns a ViewModel via `hiltViewModel()`
- Documentation: numbered `docs/00`–`12` govern implementation detail

## 13. License

No LICENSE file is included for this project.
