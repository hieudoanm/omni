import AppKit
import CoreGraphics
import OmniCore

/// Provides live display information from `NSScreen`.
final class ScreenManager: Sendable {
    static let shared = ScreenManager()

    var screens: [ScreenInfo] {
        NSScreen.screens.map(ScreenInfo.init(screen:))
    }
}

private extension ScreenInfo {
    init(screen: NSScreen) {
        self.init(
            id: screen.displayID,
            name: screen.localizedName,
            frame: screen.frame,
            visibleFrame: screen.visibleFrame
        )
    }
}

private extension NSScreen {
    var displayID: CGDirectDisplayID {
        deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? CGDirectDisplayID ?? 0
    }
}
