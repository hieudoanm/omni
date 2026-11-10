import CoreGraphics

/// Pure helpers that build saved window rules from captured windows and pick
/// the screen a window should be restored onto.
public enum WorkspaceWindowBuilder {
    /// Builds a rule for a captured window, skipping windows whose center is
    /// not inside any connected display.
    public static func window(from captured: CapturedWindow, screens: [ScreenInfo]) -> WorkspaceWindow? {
        guard let screen = screenContaining(rect: captured.bounds, screens: screens) else {
            return nil
        }
        let zone = CoordinateConverter.toNormalizedCoordinates(
            absolute: captured.bounds,
            visibleFrame: screen.visibleFrame
        )
        return WorkspaceWindow(
            bundleIdentifier: captured.bundleIdentifier,
            title: captured.title,
            screenID: screen.id,
            zone: zone
        )
    }

    public static func screenContaining(rect: CGRect, screens: [ScreenInfo]) -> ScreenInfo? {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        return screens.first { $0.frame.contains(center) }
    }

    /// Preferred screen for a rule: the display it was captured on, falling
    /// back to the first connected display when that one is unavailable.
    public static func targetScreen(for screenID: CGDirectDisplayID?, screens: [ScreenInfo]) -> ScreenInfo? {
        if let screenID, let match = screens.first(where: { $0.id == screenID }) {
            return match
        }
        return screens.first
    }
}
