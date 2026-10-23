import AppKit
import CoreGraphics
import Foundation

/// Discovers regular running applications and activates them.
public struct RunningAppsDiscoveryService: RunningAppProviding {
    private let workspace: NSWorkspace
    private let ownBundleIdentifier: String

    public init(
        workspace: NSWorkspace = .shared,
        ownBundleIdentifier: String? = Bundle.main.bundleIdentifier
    ) {
        self.workspace = workspace
        self.ownBundleIdentifier = ownBundleIdentifier ?? ""
    }

    public func runningApps() -> [RunningAppInfo] {
        let counts = RunningWindowCounter.countsByOwner(from: onScreenWindows())
        let apps = workspace.runningApplications.compactMap { app -> RunningAppInfo? in
            guard app.activationPolicy == .regular,
                  app.bundleIdentifier != ownBundleIdentifier
            else {
                return nil
            }
            return RunningAppInfo(
                pid: app.processIdentifier,
                name: app.localizedName ?? String(format: "PID %d", app.processIdentifier),
                bundleIdentifier: app.bundleIdentifier,
                icon: app.icon,
                windowCount: counts[app.processIdentifier] ?? 0
            )
        }
        return RunningAppsPresenter.sortedByName(apps)
    }

    public func bringAllWindowsToFront(for app: RunningAppInfo) {
        guard let running = workspace.runningApplications.first(where: {
            $0.processIdentifier == app.pid
        }) else { return }
        running.activate(options: [.activateAllWindows, .activateIgnoringOtherApps])
    }

    private func onScreenWindows() -> [[String: Any]] {
        guard let windows = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID)
            as? [[String: Any]] else { return [] }
        return windows
    }
}

enum RunningAppsPresenter {
    static func sortedByName(_ apps: [RunningAppInfo]) -> [RunningAppInfo] {
        apps.sorted { $0.name.localizedStandardCompare($1.name) == .orderedAscending }
    }
}

enum RunningWindowCounter {
    static func countsByOwner(from windows: [[String: Any]]) -> [Int32: Int] {
        var counts: [Int32: Int] = [:]
        for window in windows {
            guard let number = window[kCGWindowOwnerPID as String] as? NSNumber else { continue }
            counts[number.int32Value, default: 0] += 1
        }
        return counts
    }
}
