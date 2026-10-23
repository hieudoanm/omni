import CoreGraphics
import Foundation

/// Live description of a connected display. Identity is the display ID, so
/// two descriptions of the same display compare equal regardless of geometry.
public struct ScreenInfo: Identifiable, Hashable {
    public let id: CGDirectDisplayID
    public let name: String
    public let frame: CGRect
    public let visibleFrame: CGRect

    public init(id: CGDirectDisplayID, name: String, frame: CGRect, visibleFrame: CGRect) {
        self.id = id
        self.name = name
        self.frame = frame
        self.visibleFrame = visibleFrame
    }

    public var width: Double {
        Double(frame.width)
    }

    public var height: Double {
        Double(frame.height)
    }

    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    public static func == (lhs: ScreenInfo, rhs: ScreenInfo) -> Bool {
        lhs.id == rhs.id
    }
}
