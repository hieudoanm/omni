import Foundation

/// Persistence for saved workspaces.
public protocol WorkspaceStoring: Sendable {
    var workspaces: [Workspace] { get }
    func save(_ workspace: Workspace)
    func update(_ workspace: Workspace)
    func deleteWorkspace(id: UUID)
}
