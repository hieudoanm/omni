import AppKit
import CoreGraphics
import Foundation
import OmniCore

/// Lists normal, on-screen windows via `CGWindowListCopyWindowInfo`. Windows
/// owned by the current process, windows without a bundle identifier, and
/// non-normal layers (menus, docks, overlays) are excluded.
struct CoreGraphicsWindowLister: WindowListing {
    func listWindows() -> [CapturedWindow] {
        guard let windowList = CGWindowListCopyWindowInfo(
            [.optionOnScreenOnly],
            kCGNullWindowID
        ) as? [[String: Any]] else {
            return []
        }
        return windowList.compactMap(Self.makeCapturedWindow(from:))
    }

    private static func makeCapturedWindow(from info: [String: Any]) -> CapturedWindow? {
        guard let pid = info[kCGWindowOwnerPID as String] as? pid_t,
              pid != getpid(),
              let layer = info[kCGWindowLayer as String] as? Int, layer == 0,
              let boundsDict = info[kCGWindowBounds as String] as? [String: CGFloat],
              let bundleIdentifier = NSRunningApplication(processIdentifier: pid)?.bundleIdentifier
        else {
            return nil
        }
        let bounds = CGRect(
            x: boundsDict["X"] ?? 0,
            y: boundsDict["Y"] ?? 0,
            width: boundsDict["Width"] ?? 0,
            height: boundsDict["Height"] ?? 0
        )
        let title = info[kCGWindowName as String] as? String
        return CapturedWindow(
            pid: pid,
            bundleIdentifier: bundleIdentifier,
            title: title,
            bounds: bounds
        )
    }
}
