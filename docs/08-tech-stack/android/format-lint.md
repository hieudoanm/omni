# Android Format/Lint — Spotless, ktlint, Android Lint

## Spotless + ktlint

```kotlin
// app/build.gradle.kts
plugins {
    id("com.diffplug.spotless") version "6.25.0"
}

spotless {
    kotlin {
        target("*.kt", "*.kts")
        ktlint("0.50.0")
    }
    format("misc") {
        target("*.gradle.kts", "*.md", "*.json", "*.xml", "*.yml", "*.yaml", "*.properties")
        trimTrailingWhitespace()
        endWithNewline()
        indentWithSpaces(4)
    }
}
```

**Why ktlint 0.50.0:** 0.54.0+ not published to Maven Central (only GitHub Packages). 0.50.0 is last on Central.

## Commands

```bash
# Format all
./gradlew spotlessApply
# or
make format

# Check only (CI)
./gradlew spotlessCheck

# Android Lint
./gradlew :app:lintDebug
# or
make lint
```

## Android Lint

Runs `:app:lintDebug` — produces:
- HTML: `app/build/reports/lint-results-debug.html`
- SARIF: `app/build/reports/lint-results-debug.sarif`
- XML: `app/build/reports/lint-results-debug.xml`

**Baseline:** `app/lint-baseline.xml` (if needed for pre-existing warnings).

## CI Integration

```yaml
- name: Run Android lint
  run: make lint
  working-directory: packages/android
```

Fails on any lint error. Warnings allowed (but zero in this project).
