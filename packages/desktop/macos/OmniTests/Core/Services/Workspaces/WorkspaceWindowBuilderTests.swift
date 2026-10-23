import CoreGraphics
@testable import OmniCore
import Testing

@Suite("WorkspaceWindowBuilder")
struct WorkspaceWindowBuilderTests {
    private let screen = ScreenInfo(
        id: 1,
        name: "Primary",
        frame: CGRect(x: 0, y: 0, width: 1728, height: 1117),
        visibleFrame: CGRect(x: 0, y: 0, width: 1728, height: 1078)
    )
    private let secondary = ScreenInfo(
        id: 2,
        name: "Secondary",
        frame: CGRect(x: -1280, y: 0, width: 1280, height: 720),
        visibleFrame: CGRect(x: -1280, y: 0, width: 1280, height: 720)
    )

    @Test("finds the screen containing a point")
    func screenContainingPoint() {
        let primaryPoint = CGPoint(x: 600, y: 400)
        let secondaryPoint = CGPoint(x: -600, y: 300)
        #expect(WorkspaceWindowBuilder.screenContaining(rect: CGRect(origin: primaryPoint, size: .init(width: 1, height: 1)), screens: [screen, secondary])?.id == 1)
        #expect(WorkspaceWindowBuilder.screenContaining(rect: CGRect(origin: secondaryPoint, size: .init(width: 1, height: 1)), screens: [screen, secondary])?.id == 2)
    }

    @Test("skips windows whose center is outside all screens")
    func skipsOffScreenWindows() {
        let offScreen = CapturedWindow(
            pid: 10,
            bundleIdentifier: "com.apple.Safari",
            title: "Away",
            bounds: CGRect(x: 5000, y: 5000, width: 200, height: 100)
        )
        #expect(WorkspaceWindowBuilder.window(from: offScreen, screens: [screen, secondary]) == nil)
    }

    @Test("normalizes a window against the visible frame of its screen")
    func normalizesAgainstVisibleFrame() {
        let captured = CapturedWindow(
            pid: 10,
            bundleIdentifier: "com.apple.Terminal",
            title: "Shell",
            bounds: CGRect(x: 0, y: 0, width: 864, height: 539)
        )
        let rule = WorkspaceWindowBuilder.window(from: captured, screens: [screen])
        #expect(rule?.bundleIdentifier == "com.apple.Terminal")
        #expect(rule?.title == "Shell")
        #expect(rule?.screenID == 1)
        // y is measured from the bottom: a window anchored at the top edges
        // of the 1078-high visible frame sits in the top half.
        #expect(rule?.zone == NormalizedRect(x: 0, y: 0.5, width: 0.5, height: 0.5))
    }

    @Test("absolutely rounds a window at the bottom-right of a screen")
    func normalizationRoundtrip() throws {
        let bounds = CGRect(x: 432, y: 0, width: 1296, height: 808.5)
        let rule = WorkspaceWindowBuilder.window(
            from: CapturedWindow(pid: 10, bundleIdentifier: "com.apple.Safari", title: nil, bounds: bounds),
            screens: [screen]
        )
        let restored = try CoordinateConverter.toAbsoluteCoordinates(
            normalized: #require(rule?.zone),
            visibleFrame: screen.visibleFrame
        )
        #expect(restored.origin.x == bounds.origin.x)
        #expect(abs(restored.origin.y - bounds.origin.y) < 0.001)
        #expect(abs(restored.width - bounds.width) < 0.001)
        #expect(abs(restored.height - bounds.height) < 0.001)
    }

    @Test("prefers the saved screen when available")
    func targetScreenPrefersSaved() {
        let target = WorkspaceWindowBuilder.targetScreen(for: 2, screens: [screen, secondary])
        #expect(target?.id == 2)
    }

    @Test("falls back to the first screen when the saved one is unavailable")
    func targetScreenFallsBack() {
        let target = WorkspaceWindowBuilder.targetScreen(for: 99, screens: [screen, secondary])
        #expect(target?.id == 1)
    }

    @Test("returns nil when no screens are connected")
    func targetScreenEmptyScreens() {
        #expect(WorkspaceWindowBuilder.targetScreen(for: 1, screens: []) == nil)
    }
}
