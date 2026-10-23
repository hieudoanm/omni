# 09 — Testing Strategy

Test layers, fixtures, and acceptance criteria for Omni.

## Test Layers

Unit (JUnit 4 + Robolectric + MockK + Turbine), Compose UI testing, instrumented tests (Espresso / Compose Testing — planned).

## Unit Tests

The single `:app` module runs all unit tests, including Robolectric with Android resources (`unitTests.isIncludeAndroidResources = true`).

| Command | Description |
| ------- | ----------- |
| `./gradlew testDebugUnitTest` | Run all unit tests (hub + block + nfc) |

### Test Structure

```text
app/src/test/kotlin/io/github/hieudoanm/
├── omni/
│   ├── activity/MainActivityTest.kt
│   └── ui/home/HomeScreenTest.kt
├── block/
│   ├── ui/home/HomeScreenTest.kt
│   └── ...
└── nfc/
    └── NfcModuleSmokeTest.kt
```

### Block Test Suite (full)

- Repository, DataStore, Room DAO, services, screens, ViewModels (Robolectric + MockK + Turbine).

### NFC Test Suite

- Smoke test that core classes load.

### Hub Tests

- `androidx/activity`, `androidx/ui/home` — cards render and fire their `Open` callbacks.

### Robolectric Configuration

Robolectric tests pin `@Config(sdk = [34])` (see `app/src/test/resources/robolectric.properties`).

## Test Commands

| Command | Description |
| ------- | ----------- |
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK (needs signing) |
| `./gradlew lint` | Run Android lint (errors + warnings) |
| `./gradlew testDebugUnitTest` | Run unit tests |
| `./gradlew connectedDebugAndroidTest` | Run instrumented tests |
| `./gradlew clean` | Clean build artifacts |

## Supporting files

See `09-testing-strategy/` for the test matrix and Robolectric configuration.
