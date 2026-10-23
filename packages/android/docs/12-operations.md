# 12 — Operations

Contributing, setup, and development operations for Omni.

## Prerequisites

| Tool | Version |
| ---- | ------- |
| JDK | 17+ |
| Android SDK | API 37 (installed via Android Studio or `sdkmanager`) |
| Gradle | 9.7+ (wrapper included) |
| Kotlin | 2.4.10 (managed by Gradle plugin) |

## Setup

```bash
# Clone the repo
git clone https://github.com/hieudoanm/omni.git
cd omni/packages/android

# Create local.properties with your SDK path
echo "sdk.dir=$HOME/Library/Android/sdk" > local.properties

# Build
./gradlew assembleDebug
```

## Dev Commands

| Command | Description |
| ------- | ----------- |
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK (needs signing) |
| `./gradlew lint` | Run Android lint (errors + warnings) |
| `./gradlew testDebugUnitTest` | Run unit tests |
| `./gradlew connectedDebugAndroidTest` | Run instrumented tests |
| `./gradlew clean` | Clean build artifacts |

## Test Commands

| Command | Description |
| ------- | ----------- |
| `./gradlew testDebugUnitTest` | Run all unit tests (hub + block + nfc) |

Unit tests use:

- **JUnit 4** with Robolectric for Android context (pin `@Config(sdk = [34])`)
- **MockK** for mocking
- **Turbine** for Flow testing
- **Compose Testing** (`createComposeRule`) for UI tests

## Coding Conventions

- **Kotlin first** — no Java source files.
- **Compose for all UI** — no XML layouts.
- **MVVM** — `Screen` composable owns a `ViewModel` via `hiltViewModel()`.
- **StateFlow + collectAsStateWithLifecycle** for reactive UI.
- **`val` over `var`** — prefer immutability.
- **Explicit types** — prefer explicit return types on public functions.
- **Small files** — aim for < 200 lines per file.
- **Small functions** — aim for < 30 lines per function.
- **No comments** unless the intent is genuinely non-obvious.
- **Test names as documentation** — `test("returns empty list when no apps blocked")`.

## Project Structure

See [`docs/04-architecture.md`](04-architecture.md) for the full directory layout and data flow.

## Manifest

A single merged `AndroidManifest.xml` declares:

- the hub — `OmniApp` (Application), `MainActivity` with the launcher intent-filter and the Omni theme;
- **block** — `io.github.hieudoanm.block.activity.MainActivity` (exported=false, opened by the hub), `BlockActivity` (overlay, singleInstance), `FocusAccessibilityService`, and the `queries` element for the app picker;
- **nfc** — `MainActivity` (exported=true with `NDEF_DISCOVERED`, `TECH_DISCOVERED`, `TAG_DISCOVERED` intent filters), `HceApduService` (HOST_APDU_SERVICE), NFC permission + feature declarations.

Feature components use fully-qualified names so they resolve independently of the module namespace. Only the hub sets `android:name` on `<application>` and ships the launcher intent-filter + icon.

## Supporting files

See `12-operations/` for the build script templates and local.properties example.
