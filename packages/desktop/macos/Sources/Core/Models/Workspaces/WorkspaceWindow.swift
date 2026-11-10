import CoreGraphics
import Foundation

/// A single captured window: bundle identifier, optional title, and the
/// normalized position relative to the screen it was captured on.
public struct WorkspaceWindow: Codable, Identifiable, Hashable {
    public let id: UUID
    public var bundleIdentifier: String
    public var title: String?
    public var screenID: CGDirectDisplayID?
    public var zone: NormalizedRect

    public init(
        id: UUID = UUID(),
        bundleIdentifier: String,
        title: String? = nil,
        screenID: CGDirectDisplayID? = nil,
        zone: NormalizedRect
    ) {
        self.id = id
        self.bundleIdentifier = bundleIdentifier
        self.title = title
        self.screenID = screenID
        self.zone = zone
    }
}
