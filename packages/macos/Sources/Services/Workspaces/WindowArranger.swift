import ApplicationServices
import CoreGraphics
import OmniCore

/// Moves and resizes an AX window to the normalized zone on its target screen.
struct WindowArranger: Sendable {
    private let accessibility: AccessibilityManager
    private let screens: ScreenManager

    init(accessibility: AccessibilityManager = .shared, screens: ScreenManager = .shared) {
        self.accessibility = accessibility
        self.screens = screens
    }

    /// Places a window per its saved rule. Returns true only when both the
    /// position and size were applied.
    func arrange(window: AXUIElement, rule: WorkspaceWindow) -> Bool {
        guard let screen = WorkspaceWindowBuilder.targetScreen(
            for: rule.screenID,
            screens: screens.screens
        ) else {
            return false
        }
        let frame = CoordinateConverter.toAbsoluteCoordinates(
            normalized: rule.zone,
            visibleFrame: screen.visibleFrame
        )
        let positionSet = accessibility.setWindowPosition(
            window,
            to: CGPoint(x: frame.origin.x, y: frame.origin.y)
        )
        let sizeSet = accessibility.setWindowSize(
            window,
            to: CGSize(width: frame.width, height: frame.height)
        )
        return positionSet && sizeSet
    }
}
