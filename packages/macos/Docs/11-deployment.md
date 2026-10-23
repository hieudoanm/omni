# 11 — Deployment

Packaging, notarization, and distribution for Omni.

Omni, bundle ID `io.github.hieudoanm.Omni`, version 0.0.1.

## Checklist

### Common

- [ ] Bump `VERSION` in Makefile and Info.plist
- [ ] `make build`
- [ ] `make app`
- [ ] `make dmg`
- [ ] Smoke test the app

### DMG

- [ ] Mount the .dmg
- [ ] Drag `Omni.app` to Applications
- [ ] Eject

### macOS Notarization

- [ ] Sign with Developer ID certificate
- [ ] Set `DEVELOPER_ID_APPLICATION` and `APPLE_TEAM_ID` env vars
- [ ] `xcrun notarytool submit build/Omni-0.0.1.dmg --keychain-profile "notarytool" --wait`
- [ ] `xcrun stapler staple build/Omni-0.0.1.dmg`
- [ ] `spctl --assess --type open --context context:primary-signature build/Omni.app`

### Permissions

Omni requires no special permissions for its basic functionality, including port discovery via `lsof` and reading the shared pasteboard for clipboard history (the app never requests Full Disk Access, root privileges, or network extensions). It never requests Screen Recording.

The **only** permission Omni can request is **Accessibility**, and only the Workspaces tab needs it to arrange windows during a restore. `AccessibilityManager` uses `AXIsProcessTrustedWithOptions` to prompt in-app; without the permission the Workspaces tab shows a Grant banner and restore is skipped gracefully. The app runs sandboxed-off (`Omni.entitlements` only contains `com.apple.security.app-sandbox = false`) — signing does **not** require an Accessibility entitlement, the user grants it once in System Settings.

### Launch at Login (Implemented)

- [x] `SMAppService.mainApp.register()` / `unregister()` from `ServiceManagement` (see `Sources/App/Shared/LaunchAtLogin.swift`)
- [x] Toggle in Settings
- [x] Do not use shell scripts or deprecated login items — confirmed, none used

### App Store (Future)

- [ ] Apple Developer account with App Store access
- [ ] Create app record in App Store Connect
- [ ] Configure provisioning profiles
- [ ] Archive and upload
- [ ] Fill out privacy questionnaire
- [ ] Submit for review

### Auto-Update (Future)

- [ ] Integrate Sparkle framework
- [ ] Add `SUFeedURL` to Info.plist
- [ ] Test update flow

## Output

- `build/Omni-0.0.1.dmg` — installer disk image
- `build/Omni.app` — application bundle

## Install

Mount the .dmg, drag `Omni.app` to Applications, eject.

## Supporting files

See `11-deployment/` for the notarization script and entitlements reference.
