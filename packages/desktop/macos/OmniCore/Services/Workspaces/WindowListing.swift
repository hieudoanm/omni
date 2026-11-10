import CoreGraphics
import Foundation

/// A normal, visible window discovered via the CoreGraphics window list.
public struct CapturedWindow: Hashable {
    public let pid: pid_t
    public let bundleIdentifier: String
    public let title: String?
    public let bounds: CGRect

    public init(pid: pid_t, bundleIdentifier: String, title: String?, bounds: CGRect) {
        self.pid = pid
        self.bundleIdentifier = bundleIdentifier
        self.title = title
        self.bounds = bounds
    }
}

/// Lists the currently visible normal windows owned by apps.
public protocol WindowListing: Sendable {
    func listWindows() -> [CapturedWindow]
}
