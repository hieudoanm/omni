# CI Pipeline — GitHub Actions

## Workflow File

`.github/workflows/ci.yaml`

## Jobs

### Android (ubuntu-latest)

```yaml
android:
  runs-on: ubuntu-latest
  env:
    ANDROID_HOME: /opt/android-sdk
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with: { distribution: temurin, java-version: 21 }
    - uses: android-actions/setup-android@v3
      with: { api-level: 37, ndk-version: r27c }
    - uses: actions/cache@v4
      with:
        path: |
          ~/.gradle/caches
          ~/.gradle/wrapper
        key: gradle-${{ runner.os }}-${{ hashFiles('packages/android/**/*.kts', 'packages/android/**/*.toml') }}
    - run: make lint
    - run: make test
    - run: make build
    - uses: actions/upload-artifact@v4
      with:
        name: android-apk
        path: packages/android/app/build/outputs/apk/debug/*.apk
```

### macOS (macos-latest)

```yaml
macos:
  runs-on: macos-latest
  steps:
    - uses: actions/checkout@v4
    - run: make format
    - run: make lint
    - run: make test
    - run: make build
    - run: make app
    - uses: actions/upload-artifact@v4
      with:
        name: macos-app
        path: packages/macos/build/Omni.app
```

### CLI (ubuntu-latest)

```yaml
cli:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-go@v5
      with: { go-version: '1.23', cache-dependency-path: packages/cli/go.sum }
    - uses: goto-bus-stop/setup-zig@v2
      with: { version: 0.13.0 }
    - run: make format
    - run: make lint
    - run: make test
    - run: make build
    - run: make build-all
    - uses: actions/upload-artifact@v4
      with:
        name: cli-binaries
        path: packages/cli/bin/omni-*
```

### Browser (ubuntu-latest)

```yaml
browser:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 12.15.0 }
    - uses: actions/setup-node@v4
      with: { node-version: 26.12.1, cache: 'pnpm', cache-dependency-path: packages/browser/pnpm-lock.yaml }
    - run: pnpm install --frozen-lockfile
      working-directory: packages/browser
    - run: pnpm lint
      working-directory: packages/browser
    - run: pnpm test
      working-directory: packages/browser
    - run: pnpm build
      working-directory: packages/browser
    - uses: actions/upload-artifact@v4
      with:
        name: browser-extension
        path: packages/browser/dist
```

### Release Latest (ubuntu-latest)

```yaml
release-latest:
  needs: [android, macos, cli, browser]
  if: github.ref == 'refs/heads/master' && github.event_name == 'push'
  runs-on: ubuntu-latest
  permissions: { contents: write }
  steps:
    - uses: actions/download-artifact@v4
      with: { name: cli-binaries, path: dist/cli }
    - uses: actions/download-artifact@v4
      with: { name: android-apk, path: dist/android }
    - uses: actions/download-artifact@v4
      with: { name: macos-app, path: dist/macos }
    - uses: actions/download-artifact@v4
      with: { name: browser-extension, path: dist/browser }
    - uses: softprops/action-gh-release@v2
      with:
        tag_name: latest
        name: "Omni Latest"
        make_latest: true
        files: |
          dist/cli/*
          dist/android/*.apk
          dist/macos/*
          dist/browser/**
```

## Concurrency

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

Cancels in-flight runs on same branch/PR when new push arrives.

## Artifact Retention

7 days for all artifacts (configurable per job).