# macOS SwiftPM — Package.swift

## Package Structure

```swift
// Package.swift
let package = Package(
    name: "Omni",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "Omni", targets: ["Omni"]),
        .library(name: "OmniCore", targets: ["OmniCore"]),
    ],
    dependencies: [
        // No external deps currently — all stdlib / system
    ],
    targets: [
        .target(
            name: "OmniCore",
            path: "Sources/Core",
            resources: [.process("Resources")]
        ),
        .executableTarget(
            name: "Omni",
            dependencies: ["OmniCore"],
            path: "Sources/App",
            resources: [.process("Resources")]
        ),
        .testTarget(
            name: "OmniTests",
            dependencies: ["OmniCore", "Omni"],
            path: "Tests"
        ),
    ]
)
```

## Swift 6 Configuration

```swift
// In Package.swift
let package = Package(
    // ...
    targets: [
        .target(
            name: "OmniCore",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .define("DEBUG", .when(configuration: .debug)),
            ]
        ),
        // ...
    ]
)
```

## Build Commands

```bash
# Debug
swift build

# Release
swift build -c release
# or
make build

# Test
swift test
# or
make test

# Clean
swift package clean
# or
make clean
```

## App Bundle

```bash
# Creates build/Omni.app with Info.plist, AppIcon.icns, Omni.entitlements
make app

# Creates DMG
make dmg
```

## Resources

- `Resources/Info.plist` → copied to `Contents/Info.plist`
- `Resources/AppIcon.icns` → copied to `Contents/Resources/AppIcon.icns`
- `Resources/Omni.entitlements` → used by `codesign`

## CI

```yaml
- name: Run macOS lint
  run: make lint
  working-directory: packages/macos
```

`make lint` = `swift build` (warnings as errors via `-w` in Package.swift).
