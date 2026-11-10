import Foundation

/// A named snapshot of running applications and their window positions.
public struct Workspace: Codable, Identifiable, Equatable {
    public let id: UUID
    public var name: String
    public var windows: [WorkspaceWindow]
    public let createdAt: Date
    public var updatedAt: Date

    public init(
        id: UUID = UUID(),
        name: String,
        windows: [WorkspaceWindow] = [],
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.windows = windows
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    /// Number of distinct applications captured in this workspace.
    public var appCount: Int {
        Set(windows.map(\.bundleIdentifier)).count
    }

    public mutating func update(_ block: (inout Workspace) -> Void) {
        block(&self)
        updatedAt = Date()
    }
}
