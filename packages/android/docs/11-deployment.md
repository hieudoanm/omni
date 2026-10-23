# 11 — Deployment

Build types, release signing, and distribution for Omni.

## Build Types

| Type | Minify | Shrink Resources | Signing |
| ---- | ------ | ---------------- | ------- |
| Debug | No | No | Debug key |
| Release | Yes | Yes | Release keystore |

## Release Signing

The release build expects a keystore configured via environment variables:

| Variable | Default |
| -------- | ------- |
| `RELEASE_STORE_FILE` | `release.keystore` |
| `RELEASE_STORE_PASSWORD` | `android` |
| `RELEASE_KEY_ALIAS` | `release` |
| `RELEASE_KEY_PASSWORD` | `android` |

For CI, set these in the environment. For local development, place a `release.keystore` in the `app/` directory (the default path is resolved relative to the `:app` module).

## ProGuard / R8

Release builds use `proguard-android-optimize.txt` plus `app/proguard-rules.pro`, which carries the combined keep rules for the block and nfc feature data (Room entities + DAO classes).

## Output

```bash
app/build/outputs/apk/debug/app-debug.apk
app/build/outputs/apk/release/app-release.apk
app/build/outputs/bundle/release/app-release.aab
```

## Install

```bash
# Debug
./gradlew installDebug

# Release (requires signing config)
./gradlew installRelease
```

## Build & Test

```bash
./gradlew assembleDebug     # APK
./gradlew lint              # static analysis
./gradlew test              # all unit tests
./gradlew assembleRelease   # release APK (requires keystore env)
./gradlew bundleRelease     # release AAB (requires keystore env)
```

Release signing reads `RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD` from the environment (defaults: `release.keystore` / `android`, resolved inside `app/`). CI generates the keystore with keytool.

## Supporting files

See `11-deployment/` for the signing configuration and ProGuard rules reference.
