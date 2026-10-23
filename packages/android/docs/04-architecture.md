# 04 — Architecture

Module boundaries, request lifecycle, and tenancy for Omni.

> Omni — Kotlin + Jetpack Compose super app bundling Focus Blocker and NFC Toolkit under one launcher icon and one APK.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Language | Kotlin 2.x |
| UI | Jetpack Compose + Material 3 |
| Architecture | MVVM |
| Navigation | Navigation Compose (per feature) |
| Persistence | Room (per feature) |
| Preferences | DataStore |
| Async | Kotlin Coroutines + Flow |
| Dependency Injection | Hilt |
| Blocking | AccessibilityService |
| NFC | NFC + Host Card Emulation |
| Build | AGP 9.x, Gradle Kotlin DSL |
| Min SDK | 26 (Android 8.0) |
| Target / Compile SDK | 37 (Android 15+) |

## Package Structure

One Gradle **application** module (`:app`) with three independent source package trees:

```text
android/
└── app/
    └── src/main/kotlin/io/github/hieudoanm/
        ├── omni/               # Omni hub
        │   ├── OmniApp.kt      # @HiltAndroidApp — single Application
        │   ├── activity/MainActivity.kt
        │   └── ui/home/HomeScreen.kt   # cards for Block + NFC
        │
        ├── block/                  # Focus Blocker
        │   ├── accessibility/FocusAccessibilityService.kt
        │   ├── activity/{MainActivity, BlockActivity}.kt
        │   ├── data/database/      # Room: BlockedApp, Schedule
        │   ├── data/preferences/SettingsDataStore.kt
        │   ├── di/AppModule.kt
        │   ├── navigation/NavGraph.kt
        │   ├── repository/FocusRepository.kt
        │   └── ui/{home, apps, block, settings, theme}/
        │
        └── nfc/                    # NFC Toolkit
            ├── activity/MainActivity.kt
            ├── data/nfc/HceApduService.kt
            ├── data/database/      # Room: tag history
            ├── data/preferences/SettingsDataStore.kt
            ├── di/AppModule.kt
            ├── navigation/NavGraph.kt
            ├── domain/model/
            └── ui/{home, history, settings, theme}/
```

## Hub Launch Flow

```text
Launcher
   │
   ▼
MainActivity (HomeScreen)
   │
   ├── "Focus Blocker" card  ──► startActivity(MainActivity in io.github.hieudoanm.block)
   └── "NFC Toolkit" card    ──► startActivity(MainActivity in io.github.hieudoanm.nfc)
```

The module has a single namespace (`io.github.hieudoanm.omni`) and one merged manifest. Feature components are declared with fully-qualified names (`io.github.hieudoanm.block.activity.MainActivity`, etc.) so they resolve independently. Identical class names across features are independent and never collide.

## Feature Components

The merged manifest contributes the parts the hub does not provide:

- **block** — `MainActivity` (exported=false), `BlockActivity` (singleInstance overlay), `FocusAccessibilityService`, `queries`.
- **nfc** — `MainActivity` (exported=true, NDEF/TECH/TAG filters), `HceApduService` (HOST_APDU_SERVICE), NFC permission/feature.

Only the hub sets `android:name` on `<application>` and includes the launcher intent-filter and icon.

## Blocking Data Flow

```text
AccessibilityService
        │
        ▼
TYPE_WINDOW_STATE_CHANGED
        │
        ▼
FocusRepository.isBlocked(packageName)
        │
   ┌────┴────┐
   │         │
  No       Yes
   │         │
   ▼         ▼
 Skip   BlockActivity
```

## Navigation

Each feature owns a Compose `NavGraph` inside its own `MainActivity`:

- **Block**: `home` → `app_list` → `settings` (`BlockActivity` is launched separately by the AccessibilityService).
- **NFC**: `home` / `history` / `settings`.

## Database

Room instances are per-feature (distinct DB names):

- `focus_blocker.db` — entity `BlockedApp(packageName, label, enabled)` and future `Schedule`.
- nfc tag history — entity persisted on read/write.

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

## Dependency Injection

Per-feature Hilt `@Module` provides that feature's Room database, DAO, and `SettingsDataStore`. The hub's `OmniApp` is the single `@HiltAndroidApp` and roots the shared `AppComponent`.

## Key Design Decisions

- **One module, three packages** — every app ships in a single APK; features stay isolated by package namespace with no cross-feature class dependencies.
- **Single Application subclass** — features don't declare `<application>` `android:name`; `OmniApp` owns the process.
- **AccessibilityService uses Hilt** — `@AndroidEntryPoint` with field injection.
- **No network calls** — everything is local-first (Room + DataStore).

## Supporting files

See `04-architecture/` for package structure diagrams and manifest merge diagrams.
