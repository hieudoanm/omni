import AppKit
import SwiftUI

/// Opens window scenes from a menu-bar (`.accessory`) app.
///
/// Omni has no Dock icon, so it runs as an accessory app. A window can still
/// be opened, but it will not come forward on its own: the app has to become a
/// regular app and activate first, then go back to accessory once the window is
/// closed.
@MainActor
enum WindowPresenter {
    static func present(_ openWindow: OpenWindowAction, id: String) {
        NSApp.setActivationPolicy(.regular)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            NSApp.activate(ignoringOtherApps: true)
            openWindow(id: id)
        }
    }

    static func restoreMenuBarOnlyMode() {
        NSApp.setActivationPolicy(.accessory)
    }
}
