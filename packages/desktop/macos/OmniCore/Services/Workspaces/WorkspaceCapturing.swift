import Foundation

/// Captures the currently visible window arrangement into a named workspace.
public protocol WorkspaceCapturing: Sendable {
    func captureCurrentWorkspace(name: String) -> Workspace
}
