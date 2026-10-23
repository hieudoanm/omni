# Omni (Android)

_Kotlin + Jetpack Compose Android super app bundling Focus Blocker and NFC Toolkit._

---

# Goal

Deliver a single launcher app, **Omni**, whose home screen lists two
applications:

- **Focus Blocker** — block access to selected apps using Accessibility Service.
- **NFC Toolkit** — read, scan, and emulate NFC tags.

Both apps are bundled in one Gradle **application** module (`:app`). The module
hosts the hub UI, the single `@HiltAndroidApp` (`OmniApp`), the launcher
activity, and both feature source trees.

---

# High-Level Architecture

```text
                        ┌──────────────┐
                        │  OmniApp │   (@HiltAndroidApp, single Application)
                        └──────┬───────┘
                               │
                    AppComponent (Hilt)
                        │
                 ┌──────┴───────────────┐
                 │  :app (hub)          │
                 │  MainActivity        │
                 │  HomeScreen          │  - Focus Blocker card -> startActivity(block MainActivity)
                 │                      │  - NFC Toolkit card   -> startActivity(nfc MainActivity)
                 └──┬───────────────────┘
        ┌──────────┴──────────────┐
        ▼                         ▼
  io.github.hieudoanm.block   io.github.hieudoanm.nfc
   Focus Blocker app          NFC Toolkit app
   (source package)           (source package)
```

# Module Layout

```text
android/
└── app/
    ├── build.gradle.kts           # single application module
    └── src/
        ├── main/
        │   ├── AndroidManifest.xml  # one merged manifest
        │   ├── kotlin/io/github/hieudoanm/
        │   │   ├── omni/  # Omni hub
        │   │   ├── block/     # Focus Blocker feature
        │   │   └── nfc/       # NFC Toolkit feature
        │   └── res/           # merged resources
        └── test/kotlin/io/github/hieudoanm/
            ├── omni/      # hub tests
            ├── block/         # Focus Blocker tests
            └── nfc/           # NFC Toolkit tests
```

Each feature keeps its own package namespace, Room database, DataStore, Hilt
modules, and Compose UI. The hub launches each feature `MainActivity` with an
explicit class-based `Intent` — no shared classes across feature packages, so
identical class names (e.g. `MainActivity`, `HomeViewModel`) are independent.

# Manifest

A single merged `AndroidManifest.xml` declares:

- the hub — `OmniApp` (Application), `MainActivity` with the launcher
  intent-filter and the Omni theme;
- **block** — `io.github.hieudoanm.block.activity.MainActivity` (exported=false,
  opened by the hub), `BlockActivity` (overlay, singleInstance),
  `FocusAccessibilityService`, and the `queries` element for the app picker;
- **nfc** — `MainActivity` (exported=true with `NDEF_DISCOVERED`,
  `TECH_DISCOVERED`, `TAG_DISCOVERED` intent filters), `HceApduService`
  (HOST_APDU_SERVICE), NFC permission + feature declarations.

Feature components use fully-qualified names so they resolve independently of
the module namespace. Only the hub sets `android:name` on `<application>` and
ships the launcher intent-filter + icon.

# Resource Conventions

- Launcher icon lives in `res/mipmap-anydpi-v26/ic_launcher.xml` (hub).
- Feature string labels are namespaced to avoid collisions:
  `block_app_name`, `nfc_app_name`. The hub label is `app_name` (Omni).
- Feature theme names stay distinct: `Theme.FocusBlock`, `Theme.NfcToolkit`,
  `Theme.Omni` — merged into one `themes.xml`.

# Dependencies

| Plugin        | Version |
| ------------- | ------- |
| AGP           | 9.3.2   |
| Kotlin        | 2.4.10  |
| KSP           | 2.3.11  |
| Hilt          | 2.60.1  |
| Compose BOM   | 2026.08.00 |

`build.gradle.kts` at the root applies all plugins with `apply false`; the
single `:app` module applies the ones it needs. There are no library modules.

# Build & Test

```bash
./gradlew assembleDebug     # APK
./gradlew lint              # static analysis
./gradlew test              # all unit tests
./gradlew assembleRelease   # release APK (requires keystore env)
./gradlew bundleRelease     # release AAB (requires keystore env)
```

Release signing reads `RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`,
`RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD` from the environment (defaults:
`release.keystore` / `android`, resolved inside `app/`). CI generates the
keystore with keytool.

# Testing

- **hub** — `androidx/activity`, `androidx/ui/home` — cards render and fire
  their `Open` callbacks.
- **block** — full suite: repository, DataStore, Room DAO, services, screens,
  ViewModels (Robolectric + MockK + Turbine).
- **nfc** — smoke test that core classes load.

Robolectric tests pin `@Config(sdk = [34])` (see `app/src/test/resources/robolectric.properties`).

# Repository Responsibilities

- `block` — `FocusRepository` gates Room + package queries; the
  AccessibilityService asks `isBlocked(packageName)` and launches
  `BlockActivity`.
- `nfc` — `NfcRepository` wraps NFC tag IO + tag history (Room);
  `HceApduService` responds to reader APDUs.

# Streamlined by the merger

- `NfcToolkitApp` and `FocusBlockApp` `@HiltAndroidApp` classes were removed —
  `OmniApp` is now the single Application.
- Features were merged from separate `:block` / `:nfc` library modules into the
  single `:app` module; manifests, resources, and proguard keep-rules were
  merged (feature components keep fully-qualified package names).
- Launcher icons + `app_name` strings were moved out of the features and into
  the hub to guarantee clean manifest/resource merges.