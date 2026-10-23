# Infrastructure — How-To Guides

| Guide                                  | Description                                                 |
| -------------------------------------- | ----------------------------------------------------------- |
| [ci.md](ci.md)                         | Full CI pipeline, per-platform runners, artifacts           |
| [release.md](release.md)               | Rolling latest, softprops/action-gh-release, tag strategy   |
| [install-script.md](install-script.md) | scripts/install.sh, REPO/RELEASE/ASSET_PREFIX, curl \| bash |
| [docker.md](docker.md)                 | Dockerfile, Alpine, multi-arch, install script in image     |
| [artifacts.md](artifacts.md)           | Artifact paths, naming, retention, download in release job  |

## CI Pipeline Overview (`.github/workflows/ci.yaml`)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Android    │   │   macOS     │   │    CLI      │   │  Browser    │
│  ubuntu     │   │  macOS      │   │  ubuntu     │   │  ubuntu     │
│  JDK 21     │   │  Xcode 15   │   │  Go 1.23    │   │  Node 26    │
│  Android    │   │  SwiftPM    │   │  Zig 0.13   │   │  pnpm 12    │
│  SDK API 37 │   │             │   │             │   │             │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │                 │
       └─────────────────┼─────────────────┼─────────────────┘
                         ▼
              ┌─────────────────────┐
              │  release-latest     │
              │  (master push)      │
              │  tag: latest        │
              │  make_latest: true  │
              └─────────────────────┘
```

## Artifact Matrix

| Job     | Artifact Name     | Path                                                 | Retention |
| ------- | ----------------- | ---------------------------------------------------- | --------- |
| android | android-apk       | `packages/android/app/build/outputs/apk/debug/*.apk` | 7 days    |
| macos   | macos-app         | `packages/macos/build/Omni.app`                      | 7 days    |
| cli     | cli-binaries      | `packages/cli/bin/omni-*`                            | 7 days    |
| browser | browser-extension | `packages/browser/dist`                              | 7 days    |

## Release `latest`

Trigger: `github.ref == 'refs/heads/master' && github.event_name == 'push'`

Creates/updates GitHub Release with `tag_name: latest` containing all artifacts.
Download URLs: `https://github.com/hieudoanm/omni/releases/download/latest/<artifact>`

Used by: CLI install script, Dockerfile, DOWNLOADS.md
