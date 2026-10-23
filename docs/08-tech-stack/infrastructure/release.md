# Rolling Release — `latest` Tag Strategy

## Philosophy

**One tag, always current.** No SemVer, no version management, no release notes maintenance. Every push to `master` = new release.

## Implementation

```yaml
# .github/workflows/ci.yaml
release-latest:
  if: github.ref == 'refs/heads/master' && github.event_name == 'push'
  # ... downloads all artifacts ...
  - uses: softprops/action-gh-release@v2
    with:
      tag_name: latest
      name: "Omni Latest"
      body: |
        Rolling release updated on ${{ github.sha }}
        # ... artifact list ...
      make_latest: true
      files: |
        dist/cli/*
        dist/android/*.apk
        dist/macos/*
        dist/browser/**
```

## softprops/action-gh-release@v2 Behavior

| Parameter | Effect |
|-----------|--------|
| `tag_name: latest` | Creates/updates tag `latest` |
| `make_latest: true` | Marks as "Latest release" on GitHub |
| `files: ...` | Replaces all assets on each run |
| `draft: false` | Published immediately |
| `prerelease: false` | Not a pre-release |

## Result

- **GitHub Releases page:** Single "Omni Latest" release, updated on every push
- **Tag:** `latest` force-moved to latest commit
- **Download URLs:** `https://github.com/hieudoanm/omni/releases/download/latest/<artifact>`
- **Install script:** Points to `RELEASE=latest`, `ASSET_PREFIX=omni`

## Why Not SemVer

- Personal toolbox, not a library — no consumers needing version constraints
- Rolling release = always newest features/fixes
- No `CHANGELOG.md` maintenance
- No `git tag v1.2.3` ceremony
- CI already validates every push — if it passes, it's release quality

## Install Script Integration

```bash
# packages/cli/scripts/install.sh
RELEASE="latest"
ASSET_PREFIX="omni"
url="https://github.com/$REPO/releases/download/$RELEASE/${ASSET_PREFIX}-${os}-${arch}"
```

## Dockerfile Integration

```dockerfile
# packages/cli/docker/Dockerfile
ARG REPO=hieudoanm/omni
ARG INSTALL_SCRIPT_URL=https://raw.githubusercontent.com/${REPO}/master/packages/cli/scripts/install.sh
# Installs from latest release via script
```

## Rollback

If a bad push breaks `latest`:
```bash
# Force previous commit to latest tag
git push origin <good-sha>:refs/tags/latest --force
# Or re-run CI on last good commit
```