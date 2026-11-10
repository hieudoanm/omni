import AppKit
import Foundation

/// A user-facing running application in the Apps tab.
public struct RunningAppInfo: Identifiable {
    public let pid: Int32
    public let name: String
    public let bundleIdentifier: String?
    public let icon: NSImage?
    public let windowCount: Int

    public var id: Int32 {
        pid
    }

    public init(
        pid: Int32,
        name: String,
        bundleIdentifier: String? = nil,
        icon: NSImage? = nil,
        windowCount: Int = 0
    ) {
        self.pid = pid
        self.name = name
        self.bundleIdentifier = bundleIdentifier
        self.icon = icon
        self.windowCount = windowCount
    }
}
