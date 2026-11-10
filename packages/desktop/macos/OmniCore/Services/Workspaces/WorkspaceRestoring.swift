import Foundation

/// The outcome of restoring a workspace.
public struct WorkspaceRestoreResult: Sendable, Equatable {
    public var launchedApps: [String]
    public var failedToLaunchApps: [String]
    public var windowsPlaced: Int
    public var windowsFailed: Int

    public init(
        launchedApps: [String] = [],
        failedToLaunchApps: [String] = [],
        windowsPlaced: Int = 0,
        windowsFailed: Int = 0
    ) {
        self.launchedApps = launchedApps
        self.failedToLaunchApps = failedToLaunchApps
        self.windowsPlaced = windowsPlaced
        self.windowsFailed = windowsFailed
    }

    public var totalWindows: Int {
        windowsPlaced + windowsFailed
    }
}

/// Restores a workspace by launching missing applications and arranging
/// windows into their saved positions.
public protocol WorkspaceRestoring: Sendable {
    func restore(_ workspace: Workspace) async -> WorkspaceRestoreResult
}
