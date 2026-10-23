// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Omni",
    platforms: [
        .macOS(.v13),
    ],
    targets: [
        .target(
            name: "OmniCore",
            path: "Sources/Core"
        ),
        .executableTarget(
            name: "Omni",
            dependencies: ["OmniCore"],
            path: "Sources",
            exclude: ["Core"],
            linkerSettings: [
                .linkedFramework("Foundation"),
                .linkedFramework("ApplicationServices"),
                .linkedFramework("IOKit"),
            ]
        ),
        .testTarget(
            name: "OmniTests",
            dependencies: ["OmniCore"],
            path: "Tests"
        ),
    ]
)
