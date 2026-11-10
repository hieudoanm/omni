import ApplicationServices
import Foundation
import OmniCore

/// Restores a workspace: launches missing apps in parallel and arranges each
/// app's windows into their saved positions.
struct WorkspaceRestoreService: WorkspaceRestoring {
    private let accessibility: AccessibilityManager
    private let launcher: ApplicationLauncher
    private let arranger: WindowArranger

    init(
        accessibility: AccessibilityManager = .shared,
        launcher: ApplicationLauncher = ApplicationLauncher(),
        arranger: WindowArranger = WindowArranger()
    ) {
        self.accessibility = accessibility
        self.launcher = launcher
        self.arranger = arranger
    }

    private static let launchTimeout: TimeInterval = 10

    func restore(_ workspace: Workspace) async -> WorkspaceRestoreResult {
        guard accessibility.isAccessibilityEnabled else {
            return WorkspaceRestoreResult(windowsFailed: workspace.windows.count)
        }

        let rules = Dictionary(grouping: workspace.windows, by: \.bundleIdentifier)

        return await withTaskGroup(of: WorkspaceRestoreResult.self) { group in
            for (bundleID, windows) in rules {
                let launcher = self.launcher
                let arranger = self.arranger
                let accessibility = self.accessibility
                group.addTask {
                    await Self.restoreApp(
                        bundleIdentifier: bundleID,
                        windows: windows,
                        launcher: launcher,
                        arranger: arranger,
                        accessibility: accessibility
                    )
                }
            }

            var combined = WorkspaceRestoreResult()
            for await part in group {
                combined.launchedApps += part.launchedApps
                combined.failedToLaunchApps += part.failedToLaunchApps
                combined.windowsPlaced += part.windowsPlaced
                combined.windowsFailed += part.windowsFailed
            }
            return combined
        }
    }

    private static func restoreApp(
        bundleIdentifier: String,
        windows: [WorkspaceWindow],
        launcher: ApplicationLauncher,
        arranger: WindowArranger,
        accessibility: AccessibilityManager
    ) async -> WorkspaceRestoreResult {
        var result = WorkspaceRestoreResult()
        let wasRunning = launcher.runningPID(bundleIdentifier: bundleIdentifier) != nil

        guard let pid = await resolvePID(for: bundleIdentifier, launcher: launcher) else {
            result.failedToLaunchApps = [bundleIdentifier]
            result.windowsFailed = windows.count
            return result
        }
        if !wasRunning {
            result.launchedApps = [bundleIdentifier]
        }

        let axWindows = accessibility.getWindowList(pid: pid)
        guard !axWindows.isEmpty else {
            result.windowsFailed = windows.count
            return result
        }

        for rule in windows {
            let window = matchWindow(rule, in: axWindows, accessibility: accessibility)
            if arranger.arrange(window: window, rule: rule) {
                result.windowsPlaced += 1
            } else {
                result.windowsFailed += 1
            }
        }
        return result
    }

    private static func resolvePID(
        for bundleIdentifier: String,
        launcher: ApplicationLauncher
    ) async -> pid_t? {
        if let pid = launcher.runningPID(bundleIdentifier: bundleIdentifier) {
            return pid
        }
        guard launcher.launch(bundleIdentifier: bundleIdentifier) else {
            return nil
        }
        return await launcher.waitUntilRunning(
            bundleIdentifier: bundleIdentifier,
            timeout: launchTimeout
        )
    }

    private static func matchWindow(
        _ rule: WorkspaceWindow,
        in axWindows: [AXUIElement],
        accessibility: AccessibilityManager
    ) -> AXUIElement {
        if let title = rule.title, !title.isEmpty,
           let match = axWindows.first(where: { accessibility.getWindowTitle($0) == title })
        {
            return match
        }
        return axWindows[0]
    }
}
