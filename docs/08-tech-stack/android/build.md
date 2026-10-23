# Android Build — Gradle, Compose, KSP

## Gradle Wrapper

```
packages/android/
├── gradlew
├── gradlew.bat
└── gradle/wrapper/
    ├── gradle-wrapper.jar
    └── gradle-wrapper.properties  # distributionUrl=gradle-9.8.2-bin.zip
```

**Upgrade:** Edit `gradle-wrapper.properties`, run `./gradlew wrapper`.

## Version Catalog (`gradle/libs.versions.toml`)

```toml
[versions]
kotlin = "2.4.21"
composeBom = "2026.09.00"
hilt = "2.60.1"
room = "2.8.5"
datastore = "1.3.0"
ktlint = "0.50.0"
spotless = "6.25.0"

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
spotless = { id = "com.diffplug.spotless", version.ref = "spotless" }

[libraries]
androidx-compose-bom = { module = "androidx.compose:compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { module = "androidx.compose.ui:ui" }
# ... etc
```

## Compose Compiler

Kotlin 2.4.21 → Compose compiler built into Kotlin plugin. No separate `composeCompiler` version needed.

## KSP

```kotlin
// app/build.gradle.kts
ksp("com.google.dagger:hilt-compiler:$hiltVersion")
ksp("androidx.room:room-compiler:$roomVersion")
```

KSP version must match Kotlin version (see `gradle/libs.versions.toml`).

## Build Commands

```bash
# From packages/android/
ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleDebug
# or
make build

# Release (requires signing config)
ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleRelease
```

## CI Cache Key

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: gradle-${{ runner.os }}-${{ hashFiles('packages/android/**/*.kts', 'packages/android/**/*.toml') }}
```
