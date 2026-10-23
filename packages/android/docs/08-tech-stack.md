# 08 — Tech Stack

Allowed technologies and dependency policy for Omni.

## Platform

- Android only
- Min SDK: 26 (Android 8.0)
- Target / Compile SDK: 37 (Android 15+)

## Tech Stack

| Layer | Technology | Responsibility |
| ----- | ---------- | -------------- |
| Language | Kotlin 2.x | Application logic |
| UI | Jetpack Compose + Material 3 | User interface |
| Architecture | MVVM | Separation of concerns |
| Navigation | Navigation Compose (per feature) | In-app navigation |
| Persistence | Room (per feature) | Local database |
| Preferences | DataStore | App settings |
| Async | Kotlin Coroutines + Flow | Asynchronous operations |
| Dependency Injection | Hilt | Dependency injection |
| Blocking | AccessibilityService | Foreground app detection |
| NFC | NFC + Host Card Emulation | Tag read/write/emulate |
| Build | AGP 9.x, Gradle Kotlin DSL | Build system |

## Dependencies

| Plugin | Version |
| ------ | ------- |
| AGP | 9.3.2 |
| Kotlin | 2.4.10 |
| KSP | 2.3.11 |
| Hilt | 2.60.1 |
| Compose BOM | 2026.08.00 |

`build.gradle.kts` at the root applies all plugins with `apply false`; the single `:app` module applies the ones it needs. There are no library modules.

## Resource Conventions

- Launcher icon lives in `res/mipmap-anydpi-v26/ic_launcher.xml` (hub).
- Feature string labels are namespaced: `block_app_name`, `nfc_app_name`. Hub label: `app_name`.
- Feature theme names: `Theme.FocusBlock`, `Theme.NfcToolkit`, `Theme.Omni` — merged into one `themes.xml`.

## Dependency Policy

- No library modules — single `:app` application module.
- Gradle Kotlin DSL for build configuration.
- Hilt for dependency injection (single `OmniApp` `@HiltAndroidApp`).
- Compose for all UI — no XML layouts.

## Supporting files

See `08-tech-stack/` for the dependency graph and version catalog.
