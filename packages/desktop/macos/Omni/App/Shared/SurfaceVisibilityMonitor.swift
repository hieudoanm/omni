import AppKit
import Foundation

/// Tracks whether a live surface — the menu-bar panel or the dashboard window —
/// is currently on screen so background sampling (memory, network, ports,
/// battery, running apps) can pause while nothing is watching instead of
/// sampling forever.
///
/// State is only mutated by observers posted on the main queue and read on the
/// main thread by the view models; it is deliberately not actor-isolated so the
/// non-isolated view models can observe it without extra hoisting.
final class SurfaceVisibilityMonitor {
    static let shared = SurfaceVisibilityMonitor()
    static let didChangeNotification = Notification.Name("Omni.surfaceVisibilityDidChange")

    /// Identifies the dashboard window so it can be told apart from the Settings
    /// window, which does not show live metrics.
    static let dashboardWindowIdentifier = "Omni.dashboard"

    private static let visibleKey = "isVisible"

    private(set) var isPanelVisible = false
    private(set) var isDashboardVisible = false

    /// True while any surface is showing live metrics.
    private(set) var isLiveSurfaceVisible = false

    private var cachedPanel: NSWindow?
    private var isStarted = false
    private var observations: [NSObjectProtocol] = []

    private init() {}

    func start() {
        guard !isStarted else { return }
        isStarted = true
        observations.append(observe(NSWindow.didBecomeKeyNotification) { [weak self] notification in
            self?.handleBecameKey(notification)
        })
        observations.append(observe(NSWindow.didResignKeyNotification) { [weak self] notification in
            self?.handleResignedKey(notification)
        })
        observations.append(observe(NSWindow.willCloseNotification) { [weak self] notification in
            self?.handleDashboardClosing(notification)
        })
    }

    func observeVisibilityChange(_ handler: @escaping (Bool) -> Void) -> NSObjectProtocol {
        NotificationCenter.default.addObserver(
            forName: Self.didChangeNotification,
            object: self,
            queue: .main
        ) { note in
            let visible = (note.userInfo?[Self.visibleKey] as? Bool) ?? false
            handler(visible)
        }
    }

    private func handleBecameKey(_ notification: Notification) {
        guard let window = notification.object as? NSWindow else { return }
        if isMenuBarPanel(window) {
            setPanelVisible(true)
        } else if isDashboardWindow(window) {
            setDashboardVisible(true)
        }
    }

    /// Losing key focus closes the popover, but the dashboard window is still on
    /// screen, so it keeps refreshing while it is merely in the background.
    private func handleResignedKey(_ notification: Notification) {
        guard let window = notification.object as? NSWindow, isMenuBarPanel(window) else { return }
        setPanelVisible(false)
    }

    private func handleDashboardClosing(_ notification: Notification) {
        guard let window = notification.object as? NSWindow, isDashboardWindow(window) else { return }
        setDashboardVisible(false)
    }

    private func setPanelVisible(_ visible: Bool) {
        guard isPanelVisible != visible else { return }
        isPanelVisible = visible
        publishIfChanged()
    }

    private func setDashboardVisible(_ visible: Bool) {
        guard isDashboardVisible != visible else { return }
        isDashboardVisible = visible
        publishIfChanged()
    }

    private func publishIfChanged() {
        let live = isPanelVisible || isDashboardVisible
        guard isLiveSurfaceVisible != live else { return }
        isLiveSurfaceVisible = live
        NotificationCenter.default.post(
            name: Self.didChangeNotification,
            object: self,
            userInfo: [Self.visibleKey: live]
        )
    }

    private func observe(
        _ name: Notification.Name,
        handler: @escaping (Notification) -> Void
    ) -> NSObjectProtocol {
        NotificationCenter.default.addObserver(forName: name, object: nil, queue: .main, using: handler)
    }

    private func isMenuBarPanel(_ window: NSWindow) -> Bool {
        if let cachedPanel, cachedPanel === window {
            return true
        }
        // MenuBarExtra's `.window` style is backed by a floating panel; it is
        // the only NSPanel this app owns. The dashboard is a plain window.
        guard window is NSPanel else { return false }
        cachedPanel = window
        return true
    }

    private func isDashboardWindow(_ window: NSWindow) -> Bool {
        window.identifier?.rawValue == Self.dashboardWindowIdentifier
    }

    deinit {
        for observation in observations {
            NotificationCenter.default.removeObserver(observation)
        }
    }
}
